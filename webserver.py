# authors:       Eren Kocadag, Benedikt Schmitz, Feliks Vdovichenko, Lucie Prokopy, Leiss Abdal Al, Johannes Ehrich
# institution:   Freie Universität Berlin
# institute:     Institut für Informatik
# module:        SWP - Usable Machine Learning
# year:          2023

# ---------------------- IMPORT ----------------------#

from flask import Flask, render_template, request, jsonify, url_for, session, redirect
from flask_socketio import SocketIO
import base64, io, os, threading, json, webbrowser, shutil, string, random
import numpy as np
import common_dict
from PIL import Image, ImageOps

# for start_training method
from ml_utils.training import start_training as train
from ml_utils.json_write import clear_file as clear
from ml_utils.json_write import revert_history, verify_data, empty_missing_file
from ml_utils.training import stop_training
from ml_utils.testing import test_drawing
from ml_utils.print_overwrite import print, init_print
from ml_utils.evaluate import stop_eval
from ml_utils.data_beta import update_training_labels, clear_modifications

from ml_utils.false_detected import start_false_detected as start_false
import sys

sys.path.append('/Users/kian/zusatztaufgabe-usable-ml')
from common_dict import false_detected_dict, user_modified_labels
from torchvision import transforms

# ---------------------- VARIABLES ----------------------#

app = Flask(__name__)
socketio = SocketIO(app, async_mode='threading')
app.secret_key = '3456'  # for using session
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # Prevent caching
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False

# will be used for saving and loading models
current_model = ""

modified_data_set: bool

# chart data
data = {
    'd1': [],  # accuracy
    'd2': [],  # loss
    'd3': [],  # train accuracy
    'd4': [],  # train loss
    'run': []
}

# adjustment data
adj = {
    "learning_rate": 0,
    "momentum": 0,
    "dropout_rate": 0,
    "loss_function": 0,
    "epochs": 0,
    "batch_size": 0
}

# default reponse
response = ""


# ---------------------- FUNCTIONS ----------------------#
# if revert is allowed, tell frontend
def block_revert():
    if os.path.exists(f"data/{current_model}_model_new.pt"):
        socketio.emit('revert_allowed', True)


# loads chart
def update_data():
    if empty_missing_file(f"data/{current_model}_epoch_data.json"):
        for key in data.keys():
            data[key] = []
        return
    with open(f"data/{current_model}_epoch_data.json", "r") as file:
        history = json.load(file)
    data["d1"] = history["accuracy"]
    data["d2"] = history["loss"]
    data["d3"] = history["train_accuracy"]
    data["d4"] = history["train_loss"]
    data["run"] = history["run"]
    return


# starts training in ml_utils.training.py with parameters
def start_training_dict(params):
    modified_data_set = False
    worker_process = threading.Thread(target=train,
                                      args=[current_model,
                                            data,
                                            socketio, params.copy(),
                                            modified_data_set])
    worker_process.start()
    #worker_process.join()

    return


def start_training_dict_beta(params):
    modified_data_set = True
    worker_process_beta = threading.Thread(target=train,
                                      args=[current_model, data, socketio, params.copy(), modified_data_set])
    worker_process_beta.start()
    worker_process_beta.join()

    return


@app.route('/fdi_start', methods=['GET'])
def fdi_start_route():
    if os.path.exists(f'data/{current_model}_model_new.pt'):
        return fdi_start(adj)
    if os.path.exists(f'data/{current_model}_model.pt'):
        return fdi_start(adj)
    else:
        return jsonify({"status": "no_model"})


def fdi_start(params):
    global false_detected_thread
    false_detected_thread = threading.Thread(target=start_false, args=[current_model, params.copy()])
    false_detected_thread.start()
    false_detected_thread.join()
    return jsonify({"status": "processing"})


