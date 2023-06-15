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
var selected2 ='0';

//--------------- set displaying content ---------------//
dia2switch.addEventListener('click', function(){
  if (dia2switch.checked == true){
    dia2ctr.style.display = 'block';
    secondcardbody.style.display = 'block';
  }
  else if (dia2switch.checked == false){
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
          label: 'Accuracy',
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
          label: 'Accuracy',
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
});

selector2.addEventListener("change", function(event) {
  selected2 = event.target.value;
  console.log('triggered2');
  updateChart(selected2, dia2);
});

function updateChart(selectedValue, dia){
  var selected;
  if (dia == dia1){
    selected = selected_data1;
  } else {
    selected = selected_data2;
  } // notwendig??
  
  if (selectedValue === '0') {
    selected = chartData.d1;
    dia.data.labels = selected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[0].data = selected;
    dia.update();
  } else if (selectedValue === '1') {
    selected = chartData.d2;
    dia.data.labels = selected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[0].data = selected;
    dia.update();
  } else if (selectedValue === '2') {
    selected = chartData.d3;
    dia.data.labels = selected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[0].data = selected;
    dia.update();
  } else if (selectedValue === '3') {
    selected = chartData.d4;
    dia.data.labels = selected.map(function(_, index) {
      return 'Epoch ' + (index + 1);
    });
    dia.data.datasets[0].data = selected;
    dia.update();
  } // else !
}
