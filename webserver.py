from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
from PIL import Image
import base64, io, os, time, threading, json, webbrowser

#for start_training method
from ml_utils.training import start_training as train
from multiprocessing import Process

#for test_method
from ml_utils.testing import test_drawing


app = Flask(__name__)
socketio = SocketIO(app)

data = {
    'd1': [],   #accuracy
    'd2': [],   #loss
    'd3': [],	#train accuracy
    'd4': []	#train loss
}

# DO NOT CHANGE THIS
# default values should be changed in javascript (onload.js)
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
def init_data():
    try:
        with open("data/epoch_data.json", "r") as file:
            history = json.load(file)
    except:
        return
    data["d1"] = history["accuracy"]
    data["d2"] = history["loss"]
    data["d3"] = history["train_accuracy"]
    data["d4"] = history["train_loss"]
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

@app.route('/start', methods=['POST'])  # (frontend is getting adjustments) 
def start():
    print("LOG: RECEIVED TO RUN: " +str(adj))
    print("LOG: STARTING TRAINING")
    start_training_dict(adj)
    return response

#TODO: STOP TRAINING IF ONE IS RUNNING
def stop_training():
   

   print('LOG: STOPPED')


#TODO: make stop work
#   likely should be done by lockfiles 
#   and training checking for said lockfile, unlocking
#   and posting update '-1'
#   or maybe pass a variable that training and flask has access to
@app.route('/stop', methods=['POST'])  # (frontend is getting adjustments) 
def stop():
    print("LOG: STOP PRESSED")
    stop_training();
    return response


#TODO: make revert work
#   involves always saving the backup file of model
#   how do you remember how many epochs were in last run
#   might involve adding to json_write.py interface
@app.route('/revert', methods=['POST'])  # (frontend is getting adjustments) 
def revert():
    print("LOG: REVERT PRESSED")

    return response

#TODO: already has an interface in json_write.py
#   this is basicly 2 lines of code at max
@app.route('/clear_history', methods=['POST']) 
def clear_history():
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
    prediction = test_drawing()

    return jsonify({'prediction': int(prediction)})

# start server & websocket connection 
# any init stuff can be put here
@socketio.on('connect')
def handle_connect():
    init_data()
    print("Connected to client.")
    socketio.emit('update_chart', {'data': data})

@socketio.on('disconnect')
def handle_disconnect():
    stop_training();
    print('Client disconnected')

if __name__ == '__main__':
    print('App started')
    # webbrowser.open('http://localhost:5001')
    socketio.run(app, host='127.0.0.1', port=5001, debug=False)
    
