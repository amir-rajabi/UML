import {adjustments} from './data.js';
window.adjustments = adjustments;

export function sendAdjustments(data) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/adjust', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        console.log(response);
        }
    };
    xhr.send(JSON.stringify(data));
} 


// when start button is clicked, send data to server
const start = document.getElementById('start');
start.addEventListener('click', function(){
    sendAdjustments(adjustments);
});


