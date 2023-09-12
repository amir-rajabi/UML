
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

  save_button.addEventListener('click', function(){
    var imageData = canvas.toDataURL();

    // Get the adjusted image
    getIMG(imageData, function(){
      if(adjustedImageData) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/save_image', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
          if (xhr.status === 200) {
            createAlert(1, 'Image saved successfully.');
          } else {
            createAlert(3, 'There was an error saving the image.');
          }
        };
        xhr.send(JSON.stringify({ image_data: adjustedImageData }));
      } else {
        createAlert(3, 'No adjusted image data to save.');
      }
    });
  });

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

  function getIMG(imageData, callback){
    var xhr9 = new XMLHttpRequest();
    xhr9.open('POST', '/send_image', true);
    xhr9.setRequestHeader('Content-Type', 'application/json');
    xhr9.responseType = 'json';
    xhr9.onload = function() {
      if (xhr9.status === 200) {
        var response = xhr9.response;
        adjustedImageData = response.image;
        var imageUrl = "data:image/png;base64," + adjustedImageData;
        output_img.src = imageUrl;
        callback();
      }
    };
    xhr9.send(JSON.stringify({ image_data: imageData }));
  }