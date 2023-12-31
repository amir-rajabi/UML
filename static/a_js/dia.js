/*
authors:        Eren Kocadag, Benedikt Schmitz, Feliks Vdovichenko, Lucie Prokopy, Leiss Abdal Al, Johannes Ehrich
institution:    Freie Universität Berlin
institute:      Institut für Informatik
module:         SWP - Usable Machine Learning 
year:           2023
*/

import {chartData, socket, storedData, epochs_per_runs} from './data.js';
import {createAlert} from './alerts.js';
import {historyFrontend} from './history.js';
import {updateModelInfo} from './models.js';

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
var start = document.getElementById('start');
var start_beta = document.getElementById('start_beta_train');

var revertChecked = revert.checked;
var lastIndexRun = revertIndexCalc(chartData.run);
var revertedData = null;

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
      ctx.strokeRect(x.getPixelForValue(runCount), top + 5, 0, height - 20);
      ctx.strokeWidth = 1;
      ctx.restore(); 

      if (chartData.run.length < 25) {
        if (revertedData != null && revertedData.run.length < 25) {
          // run number
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'white';
          // - 22 falls links
          ctx.fillText("Run " + (i+1), x.getPixelForValue(runCount) - 0, top);
        }
        else if (revertedData == null) {
          // run number
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'white';
          // - 22 falls links
          ctx.fillText("Run " + (i+1), x.getPixelForValue(runCount) - 0, top);
        }
      }
    }
  }
}

function revertIndexCalc(runs, epochCount) {
  if (epochCount >= 0) {
    let lastElement = runs.slice(-1);
    let lastRunStart = epochCount - lastElement;
    return (lastRunStart - 2);
  }
}

//--------------- set displaying content ---------------//
dia2switch.addEventListener('click', function(){
  if (dia2switch.checked == true){
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

//--------------- zoom-functionality ---------------//
function resetZoom() {
  Chart.helpers.each(Chart.instances, function(instance) {
    instance.resetZoom();
  });
}

document.getElementById('reset-zoom-button').addEventListener('click', resetZoom);

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
        },
        {
          label: 'Reverted data',
          data: [],
          tension: 0.4,
          segment: {
            borderDash: ctx => ctx.p0DataIndex > lastIndexRun ? [6,6] : [6,0],
            borderColor: ctx => ctx.p0DataIndex > lastIndexRun ? 'white' : '#0b6ffd'
          },
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        arbitraryLine: {
          runs: [],
        },
        legend: {
          labels: {
            filter: function(label) {
              if (label.text !== 'Reverted data') {
                return true;
              }
            }
          }
        },
        zoom: {
          pan: {
            enabled: true,
          },
          zoom: {
            wheel: {
              enabled: true,
              speed: 0.05,
            },
            drag: {
              enabled: true,
              backgroundColor: '#272c36',
              borderWidth: '1',
              borderColor: '#ffffff',
              modifierKey: 'shift'
            },
            mode: 'y',
          },
          limits: {
            y: {min: 'original', max: 'original'},
          },
        },
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(77, 77, 77, 0.1)'
          }
        }
      }
    },
    plugins: [arbitraryLine, ChartZoom],
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
        },
        {
          label: 'Reverted data',
          data: [],
          tension: 0.4,
          segment: {
            borderDash: ctx => ctx.p0DataIndex > lastIndexRun ? [6,6] : [6,0],
            borderColor: ctx => ctx.p0DataIndex > lastIndexRun ? 'white' : '#0b6ffd'
          },
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        arbitraryLine: {
          runs: [],
        },
        legend: {
          labels: {
            filter: function(label) {
              if (label.text !== 'Reverted data') {
                return true;
              }
            }
          }
        },
        zoom: {
          pan: {
            enabled: true,
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true
            },
            drag: {
              enabled: true,
              backgroundColor: '#272c36',
              borderWidth: '1',
              borderColor: '#ffffff',
              modifierKey: 'shift'
            },
            mode: 'y',
          },
          limits: {
            y: {min: 'original', max: 'original'},
          }
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
        },
        {
          label: 'Reverted data',
          data: [],
          tension: 0.4,
          segment: {
            borderDash: ctx => ctx.p0DataIndex > lastIndexRun ? [6,6] : [6,0],
            borderColor: ctx => ctx.p0DataIndex > lastIndexRun ? 'white' : '#0b6ffd'
          },
          yAxisID: 'y1'
        },
        {
          label: 'Reverted data',
          data: [],
          tension: 0.4,
          segment: {
            borderDash: ctx => ctx.p0DataIndex > lastIndexRun ? [6,6] : [6,0],
            borderColor: ctx => ctx.p0DataIndex > lastIndexRun ? 'white' : '#bb2d3c'
          },
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
        },
        legend: {
          labels: {
            filter: function(label) {
              if (label.text !== 'Reverted data') {
                return true;
              }
            }
          }
        },
        zoom: {
          pan: {
            enabled: true,
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true
            },
            drag: {
              enabled: true,
              backgroundColor: '#272c36',
              borderWidth: '1',
              borderColor: '#ffffff',
              modifierKey: 'shift'
            },
            mode: 'y',
          },
          limits: {
            y: {min: 'original', max: 'original'},
          },
        }
      },
      scales: {
        y1: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: labels[0],
          },
          grid: {
            color: 'rgba(77, 77, 77, 0.1)'
          }
        },
        y2: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: labels[1],
          }
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
var numEpochs = document.getElementById('sliderValue4');


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

  if (revertedData !== null && revertedData.epochs_per_runs.length == epochs_per_runs.length && revertedData.epochs_per_runs.length != 0) {
    let lastElement = revertedData.epochs_per_runs.length - 1;
    epochs_per_runs[lastElement] = revertedData.epochs_per_runs[lastElement];
    lastIndexRun = revertIndexCalc(epochs_per_runs, data.data.run.length + revertedData.epochs_per_runs[lastElement]);
  } else {    
    epochs_per_runs.pop();
  }
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
  updateModelInfo(chartData.d1[chartData.d1.length-1], chartData.d1.length);
  //alert(numEpochs.textContent);
});

