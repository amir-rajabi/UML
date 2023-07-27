# authors:       Eren Kocadag, Benedikt Schmitz, Feliks Vdovichenko, Lucie Prokopy, Leiss Abdal Al, Johannes Ehrich
# institution:   Freie Universität Berlin
# institute:     Institut für Informatik
# module:        SWP - Usable Machine Learning
# year:          2023

import numpy as np
import time, random, os, math
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO

'''
this module is heavily tied with training
and evaluate module
'''

'''progressbar stats'''
pb_s = {
        "n_epochs":0,
        "epoch":0,
        "curr_perc":0,
        "batch_size":0,
        "socket":None
}

'''init data'''
def init_pb(socketio, batch_size,n_epochs):
    global pb_s
    pb_s["socket"]=socketio
    pb_s["batch_size"]=batch_size
    pb_s["n_epochs"]=n_epochs

'''
updates to a current percentage of
of the epoch
'''
def update_pb(curr_percentage):
    global pb_s
    pb_s["curr_perc"]=curr_percentage


'''
updates the epochs and
thereby resets current percentage
'''
def update_pb_epoch(epoch):
    global pb_s
    pb_s["curr_perc"]=0
    pb_s["epoch"]=epoch

'''
if batches -1 we want to make a flat update
without much calculation so just the percentage
but consider also the epoch
this will also update the percentage
-1 is given when we want to finish a subprocess
and make sure the percentage is current

else we calculcate what part of the progress it is
based on how many max batches there are for this
subprocess, thereby calculating what fraction it is
of the EPOCH not the entire bar and then calculating it
with the fraction of the epoch to epoch numbers
'''
def send_pb(batches, percent):
    fraction = batches*pb_s["batch_size"]/130000
    socketio = pb_s["socket"]
    if batches == -1:
        update_pb(percent)
        socketio.emit('percent', {'percent': math.ceil(100* (pb_s["epoch"]+percent)/pb_s["n_epochs"])})
    else:
        socketio.emit('percent', {'percent': math.ceil(100*(pb_s["curr_perc"] +pb_s["epoch"]+fraction*percent)/pb_s["n_epochs"])})
