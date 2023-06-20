import numpy as np
from torch import manual_seed, Tensor
from torch.cuda import empty_cache
from torch.nn import Module, functional as F
import torch.nn as nn
import torch
from torch.optim import Optimizer, SGD

import time
import random
import os

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO

from ml_utils.data import get_data_loaders
from ml_utils.evaluate import accuracy
from ml_utils.model import ConvolutionalNeuralNetwork
from ml_utils.json_write import write_json, get_run_num 
from ml_utils.print_overwrite import print

loss = [F.cross_entropy, F.multi_margin_loss, F.nll_loss]
stop_flag = False


def train_step(model: Module, optimizer: Optimizer, data: Tensor,
               target: Tensor, cuda: bool, loss_func):
    model.train()
    if cuda:
        data, target = data.cuda(), target.cuda()
    prediction = model(data)
    #NOTE: size of targe is [256]
    #       size of prediction is [256,10]
    #TODO: add function to adjust loss function
    #   will probably also have to adjust size
    #   depending on the loss function

    #NOTE: for testing other loss functions
    #print("Target\n")
    #print(target)
    #print(target.size())
    #print("Prediction\n")
    #print(prediction)
    #print(prediction.size())
    #time.sleep(30)
    #print("batch")

    #NOTE: likely needs one_hot_encoding
    #loss = F.multilabel_margin_loss(prediction, target)
    #loss = F.multilabel_soft_margin_loss(prediction, target)
    #loss = F.cosine_embedding_loss(prediction, target)
    #loss = F.hinge_embedding_loss(prediction, target)
    #loss = F.poisson_nll_loss(prediction, target)
    #loss = F.gaussian_nll_loss(prediction, target)
    
    #currently uses loss_function intput into the function
    loss = loss_func(prediction, target)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()


def training(chart_data, socketio, dictionary, model: Module,
            optimizer: Optimizer,
            cuda: bool, n_epochs: int,
            batch_size: int, loss_func):
    global_epoch=len(chart_data["d1"])
    run_index = get_run_num()
    train_loader, test_loader = get_data_loaders(batch_size=batch_size)
    if cuda:
        model.cuda()
    for epoch in range(n_epochs):
        for batch in train_loader:
            data, target = batch
            train_step(model=model, optimizer=optimizer, cuda=cuda, data=data,
                       target=target, loss_func=loss_func)
            if stop_flag:
                break
        else:
            #this else statement makes it so
            #that if an interrupt is send this block will not
            #go through. If however the loop finishes without
            #the interrupt, then it will execute
            #this means that on interrupt the current epoch is
            #aborted
            test_loss, test_accuracy = accuracy(model, test_loader, cuda)
            train_loss, train_accuracy = accuracy(model, train_loader, cuda)

            chart_data['d1'].append(test_accuracy)
            chart_data['d2'].append(test_loss)
            chart_data['d3'].append(train_accuracy)
            chart_data['d4'].append(train_loss)
            socketio.emit('update_chart', {'data':chart_data})
            print("LOG: update chart")

            dictionary["loss"] = str(test_loss)
            dictionary["accuracy"] = str(test_accuracy)
            dictionary["train_loss"] = str(train_loss)
            dictionary["train_accuracy"] = str(train_accuracy)
            dictionary["run"]=str(run_index)
            write_json(dictionary,path="data/epoch_data.json")
            curr_glob_epoch = len(chart_data["d1"])
            print(f'LOG: epoch={curr_glob_epoch}/{global_epoch+n_epochs}, train accuracy={train_accuracy}, train loss={train_loss}')
            print(f'LOG: epoch={curr_glob_epoch}/{global_epoch+n_epochs}, test accuracy={test_accuracy}, test loss={test_loss}')
            torch.save(model.state_dict(), 'data/model_new.pt')
            print("LOG: model written")
            continue
        print('LOG: breaking double loop')
        break
    if cuda:
        empty_cache()
    if stop_flag:
        print("LOG: interrupt successful")
    else:
        print("LOG: TRAINING FINISHED")
    socketio.emit('training_finished', {'data':chart_data})

def init_model(model):
    if os.path.exists("data/model.pt"):
        model.load_state_dict(torch.load("data/model.pt"))
        print("LOG: model loaded")
    return model


#this function is used by frontend
#socket to JS frontend
#data is the current graph in JS
#that will be updated by training
def start_training(data, socketio, params):
    #seed = random.randint(0,100)
    seed = ((len(data["run"]) << 3)*31)%256
    manual_seed(seed)
    np.random.seed(seed)
    model = ConvolutionalNeuralNetwork(float(params["dropout_rate"]))
    model = init_model(model)
    opt = SGD(model.parameters(), lr=float(params["learning_rate"]), 
              momentum=float(params["momentum"]))
    
    global stop_flag
    stop_flag = False
    
    training(
        data,
        socketio,
        params,
        model=model,
        optimizer=opt,
        cuda=False,
        n_epochs=int(params["epochs"]),
        batch_size=int(params["batch_size"]),
        loss_func=loss[int(params["loss_function"])]
    )

#is called by frontend when interrupt ist set
def stop_training():
    global stop_flag 
    stop_flag = True
    print('LOG: STOPPED')
