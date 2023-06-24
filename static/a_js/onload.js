import {adjustments, chartData, history, updateAdjustments, socket, defaults, restoreAllAdjustments, storedData} from './data.js';
import {sendAdjustments} from './send.js';

window.adjustments_data = adjustments;
window.defaults_data = defaults
window.chartData = chartData;
window.historyData = history;
var stop = document.getElementById('stop');
var start = document.getElementById('start');
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
    console.log('Connected to server.');
    start.removeAttribute('disabled','');
    startRestoring();
});

socket.on('disconnect', function() {
    stop.style.display = 'none';
    start.style.display = 'block';
    start.setAttribute('disabled','');
    console.log('Disconnected from server');

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
