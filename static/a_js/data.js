export var socket = io();

export var storedData = sessionStorage.getItem('UML_DATA_PIEQ4');

export var statustxt = document.getElementById('status-txt');

export var adjustments = {
    learning_rate: null,
    momentum: null,
    dropout_rate: null,
    loss_function: null, 
    epochs: null,
    batch_size: null
};

export var defaults = {
    learning_rate: 0.1,
    momentum: 0.5,
    dropout_rate: 0,
    loss_function: 0, 
    epochs: 10,
    batch_size: 256
};

export var chartData = {
    d1: [],                 // accuracy
    d2: [],                 // loss
    d3: [],                 // training accuracy
    d4: [],                 // training loss
    run: []
};

export var epochs_per_runs = [];

export var adjustmentsData = {};

export function updateAdjustments(data) {
    adjustments.learning_rate = data.learning_rate;
    adjustments.momentum = data.momentum;
    adjustments.dropout_rate = data.dropout_rate;
    adjustments.loss_function = data.loss_function;
    adjustments.epochs = data.epochs;
    adjustments.batch_size = data.batch_size;
}

var adjust_slider1 = document.getElementById('customRange1');
var sliderValue1 = document.getElementById('sliderValue1');
var adjust_slider2 = document.getElementById('customRange2');
var sliderValue2 = document.getElementById('sliderValue2');
var adjust_slider3 = document.getElementById('customRange3');
var sliderValue3 = document.getElementById('sliderValue3');
var adjust_slider4 = document.getElementById('customRange4');
var sliderValue4 = document.getElementById('sliderValue4');
var adjust_slider5 = document.getElementById('customRange5');
var sliderValue5 = document.getElementById('sliderValue5');
var loss_function = document.getElementById("adjust-dropdown1");

export function restoreAllAdjustments() {
    var learningRate = adjustments.learning_rate;
    var momentum = adjustments.momentum;
    var dropoutRate = adjustments.dropout_rate;
    var epochs = adjustments.epochs;
    var batch_size = adjustments.batch_size;
    var lossFunction = adjustments.loss_function;

    adjust_slider1.value = parseFloat(learningRate);
    sliderValue1.textContent = learningRate;
    adjust_slider2.value = parseFloat(momentum);
    sliderValue2.textContent = momentum;
    adjust_slider3.value = parseFloat(dropoutRate);
    sliderValue3.textContent = dropoutRate;

    adjust_slider4.value = parseInt(epochs);
    sliderValue4.textContent = epochs;
    adjust_slider5.value = parseInt(batch_size);
    sliderValue5.textContent = batch_size;

    loss_function.value = parseFloat(lossFunction);
}