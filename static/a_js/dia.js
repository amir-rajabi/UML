import {chartData, socket, storedData, epochs_per_runs} from './data.js';
import {createAlert} from './alerts.js';
import {historyFrontend} from './history.js';

window.chartData = chartData;
window.epr = epochs_per_runs;
window.socket = socket;

var dia1ctr = document.getElementById('dia1-ctr');
var dia2ctr = document.getElementById('dia2-ctr');
var dia3ctr = document.getElementById('dia3-ctr');
var dia2switch = document.getElementById('flexSwitchCheckDefault');
var dia3join = document.getElementById('joinDiagramsSwitch');
var secondcardbody = document.getElementById('second-card-body');
var dia_join_ctr = document.getElementById('dia_join_ctr');

var selector1 = document.querySelector('.adjust-dropdown1');
var selector2 = document.querySelector('.adjust-dropdown2');
var selected_data1 = chartData.d1;
var selected_data2 = chartData.d1;
var selected1 = '0';
var selected2 ='1';
var labels = ['Accuracy (test-set)', 'Loss (test-set)', 'Accuracy (train-set)', 'Loss (train-set)'];
var second = false;
var joined = false;

var createHistory = true;

var revert = document.getElementById('revert');
var revertChecked = revert.checked;
var lastIndexRun = revertIndexCalc(chartData.run);

const dash = (ctx, value) => {
  if (revertChecked) {
    return ctx.p0DataIndex > lastIndexRun ? value : [6, 0];
  }
  return [6,0];
};


const arbitraryLine = {
  id: 'arbitraryLine',
  afterDraw(chart, args, options){
    const { ctx, chartArea: {top, right, bottom, left, width, height }, scales: {x, y} } = chart;
    ctx.save();
    let runCount = -1;

    for (let i = 0; i < options.runs.length; i++) {
      // counting epochs of runs
      runCount += options.runs[i];

      // run line
      ctx.strokeStyle = 'lightgray';
      ctx.strokeRect(x.getPixelForValue(runCount), top, 0, height);
      ctx.strokeWidth = 1;
      ctx.restore(); 

      // run number
      // ctx.font = '12px Arial';
      // ctx.textAlign = 'center';
      // ctx.fillStyle = 'white';
      // - 0 falls central
      // ctx.fillText("Run " + (i+1), x.getPixelForValue(runCount) - 22, top + 12);
    }
  }
}

function revertIndexCalc(runs, epochCount) {
  if (epochCount > 0) {
    let lastElement = runs.slice(-1);
    let lastRunStart = epochCount - lastElement;
    return (lastRunStart - 2);
  }
}

//--------------- set displaying content ---------------//
dia2switch.addEventListener('click', function(){
  if (dia2switch.checked == true){
    console.log('true');
    second = true;
    saveDataToSessionStorage();
    if (joined) {
      dia1ctr.style.display = 'none';
      dia2ctr.style.display = 'none';
      dia3ctr.style.display = 'block';
    } else {
      dia2ctr.style.display = 'block';
      dia3ctr.style.display = 'none';
    }
    secondcardbody.style.display = 'block';
    dia_join_ctr.style.display = 'block';
    dia_join_ctr.style.display = 'block';
  }
  else if (dia2switch.checked == false){
    console.log('false');
    second = false;
    joined = false;
    saveDataToSessionStorage();
    dia1ctr.style.display = 'block';
    dia2ctr.style.display = 'none';
    dia3ctr.style.display = 'none';
    secondcardbody.style.display = 'none';
    dia_join_ctr.style.display = 'none';
    dia_join_ctr.style.display = 'none';
    dia3join.checked = false;
  }
});

dia3join.addEventListener('click', function(){
  if (dia3join.checked == true){
    joined = true;
    saveDataToSessionStorage();
    dia1ctr.style.display = 'none';
    dia2ctr.style.display = 'none';
    dia3ctr.style.display = 'block';
  }
  else if (dia3join.checked == false){
    joined = false;
    saveDataToSessionStorage();
    dia1ctr.style.display = 'block';
    if (second) {  
      dia2ctr.style.display = 'block';
    } else {
      dia2ctr.style.display = 'none';
    }
    dia3ctr.style.display = 'none';
  }
});

//--------------- make diagrams responsive ---------------//
window.addEventListener('resize', function() {
  dia1.resize();
  dia2.resize();
  dia3.resize();
});
//--------------- dia 1 ---------------//
const dia1 = new Chart(
  document.getElementById('dia1'),
  {
    type: 'line',
    data: {
      labels: selected_data1.map((_, index) => `Epoch ${index + 1}`),
      datasets: [
        {
          label: labels[0],
          data: selected_data1,
          tension: 0.4,
          segment: {
            borderDash: ctx => dash(ctx, [6,6])
          },
          borderColor: '#0b6ffd',
          backgroundColor: 'rgba(11, 80, 179, 0.8)',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        arbitraryLine: {
          runs: [],
        }
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(77, 77, 77, 0.1)'
          }
        }
      }
    },
    plugins: [arbitraryLine]
  }
);

