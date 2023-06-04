document.getElementById('button1').addEventListener('click', function() {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/button', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      document.getElementById('response').innerText = response.response;
    }
  };
  xhr.send();
});
