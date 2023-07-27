/*
authors:        Eren Kocadag, Benedikt Schmitz, Feliks Vdovichenko, Lucie Prokopy, Leiss Abdal Al, Johannes Ehrich
institution:    Freie Universität Berlin
institute:      Institut für Informatik
module:         SWP - Usable Machine Learning 
year:           2023
*/

var p1 = document.getElementById('save-current-model-popup');
var p2 = document.getElementById('resetModal');
var p3 = document.getElementById('revertModal');
var p4 = document.getElementById('reset_model_window');
var p5 = document.getElementById('load_model_window');

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        if (p1.classList.contains('show')) {
            var button = document.getElementById('save-current-model');
            button.click();
        }
        if (p2.classList.contains('show')) {
            var button = document.getElementById('reset');
            button.click();
        }
        if (p3.classList.contains('show')) {
            var button = document.getElementById('revert_confirmed');
            button.click();
        }
        if (p4.classList.contains('show')) {
            var button = document.getElementById('delete_model_confirmed');
            button.click();
        }
        if (p5.classList.contains('show')) {
            var button = document.getElementById('load_model_confirmed');
            button.click();
        }
    }
}

document.addEventListener('keydown', handleEnterKey);