import {chartData} from './data.js';
window.chartData = chartData;

var save_model = document.getElementById('save-current-model');
var new_model_name = document.getElementById('new-model-name');
var model_name = document.getElementById('model_name');
var already_taken_alert = document.getElementById('already-taken-alert');
var too_long_alert = document.getElementById('too-long-alert');
var all_model_names = document.getElementsByClassName('saved-models-name');
var delete_modals_ctr = document.getElementById("delete_model_modals");

save_model.addEventListener('click', function(){
    var savedModelItems = document.querySelectorAll('.saved-model-item');
    var savedModelsCount = null;
    
    for (var i = 0; i < savedModelItems.length; i++) {
        var element = savedModelItems[i];
        var id = element.id;
        if (id) {
            var match = id.match(/\d+$/);   
            savedModelsCount = parseInt(match[0]);
        }
    }  
    if (savedModelsCount !== null) {
        savedModelsCount += 1;
    } else{
        savedModelsCount = 0;
    }
    

    var current_runs_of_model = chartData.d1.length;
    var current_accuracy_of_model = chartData.d1[chartData.d1.length-1]; 

    var accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item saved-model-item';
    accordionItem.id = 'acc-item-ctr-' + (savedModelsCount);

    var accordionHeader = document.createElement('h2');
    accordionHeader.className = 'accordion-header';

    var accordionButton = document.createElement('button');
    accordionButton.className = 'accordion-button collapsed';
    accordionButton.type = 'button';
    accordionButton.setAttribute('data-bs-toggle', 'collapse');
    accordionButton.setAttribute('data-bs-target', '#acc-saved-models-' + (savedModelsCount));
    accordionButton.setAttribute('aria-expanded', 'false');
    accordionButton.setAttribute('aria-controls', 'collapseOne');
    accordionButton.id = 'acc-model-button-' + (savedModelsCount);

    var accordionTitle = document.createElement('div');
    accordionTitle.id = 'acc-saved-models-headtitle-' + (savedModelsCount);
    accordionTitle.className = 'saved-models-name'
    accordionTitle.textContent = model_name.value;

    accordionButton.appendChild(accordionTitle);
    accordionHeader.appendChild(accordionButton);

    var accordionCollapse = document.createElement('div');
    accordionCollapse.id = 'acc-saved-models-' + (savedModelsCount);
    accordionCollapse.className = 'accordion-collapse collapse';
    accordionCollapse.setAttribute('data-bs-parent', '#acc_saved_models');

    var accordionBody = document.createElement('div');
    accordionBody.className = 'accordion-body';

    var table = document.createElement('table');
    table.className = 'table';
    table.setAttribute('data-bs-theme', 'dark');

    var tableBody = document.createElement('tbody');
    var accuracyRow = document.createElement('tr');
    var accuracyLabel = document.createElement('td');
    accuracyLabel.textContent = 'Accuracy';
    var accuracyValue = document.createElement('td');
    accuracyValue.innerHTML = '<span id="model-acc-' + (savedModelsCount) + '">' + (current_accuracy_of_model) + '</span> %';
    accuracyRow.appendChild(accuracyLabel);
    accuracyRow.appendChild(accuracyValue);

    var epochsRow = document.createElement('tr');
    var epochsLabel = document.createElement('td');
    epochsLabel.textContent = 'Total epochs trained';
    var epochsValue = document.createElement('td');
    epochsValue.innerHTML = '<span id="model-epochs-' + (savedModelsCount) + '">'+ (current_runs_of_model) +'</span>';
    epochsRow.appendChild(epochsLabel);
    epochsRow.appendChild(epochsValue);

    tableBody.appendChild(accuracyRow);
    tableBody.appendChild(epochsRow);
    table.appendChild(tableBody);

    var restoreButtons = document.createElement('div');
    restoreButtons.className = 'history-restore-ctr';
    var deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-outline-danger';
    deleteButton.id = 'delete-model-' + (savedModelsCount);
    deleteButton.textContent = 'Delete model';
    deleteButton.setAttribute('data-bs-toggle', 'modal');
    deleteButton.setAttribute('data-bs-target', '#reset_model_window_' +savedModelsCount);
    var loadButton = document.createElement('button');
    loadButton.type = 'button';
    loadButton.className = 'btn btn-primary';
    loadButton.id = 'load-model-' + (savedModelsCount);
    loadButton.textContent = 'Load model';

    restoreButtons.appendChild(deleteButton);
    restoreButtons.appendChild(loadButton);

    accordionBody.appendChild(table);
    accordionBody.appendChild(restoreButtons);

    accordionCollapse.appendChild(accordionBody);

    accordionItem.appendChild(accordionHeader);
    accordionItem.appendChild(accordionCollapse);

    var accSavedModels = document.getElementById('acc_saved_models');
    accSavedModels.appendChild(accordionItem);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/save_model', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    var modelName = {
    new_model_name: model_name.value
    };
    xhr.send(JSON.stringify(modelName));

    createModalElement(savedModelsCount, model_name.value);

    var allModels = document.getElementById('saved_models_frontend').innerHTML;
    var xhr1 = new XMLHttpRequest();
    xhr1.open('POST', '/saved_models_html', true);
    xhr1.setRequestHeader('Content-Type', 'application/json');
    xhr1.send(JSON.stringify({ savedModelsHTML: allModels }));

    model_name.value = '';
    save_model.setAttribute('disabled', 'true');
});

