import {adjustments, chartData, updateAdjustments, socket, defaults, restoreAllAdjustments, storedData, statustxt} from './data.js';
import {sendAdjustments} from './send.js';

window.adjustments_data = adjustments;
window.defaults_data = defaults
window.chartData = chartData;
window.statustxt = statustxt;
var stop = document.getElementById('stop');
var start = document.getElementById('start');
var redDot = document.getElementById('server-dot-red');
var greenDot = document.getElementById('server-dot-green');
var revert = document.getElementById('revert');

var error = false;
var first_run_flag = 1;

socket.on('verify_error', function() {
    stop.style.display = 'none';
    start.style.display = 'block';
    start.setAttribute('disabled','');
    console.log('Disconnected from server');
    error = true;
});

socket.on('connect', function() {
    if(error){
        return
    }
    greenDot.style.display = 'flex';
    redDot.style.display = 'none';
    statustxt.textContent = "READY FOR TRAINING"
    start.removeAttribute('disabled','');
    startRestoring();
});

socket.on('disconnect', function() {
    stop.style.display = 'none';
    start.style.display = 'block';
    start.setAttribute('disabled','');
    greenDot.style.display = 'none';
    redDot.style.display = 'flex';
    sessionStorage.removeItem('UML_DATA_PIEQ4');
});

function startRestoring() { 
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
        updateAdjustments(defaults_data);
        sendAdjustments();
        restoreAllAdjustments();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var xhr = new XMLHttpRequest();
        xhr.open('POST', '/revert_possible', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                if (response == "0"){
                    revert.disabled = true;
                }
            }
        };
        xhr.send(1);

    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', '/restore_saved_models_html', true);
    xhr1.send();
  
    xhr1.onload = function () {
        if (xhr1.status === 200) {
        var htmlContent = JSON.parse(xhr1.responseText);
            if (htmlContent !== 0){
                var accSavedModels = document.getElementById('saved_models_frontend');
                if (htmlContent !== false) {
                    accSavedModels.innerHTML = htmlContent;
                }
            }
        }
    };
});