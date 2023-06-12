from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
import time

#for start_training method
from ml_utils.training import start_training as train
from multiprocessing import Process, JoinableQueue, Event



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
  "loss_function": 0
}


#starts training in ml_utils.training.py
#with parameters
#to extend param list also edit start training
#in training.py accordingly
def start_training(lr, momentum, batch_size, seed = 0):
    worker_process = Process(target=train, args=[float(lr), float(momentum), batch_size, seed], daemon=True)
    worker_process.start()
    return

@app.route('/')
def index():
    return render_template('index.html')

#start button
@app.route('/adjust', methods=['POST'])
def button():
  if request.method == 'POST':
    data = request.get_json()
    print(f"Empfangene Daten: {data}")
    
    for key, value in data.items():
      if key in adj:
        adj[key] = value
    print("adjustmens:" + str(adj))

    #WILL ONLY START TRANING ON LOG-COSH-LOSS
    if adj["loss_function"] == '3':
        print("STARTING TRAINING")
        start_training(adj['learning_rate'], adj['momentum'],256,0)

    response_text = "Daten empfangen und gespeichert!"
    return jsonify({'response': response_text})


# start server & websocket connection 
@socketio.on('connect')
def handle_connect():
    print("Connected to client.")
    socketio.emit('update_chart', {'data': data})

if __name__ == '__main__':
    print('App started')
    socketio.run(app, host='127.0.0.1', port=5001, debug=False)

