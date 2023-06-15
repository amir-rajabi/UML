import { adjustments, chartData, history, updateAdjustments } from './data.js';
import { sendAdjustments } from './send.js';

window.adjustments_data = adjustments;
window.chartData = chartData;
window.historyData = history;

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

var first_run_flag = 1;

window.addEventListener('load', function() { 
    var storedData = sessionStorage.getItem('UML_DATA_PIEQ4');
    
    if (storedData) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/getadjust', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                updateAdjustments(response.response);
                restoreAllAdjustments();
            }
        };
        xhr.send(JSON.stringify(first_run_flag));
    } else {
        sessionStorage.setItem('UML_DATA_PIEQ4', first_run_flag);
        var response = {
            learning_rate: 0.1,
            momentum: 0.5,
            dropout_rate: 0,
            loss_function: 0, 
            epochs: 1,
            batch_size: 256
        };
        updateAdjustments(response);
        sendAdjustments();
        restoreAllAdjustments();
    }
});

function restoreAllAdjustments() {
    var learningRate = adjustments_data.learning_rate;
    var momentum = adjustments_data.momentum;
    var dropoutRate = adjustments_data.dropout_rate;
    var epochs = adjustments_data.epochs;
    var batch_size = adjustments_data.batch_size;
    var lossFunction = adjustments_data.loss_function;

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
