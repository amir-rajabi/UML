import {updateAdjustments, defaults, restoreAllAdjustments, socket} from './data.js';
import {sendAdjustments, block_button} from './send.js';
import {createAlert} from './alerts.js';

window.defaults_data = defaults;

var reset_settings = document.getElementById('flexCheckChecked');
var clear_history = document.getElementById('flexCheckDefault');
var reset = document.getElementById('reset');
var revert = document.getElementById('revert');
var resetModal = document.getElementById('resetModal');
var accordion_history = document.getElementById('accordion_history');


reset.addEventListener('click', function(){
    if (reset_settings.checked && clear_history.checked){
        updateAdjustments(defaults_data);
        sendAdjustments();
        restoreAllAdjustments();
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/clear_history', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(1);
        block_button(revert, true)
        accordion_history.innerHTML = '';
        createAlert(2, 'All settings have been reset and the history has been deleted.')
    }
    else if (reset_settings.checked){
        updateAdjustments(defaults_data);
        sendAdjustments();
        restoreAllAdjustments();
        createAlert(2, 'All settings have been reset.');
    }
    else if (clear_history.checked){
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/clear_history', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(1);
        block_button(revert, true)
        accordion_history.innerHTML = '';
        createAlert(2, 'The history has been deleted.');
    }
    else {
        createAlert(4, 'You have to tick a box to reset. Try again.');
    }
    reset_settings.checked = true;
    clear_history.checked = false;
});
