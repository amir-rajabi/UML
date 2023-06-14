import {adjustments} from './data.js';
import { sendAdjustments } from './send.js';

window.adjustments = adjustments;

var slider1 = document.getElementById('customRange1');          // learning rate
var sliderValue1 = document.getElementById('sliderValue1');
var slider2 = document.getElementById('customRange2');          // momentum
var sliderValue2 = document.getElementById('sliderValue2');
var slider3 = document.getElementById('customRange3');          // dropout rate
var sliderValue3 = document.getElementById('sliderValue3');
var slider4 = document.getElementById('customRange4');
var sliderValue4 = document.getElementById('sliderValue4');     // epochs
var slider5 = document.getElementById('customRange5');
var sliderValue5 = document.getElementById('sliderValue5');     // batch size

var dropdown1 = document.getElementById('adjust-dropdown1');

slider1.addEventListener('input', function() {
    sliderValue1.textContent = this.value;
    window.adjustments.learning_rate = this.value;
    sendAdjustments();
});
slider2.addEventListener('input', function() {
    sliderValue2.textContent = this.value;
    window.adjustments.momentum = this.value;
    sendAdjustments();
});
slider3.addEventListener('input', function() {
    sliderValue3.textContent = this.value;
    window.adjustments.dropout_rate = this.value;
    sendAdjustments();
});
slider4.addEventListener('input', function() {
    sliderValue4.textContent = this.value;
    window.adjustments.epochs = this.value;
    sendAdjustments();
});
slider5.addEventListener('input', function() {
    sliderValue5.textContent = this.value;
    window.adjustments.batch_size = this.value;
    sendAdjustments();
});

dropdown1.addEventListener('input', function(){
    window.adjustments.loss_function = this.value;
    sendAdjustments();
});