//--------------- reset reverted data  ---------------//

export function resetRevertedData() {
  revertedData = null;
  dia1.data.datasets[1].data = [];
  dia2.data.datasets[1].data = [];
  dia3.data.datasets[2].data = [];
  dia3.data.datasets[3].data = [];
}

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

start.addEventListener("click", function(event) {
  revertedData = null;
  dia1.data.datasets[1].data = [];
  dia2.data.datasets[1].data = [];
  dia3.data.datasets[2].data = [];
  dia3.data.datasets[3].data = [];

  if (revertChecked) {
    revertedData = Object.assign({}, chartData);
    revertedData['epochs_per_runs'] = epochs_per_runs.map((x) => x);
  }

  revertChecked = false;
})

start_beta.addEventListener("click", function(event) {
  revertedData = null;
  dia1.data.datasets[1].data = [];
  dia2.data.datasets[1].data = [];
  dia3.data.datasets[2].data = [];
  dia3.data.datasets[3].data = [];

  if (revertChecked) {
    revertedData = Object.assign({}, chartData);
    revertedData['epochs_per_runs'] = epochs_per_runs.map((x) => x);
  }

  revertChecked = false;
})

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
    let i;
    if (dia == dia3) {
      dia.options.scales.y1.title.text = labels[0];
      i = 2;
    } else {
      i = 1;
    }
    if (revertedData !== null) {
      dia.data.datasets[i].data = revertedData.d1;
      if (selected.length < revertedData.d1.length) {
        dia.data.labels = revertedData.d1.map((_, index) => `Epoch ${index + 1}`);
      }
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
    let i;
    if (dia == dia3) {
      dia.options.scales.y1.title.text = labels[1];
      i = 2;
    } else {
      i = 1;
    }
    if (revertedData !== null) {
      dia.data.datasets[i].data = revertedData.d2;
      if (selected.length < revertedData.d2.length) {
        dia.data.labels = revertedData.d2.map((_, index) => `Epoch ${index + 1}`);
      }
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
    let i;
    if (dia == dia3) {
      dia.options.scales.y1.title.text = labels[2];
      i = 2;
    } else {
      i = 1;
    }
    if (revertedData !== null) {
      dia.data.datasets[i].data = revertedData.d3;
      if (selected.length < revertedData.d3.length) {
        dia.data.labels = revertedData.d3.map((_, index) => `Epoch ${index + 1}`);
      }
    }
    dia.update();
  } else if (selectedValue === '3') {
    selected = chartData.d4;
    dia.data.labels = selected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[0].data = selected;
    dia.data.datasets[0].label = labels[3];
    let i;
    if (dia == dia3) {
      dia.options.scales.y1.title.text = labels[3];
      i = 2;
    } else {
      i = 1;
    }
    if (revertedData !== null) {
      dia.data.datasets[i].data = revertedData.d4;
      if (selected.length < revertedData.d4.length) {
        dia.data.labels = revertedData.d4.map((_, index) => `Epoch ${index + 1}`);
      }
    }
    dia.update();
  }
  
  if (secondSelectedValue === '0') {
    secondSelected = chartData.d1;
    dia.data.datasets[1].data = secondSelected;
    dia.data.datasets[1].label = labels[0];
    dia.options.scales.y2.title.text = labels[0];
    if (revertedData !== null) {
      dia.data.datasets[3].data = revertedData.d1;
    }
    dia.update();
  } 
  else if (secondSelectedValue === '1') {
    secondSelected = chartData.d2;
    dia.data.datasets[1].data = secondSelected;
    dia.data.datasets[1].label = labels[1];
    dia.options.scales.y2.title.text = labels[1];
    if (revertedData !== null) {
      dia.data.datasets[3].data = revertedData.d2;
    }
    dia.update();
  } 
  else if (secondSelectedValue === '2') {
    secondSelected = chartData.d3;
    dia.data.datasets[1].data = secondSelected;
    dia.data.datasets[1].label = labels[2];
    dia.options.scales.y2.title.text = labels[2];
    if (revertedData !== null) {
      dia.data.datasets[3].data = revertedData.d3;
    }
    dia.update();
  } else if (secondSelectedValue === '3') {
    secondSelected = chartData.d4;
    dia.data.datasets[1].data = secondSelected;
    dia.data.datasets[1].label = labels[3];
    dia.options.scales.y2.title.text = labels[3];
    if (revertedData !== null) {
      dia.data.datasets[3].data = revertedData.d4;
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
