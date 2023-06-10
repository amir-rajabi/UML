import {adjustments} from './data.js';
window.adjustments = adjustments;

const slider1 = document.getElementById('customRange1');        //learning rate
const sliderValue1 = document.getElementById('sliderValue1');
const slider2 = document.getElementById('customRange2');        //momentum
const sliderValue2 = document.getElementById('sliderValue2');
const slider3 = document.getElementById('customRange3');        // dropout rate
const sliderValue3 = document.getElementById('sliderValue3');

const dropdown1 = document.getElementById('adjust-dropdown1');

slider1.addEventListener('input', function() {
    sliderValue1.textContent = this.value;
    window.adjustments.learning_rate = this.value;
    console.log(adjustments);
});
slider2.addEventListener('input', function() {
    sliderValue2.textContent = this.value;
    window.adjustments.momentum = this.value;
});
slider3.addEventListener('input', function() {
    sliderValue3.textContent = this.value;
    window.adjustments.dropout_rate = this.value;
});

dropdown1.addEventListener('input', function(){
    window.adjustments.loss_function = this.value;
});