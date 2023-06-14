from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
from PIL import Image, ImageDraw
import base64
import io

#for start_training method
from ml_utils.training import start_training as train
from multiprocessing import Process

#for test_method
from ml_utils.testing import test_drawing

app = Flask(__name__)
socketio = SocketIO(app)
data = {
    'd1': [1, 2, 3, 4, 5, 5, 2, 2, 1],
    'd2': [5, 4, 3, 2, 1],
    'd3': [1, 3, 5, 4, 2],
    'd4': [3, 4, 5, 2, 1]
}

#default values can be changed here
adj = {
    "learning_rate": 0.2,
    "momentum": 0.5,
    "dropout_rate": 0,
    "loss_function": 0,
    "epochs": 1,
    "batch_size": 256
}


#TODO: block start button on training
#   currently it's possible to start training mutliple
#   times; this should not be possible in the final product
#TODO: add interrupt
#   probably doesn't belong here but still
#   likely should be done by lockfiles 
#   and training checking for said lockfile, unlocking
#   and posting update '-1'
#starts training in ml_utils.training.py
#with parameters
def start_training_dict(params):
    #NOTE: what to do with sesed?
    # should it be chooseable or rolled randomly each time?
    # or options for both?
    worker_process = Process(target=train, args=[params],daemon=True)
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
    print("LOG: RECEIVED TO RUN: " +str(adj))
    print("LOG: STARTING TRAINING")
    start_training_dict(adj)

    response_text = "Daten empfangen und gespeichert!"
    return jsonify({'response': response_text})

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

