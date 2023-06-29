var save_model = document.getElementById('save-current-model');
var new_model_name = document.getElementById('new-model-name');
var model_name = document.getElementById('model_name');

save_model.addEventListener('click', function(){
    var savedModelItems = document.querySelectorAll('.saved-model-item');
    var savedModelsCount = savedModelItems.length;

    var accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item saved-model-item';

    var accordionHeader = document.createElement('h2');
    accordionHeader.className = 'accordion-header';

    var accordionButton = document.createElement('button');
    accordionButton.className = 'accordion-button collapsed';
    accordionButton.type = 'button';
    accordionButton.setAttribute('data-bs-toggle', 'collapse');
    accordionButton.setAttribute('data-bs-target', '#acc-saved-models-' + (savedModelsCount));
    accordionButton.setAttribute('aria-expanded', 'false');
    accordionButton.setAttribute('aria-controls', 'collapseOne');

    var accordionTitle = document.createElement('div');
    accordionTitle.id = 'acc-saved-models-headtitle-' + (savedModelsCount);
    var modelNameInput = document.getElementById('model_name');
    accordionTitle.textContent = modelNameInput.value;

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
    accuracyValue.innerHTML = '<span id="model-acc-' + (savedModelsCount) + '">99</span> %';
    accuracyRow.appendChild(accuracyLabel);
    accuracyRow.appendChild(accuracyValue);

    var epochsRow = document.createElement('tr');
    var epochsLabel = document.createElement('td');
    epochsLabel.textContent = 'Total epochs trained';
    var epochsValue = document.createElement('td');
    epochsValue.innerHTML = '<span id="model-epochs-' + (savedModelsCount) + '">123</span>';
    epochsRow.appendChild(epochsLabel);
    epochsRow.appendChild(epochsValue);

    tableBody.appendChild(accuracyRow);
    tableBody.appendChild(epochsRow);
    table.appendChild(tableBody);

    var restoreButtons = document.createElement('div');
    restoreButtons.className = 'history-restore-ctr';
    var deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-danger';
    deleteButton.id = 'delete-model-' + (savedModelsCount);
    deleteButton.textContent = 'Delete model';
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
    new_model_name: modelNameInput.value
    };
    xhr.send(JSON.stringify(modelName));


    var allModels = document.getElementById('acc_saved_models').innerHTML;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/saved_models_html', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    var htmlContent = {
        htmlContent: allModels
    };
    xhr.send(JSON.stringify({ htmlContent }));

    modelNameInput.value = '';
});

model_name.addEventListener('input', function() {
    if (model_name.value.trim() !== '') {
        save_model.removeAttribute('disabled');
    } else {
        save_model.setAttribute('disabled', 'true');
    }
});

model_name.addEventListener('keypress', function(event) {
    if (event.keyCode === 32) {
        event.preventDefault();
        var currentValue = model_name.value;
        var caretPos = model_name.selectionStart;
        var newValue = currentValue.slice(0, caretPos) + '-' + currentValue.slice(caretPos);
        model_name.value = newValue;
        model_name.setSelectionRange(caretPos + 1, caretPos + 1);
    }
});
