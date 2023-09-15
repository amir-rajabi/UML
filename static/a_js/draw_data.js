
var canvas = document.getElementById('drawingcanvas');
  var context = canvas.getContext('2d');
  var drawing = false;
  var previousX = 0;
  var previousY = 0;
  var clear_button = document.getElementById('clearButton');
  var output_img = document.getElementById('output_img');
  var save_button = document.getElementById('saveButton');
  save_button.disabled = true;  // Initially disable the save button
  var adjustedImageData = null;


  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  var adjustedImageData;

save_button.addEventListener('click', function(){
    var imageData = canvas.toDataURL();
    var selectedLabel = document.getElementById('new_label').value;  // Get the selected label

    // Get the adjusted image
    getIMG(imageData, function(response){
        if(response.status === "success") {
            createAlert(1, response.message);  //  success alert
            clear_canvas();

            document.getElementById('new_label').value = '0';  // Reset the toggle after saving
        } else {
            createAlert(3, response.message);  // Create error alert
        }
    });
});

function getIMG(imageData, callback) {
    var selectedLabel = document.getElementById('new_label').value;  // Get the selected label

    var xhr9 = new XMLHttpRequest();
    xhr9.open('POST', '/send_image', true);
    xhr9.setRequestHeader('Content-Type', 'application/json');
    xhr9.responseType = 'json';
    xhr9.onload = function() {
        var response = xhr9.response;

        if (xhr9.status === 200 && response.status === "success") {
            adjustedImageData = response.image;
            var imageUrl = "data:image/png;base64," + adjustedImageData;
            output_img.src = imageUrl;
            callback(response);
        } else {
            callback(response);
        }
    };
    xhr9.send(JSON.stringify({ image_data: imageData, label: selectedLabel }));
}


  clear_button.addEventListener('click', function(){
    clear_canvas();
    output_img.src = '';
  });

  function startDrawing(event) {
    drawing = true;
    save_button.disabled = false;
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
    context.lineWidth = 10;
    context.strokeStyle = 'white';
    context.lineCap = "round";
    context.stroke();
    previousX = offsetX;
    previousY = offsetY;
  }

  function stopDrawing() {
    drawing = false;
  }

  function clear_canvas(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    save_button.disabled = true
  }



function createAlert(type, message) {
  let alertContainer = document.getElementById('alerts_ctr');
  let alertElement = document.createElement('div');

  let alertClass = 'alert ';
  if (type === 1) {
    alertClass += 'alert-success';
  } else if (type === 3) {
    alertClass += 'alert-danger';
  } else {
    alertClass += 'alert-primary';
  }

  alertElement.setAttribute('class', alertClass);
  alertElement.setAttribute('role', 'alert');
  alertElement.textContent = message;

  alertContainer.appendChild(alertElement);

  setTimeout(() => {
    alertElement.remove();
  }, 5000); // The alert will be removed after 5 seconds
}