from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
import time

app = Flask(__name__)
socketio = SocketIO(app)
data = [1, 4, 3, 5, 4, 7, 2]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/button', methods=['POST'])
def button():
    if request.method == 'POST':
        value = request.form.get('value')
        print(f"Empfangener Wert: {value}")
        response_text = "Button clicked!"
        data = [1, 4, 3, 5, 4, 7, 2, 4]
        socketio.emit('update_chart', data)
        return jsonify({'response': response_text})

@socketio.on('connect')
def handle_connect():
    socketio.sleep(2)
    socketio.emit('update_chart', data)

if __name__ == '__main__':
    print('App started')
    socketio.run(app, host='127.0.0.1', port=5001, debug=True)
