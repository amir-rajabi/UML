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
    //kachelButtons[i].addEventListener('keydow', handleButtonClick);
  }

//----------------------------------------------------------------//

var adjustButton = document.getElementById('adjust-button');
var diagramButton = document.getElementById('diagram-button');
var historyButton = document.getElementById('history-button');
var modelsButton = document.getElementById('models-button');
const buttons = [adjustButton, diagramButton, historyButton, modelsButton]

var adjustSettings = document.getElementById('adjust-settings');
var diagramSettings = document.getElementById('diagram-settings');
var historySettings = document.getElementById('history-settings');
var modelsSettings = document.getElementById('models-settings');
const settings = [adjustSettings, diagramSettings, historySettings, modelsSettings]

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

var handlesButtons = [
	handleAdjustButtonClick,
	handleDiagramButtonClick,
	handleHistoryButtonClick,
	handleModelsButtonClick,
]

adjustButton.addEventListener('click', handleAdjustButtonClick);
diagramButton.addEventListener('click', handleDiagramButtonClick);
historyButton.addEventListener('click', handleHistoryButtonClick);
modelsButton.addEventListener('click', handleModelsButtonClick);

// function mod(n,m) {
// 	if( n<0){
// 		n += m
// 	}
// 	return n%m;
// }

// function findActive() {
// 	for(let i = 0; i < settings.length; i++) {
// 		if(settings[i].classList.contains('current-setting')){
// 			return i;
// 		}
// 	}
// 	return 0;
//   }


// document.addEventListener('keydown', e => {
// 	if(e.ctrlKey === true){
// 		return
// 	}
// 	let key = e.key.toLowerCase() 
// 	let num = 0;
// 	let active = findActive();
// 	// console.log(e);

// 	switch (key) {
// 	  case 'q':
// 	    handleAdjustButtonClick();
// 	    num = 0;
// 	    break;
// 	  case 'w':
// 	    handleDiagramButtonClick();
// 	    num = 1;
// 	    break;
// 	  case 'e':
// 	    handleHistoryButtonClick();
// 	    num = 2;
// 	    break;
// 	  case 'r':
// 	    handleModelsButtonClick();
// 	    num = 3;
// 	    break;
// 	  case 'j':
// 	    num = mod((findActive() +1),buttons.length);
// 	    handlesButtons[num]();
// 	    break;
// 	  case 'k':
// 	    num = mod((findActive()-1),buttons.length);
// 	    handlesButtons[num]();
// 	    break;
// 	  default:
// 	    return;
// 	}

// 	for (var i = 0; i < kachelButtons.length; i++) {
//       		if (i == num) {
//         		kachelButtons[i].classList.add('current-kachel');
//       		} else {
//         		kachelButtons[i].classList.remove('current-kachel');
//       		}
//     	}
// });

//----------------------------------------------------------------//