def tensor_to_image_base64(tensor_image):
    # Convert tensor to PIL Image
    img = transforms.ToPILImage()(tensor_image)

    # Convert PIL Image to bytes
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_bytes = buffer.getvalue()

    # Convert bytes to base64 encoded string
    base64_encoded = base64.b64encode(img_bytes).decode('utf-8')
    return f"data:image/png;base64,{base64_encoded}"


@app.route('/clear_modifications', methods=['POST'])
def clear_modifications_route():
    try:
        clear_modifications()  # Call the function from data_beta.py
        return jsonify(status="success", message="Modifications cleared!", alertType="danger")

    except Exception as e:
        return jsonify(status="error", message=str(e), alertType="danger")


@app.route('/change_label', methods=['POST'])
def change_label():
    try:
        new_label = request.form['new_label']
    except KeyError:
        return jsonify(status="error", message="Label not provided.", alertType="danger")

    # Get the actual key using current_index from the session
    keys_list = list(common_dict.false_detected_dict.keys())
    current_key = keys_list[session['current_index']]
    original_label = common_dict.false_detected_dict[current_key]['label']

    # Compare new_label with original label for correct visualization of modified labels
    if int(new_label) == original_label:
        common_dict.false_detected_dict[current_key].pop('actual_label', None)
        return jsonify(status="unchanged", message="Label remains unchanged", alertType="info")
    else:
        common_dict.false_detected_dict[current_key]['actual_label'] = int(new_label)
        common_dict.user_modified_labels[current_key] = int(new_label)
        update_training_labels(common_dict.user_modified_labels, 256)
        return jsonify(status="success", message="Label updated successfully", alertType="success")


@app.route('/fdi_status', methods=['GET'])
def fdi_status():
    # Check the status of your thread. If it's complete, return "done". Otherwise, return "processing".
    # This is a simple example, you might need to adjust it to your actual threading setup.
    while false_detected_thread.is_alive():
        return jsonify(status="processing")

    return jsonify(status="done")

def load_modifications():
    with open("modifications.json", "r") as file:
        modifications = json.load(file)
    return modifications

@app.route('/fdi', methods=['GET', 'POST'])
def visualize_false_detected_images():
    modifications = load_modifications()

    keys_list = list(common_dict.false_detected_dict.keys())


    if not keys_list:
        # Handle empty list case
        return render_template('fdi-no-image.html')

    if 'current_index' not in session:
        session['current_index'] = 0
    else:
        if session['current_index'] >= len(keys_list):
            session['current_index'] = 0

    if request.method == 'POST':
        if 'next' in request.form and session['current_index'] < len(keys_list) - 1:
            session['current_index'] += 1
        elif 'previous' in request.form and session['current_index'] > 0:
            session['current_index'] -= 1

    current_key = keys_list[session['current_index']]
    current_detection = common_dict.false_detected_dict[current_key]

    # Checking if the current_key exists in the modifications dictionary
    if current_key in modifications:
        # Updating the label in current_detection with the label from modifications dictionary
        current_detection['actual_label'] = modifications[current_key]

    if 'image_tensor' not in current_detection:
        return "Error: image_tensor key not found for the current detection."
    current_detection['image'] = tensor_to_image_base64(current_detection['image_tensor'])
    return render_template('fdi.html', detection=current_detection, total_images=len(keys_list),
                           current_index=session['current_index'], keys_list=keys_list)

@app.route('/dti')
def render_dti():
    return render_template('dti.html')


@app.route('/fdinm')
def fdinomodel():
    return render_template('fdi-no-model.html')

def check_revert(revert):
    if revert:
        if os.path.exists(f"data/{current_model}_model_new.pt"):
            revert_history(f"data/{current_model}_epoch_data.json")
            os.remove(f"data/{current_model}_model_new.pt")
        else:
            sendAlert(4, "Nothing to revert")
            print("LOG: nothing to revert")
        print("LOG: TRAINING OLD REVERTED MODEL")
        return
    elif os.path.exists(f"data/{current_model}_model_new.pt"):
        # aktualisiert das model
        # model is always loaded by training
        # model_new.pt is for the new one
        # that will be written into by trianing
        shutil.copy(f"data/{current_model}_model_new.pt", f"data/{current_model}_model.pt")
        print("LOG: NO REVERT")


