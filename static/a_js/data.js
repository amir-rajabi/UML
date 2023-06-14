export var socket = io();

export var adjustments = {
    learning_rate: null,
    momentum: null,
    dropout_rate: null,
    loss_function: null, 
    epochs: null,
    batch_size: null
};

export var chartData = {
    d1: [],
    d2: [],
    d3: [],
    d4: []
};

export var history = {
    r1: [],
    r2: [],
    r3: [],
    r4: []
};

export function updateAdjustments(data) {
    adjustments.learning_rate = data.learning_rate;
    adjustments.momentum = data.momentum;
    adjustments.dropout_rate = data.dropout_rate;
    adjustments.loss_function = data.loss_function;
    adjustments.epochs = data.epochs;
    adjustments.batch_size = data.batch_size;
}