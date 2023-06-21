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
var redo = document.getElementById('redo');

start.addEventListener('click', function(){
    revert.style.display = 'block';
    redo.style.display = 'none';
    block_button(revert, true);
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
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/stop', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(1);
});

revert.addEventListener('click', function(){
    revert.style.display = 'none';
    redo.style.display = 'block';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/revert', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(1);
});

redo.addEventListener('click', function(){
    revert.style.display = 'block';
    redo.style.display = 'none';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/redo', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(1);
});


socket.on('training_finished', function(data){
    block_button(revert, false);
    start.style.display = 'block';
    stop.style.display = 'none';
    });

socket.on('revert_allowed', function(data){
    if (data == true){
        block_button(revert, false);
    }
});

export function block_button(button, block) {
    if (block == true) {
        console.log('true');
        if (!button.disabled){
            console.log('not diabled to disabled');
            button.setAttribute('disabled','');
        }
    }
    else if (block == false) {
        console.log('false');
        if (button.disabled){
            console.log('disabled to not disabled');
            button.removeAttribute('disabled');
        }
    }
}
