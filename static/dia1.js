(function() {
  const data = [1,4,3,5,4,7,2];

  new Chart(
    document.getElementById('accuracy'),
    {
      type: 'line',
      data: {
        labels: data.map((index) => `Epoch ${index + 1}`),
        datasets: [
          {
            label: 'Accuracy',
            data: data
          }
        ]
      }
    }
  );
})();
