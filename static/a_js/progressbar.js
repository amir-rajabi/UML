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
    var ep = document.getElementById('customRange4').value; // get epochs
    var bs = document.getElementById('customRange5').value; // get batch_size
    var totalBatches = Math.ceil(60000 / bs) * ep;

    batch = 100 / Math.ceil(totalBatches / 5);
};

export function stopProgress(){
    
};

socket.on('batch', function(data){
    pg_width += batch;
    progressbar.style.width = pg_width + '%';
    progressbar.textContent = Math.floor(pg_width) + '%'
});
