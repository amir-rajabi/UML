/*
authors:        Eren Kocadag, Benedikt Schmitz, Feliks Vdovichenko, Lucie Prokopy, Leiss Abdal Al, Johannes Ehrich
institution:    Freie Universität Berlin
institute:      Institut für Informatik
module:         SWP - Usable Machine Learning 
year:           2023
*/

import {adjustments, chartData, socket, adjustmentsData} from './data.js';
import { getAdjustmentsData, createHistoryItem } from './history.js';
import { startProgress, stopProgress } from './progressbar.js';
window.adjustments = adjustments;
window.adjData = adjustmentsData;

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
var progressbar = document.getElementById('progress-bar');
var run_block = document.getElementsByClassName('run_block');

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
    }
    revert.checked = false;
    start.removeAttribute('data-bs-toggle');
    start.removeAttribute('data-bs-target');
    block_button(revert, true);
    start.style.display = 'none';
    stop.style.display = 'block';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/start', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(true);
    startProgress();
    block_while_running();
});

start.addEventListener('click', function(){
    sessionStorage.setItem('UML_epochs', chartData.run.length);
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
            startProgress();
            block_while_running();
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
        startProgress();
        block_while_running();
    }
});

stop.addEventListener('click', function(){
    start.style.display = 'block';
    stop.style.display = 'none';
    block_button(start, true);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/stop', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(1);
    stopProgress();
});

socket.on('training_finished', function(data){
    block_button(revert, false);
    block_button(start, false);
    start.style.display = 'block';
    stop.style.display = 'none';
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/revert_possible', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response == "0"){
                revert.disabled = true;
            } else {
                revert.disabled = false;
            }
            progressbar.classList.remove("progress-bar-striped", "progress-bar-animated");
            if (progressbar.style.width == '100%'){
                progressbar.textContent = '100%';
            }
            unblock_after_running();
        }
    };
    xhr.send(1);

    getAdjustmentsData().then(function(adjData) {
        var saved_length = sessionStorage.getItem('UML_epochs');
        if (saved_length == chartData.run.length){} 
        else{
            var lastElement = chartData.run.length-1;
            var numofEpochs = 0;
            for (var i = 0; i < lastElement+1; i++) {
                if (chartData.run[i] == chartData.run[lastElement]) {
                    numofEpochs++;
                }
            }
            createHistoryItem(
                chartData.d1[lastElement],
                adjData.learning_rate[lastElement],
                adjData.momentum[lastElement],
                adjData.dropout_rate[lastElement],
                adjData.loss_function[lastElement],
                adjData.batch_size[lastElement],
                numofEpochs
            );
        }
    }).catch(function(error) {
        console.log("Error:", error);
        });
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

function block_while_running(){
    for (var i = 0; i <run_block.length; i++) {
        run_block[i].setAttribute('disabled', '');
    }
}
function unblock_after_running(){
    for (var i = 0; i <run_block.length; i++) {
        run_block[i].removeAttribute('disabled');
    }
}