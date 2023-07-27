/*
authors:        Eren Kocadag, Benedikt Schmitz, Feliks Vdovichenko, Lucie Prokopy, Leiss Abdal Al, Johannes Ehrich
institution:    Freie Universität Berlin
institute:      Institut für Informatik
module:         SWP - Usable Machine Learning 
year:           2023
*/

import { socket } from "./data.js";

var progressbar = document.getElementById('progress-bar');
var progress = document.getElementById('progress');

var batch = 0;
var pg_width = 0;

export function startProgress(){
    progress.style.visibility = 'visible';
    progressbar.classList.add("progress-bar-striped", "progress-bar-animated");
    progressbar.style.width = '0%';
    pg_width = 0;
};

export function stopProgress(){
    
};

socket.on('percent', function(data){
    pg_width = data["percent"];
    if(pg_width > 99){
	pg_width = '99';
    }
    progressbar.style.width = pg_width + '%';
    progressbar.textContent = Math.floor(pg_width) + '%'
});


socket.on('training_finished', function(data){
    progressbar.style.width = '100%';
    progressbar.textContent = '100%';
});
