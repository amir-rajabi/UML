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
from ml_utils.json_write import write_json, get_run_num 
from ml_utils.print_overwrite import print

#cross_entroyp - soft_margin_loss good
#l1_loss weird
#smooth_l1_loss decent
#poisson_nll_loss decent

start_timer = 0

loss_func = [F.cross_entropy, F.multi_margin_loss, F.multilabel_soft_margin_loss,
        F.soft_margin_loss, F.l1_loss, F.smooth_l1_loss, F.poisson_nll_loss]
stop_flag = False


def train_step(model: Module, optimizer: Optimizer, data: Tensor,
               target: Tensor, cuda: bool, loss_nr):
    model.train()
    if cuda:
        data, target = data.cuda(), target.cuda()
    prediction = model(data)

    if loss_nr > 1:
        target = F.one_hot(target, 10)

    #currently uses loss_function intput into the function
    loss = loss_func[loss_nr](prediction, target)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()


def training(name, chart_data, socketio, dictionary, model: Module,
            optimizer: Optimizer,
            cuda: bool, n_epochs: int,
            batch_size: int, loss_nr):
    bcounter = 0
    global_epoch=len(chart_data["d1"])
    run_index = get_run_num(f"data/{name}_epoch_data.json")
    train_loader, test_loader = get_data_loaders(batch_size=batch_size)
    if cuda:
        model.cuda()
    for epoch in range(n_epochs):
        for batch in train_loader:
            data, target = batch
            train_step(model=model, optimizer=optimizer, cuda=cuda, data=data,
                       target=target, loss_nr=loss_nr)
            if bcounter % 5 == 0:
                socketio.emit('batch', {'data': [1]})
                bcounter += 1
            else: 
                bcounter += 1

            if stop_flag:
                break
        else:
            #this else statement makes it so
            #that if an interrupt is send this block will not
            #go through. If however the loop finishes without
            #the interrupt, then it will execute
            #this means that on interrupt the current epoch is
            #aborted
            test_loss, test_accuracy = accuracy(loss_nr, model, test_loader, cuda)
            train_loss, train_accuracy = accuracy(loss_nr, model, train_loader, cuda)

            if stop_flag:
                break

            if not epoch:
                print(f"LOG: time for one epoch: {time.time()-start_timer}")

            #should likely not pop up, delete this in production
            if str(test_loss) == "nan":
                test_loss = 5
                print("Overflow detected in testing loss")
            if str(train_loss) == "nan":
                train_loss = 5
                print("Overflow detected in training loss")

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
            write_json(dictionary,path=f"data/{name}_epoch_data.json")
            curr_glob_epoch = len(chart_data["d1"])
            print(f'LOG: epoch={curr_glob_epoch}/{global_epoch+n_epochs}, train accuracy={train_accuracy}, train loss={train_loss}')
            print(f'LOG: epoch={curr_glob_epoch}/{global_epoch+n_epochs}, test accuracy={test_accuracy}, test loss={test_loss}')
            torch.save(model.state_dict(), f'data/{name}_model_new.pt')
            print("LOG: model written")
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
        loss_nr=int(params["loss_function"])
    )

#is called by frontend when interrupt ist set
def stop_training():
    global stop_flag 
    stop_flag = True
