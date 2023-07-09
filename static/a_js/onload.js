import {adjustments, chartData, updateAdjustments, socket, defaults, restoreAllAdjustments, storedData} from './data.js';
import {sendAdjustments} from './send.js';
import {getModelName} from './models.js';

window.adjustments_data = adjustments;
window.defaults_data = defaults
window.chartData = chartData;
var stop = document.getElementById('stop');
var start = document.getElementById('start');
var redDot = document.getElementById('server-dot-red');
var greenDot = document.getElementById('server-dot-green');
var revert = document.getElementById('revert');

var block = document.getElementsByClassName('block_item');
var blockCanvas = document.getElementById('blockCanvas');
var predict_drawing = document.getElementById('predict_drawing');

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

    for (var i = 0; i < block.length; i++) {
        block[i].disabled = false;
        block[i].style.cursor = 'pointer';
        blockCanvas.style.display = 'none';
        predict_drawing.cursor = 'pointer';
    }

    start.removeAttribute('disabled','');
    startRestoring();
});

socket.on('disconnect', function() {
    stop.style.display = 'none';
    start.style.display = 'block';
    start.setAttribute('disabled','');
    greenDot.style.display = 'none';
    redDot.style.display = 'flex';

    for (var i = 0; i < block.length; i++) {
        block[i].disabled = true;
        block[i].style.cursor = 'not-allowed';
        predict_drawing.disabled = true;
        predict_drawing.cursor = 'not-allowed';
        blockCanvas.style.display = 'block';
    }

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
            var htmlContent = xhr1.responseText;
            try {
                var parsedContent = JSON.parse(htmlContent);
                if (parsedContent !== 0) {
                    var accSavedModels = document.getElementById('saved_models_frontend');
                    if (parsedContent !== "response") {
                        accSavedModels.innerHTML = parsedContent;
                    }
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        }
    }; 
    getModelName();
});