//--------------- dia 2 ---------------//
const dia2 = new Chart(
  document.getElementById('dia2'),
  {
    type: 'line',
    data: {
      labels: selected_data1.map((_, index) => `Epoch ${index + 1}`),
      datasets: [
        {
          label: labels[1],
          data: selected_data2,
          tension: 0.4,
          segment: {
            borderDash: ctx => dash(ctx, [6,6])
          },
          borderColor: '#0b6ffd',
          backgroundColor: 'rgba(11, 80, 179, 0.8)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        arbitraryLine: {
          runs: [],
        }
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(77, 77, 77, 0.1)'
          }
        }
      }  
    },
    plugins: [arbitraryLine]
  }
);
//--------------- dia 3 ---------------//
const dia3 = new Chart(
  document.getElementById('dia3'),
  {
    type: 'line',
    data: {
      labels: selected_data1.map((_, index) => `Epoch ${index + 1}`),
      datasets: [
        {
          label: labels[0],
          data: selected_data1,
          tension: 0.4,
          segment: {
            borderDash: ctx => dash(ctx, [6,6])
          },
          borderColor: '#0b6ffd',
          backgroundColor: 'rgba(11, 80, 179, 0.8)',
          yAxisID: 'y1'
        },
        {
          label: labels[1],
          data: selected_data2,
          tension: 0.4,
          segment: {
            borderDash: ctx => dash(ctx, [6,6])
          },
          borderColor: '#bb2d3c',
          backgroundColor: 'rgba(179, 18, 34, 0.8)',
          yAxisID: 'y2'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        arbitraryLine: {
          runs: [],
        }
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(77, 77, 77, 0.1)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: labels[0],
          },
        },
        y2: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: labels[1],
          },
        },
      },
    },
    plugins: [arbitraryLine]
  }
);

//--------------- updater ---------------//
var first_alert = 0;
var currentAccuracy = document.getElementById('current-accuracy');
var currentAccuracyModel = document.getElementById('current-acc-model');
var currentModelEpochs = document.getElementById('current-model-epochs');

socket.on('update_chart', function(data){
  chartData.d1 = data.data.d1;
  chartData.d2 = data.data.d2;
  chartData.d3 = data.data.d3;
  chartData.d4 = data.data.d4;
  chartData.run = data.data.run;
  
  // convert normal run format to needed ([0,0,0,0,1,1,1,2] to [4,3,1])
  for (let i = 0; i < data.data.run.length; i++) {
    let count = data.data.run.filter(x => x == i).length;
    if (data.data.run.filter(x => x == i).length > 0) {
      epochs_per_runs[i] = count;
    }
  }

  lastIndexRun = revertIndexCalc(epochs_per_runs, data.data.run.length);
  epochs_per_runs.pop();

  if (createHistory == true){
    createHistory = false;
    historyFrontend();
  }

  if (chartData.d1.length > 0 && !storedData && first_alert==0){
    first_alert = 1;
    createAlert(1,'Found and restored old data. If you want to delete it <button style="height:inherit; padding: 0; border: none; text-decoration: underline" type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#resetModal">click here</button>')
  } else{first_alert = 1;}

  updateChart(selected1, dia1);
  updateChart(selected2, dia2);
  updateChart(selected1, dia3, selected2);

  currentAccuracy.textContent = chartData.d1[chartData.d1.length-1];  
  currentAccuracyModel.textContent = chartData.d1[chartData.d1.length-1];
  currentModelEpochs.textContent = chartData.d1.length;
});

//--------------- progressbar ---------------//

/*
var first_alert = 0;

socket.on('update_progress', function(data){
  chartData.d1 = data.data.d1;
  chartData.d2 = data.data.d2;
  chartData.d3 = data.data.d3;
  chartData.d4 = data.data.d4;

  if (chartData.d1.length > 0 && !storedData && first_alert==0){
    first_alert = 1;
    createAlert(1,'Found and restored old data. If you want to delete it <button style="height:inherit; padding: 0; border: none; text-decoration: underline" type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#resetModal">click here</button>')
  } else{first_alert = 1;}

  updateChart(selected1, dia1);
  updateChart(selected2, dia2);
});
*/

//--------------- change the shown parameter ---------------//

selector1.addEventListener("change", function(event) {
  selected1 = event.target.value;
  updateChart(selected1, dia1);
  updateChart(selected1, dia3, selected2);
  saveDataToSessionStorage();
});