# style 1-normal; 2-success; 3-danger; 4-warning
def sendAlert(style, content):
    data = {
        'style': style,
        'content': content
    }
    socketio.emit('sendAlert', {'data': data})


# ---------------------- APP ROUTES FLASK ----------------------#
# Route to save false detected images to the database


@app.route('/')
def index():
    return render_template('index.html')

    # --------------------slider adjustments-----------#


@app.route('/sendadjust', methods=['POST'])
def gettingAdjustments():
    if request.method == 'POST':
        data = request.get_json()
        for key, value in data.items():
            if key in adj:
                adj[key] = value
        return response


@app.route('/getadjust', methods=['POST'])
def sendingAdjustments():
    print('\n DATA WIRD AUFGERUFEN' + str(adj))
    if request.method == 'POST':
        response = adj;
        return jsonify({'response': response})


# --------------------------history adjustments --------------------#
@app.route('/get_adjustments_data', methods=['GET'])
def get_adjustments_data():
    file_path = os.path.join("data", f"{current_model}_epoch_data.json")
    adjustments_data = {
        "learning_rate": [],
        "momentum": [],
        "dropout_rate": [],
        "loss_function": [],
        "epochs": [],
        "batch_size": []
    }

    if empty_missing_file(file_path):
        print("LOG: empty history update sent")
        return jsonify(adjustments_data)

    with open(file_path, 'r') as file:
        data = json.load(file)
    for key in adjustments_data.keys():
        adjustments_data[key] = data[key]
    print("LOG: history update sent to frontend")
    return jsonify(adjustments_data)

    # ---------------start -stop ------------------#


@app.route('/start_beta', methods=['POST'])
def start_beta():

    revert = request.get_json()
    print("LOG: RECEIVED TO RUN: " + str(adj))
    print("LOG: STARTING TRAINING")
    check_revert(revert)
    update_data()
    socketio.emit('update_chart', {'data': data})
    start_training_dict_beta(adj)
    return jsonify(status='success')


@app.route('/start', methods=['POST'])
def start():
    revert = request.get_json()
    print("LOG: RECEIVED TO RUN: " + str(adj))
    print("LOG: STARTING TRAINING")
    check_revert(revert)
    update_data()
    socketio.emit('update_chart', {'data': data})
    start_training_dict(adj)
    return response


@app.route('/stop_beta', methods=['POST'])
def stop_beta():
    print("LOG: STOP PRESSED")
    stop_eval()
    stop_training()
    return response

@app.route('/stop', methods=['POST'])
def stop():
    print("LOG: STOP PRESSED")
    stop_eval()
    stop_training()
    return response

    # ----------------------other buttons --------------#


@app.route('/clear_history', methods=['POST'])
def clear_history_data():
    clear(f"data/{current_model}_epoch_data.json")
    clear_modifications()
    false_detected_dict.clear()
    update_data()
    socketio.emit('update_chart', {'data': data})
    print("LOG: CLEAR HISTORY")
    return response


@app.route('/revert_possible', methods=['POST'])
def revert_possible():
    if os.path.exists(f"data/{current_model}_model_new.pt"):
        return ("1")
    else:
        return ("0")

        # --------------------drawing ------------------------#


@app.route('/predict_drawing', methods=['POST'])
def predict_drawing():
    data = request.get_json()
    image_data = data['image_data']
    image_bytes = base64.b64decode(image_data.split(',')[1])
    img = Image.open(io.BytesIO(image_bytes))
    new_img = Image.new('RGB', img.size, 'black')
    new_img.paste(img, (0, 0), img)
    new_img.save('static/img.jpg', 'jpeg')
    prediction, confidence = test_drawing(current_model)
    if prediction == -1:
        sendAlert(3, "ERROR: there's likely no model trained, try train the neural network before testing")
        return response

    return jsonify({'prediction': int(prediction), 'confidence': float(confidence)})


