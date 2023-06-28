import {chartData, socket, storedData} from './data.js';
import {createAlert} from './alerts.js';

window.chartData = chartData;
window.socket = socket;

var dia1ctr = document.getElementById('dia1-ctr');
var dia2ctr = document.getElementById('dia2-ctr');
var dia3ctr = document.getElementById('dia3-ctr');
var dia2switch = document.getElementById('flexSwitchCheckDefault');
var dia3join = document.getElementById('joinDiagramsSwitch');
var secondcardbody = document.getElementById('second-card-body');

var selector1 = document.querySelector('.adjust-dropdown1');
var selector2 = document.querySelector('.adjust-dropdown2');
var selected_data1 = chartData.d1;
var selected_data2 = chartData.d1;
var selected1 = '0';
var selected2 ='1';
var labels = ['Accuracy (test-set)', 'Loss (test-set)', 'Accuracy (train-set)', 'Loss (train-set)'];
var second = false;
var joined = false;

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
  }
  else if (dia2switch.checked == false){
    second = false;
    saveDataToSessionStorage();
    dia1ctr.style.display = 'block';
    dia2ctr.style.display = 'none';
    dia3ctr.style.display = 'none';
    secondcardbody.style.display = 'none';
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
          data: selected_data1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
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
          data: selected_data2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
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
          data: selected_data1
        },
        {
          label: labels[1],
          data: selected_data2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
  }
);

//--------------- updater ---------------//
var first_alert = 0;

socket.on('update_chart', function(data){
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
  updateChart(selected1, dia3, selected2);
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

function updateChart(selectedValue, dia, secondSelectedValue = -1){
  var selected;
  var secondSelected;
  
  if (selectedValue === '0') {
    selected = chartData.d1;
    dia.data.labels = selected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[0].data = selected;
    dia.data.datasets[0].label = labels[0];
    dia.update();
  } 
  else if (selectedValue === '1') {
    selected = chartData.d2;
    dia.data.labels = selected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[0].data = selected;
    dia.data.datasets[0].label = labels[1];
    dia.update();
  } 
  else if (selectedValue === '2') {
    selected = chartData.d3;
    dia.data.labels = selected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[0].data = selected;
    dia.data.datasets[0].label = labels[2];
    dia.update();
  } else if (selectedValue === '3') {
    selected = chartData.d4;
    dia.data.labels = selected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[0].data = selected;
    dia.data.datasets[0].label = labels[3];
    dia.update();
  }
  
  if (secondSelectedValue === '0') {
    secondSelected = chartData.d1;
    dia.data.labels = secondSelected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[1].data = secondSelected;
    dia.data.datasets[1].label = labels[0];
    dia.update();
  } 
  else if (secondSelectedValue === '1') {
    secondSelected = chartData.d2;
    dia.data.labels = secondSelected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[1].data = secondSelected;
    dia.data.datasets[1].label = labels[1];
    dia.update();
  } 
  else if (secondSelectedValue === '2') {
    secondSelected = chartData.d3;
    dia.data.labels = secondSelected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[1].data = secondSelected;
    dia.data.datasets[1].label = labels[2];
    dia.update();
  } else if (secondSelectedValue === '3') {
    secondSelected = chartData.d4;
    dia.data.labels = secondSelected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[1].data = secondSelected;
    dia.data.datasets[1].label = labels[3];
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
    dia3join.checked = joined === 'true'; // Convert the value to a boolean
  }

  if (sessionStorage.getItem('second')){
    second = sessionStorage.getItem('second');
    dia2switch.checked = second === 'true'; // Convert the value to a boolean
    if (joined === 'true' && second === 'true') {
      dia1ctr.style.display = 'none';
      dia2ctr.style.display = 'none';
      dia3ctr.style.display = 'block';
      secondcardbody.style.display = 'block';
    } else if (second === 'true') {  
      dia2ctr.style.display = 'block';
      secondcardbody.style.display = 'block';
    } else {
      dia2ctr.style.display = 'none';
      secondcardbody.style.display = 'none';
    }
  }
});
