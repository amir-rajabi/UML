import {adjustments} from './data.js';
window.adjustments = adjustments;

export function sendAdjustments() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/sendadjust', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(adjustments));
} 

// when start button is clicked, send data to server
const start = document.getElementById('start');
start.addEventListener('click', function(){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/run', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(1);
});