@app.route('/get_image', methods=['GET'])
def get_image():
    image_path = 'static/images/output.png'

    with open(image_path, 'rb') as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode('utf-8')

    response = {'image': encoded_image}
    return jsonify(response)

    # ---------------------- ROUTE SAVE LOAD ----------------#


# Function to generate a random string of characters
def random_string(length):
    letters = string.ascii_letters + string.digits
    return ''.join(random.choice(letters) for _ in range(length))



@app.route('/send_image', methods=['POST'])
def send_image():
    try:
        data = request.json
        image_data = data['image_data']
        image_data = image_data.split(',')[1]
        image_data = base64.b64decode(image_data)

        label = data['label']  # Get the label from the request data



        # Open the image and convert it to grayscale
        image = Image.open(io.BytesIO(image_data)).convert('L')

        # Convert image to numpy array and crop the empty space
        image_np = np.array(image)
        non_empty_columns = np.where(image_np.min(axis=0)<255)[0]
        non_empty_rows = np.where(image_np.min(axis=1)<255)[0]
        cropBox = (min(non_empty_columns), min(non_empty_rows), max(non_empty_columns), max(non_empty_rows))
        image_np_crop = image_np[cropBox[1]:cropBox[3]+1, cropBox[0]:cropBox[2]+1]

        # Convert back to image and resize to 28x28
        image_crop = Image.fromarray(image_np_crop)
        image_resized = ImageOps.fit(image_crop, (28, 28), method=0, bleed=0.0)

        # Save the processed image in "New Test Images" folder with a unique random name
        folder_path = os.path.join(os.getcwd(), 'New Test Images')
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)

        unique_filename = f'{random_string(32)}{label}.png'
        image_path = os.path.join(folder_path, unique_filename)

        image_resized = image_resized.convert('L')  # Convert to grayscale
        image_resized.save(image_path, format='PNG')  # Save as PNG

        # Save as output_draw.png also
        image_resized.save('static/images/output_draw.png')

        with open('static/images/output_draw.png', 'rb') as image_file:
            encoded_image = base64.b64encode(image_file.read()).decode('utf-8')

        response = {'image': encoded_image}
        return jsonify(status="success", message="Image saved successfully."), 200

    except Exception as e:
        return jsonify(status="error", error=str(e), message="There was an error saving the image."), 400
@app.route('/saved_models_html', methods=['POST'])
def send_saved_models_html():
    saved_models_json = 'data/saved_models.json'

    if not os.path.exists(saved_models_json):
        with open(saved_models_json, 'w') as file:
            json.dump({}, file)

    savedModelsHTML = request.json.get('savedModelsHTML')

    with open('data/saved_models.json', 'w') as file:
        json.dump(savedModelsHTML, file)
    return response


@app.route('/restore_saved_models_html', methods=['GET'])
def restore_saved_models_html():
    saved_models_json = 'data/saved_models.json'

    if os.path.exists(saved_models_json):
        with open(saved_models_json, 'r') as file:
            json_data = json.load(file)
        return jsonify(json_data)
    else:
        return jsonify("response")


# Not developed yet
@app.route('/train_with_changed_labels', methods=['POST'])
def train_with_changed_labels():
    training_data = request.json
    # Perform training with the updated labels in training_data
    # You can modify your existing training code to include these images
    # and update the model accordingly

    # Return a response indicating success
    return jsonify({"message": "Model trained with changed labels successfully."})


