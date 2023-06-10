var kachelButtons = document.getElementsByClassName('kachel_button');

function handleButtonClick(event) {
    for (var i = 0; i < kachelButtons.length; i++) {
      if (kachelButtons[i] === event.currentTarget) {
        kachelButtons[i].classList.add('current-kachel');
      } else {
        kachelButtons[i].classList.remove('current-kachel');
      }
    }
  }
  for (var i = 0; i < kachelButtons.length; i++) {
    kachelButtons[i].addEventListener('click', handleButtonClick);
  }

//----------------------------------------------------------------//

var adjustButton = document.getElementById('adjust-button');
var diagramButton = document.getElementById('diagram-button');
var historyButton = document.getElementById('history-button');
var modelsButton = document.getElementById('models-button');

var adjustSettings = document.getElementById('adjust-settings');
var diagramSettings = document.getElementById('diagram-settings');
var historySettings = document.getElementById('history-settings');
var modelsSettings = document.getElementById('models-settings');

function handleAdjustButtonClick() {
  adjustSettings.classList.add('current-setting');
  diagramSettings.classList.remove('current-setting');
  historySettings.classList.remove('current-setting');
  modelsSettings.classList.remove('current-setting');
}

function handleDiagramButtonClick() {
  adjustSettings.classList.remove('current-setting');
  diagramSettings.classList.add('current-setting');
  historySettings.classList.remove('current-setting');
  modelsSettings.classList.remove('current-setting');
}

function handleHistoryButtonClick() {
  adjustSettings.classList.remove('current-setting');
  diagramSettings.classList.remove('current-setting');
  historySettings.classList.add('current-setting');
  modelsSettings.classList.remove('current-setting');
}

function handleModelsButtonClick() {
  adjustSettings.classList.remove('current-setting');
  diagramSettings.classList.remove('current-setting');
  historySettings.classList.remove('current-setting');
  modelsSettings.classList.add('current-setting');
}

adjustButton.addEventListener('click', handleAdjustButtonClick);
diagramButton.addEventListener('click', handleDiagramButtonClick);
historyButton.addEventListener('click', handleHistoryButtonClick);
modelsButton.addEventListener('click', handleModelsButtonClick);

//----------------------------------------------------------------//