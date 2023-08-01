# authors:       Eren Kocadag, Benedikt Schmitz, Feliks Vdovichenko, Lucie Prokopy, Leiss Abdal Al, Johannes Ehrich
# institution:   Freie Universität Berlin
# institute:     Institut für Informatik
# module:        SWP - Usable Machine Learning
# year:          2023
import base64
import json
import numpy as np
from torch import manual_seed, Tensor
from torch.cuda import empty_cache
from torch.nn import Module, functional as F
import torch.nn as nn
import torch
from torch.optim import Optimizer, SGD

import time, random, os, math

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO

from ml_utils.data import get_data_loaders
from ml_utils.evaluate import accuracy, init_eval_flag
from ml_utils.model import ConvolutionalNeuralNetwork
from ml_utils.json_write import write_json, get_run_num, dictionary
from ml_utils.print_overwrite import print
from ml_utils.progressbar import init_pb, update_pb_epoch, send_pb

start_timer = 0
stop_flag = False

loss_func = [F.cross_entropy, F.multi_margin_loss, F.multilabel_soft_margin_loss,
        F.soft_margin_loss, F.l1_loss, F.smooth_l1_loss, F.poisson_nll_loss]


def tensor_to_list(tensor):
    return tensor.cpu().numpy().tolist()

def print_json_file(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    print("JSON file contents:")
    print(json.dumps(data, indent=4))

def train_step(model: Module, optimizer: Optimizer, data: Tensor,
               target: Tensor, cuda: bool, loss_nr, false_detected_samples):
    model.train()
    if cuda:
        data, target = data.cuda(), target.cuda()
    prediction = model(data)

    if loss_nr > 1:
        target = F.one_hot(target, 10)

    loss = loss_func[loss_nr](prediction, target)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()

    # Identify false detected samples and save them
    predicted_labels = prediction.argmax(dim=1)
    false_detections = data[predicted_labels != target]
    false_detected_samples.extend(false_detections)

    false_detected_images = []
    for false_detection in false_detections:
        img_byte_array = false_detection.squeeze(0).mul(255).clamp(0, 255).byte().cpu().numpy()
        img_base64 = base64.b64encode(img_byte_array).decode("utf-8")
        false_detected_images.append(img_base64)
    dictionary["false_detected_samples"] = false_detected_images






def training(name, chart_data, socketio, dictionary, model: Module,
            optimizer: Optimizer,
            cuda: bool, n_epochs: int,
            batch_size: int, loss_nr, false_detected_samples):

    #for progressbar
    batches = math.ceil(60000/batch_size)
    init_pb(socketio, batch_size, n_epochs)

    global_epoch=len(chart_data["d1"])
    run_index = get_run_num(f"data/{name}_epoch_data.json")
    train_loader, test_loader = get_data_loaders(batch_size=batch_size)

    false_detected_samples = []

    if cuda:
        model.cuda()
    for epoch in range(n_epochs):
        update_pb_epoch(epoch)
        bcounter = 0
        for batch in train_loader:
            data, target = batch
            train_step(model=model, optimizer=optimizer, cuda=cuda, data=data,
                       target=target, loss_nr=loss_nr, false_detected_samples=false_detected_samples)
            if bcounter % 10 == 0:
                #see progressbar module
                send_pb(batches, bcounter/batches)
            bcounter += 1

            if stop_flag:
                break
        else:
            #gets triggered if inner loop clean finishes
            #doesn't get triggered if inner loop breaks

            #send_pb updates pb but flat without fraction calc

            send_pb(-1, 0.46)
            test_loss, test_accuracy = accuracy(loss_nr, model, test_loader, cuda)

            if stop_flag:
                break
            send_pb(-1, 0.53)

            train_loss,train_accuracy = accuracy(loss_nr, model, train_loader, cuda)

            send_pb(-1,1)
            if stop_flag:
                break

            #triggered on first epoch to check time through logs
            if not epoch:
                print(f"LOG: time for one epoch: {time.time()-start_timer}")

            #detecting overflow of loss
            if str(test_loss) == "nan":
                test_loss = 10
                print("LOG: Overflow detected in testing loss")
            if str(train_loss) == "nan":
                train_loss = 10
                print("LOG: Overflow detected in training loss")

            #if model overflows the accuracy will be 9.8
            #checking for overflow if that is the case
            if int(test_accuracy) < 10:
                is_nan = torch.stack([torch.isnan(p).any() for p in model.parameters()]).any()
                if is_nan:
                    print("ERROR: overflow detected in model weights")
                    sendAlert(3,
                              "Overflow detected in neural network, training was stopped", socketio)
                    sendAlert(3,
                              "try again with different parameters or revert the run", socketio)
                    break

            chart_data['d1'].append(test_accuracy)
            chart_data['d2'].append(test_loss)
            chart_data['d3'].append(train_accuracy)
            chart_data['d4'].append(train_loss)
            chart_data['run'].append(str(run_index))
            socketio.emit('update_chart', {'data':chart_data})
            print("LOG: update chart")

            dictionary["loss"] = str(test_loss)
            dictionary["accuracy"] = str(test_accuracy)
            dictionary["train_loss"] = str(train_loss)
            dictionary["train_accuracy"] = str(train_accuracy)
            dictionary["run"]=str(run_index)
            dictionary["false_detected_samples"] = false_detected_samples
            write_json(dictionary,path=f"data/{name}_epoch_data.json")
            curr_glob_epoch = len(chart_data["d1"])

            print(f'LOG: epoch={curr_glob_epoch}/{global_epoch+n_epochs}, train accuracy={train_accuracy}, train loss={train_loss}')
            print(f'LOG: epoch={curr_glob_epoch}/{global_epoch+n_epochs}, test accuracy={test_accuracy}, test loss={test_loss}')
            print_json_file(f"data/{name}_epoch_data.json")

            torch.save(model.state_dict(), f'data/{name}_model_new.pt')
            continue
        break
    if cuda:
        empty_cache()
    if stop_flag:
        print('LOG: STOPPED')
    else:
        print("LOG: TRAINING FINISHED")
    socketio.emit('training_finished', {'data':chart_data})

#init model
def init_model(name,model):
    if os.path.exists(f"data/{name}_model.pt"):
        model.load_state_dict(torch.load(f"data/{name}_model.pt"))
        print(f"LOG:{name} model loaded")
    return model


#this function is used by frontend
#socket to JS frontend
#data is the current graph in JS
#that will be updated by training
def start_training(name, data, socketio, params):
    
    seed = ((len(data["run"]) << 3)*31)%256
    manual_seed(seed)
    np.random.seed(seed)
    model = ConvolutionalNeuralNetwork(float(params["dropout_rate"]))
    model = init_model(name,model)
    opt = SGD(model.parameters(), lr=float(params["learning_rate"]), 
              momentum=float(params["momentum"]))
    false_detected_samples = []

    global stop_flag
    stop_flag = False
    init_eval_flag()

    cuda = False
    if os.path.exists("data/CUDA.conf"):
        cuda = True
    global start_timer
    start_timer = time.time()
    training(
        name,
        data,
        socketio,
        params,
        model=model,
        optimizer=opt,
        cuda=cuda,
        n_epochs=int(params["epochs"]),
        batch_size=int(params["batch_size"]),
        loss_nr=int(params["loss_function"]),
        false_detected_samples = false_detected_samples  # Pass the list as an argument

    )

#is called by frontend when interrupt ist set
def stop_training():
    global stop_flag 
    stop_flag = True

#style 1-normal; 2-success; 3-danger; 4-warning
#could import from webserver because of cyclic dependency
def sendAlert(style, content, socketio):
    data = {
        'style': style,
        'content': content
    }
    socketio.emit('sendAlert', {'data':data})   