@app.route('/load_model', methods=['POST'])
def load_model():
    global current_model
    if current_model == "":
        if os.path.exists(f"data/_model.pt"):
            os.remove(f"data/_model.pt")
        if os.path.exists(f"data/_model_new.pt"):
            os.remove(f"data/_model_new.pt")
        if os.path.exists(f"data/_epoch_data.json"):
            os.remove(f"data/_epoch_data.json")
    current_model = request.json
    error = verify_data(f"data/{current_model}_epoch_data.json")
    if error:
        sendAlert(3, "ERROR: please read logs")
        socketio.emit('verify_error')
    else:
        sendAlert(2, f"Successfully loaded {current_model}")
        update_data()
        socketio.emit('update_chart', {'data': data})
        socketio.emit('changed_model', {'data': [1]})
    return response


@app.route('/save_model', methods=['POST'])
def save_model():
    if os.path.exists(f"data/{current_model}_model_new.pt"):
        model = f"{current_model}_model_new.pt"
    elif os.path.exists(f"data/{current_model}_model.pt"):
        model = f"{current_model}_model.pt"
    else:
        sendAlert(3, "Model to store was not found")
        print(f"ERROR:model doesn't exists")
        return response

    print("LOG: model to save: " + model)

    # the current model ist not set to the new
    # nameing space, it only saves without loading
    name = request.json.get('new_model_name')

    # copy the current model and epoch_data
    shutil.copy(f"data/{model}", f"data/{name}_model.pt")
    shutil.copy(f"data/{current_model}_epoch_data.json", f"data/{name}_epoch_data.json")
    sendAlert(2, f"Successfully saved {name}")
    print("LOG: saved: " + name)
    return response


@app.route('/delete_model', methods=['POST'])
def delete_model():
    global current_model
    name = request.get_json()
    if os.path.exists(f"data/{name}_model.pt"):
        os.remove(f"data/{name}_model.pt")
    elif os.path.exists(f"data/{name}_model_new.pt"):
        os.remove(f"data/{name}_model_new.pt")
    else:
        print("ERROR: model to be deleted does not exist")
        sendAlert(3, "ERROR: Model to be deleted does not exist")
    if os.path.exists(f"data/{name}_epoch_data.json"):
        os.remove(f"data/{name}_epoch_data.json")
    if name == current_model:
        current_model = ""
        update_data()
        socketio.emit('update_chart', {'data': data})
        socketio.emit('changed_model', {'data': [1]})
    return response


@app.route('/get_model_name', methods=['GET'])
def get_model_name():
    return jsonify(current_model)


@app.route('/create_empty_model', methods=['POST'])
def create_empty_model():
    global current_model
    if os.path.exists(f"data/_model.pt"):
        os.remove(f"data/_model.pt")
    if os.path.exists(f"data/_model_new.pt"):
        os.remove(f"data/_model_new.pt")
    if os.path.exists(f"data/_epoch_data.json"):
        os.remove(f"data/_epoch_data.json")
    current_model = ""
    update_data()
    socketio.emit('update_chart', {'data': data})
    socketio.emit('changed_model', {'data': [1]})
    return response


# ----------------------------------------------------------------#
# start server & websocket connection
# any init stuff can be put here
@socketio.on('connect')
def handle_connect():
    init_print(sendAlert)
    remove_unnecessary()
    error = verify_data(f"data/{current_model}_epoch_data.json")
    if error:
        sendAlert(3, "ERROR: please read logs")
        socketio.emit('verify_error')
    else:
        update_data()
        print("Connected to client.")
        block_revert()
        socketio.emit('update_chart', {'data': data})


def remove_unnecessary():
    if os.path.exists('static/images/output.png'):
        print('LOG: removed output.png')
        os.remove('static/images/output.png')
    if os.path.exists('static/img.jpg'):
        print('LOG: removed img.jpg')
        os.remove('static/img.jpg')


@socketio.on('disconnect')
def handle_disconnect():
    stop_training()
    remove_unnecessary()
    print('Client disconnected')


if __name__ == '__main__':
    print('App started')
    webbrowser.open_new_tab('http://127.0.0.1:5001')
    socketio.run(app, host='127.0.0.1', port=5001, debug=True)
    app.run(debug=True)


