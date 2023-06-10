from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
import time

app = Flask(__name__)
socketio = SocketIO(app)
data = {
    'd1': [1, 2, 3, 4, 5, 5, 2, 2, 1],
    'd2': [5, 4, 3, 2, 1],
    'd3': [1, 3, 5, 4, 2],
    'd4': [3, 4, 5, 2, 1]
}

adjustments = {
  "learning_rate": 0,
  "momentum": 0,
  "dropout_rate": 0,
  "loss_function": 0
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/adjust', methods=['POST'])
def button():
  if request.method == 'POST':
    data = request.get_json()
    print(f"Empfangene Daten: {data}")
    
    for key, value in data.items():
      if key in adjustments:
        adjustments[key] = value
    print(adjustments)
    response_text = "Daten empfangen und gespeichert!"
    return jsonify({'response': response_text})

# start server & websocket connection 

@socketio.on('connect')
def handle_connect():
    print("Connected to client.")
    socketio.emit('update_chart', {'data': data})

if __name__ == '__main__':
    print('App started')
    socketio.run(app, host='127.0.0.1', port=5001, debug=True)