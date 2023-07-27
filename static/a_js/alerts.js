/*
authors:        Eren Kocadag, Benedikt Schmitz, Feliks Vdovichenko, Lucie Prokopy, Leiss Abdal Al, Johannes Ehrich
institution:    Freie Universität Berlin
institute:      Institut für Informatik
module:         SWP - Usable Machine Learning 
year:           2023
*/

import {socket} from './data.js'

var alertCounter = 1;

socket.on('sendAlert', function (data) {
  var style = data.data.style;
  var content = data.data.content;
  createAlert(style, content);
});

export function createAlert(style, content) {
  var alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-dismissible fade show";

  if (style == 1) {
    alertDiv.className += " alert-primary";
  } else if (style == 2) {
    alertDiv.className += " alert-success";
  } else if (style == 3) {
    alertDiv.className += " alert-danger";
  } else if (style == 4) {
    alertDiv.className += " alert-warning";
  }

  alertDiv.setAttribute("data-bs-theme", "dark");

  alertDiv.id = "alert" + alertCounter;
  alertCounter++;
  
  alertDiv.innerHTML = content + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';

  var container = document.getElementById("alerts_ctr");
  var firstChild = container.firstChild;

  if (firstChild) {
    container.insertBefore(alertDiv, firstChild);
  } else {
    container.appendChild(alertDiv);
  }  

  for (var i = 1; i < alertCounter; i++) {
    hideAlert("alert" + i);
  }
}

function hideAlert(alertId) {
    setTimeout(function() {
        var previousAlert = document.getElementById(alertId);
        if (previousAlert) {
        previousAlert.style.display = "none";
        }
    }, 10000);
}