selector2.addEventListener("change", function(event) {
  selected2 = event.target.value;
  updateChart(selected2, dia2);
  updateChart(selected1, dia3, selected2);
  saveDataToSessionStorage();
});

revert.addEventListener("change", function(event) {
  revertChecked = event.target.checked;
  updateChart(selected1, dia1);
  updateChart(selected2, dia2);
  updateChart(selected1, dia3, selected2);
});

function updateChart(selectedValue, dia, secondSelectedValue = -1){
  var selected;
  var secondSelected;

  dia.options.plugins.arbitraryLine.runs = epochs_per_runs;
  
  if (selectedValue === '0') {
    selected = chartData.d1;
    dia.data.labels = selected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[0].data = selected;
    dia.data.datasets[0].label = labels[0];
    if (dia == dia3) {
      dia.options.scales.y1.title.text = labels[0];
    }
    dia.update();
  } 
  else if (selectedValue === '1') {
    selected = chartData.d2;
    dia.data.labels = selected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[0].data = selected;
    dia.data.datasets[0].label = labels[1];
    if (dia == dia3) {
      dia.options.scales.y1.title.text = labels[1];
    }
    dia.update();
  } 
  else if (selectedValue === '2') {
    selected = chartData.d3;
    dia.data.labels = selected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[0].data = selected;
    dia.data.datasets[0].label = labels[2];
    if (dia == dia3) {
      dia.options.scales.y1.title.text = labels[2];
    }
    dia.update();
  } else if (selectedValue === '3') {
    selected = chartData.d4;
    dia.data.labels = selected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[0].data = selected;
    dia.data.datasets[0].label = labels[3];
    if (dia == dia3) {
      dia.options.scales.y1.title.text = labels[3];
    }
    dia.update();
  }
  
  if (secondSelectedValue === '0') {
    secondSelected = chartData.d1;
    dia.data.labels = secondSelected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[1].data = secondSelected;
    dia.data.datasets[1].label = labels[0];
    if (dia == dia3) {
      dia.options.scales.y2.title.text = labels[0];
    }
    dia.update();
  } 
  else if (secondSelectedValue === '1') {
    secondSelected = chartData.d2;
    dia.data.labels = secondSelected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[1].data = secondSelected;
    dia.data.datasets[1].label = labels[1];
    if (dia == dia3) {
      dia.options.scales.y2.title.text = labels[1];
    }
    dia.update();
  } 
  else if (secondSelectedValue === '2') {
    secondSelected = chartData.d3;
    dia.data.labels = secondSelected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[1].data = secondSelected;
    dia.data.datasets[1].label = labels[2];
    if (dia == dia3) {
      dia.options.scales.y2.title.text = labels[2];
    }
    dia.update();
  } else if (secondSelectedValue === '3') {
    secondSelected = chartData.d4;
    dia.data.labels = secondSelected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[1].data = secondSelected;
    dia.data.datasets[1].label = labels[3];
    if (dia == dia3) {
      dia.options.scales.y2.title.text = labels[3];
    }
    dia.update();
  }
}

//--------------- safe-data to session storager ---------------//

function saveDataToSessionStorage() {
  sessionStorage.setItem('selected1', selected1);
  sessionStorage.setItem('selected2', selected2);
  sessionStorage.setItem('second', second);
  sessionStorage.setItem('joined', joined);
}

window.addEventListener('DOMContentLoaded', function() {
  if (sessionStorage.getItem('selected1')) {
    selected1 = sessionStorage.getItem('selected1');
    selector1.value = selected1;
    updateChart(selected1, dia1);
  }

  if (sessionStorage.getItem('selected2')) {
    selected2 = sessionStorage.getItem('selected2');
    selector2.value = selected2;
    updateChart(selected2, dia2);
    updateChart(selected1, dia3, selected2)
  }
  
  if (sessionStorage.getItem('joined')){
    joined = sessionStorage.getItem('joined');
    joined = joined === 'true';
    dia3join.checked = joined; // Convert the value to a boolean
  }

  if (sessionStorage.getItem('second')){
    second = sessionStorage.getItem('second');
    second = second === 'true';
    dia2switch.checked = second; // Convert the value to a boolean
    if (joined && second) {
      dia1ctr.style.display = 'none';
      dia2ctr.style.display = 'none';
      dia3ctr.style.display = 'block';
      secondcardbody.style.display = 'block';
      dia_join_ctr.style.display = 'block';
    } else if (second) {  
      dia2ctr.style.display = 'block';
      secondcardbody.style.display = 'block';
      dia_join_ctr.style.display = 'block';
    } else {
      dia2ctr.style.display = 'none';
      secondcardbody.style.display = 'none';
      dia_join_ctr.style.display = 'none';
    }
  }
});
