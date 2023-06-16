import { adjustments, chartData, history, updateAdjustments, socket, defaults, restoreAllAdjustments } from './data.js';
import { sendAdjustments } from './send.js';

window.adjustments_data = adjustments;
window.defaults_data = defaults
window.chartData = chartData;
window.historyData = history;

var first_run_flag = 1;

socket.on('connect', function() {
    console.log('Connected to server.');
    startRestoring();
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
    sessionStorage.removeItem('UML_DATA_PIEQ4');
});

function startRestoring() {
    var storedData = sessionStorage.getItem('UML_DATA_PIEQ4');
    
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