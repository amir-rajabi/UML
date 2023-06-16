var alertCounter = 1;

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