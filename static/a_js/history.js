import {chartData, adjustmentsData} from './data.js';
window.adjData = adjustmentsData;

export function historyFrontend() {
    getAdjustmentsData().then(function(adjData) {
      var numRuns = getnumRuns();
      console.log("numRuns:", numRuns);
  
      for (var x = 0; x < numRuns; x++) {
        var numofEpochs = 0;
        for (var j = 0; j < chartData.run.length; j++) {
          if (chartData.run[j] === String(x)) {
            numofEpochs++;
          }
        }
        var lastIndex = chartData.run.lastIndexOf(String(x));
        if (lastIndex == -1){
          lastIndex = chartData.run.length;
        }
        createHistoryItem(chartData.d1[lastIndex], 
          adjData.learning_rate[lastIndex], 
          adjData.momentum[lastIndex], 
          adjData.dropout_rate[lastIndex], 
          adjData.loss_function[lastIndex], 
          numofEpochs)
      }
    }).catch(function(error) {
      console.error("Fehler beim Abrufen der Daten:", error);
    });
  }
  
  export function getAdjustmentsData() {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/get_adjustments_data', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(xhr.status);
          }
        }
      };
      xhr.send();
    });
  }
  

function getnumRuns() {
  var numRuns_arr = [];
  for (var i = 0; i < chartData.run.length+1; i++) {
    var element = Number(chartData.run[i]);
    if (!numRuns_arr.includes(element)) {
      numRuns_arr.push(element);
    }
  }
  return numRuns_arr.length;
}
  

export function createHistoryItem(accuracy, learning_rate, momentum, dropout_rate, loss_function_no, epochs) {
    var loss_function;
    if (loss_function_no == 0){loss_function = "Cross Entropy";} 
    else if (loss_function_no == 1){loss_function = "L1 Loss";}
    else if (loss_function_no == 2){loss_function = "Multi Margin Loss";}
    else if (loss_function_no == 3){loss_function = "Multilabel Soft Margin Loss";}
    else if (loss_function_no == 4){loss_function = "Poisson NLL Loss";}
    else if (loss_function_no == 5){loss_function = "Smooth L1 Loss";}
    else if (loss_function_no == 6){loss_function = "Soft Margin Loss";}
    var all_history_acc = document.querySelectorAll('.history-accordion-item');
    var historyCounter = all_history_acc.length;
    var accordionHistory = document.getElementById('accordion_history');
    var accordionItemDiv = document.createElement('div');
    accordionItemDiv.className = 'accordion-item';
    var headerDiv = document.createElement('h2');
    headerDiv.className = 'accordion-header';
    var button = document.createElement('button');
    button.className = 'accordion-button collapsed';
    button.type = 'button';
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', '#history-collapse-' + historyCounter);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'history-collapse-' + historyCounter);
    button.innerHTML = '<div class="history_acc_headtitle">Run '+ (historyCounter + 1) + '<div></div>'+ accuracy + ' %<div></div></div>'
    headerDiv.appendChild(button);
    var collapseDiv = document.createElement('div');
    collapseDiv.id = 'history-collapse-' + historyCounter;
    collapseDiv.className = 'accordion-collapse collapse';
    collapseDiv.setAttribute('data-bs-parent', '#accordion_history');
    var bodyDiv = document.createElement('div');
    bodyDiv.className = 'accordion-body';
    var table = document.createElement('table');
    table.className = 'table';
    var thead = document.createElement('thead');
    var tableHeadRow = document.createElement('tr');
    tableHeadRow.className = 'table-head';
    var tableHeadItem1 = document.createElement('th');
    tableHeadItem1.scope = 'col';
    tableHeadItem1.innerText = 'Item';
    tableHeadItem1.className = 'history-accordion-item';
    var tableHeadItem2 = document.createElement('th');
    tableHeadItem2.scope = 'col';
    tableHeadItem2.innerText = 'Value';
    tableHeadRow.appendChild(tableHeadItem1);
    tableHeadRow.appendChild(tableHeadItem2);
    thead.appendChild(tableHeadRow);
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    var tableRow1 = document.createElement('tr');
    var tableRow2 = document.createElement('tr');
    var tableRow3 = document.createElement('tr');
    var tableRow4 = document.createElement('tr');
    var tableRow5 = document.createElement('tr');
    tableRow1.innerHTML = '<td>Learning rate</td><td>' + learning_rate + '</td>';
    tableRow2.innerHTML = '<td>Momentum</td><td>' + momentum + '</td>';
    tableRow3.innerHTML = '<td>Dropout rate</td><td>' + dropout_rate + '</td>';
    tableRow4.innerHTML = '<td>Loss function</td><td>' + loss_function + '</td>';
    tableRow5.innerHTML = '<td>Epochs runned</td><td>' + epochs + '</td>';
    tbody.appendChild(tableRow1);
    tbody.appendChild(tableRow2);
    tbody.appendChild(tableRow3);
    tbody.appendChild(tableRow4);
    tbody.appendChild(tableRow5);
    table.appendChild(tbody);
    bodyDiv.appendChild(table);
    var buttonDiv = document.createElement('div');
    buttonDiv.className = 'history-restore-ctr';
    var plotButton = document.createElement('button');
    plotButton.type = 'button';
    plotButton.className = 'btn btn-secondary';
    plotButton.id = 'history-plot-' + (historyCounter + 1);
    plotButton.innerText = 'Plot in diagrams';
    var restoreButton = document.createElement('button');
    restoreButton.type = 'button';
    restoreButton.className = 'btn btn-primary';
    restoreButton.id = 'history-restore-' + (historyCounter + 1);
    restoreButton.innerText = 'Restore this values';
    buttonDiv.appendChild(plotButton);
    buttonDiv.appendChild(restoreButton);
    bodyDiv.appendChild(buttonDiv);
    collapseDiv.appendChild(bodyDiv);
    accordionItemDiv.appendChild(headerDiv);
    accordionItemDiv.appendChild(collapseDiv);
    accordionHistory.insertBefore(accordionItemDiv, accordionHistory.firstChild);
}