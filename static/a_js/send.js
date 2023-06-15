import {adjustments, chartData} from './data.js';
window.adjustments = adjustments;

export function sendAdjustments() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/sendadjust', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(adjustments));
} 

// when start button is clicked, send data to server
var start = document.getElementById('start');
var stop = document.getElementById('stop');
var revert = document.getElementById('revert');


start.addEventListener('click', function(){
    un_block_button(revert);
    start.style.display = 'none';
    stop.style.display = 'block';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/start', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(1);
});

stop.addEventListener('click', function(){
    start.style.display = 'block';
    stop.style.display = 'none';
    un_block_button(revert);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/stop', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(1);
});

revert.addEventListener('click', function(){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/revert', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(1);
});

socket.on('training_finished', function(data){
    un_block_button(revert);
    start.style.display = 'block';
    stop.style.display = 'none';
});


function un_block_button(button) {
    if (button.disabled) {
        button.removeAttribute('disabled');
    } 
    else {
        button.setAttribute('disabled','');
    }
}