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
var revert_confirmed = document.getElementById('revert_confirmed');
var revertChecked = document.getElementById('revertChecked');

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

revert.addEventListener('click', function() {
    var revert_confirm = sessionStorage.getItem('UML_revert');
    if (revert_confirm) {
        revert.style.display = 'none';
        redo.style.display = 'block';
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/revert', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(1);
    }
});
  
revert_confirmed.addEventListener('click', function(){
    if (revertChecked.checked){
        sessionStorage.setItem('UML_revert', 1);
        revert.removeAttribute('data-bs-toggle');
        revert.removeAttribute('data-bs-target');
    }    
    revert.style.display = 'none';
    redo.style.display = 'block';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/revert', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(1);
});

window.addEventListener("load", function() {
    var revert_confirm = sessionStorage.getItem('UML_revert');
    if (revert_confirm){
        revert.removeAttribute('data-bs-toggle');
        revert.removeAttribute('data-bs-target');
    }
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
