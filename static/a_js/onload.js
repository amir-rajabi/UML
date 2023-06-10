// import {adjustments, chartData, history} from './data.js';
// window.adjustments = adjustments
// window.chartData = chartData;
// window.history = history;

// var adjust_slider1 = document.getElementById('adjust-slider1');
// var sliderValue1 = document.getElementById('sliderValue1');



// window.addEventListener('beforeunload', function(event) {
//     var dataToStore = {
//       adjustments: adjustments,
//       chartData: chartData,
//       history: history
//     };
//     sessionStorage.setItem('UML_DATA_PIEQ4', JSON.stringify(dataToStore));
// });

// window.addEventListener('load', function() {
//     var storedData = sessionStorage.getItem('UML_DATA_PIEQ4');
//     if (storedData) {
//       var parsedData = JSON.parse(storedData);
//       adjustments.learning_rate = parsedData.adjustments.learning_rate;
//       chartData = parsedData.chartData;
//       history = parsedData.history;
//     }
//     adjust_slider1.value = adjustments.learning_rate;
// });
  