model_name.addEventListener('input', function() {
    if (model_name.value.trim() !== '') {
        checkIfModelExists();
    } else {
        save_model.setAttribute('disabled', 'true');
        already_taken_alert.style.display = 'none';
    }

    if (model_name.value.length >= model_name.maxLength) {
        model_name.addEventListener('keydown', function() {
            too_long_alert.style.display = "block";
        });
      } else {
        too_long_alert.style.display = "none";
      }      
});

model_name.addEventListener('keypress', function(event) {
    if (event.keyCode === 32) {
        if (!(model_name.value.length >= model_name.maxLength)){  
            event.preventDefault();
            var currentValue = model_name.value;
            var caretPos = model_name.selectionStart;
            var newValue = currentValue.slice(0, caretPos) + '-' + currentValue.slice(caretPos);
            model_name.value = newValue;
            model_name.setSelectionRange(caretPos + 1, caretPos + 1);         
        }
    }
    checkIfModelExists();
});


function checkIfModelExists() {
    var checkname = model_name.value;
    var amnl = all_model_names.length;

    if (amnl > 0) {
        for (var i = 0; i < amnl; i++) {
            if (checkname == all_model_names[i].textContent) {
                save_model.setAttribute('disabled', 'true');
                already_taken_alert.style.display = 'block';
                break;
            } else{
                save_model.removeAttribute('disabled');
                already_taken_alert.style.display = 'none';
            }
        }
    } else{
        save_model.removeAttribute('disabled');
        already_taken_alert.style.display = 'none';
    };
}

var delete_modals_ctr = document.getElementById("delete_model_modals");

function createModalElement(index, modelName) {
    var modalElement = document.createElement("div");
    modalElement.classList.add("modal", "fade");
    modalElement.id = "reset_model_window_" + index;
    modalElement.setAttribute("tabindex", "-1");
    modalElement.setAttribute("aria-labelledby", "reset_model_window_label_" + index);
    modalElement.setAttribute("aria-hidden", "true");
    modalElement.setAttribute("data-bs-theme","dark");

    var modalContent = document.createElement("div");
    modalContent.classList.add("modal-dialog", "modal-content");

    var modalHeader = document.createElement("div");
    modalHeader.classList.add("modal-header");

    var modalTitle = document.createElement("h1");
    modalTitle.classList.add("modal-title", "fs-5");
    modalTitle.id = "reset_model_window_label_" + index;
    modalTitle.textContent = "Are you sure you want to delete your model?";

    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.classList.add("btn-close");
    closeButton.setAttribute("data-bs-dismiss", "modal");
    closeButton.setAttribute("aria-label", "Close");

    var modalBody = document.createElement("div");
    modalBody.classList.add("modal-body");
    modalBody.textContent = "selected model: " + modelName;

    var modalFooter = document.createElement("div");
    modalFooter.classList.add("modal-footer");

    var cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.classList.add("btn", "btn-outline-light");
    cancelButton.setAttribute("data-bs-dismiss", "modal");
    cancelButton.textContent = "Cancel";

    var deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("btn", "btn-danger");
    deleteButton.id = "delete_model_confirmed_" + index;
    deleteButton.setAttribute("data-bs-dismiss", "modal");
    deleteButton.setAttribute("onclick", "delete_model(" + index + ")");
    deleteButton.textContent = "Delete model";

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    modalFooter.appendChild(cancelButton);
    modalFooter.appendChild(deleteButton);
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modalElement.appendChild(modalContent);

    delete_modals_ctr.appendChild(modalElement);
}