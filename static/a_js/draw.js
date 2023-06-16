import {createAlert} from './alerts.js';

var canvas = document.getElementById('drawingcanvas');
var context = canvas.getContext('2d');
var drawing = false;
var previousX = 0;
var previousY = 0;

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

function startDrawing(event) {
    drawing = true;
    var { offsetX, offsetY } = event;
    previousX = offsetX;
    previousY = offsetY;
}

function draw(event) {
    if (!drawing) return;

    var { offsetX, offsetY } = event;
    context.beginPath();
    context.moveTo(previousX, previousY);
    context.lineTo(offsetX, offsetY);
    context.lineWidth = 10; // Setzen Sie die Linienbreite nach Bedarf
    context.strokeStyle = 'white';
    context.lineCap = "round";
    context.stroke();

    previousX = offsetX;
    previousY = offsetY;
}

function stopDrawing() {
    drawing = false;
}

var predicted_no = document.getElementById('predicted_no');

document.getElementById('clear_drawing').addEventListener('click', function(){
    clear_canvas();
});

function clear_canvas(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    predicted_no.textContent = "";
}

document.getElementById('predict_drawing').addEventListener('click', function(){
    var imageData = canvas.toDataURL();

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/predict_drawing', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            var prediction = response.prediction;
            predicted_no.textContent = prediction;
        } else {
            createAlert(3,'There was an error sending the image.');
        }
    };
    xhr.send(JSON.stringify({ image_data: imageData }));
});
