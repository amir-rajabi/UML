from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
import time

#for start_training method
from ml_utils.training import start_training as train
from multiprocessing import Process



app = Flask(__name__)
socketio = SocketIO(app)
data = {
    'd1': [1, 2, 3, 4, 5, 5, 2, 2, 1],
    'd2': [5, 4, 3, 2, 1],
    'd3': [1, 3, 5, 4, 2],
    'd4': [3, 4, 5, 2, 1]
}

adj = {
    "learning_rate": 0,
  "momentum": 0,
  "dropout_rate": 0,
  "loss_function": 0,
  "epochs": 1,
  "batch_size": 1
}


#starts training in ml_utils.training.py
#with parameters
#to extend param list also edit start training
#in training.py accordingly
#TODO: block start button on training
#   currently it's possible to start training mutliple
#   times; this should not be possible in the final product
#TODO: add interrupt
#   probably doesn't belong here but still
#   likely should be done by lockfiles 
#   and training checking for said lockfile, unlocking
#   and posting update '-1'
def start_training(lr, momentum, dropout_rate, batch_size, epoch_num=5,seed = 0):
    worker_process = Process(target=train, args=[float(lr), float(momentum),
                                                 float(dropout_rate), batch_size,
                                                 epoch_num,seed], daemon=True)
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
    response_text = ""
    return jsonify({'response': response_text})

@app.route('/getadjust', methods=['POST'])  # (frontend is getting adjustments) 
def sendingAdjustments():
  print('\n DATA WIRD AUFGERUFEN', adj)
  if request.method == 'POST':
    response = adj;
    return jsonify({'response': response})

@app.route('/run', methods=['POST'])  # (frontend is getting adjustments) 
def run():
    if adj["loss_function"] == '2':
        print("STARTING TRAINING")
        start_training(adj['learning_rate'], adj['momentum'], adj['dropout_rate'],256,5,0)

    response_text = "Daten empfangen und gespeichert!"
    return jsonify({'response': response_text})

#TODO: intrrupt button
#   @JS dev and Flask dev

# start server & websocket connection 
@socketio.on('connect')
def handle_connect():
    print("Connected to client.")
    socketio.emit('update_chart', {'data': data})

if __name__ == '__main__':
    print('App started')
    socketio.run(app, host='127.0.0.1', port=5001, debug=False)

