#---------------------- IMPORT ----------------------#

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
from PIL import Image
import base64, io, os, sys, time, threading, json, webbrowser, shutil
from multiprocessing import Process

#for start_training method
from ml_utils.training import start_training as train
from ml_utils.json_write import clear_history as clear
from ml_utils.json_write import revert_history, verify_data, empty_missing_file
from ml_utils.training import stop_training
from ml_utils.testing import test_drawing
from ml_utils.print_overwrite import print

#---------------------- VARIABLES ----------------------#

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

#---------------------- FUNCTIONS ----------------------#
def checkRevert(): #if revert is allowed, tell frontend
    if os.path.exists("data/model_new.pt"):
        socketio.emit('revert_allowed', True)

#loads history
def update_data():
    if empty_missing_file():
        for key in data.keys():
            data[key] = []
        return
    with open("data/epoch_data.json", "r") as file:
        history = json.load(file)
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

def check_revert():
    global config_revert
    if config_revert:
        if os.path.exists("data/model_new.pt"):
            revert_history()
            os.remove("data/model_new.pt")
        else:
            #send this to frontend
            #socketio.emit('error', {'error': 'nothing to revert'})
            print("LOG: nothing to revert")
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
  print('\n DATA WIRD AUFGERUFEN'+ str(adj))
  if request.method == 'POST':
    response = adj;
    return jsonify({'response': response})

@app.route('/start', methods=['POST'])
def start():
    print("LOG: RECEIVED TO RUN: " +str(adj))
    if testing_flag:
        print("LOG: testing; training skipped")
        return response
    print("LOG: STARTING TRAINING")
    check_revert()
    update_data()
    socketio.emit('update_chart', {'data':data})
    start_training_dict(adj)
    return response

@app.route('/stop', methods=['POST'])  
def stop():
    print("LOG: STOP PRESSED")
    stop_training()
    return response


#GOTO: start() -> check_revert()
#this function will only set the Flag 
#the action of reverting is done in check_revert
@app.route('/revert', methods=['POST'])
def revert():
    #TODO: add signal to update chart in JS
    # this still applies. see fork graph
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

@app.route('/clear_history', methods=['POST']) 
def clear_history_data():
    clear()
    update_data()
    socketio.emit('update_chart', {'data':data})
    print("LOG: CLEAR HISTORY")
    return response

@app.route('/predict_drawing', methods=['POST'])
def predict_drawing():
    data = request.get_json()
    image_data = data['image_data']   
    image_bytes = base64.b64decode(image_data.split(',')[1])
    img = Image.open(io.BytesIO(image_bytes))    
    new_img = Image.new('RGB', img.size, 'black')
    new_img.paste(img, (0, 0), img)
    new_img.save('static/img.jpg', 'jpeg')
    prediction = test_drawing(config_revert)

    return jsonify({'prediction': int(prediction)})


#----------------------------------------------------------------#

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

    verify_data()
    update_data()
    print_t("Connected to client.")
    checkRevert()
    socketio.emit('update_chart', {'data': data})

@socketio.on('disconnect')
def handle_disconnect():
    stop_training()
    print('Client disconnected')

if __name__ == '__main__':
    print('App started')
    socketio.run(app, host='127.0.0.1', port=5001, debug=False)
