#---------------------- IMPORT ----------------------#

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
from PIL import Image
import base64, io, os, sys, time, threading, json, webbrowser, shutil
from multiprocessing import Process

#for start_training method
from ml_utils.training import start_training as train
from ml_utils.json_write import clear_file as clear
from ml_utils.json_write import revert_history, verify_data, empty_missing_file
from ml_utils.training import stop_training
from ml_utils.testing import test_drawing
from ml_utils.print_overwrite import print, init_print

#---------------------- VARIABLES ----------------------#

app = Flask(__name__)
socketio = SocketIO(app)

config_revert = False
data_corrupted = False

#will be used for saving and loading models
current_model = ""

#chart data
data = {
    'd1': [],   #accuracy
    'd2': [],   #loss
    'd3': [],	#train accuracy
    'd4': [],	#train loss
    'run': []
}

#adjustment data
adj = {
    "learning_rate": 0,
    "momentum": 0,
    "dropout_rate": 0,
    "loss_function": 0,
    "epochs": 0,
    "batch_size": 0
}

#default reponse
response = ""

#---------------------- FUNCTIONS ----------------------#
#if revert is allowed, tell frontend
def block_revert():
    if os.path.exists(f"data/{current_model}_model_new.pt"):
        socketio.emit('revert_allowed', True)

#loads chart
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

#starts training in ml_utils.training.py with parameters
def start_training_dict(params):
    worker_process = threading.Thread(target=train, args=[current_model,data,
                                                          socketio, params.copy()])
    worker_process.start()
    return

#acts according to revert param
def check_revert(revert):
    if revert:
        if os.path.exists(f"data/{current_model}_model_new.pt"):
            revert_history(f"data/{current_model}_epoch_data.json")
            os.remove(f"data/{current_model}_model_new.pt")
        else:
            sendAlert(4,"Nothing to revert")
            print("LOG: nothing to revert")
        config_revert = False
        print("LOG: TRAINING OLD REVERTED MODEL")
        return
    elif os.path.exists(f"data/{current_model}_model_new.pt"):
        #aktualisiert das model
        #model is always loaded by training
        #model_new.pt is for the new one
        #that will be written into by trianing
        shutil.copy(f"data/{current_model}_model_new.pt", f"data/{current_model}_model.pt")
        print("LOG: NO REVERT")

#style 1-normal; 2-success; 3-danger; 4-warning
def sendAlert(style, content):
    data = {
        'style': style,
        'content': content
    }
    socketio.emit('sendAlert', {'data':data})   

#---------------------- APP ROUTES FLASK ----------------------#

@app.route('/')
def index():
    return render_template('index.html')

    #--------------------slider adjustments-----------#
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
  print('\n DATA WIRD AUFGERUFEN'+ str(adj))
  if request.method == 'POST':
    response = adj;
    return jsonify({'response': response})

    #--------------------------history adjustments --------------------#
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
        adjustments_data[key]=data[key]
    print("LOG: history update sent to frontend")
    return jsonify(adjustments_data)

    #---------------start -stop ------------------#
@app.route('/start', methods=['POST'])
def start():
    revert = request.get_json()
    print("LOG: RECEIVED TO RUN: " +str(adj))
    print("LOG: STARTING TRAINING")
    check_revert(revert)
    update_data()
    socketio.emit('update_chart', {'data':data})
    start_training_dict(adj)
    return response

@app.route('/stop', methods=['POST'])  
def stop():
    print("LOG: STOP PRESSED")
    stop_training()
    return response

    #----------------------other buttons --------------#
@app.route('/clear_history', methods=['POST']) 
def clear_history_data():
    clear(f"data/{current_model}_epoch_data.json")
    update_data()
    socketio.emit('update_chart', {'data':data})
    print("LOG: CLEAR HISTORY")
    return response

@app.route('/revert_possible', methods=['POST'])
def revert_possible():
    if os.path.exists(f"data/{current_model}_model_new.pt"):
        return ("1")
    else: 
        return ("0")        

    #--------------------drawing ------------------------#
@app.route('/predict_drawing', methods=['POST'])
def predict_drawing():
    data = request.get_json()
    image_data = data['image_data']   
    image_bytes = base64.b64decode(image_data.split(',')[1])
    img = Image.open(io.BytesIO(image_bytes))    
    new_img = Image.new('RGB', img.size, 'black')
    new_img.paste(img, (0, 0), img)
    new_img.save('static/img.jpg', 'jpeg')
    prediction = test_drawing(current_model,config_revert)
    if prediction == -1:
        sendAlert(3, "ERROR: model not found")
        return response

    return jsonify({'prediction': int(prediction)})

    #---------------------- ROUTE SAVE LOAD ----------------#
 
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

def load_model():
    global current_model
    #semi-pseudocode
    #might need adjustment
    #request should be sometihng that is sent by JS frontend
    current_model = request.name

    error =  verify_data(f"data/{current_model}_epoch_data.json")
    if error:
        sendAlert(3, "ERROR: please read logs")
        socketio.emit('verify_error')
    else: 
        sendAlert(2, f"Successfully loaded {current_model}")
        update_data()

@app.route('/save_model', methods=['POST'])
def save_model():
    if config_revert:
        #copy model.pt
        model = f"{current_model}_model.pt"
    else: 
        #copy new_model.pt
        model = f"{current_model}_model_new.pt"

    print("LOG: model to save: " + model)
    #throw error
    if not os.path.exists(f"data/{model}"):
        sendAlert(3,"Model to store was not found")
        print(f"ERROR:{model} doesn't exists")
        return response

    #the current model ist not set to the new
    #nameing space, it only saves without loading
    name = request.json.get('new_model_name')

    #copy the current model and epoch_data
    shutil.copy(f"data/{model}", f"data/{name}_model.pt")
    shutil.copy(f"data/{current_model}_epoch_data.json", f"data/{name}_epoch_data.json")
    sendAlert(2,f"Successfully saved {name}")
    print ("LOG: saved: " + name)
    return response

@app.route('/delete_model', methods=['POST'])
def delete_model():
    name = request.get_json()
    if os.path.exists(f"data/{name}_model.pt"):
        os.remove(f"data/{name}_model.pt")
    else:
        print("ERROR: model to be deleted does not exist")
        sendAlert(3, "ERROR: Model to be deleted does not exist")
    if os.path.exists(f"data/{name}_model_new.pt"):
        os.remove(f"data/{name}_model_new.pt")
    if os.path.exists(f"data/{name}_epoch_data.json"):
        os.remove(f"data/{name}_epoch_data.json")
    return response


#----------------------------------------------------------------#
# start server & websocket connection 
# any init stuff can be put here
@socketio.on('connect')
def handle_connect():
    init_print(sendAlert)

    error =  verify_data(f"data/{current_model}_epoch_data.json")
    if error:
        sendAlert(3, "ERROR: please read logs")
        socketio.emit('verify_error')
    else:
        update_data()
        print("Connected to client.")
        block_revert()
        socketio.emit('update_chart', {'data': data})


@socketio.on('disconnect')
def handle_disconnect():
    stop_training()
    print('Client disconnected')

if __name__ == '__main__':
    print('App started')
    socketio.run(app, host='127.0.0.1', port=5001, debug=False)
