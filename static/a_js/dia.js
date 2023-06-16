import {chartData, socket} from './data.js';
window.chartData = chartData;
window.socket = socket;

var dia2ctr = document.getElementById('dia2-ctr');
var dia2switch = document.getElementById('flexSwitchCheckDefault');
var secondcardbody = document.getElementById('second-card-body');

var selector1 = document.querySelector('.adjust-dropdown1');
var selector2 = document.querySelector('.adjust-dropdown2');
var selected_data1 = chartData.d1;
var selected_data2 = chartData.d1;
var selected1 = '0';
var selected2 ='1';
var labels = ['Accuracy (test-set)', 'Loss (test-set)', 'Accuracy (train-set)', 'Loss (train-set)'];
var second = false;

//--------------- set displaying content ---------------//
dia2switch.addEventListener('click', function(){
  if (dia2switch.checked == true){
    second = true;
    saveDataToSessionStorage();
    dia2ctr.style.display = 'block';
    secondcardbody.style.display = 'block';
  }
  else if (dia2switch.checked == false){
    second = false;
    saveDataToSessionStorage();
    dia2ctr.style.display = 'none';
    secondcardbody.style.display = 'none';
  }
});

//--------------- make diagrams responsive ---------------//
window.addEventListener('resize', function() {
  dia1.resize();
  dia2.resize();
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

//--------------- updater ---------------//

socket.on('update_chart', function(data){
  chartData.d1 = data.data.d1;
  chartData.d2 = data.data.d2;
  chartData.d3 = data.data.d3;
  chartData.d4 = data.data.d4;

  updateChart(selected1, dia1);
  updateChart(selected2, dia2);
});

//--------------- change the shown parameter ---------------//

selector1.addEventListener("change", function(event) {
  selected1 = event.target.value;
  console.log('triggered1');
  updateChart(selected1, dia1);
  saveDataToSessionStorage();
});

selector2.addEventListener("change", function(event) {
  selected2 = event.target.value;
  console.log('triggered2');
  updateChart(selected2, dia2);
  saveDataToSessionStorage();
});

function updateChart(selectedValue, dia){
  var selected;
  
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
}

//--------------- safe-data to session storager ---------------//

function saveDataToSessionStorage() {
  sessionStorage.setItem('selected1', selected1);
  sessionStorage.setItem('selected2', selected2);
  sessionStorage.setItem('second', second);
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
  }
  
  if (sessionStorage.getItem('second')){
    second = sessionStorage.getItem('second');
    dia2switch.checked = second === 'true'; // Convert the value to a boolean
    dia2ctr.style.display = second ? 'block' : 'none';
    secondcardbody.style.display = second ? 'block' : 'none';
  }
});
