/*
authors:        Eren Kocadag, Benedikt Schmitz, Feliks Vdovichenko, Lucie Prokopy, Leiss Abdal Al, Johannes Ehrich
institution:    Freie Universität Berlin
institute:      Institut für Informatik
module:         SWP - Usable Machine Learning 
year:           2023
*/

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

var predict_button = document.getElementById('predict_drawing');
var clear_button = document.getElementById('clear_drawing');
var predicted_no = document.getElementById('predicted_no');
var confidence_value = document.getElementById('confidence');
var output_img = document.getElementById('output_img');

// -------------------- FUNCTIONS

function stopDrawing() {
    drawing = false;
}
function clear_canvas(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    predicted_no.innerHTML = '&nbsp;';
    confidence_value.innerHTML = '&nbsp;';
}
function startDrawing(event) {
    drawing = true;
    var { offsetX, offsetY } = event;
    previousX = offsetX;
    previousY = offsetY;

    predict_button.removeAttribute('disabled');
}
function draw(event) {
    if (!drawing) return;
    var { offsetX, offsetY } = event;
    context.beginPath();
    context.moveTo(previousX, previousY);
    context.lineTo(offsetX, offsetY);
    context.lineWidth = 10;             // Liniendicke verändern
    context.strokeStyle = 'white';
    context.lineCap = "round";
    context.stroke();
    previousX = offsetX;
    previousY = offsetY;
}

// -------------------- EVENTLISTENER

clear_button.addEventListener('click', function(){
    clear_canvas();
    predict_button.setAttribute('disabled','');
    output_img.src = '';
});

predict_button.addEventListener('click', function(){
    var imageData = canvas.toDataURL();
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/predict_drawing', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            var prediction = response.prediction;
            var confidence = response.confidence;
            confidence = (confidence * 100).toFixed(1); 
            predicted_no.textContent = prediction;
            confidence_value.textContent = confidence + '%';
            getIMG();
        } else {
            createAlert(3,'There was an error sending the image.');
        }
    };
    xhr.send(JSON.stringify({ image_data: imageData }));
});

function getIMG(){
    var xhr9 = new XMLHttpRequest();
    xhr9.open('GET', '/get_image', true);
    xhr9.responseType = 'json';

    xhr9.onload = function() {
        if (xhr9.status === 200) {
            var response = xhr9.response;
            var encodedImage = response.image;
            var decodedImage = atob(encodedImage);
            var imageArray = new Uint8Array(decodedImage.length);
            for (var i = 0; i < decodedImage.length; i++) {
                imageArray[i] = decodedImage.charCodeAt(i);
            }
            var blob = new Blob([imageArray], { type: 'image/png' });
            var imageUrl = URL.createObjectURL(blob);
            output_img.src = imageUrl;
        }
    };
    xhr9.send();
}