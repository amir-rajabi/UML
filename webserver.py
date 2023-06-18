from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
from PIL import Image
import base64, io, os, sys, time, threading, json, webbrowser, shutil

#for start_training method
from ml_utils.training import start_training as train
from ml_utils.json_write import clear_history as clear
from ml_utils.json_write import revert_history
from multiprocessing import Process

#for end_training
from ml_utils.training import stop_training

#for test_method
from ml_utils.testing import test_drawing



app = Flask(__name__)
socketio = SocketIO(app)

config_revert = False
#disable training by giving webserver any number
testing_flag = False

data = {
    'd1': [],   #accuracy
    'd2': [],   #loss
    'd3': [],	#train accuracy
    'd4': [],	#train loss
    'run': []
}

# DO NOT CHANGE THIS
# default values should be changed in javascript (data.js)
adj = {
    "learning_rate": 0,
    "momentum": 0,
    "dropout_rate": 0,
    "loss_function": 0,
    "epochs": 0,
    "batch_size": 0
}
response = ""

#loads history
def update_data():
    try:
        with open("data/epoch_data.json", "r") as file:
            history = json.load(file)
    except:
        return
    data["d1"] = history["accuracy"]
    data["d2"] = history["loss"]
    data["d3"] = history["train_accuracy"]
    data["d4"] = history["train_loss"]
    data["run"] = history["run"]
    return

#starts training in ml_utils.training.py with parameters

def start_training_dict(params):
    #NOTE: what to do with sesed?
    # should it be chooseable or rolled randomly each time?
    # or options for both?
    worker_process = threading.Thread(target=train, args=[data, socketio, params.copy()])
    worker_process.start()
    return

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/sendadjust', methods=['POST'])   # (frontend is sending adjustments) 
def gettingAdjustments():
  if request.method == 'POST':
    data = request.get_json()   
    for key, value in data.items():
      if key in adj:
        adj[key] = value
    return response

@app.route('/getadjust', methods=['POST'])  # (frontend is getting adjustments) 
def sendingAdjustments():
  print('\n DATA WIRD AUFGERUFEN', adj)
  if request.method == 'POST':
    response = adj;
    return jsonify({'response': response})

def check_revert():
    global config_revert
    if config_revert:
        revert_history()
        update_data()
        config_revert = False
        print("LOG: TRAINING OLD REVERTED MODEL")
        return
    elif os.path.exists("data/model_new.pt"):
        #aktualisiert das model
        #model is always loaded by training
        #model_new.pt is for the new one
        #that will be written into by trianing
        shutil.copy("data/model_new.pt", "data/model.pt")
        print("LOG: NO REVERT")

@app.route('/start', methods=['POST'])
def start():
    print("LOG: RECEIVED TO RUN: " +str(adj))
    if testing_flag:
        print("LOG: testing; training skipped")
        return response
    print("LOG: STARTING TRAINING")
    check_revert()
    start_training_dict(adj)
    return response


@app.route('/stop', methods=['POST'])  
def stop():
    print("LOG: STOP PRESSED")
    stop_training()
    return response


#TODO: make revert work
#GOTO: start() -> check_revert()
#this function will only set the Flag 
#the action of reverting is done in check_revert
@app.route('/revert', methods=['POST'])
def revert():
    #TODO: add signal to update chart in JS
    global config_revert
    config_revert = True
    print("LOG: REVERT PRESSED")
    return response

@app.route('/redo', methods=['POST'])
def redo():
    global config_revert
    config_revert = False
    print("LOG: REDO PRESSED")
    return response


#TODO: already has an interface in json_write.py
#   this is basicly 2 lines of code at max
@app.route('/clear_history', methods=['POST']) 
def clear_history_data():
    clear()
    update_data()
    socketio.emit('update_chart', {'data':data})
    print("LOG: CLEAR HISTORY")
    return response


@app.route('/predict_drawing', methods=['POST'])
def predict_drawing(config_revert):
    data = request.get_json()
    image_data = data['image_data']   
    image_bytes = base64.b64decode(image_data.split(',')[1])
    img = Image.open(io.BytesIO(image_bytes))    
    new_img = Image.new('RGB', img.size, 'black')
    new_img.paste(img, (0, 0), img)
    new_img.save('static/img.jpg', 'jpeg')
    prediction = test_drawing()

    return jsonify({'prediction': int(prediction)})

# start server & websocket connection 
# any init stuff can be put here
@socketio.on('connect')
def handle_connect():

    #disables training, give 
    #arguments only for testing
    if len(sys.argv) == 2:
        global testing_flag
        testing_flag = True
        print("LOG: testing mode")

    update_data()
    print("Connected to client.")
    socketio.emit('update_chart', {'data': data})

@socketio.on('disconnect')
def handle_disconnect():
    stop_training()
    print('Client disconnected')

if __name__ == '__main__':
    print('App started')
    # webbrowser.open('http://localhost:5001')
    socketio.run(app, host='127.0.0.1', port=5001, debug=False)
    
