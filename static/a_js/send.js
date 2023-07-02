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
var dsa_revert = document.getElementById('dsa_revert');
var revert_confirmed = document.getElementById('revert_confirmed');
var revertlabel_withtooltip = document.getElementById('revertlabel_withtooltip');
var revertlabel_notooltip = document.getElementById('revertlabel_notooltip');

revert.addEventListener('change', function(){
    var dsa_revert_flag = sessionStorage.getItem('UML_revert');
    if (revert.checked) {
        if (!dsa_revert_flag){
            start.setAttribute('data-bs-toggle', 'modal');
            start.setAttribute('data-bs-target', '#revertModal');
        }
        else {
            start.removeAttribute('data-bs-toggle');
            start.removeAttribute('data-bs-target');
        }
    } else {
        start.removeAttribute('data-bs-toggle');
        start.removeAttribute('data-bs-target');
    }
});

revert_confirmed.addEventListener('click', function(){
    if (dsa_revert.checked){
        revertlabel_withtooltip.style.display = 'none';
        revertlabel_notooltip.style.display = 'block';
        sessionStorage.setItem('UML_revert', 1);
        start.removeAttribute('data-bs-toggle');
        start.removeAttribute('data-bs-target');
    }
    revert.checked = false;
    block_button(revert, true);
    start.style.display = 'none';
    stop.style.display = 'block';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/start', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(true);
});

start.addEventListener('click', function(){
    var dsa_revert_flag = sessionStorage.getItem('UML_revert');
    if (revert.checked){
        if (dsa_revert_flag){
            revert.checked = false;
            block_button(revert, true);
            start.style.display = 'none';
            stop.style.display = 'block';
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/start', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(true);
        }
    } else{
        revert.checked = false;
        block_button(revert, true);
        start.style.display = 'none';
        stop.style.display = 'block';
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/start', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(false);
    }
});

stop.addEventListener('click', function(){
    start.style.display = 'block';
    stop.style.display = 'none';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/stop', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(1);
});

socket.on('training_finished', function(data){
    block_button(revert, false);
    start.style.display = 'block';
    stop.style.display = 'none';
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/revert_possible', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response == "1"){
                revert.disabled = true;
            } else {
                revert.disabled = false;
            }
        }
    };
    xhr.send(1);
    });

socket.on('revert_allowed', function(data){
    if (data == true){
        block_button(revert, false);
    }
});

export function block_button(button, block) {
    if (block == true) {
        if (!button.disabled){
            button.setAttribute('disabled','');
        }
    }
    else if (block == false) {
        if (button.disabled){
            button.removeAttribute('disabled');
        }
    }
}
