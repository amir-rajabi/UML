const chartData = [1,1,1,1,1,1,1];
const socket = io();

const chart = new Chart(
  document.getElementById('accuracy'),
  {
    type: 'line',
    data: {
      labels: chartData.map((_, index) => `Epoch ${index + 1}`),
      datasets: [
        {
          label: 'Accuracy',
          data: chartData
        }
      ]
    }
  }
);

socket.on('update_chart', function(data) {
  console.log(data);
  chart.data.labels = data.map((_, index) => `Epoch ${index + 1}`);
  chart.data.datasets[0].data = data;
  chart.update();
});