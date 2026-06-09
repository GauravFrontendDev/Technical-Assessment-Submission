(function () {
    var storageKey = 'frontend-ui-assignment-form-builder';
    var formTitle = document.getElementById('formTitle');
    var titleCount = document.getElementById('titleCount');
    var dropZone = document.getElementById('dropZone');
    var fieldList = document.getElementById('fieldList');
    var emptyState = document.getElementById('emptyState');
    var paletteGrid = document.getElementById('paletteGrid');
    var addFieldsTab = document.getElementById('addFieldsTab');
    var fieldOptionsTab = document.getElementById('fieldOptionsTab');
    var addFieldsPanel = document.getElementById('addFieldsPanel');
    var fieldOptionsPanel = document.getElementById('fieldOptionsPanel');
    var noSelection = document.getElementById('noSelection');
    var optionsForm = document.getElementById('optionsForm');
    var previewToggle = document.getElementById('previewToggle');
    var editorMode = document.getElementById('editorMode');
    var previewMode = document.getElementById('previewMode');
    var previewForm = document.getElementById('previewForm');
    var toast = document.getElementById('builderToast');

    var inputs = {
        label: document.getElementById('fieldLabel'),
        placeholder: document.getElementById('fieldPlaceholder'),
        min: document.getElementById('fieldMin'),
        max: document.getElementById('fieldMax'),
        defaultValue: document.getElementById('fieldDefault'),
        cssClass: document.getElementById('fieldClass'),
        required: document.getElementById('fieldRequired')
    };

    var fieldTypes = [
        { type: 'text', name: 'Text Input', description: 'Single-line text', template: 'text', placeholder: 'Enter text', supports: ['placeholder', 'minMax', 'default'] },
        { type: 'textarea', name: 'Text Area', description: 'Multi-line response', template: 'textarea', placeholder: 'Enter longer response', supports: ['placeholder', 'minMax'] },
        { type: 'number', name: 'Number Input', description: 'Numeric only', template: 'number', placeholder: '0', supports: ['placeholder', 'default'] },
        { type: 'email', name: 'Email Input', description: 'Email validation', template: 'email', placeholder: 'name@example.com', supports: ['placeholder', 'default'] },
        { type: 'tel', name: 'Phone Input', description: 'Phone number', template: 'tel', placeholder: '+1 555 000 0000', supports: ['placeholder'] },
        { type: 'select', name: 'Dropdown', description: 'Choice menu', template: 'select', options: true },
        { type: 'radio', name: 'Radio Buttons', description: 'Single choice', template: 'radio', options: true },
        { type: 'checkbox', name: 'Checkboxes', description: 'Multiple choice', template: 'checkbox', options: true },
        { type: 'date', name: 'Date Picker', description: 'Date selection', template: 'date' },
        { type: 'file', name: 'File Upload', description: 'Attachment field', template: 'file' },
        { type: 'title', name: 'Title', description: 'Section heading', template: 'title' },
        { type: 'description', name: 'Description', description: 'Helper copy', template: 'description' },
        { type: 'new_line', name: 'New Line', description: 'Vertical spacing', template: 'new_line' },
        { type: 'page_break', name: 'Page Break', description: 'Section divider', template: 'page_break' },
        { type: 'hidden', name: 'Hidden Field', description: 'Stored metadata', template: 'hidden', supports: ['default'] },
        { type: 'state', name: 'State', description: 'Location state', template: 'state', options: true },
        { type: 'city', name: 'City', description: 'Location city', template: 'city', placeholder: 'Enter city', supports: ['placeholder'] },
        { type: 'state_city', name: 'State & City', description: 'Combined location', template: 'state_city', placeholder: 'State, City', supports: ['placeholder'] }
    ];

    var state = {
        title: formTitle.value,
        fields: [],
        selectedId: null
    };
    var undoStack = [];
    var redoStack = [];
    var draggedFieldId = null;

    function uid() {
        return 'field_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function findType(type) {
        return fieldTypes.filter(function (item) { return item.type === type; })[0];
    }

    function selectedField() {
        return state.fields.filter(function (field) { return field.id === state.selectedId; })[0] || null;
    }

    function pushHistory() {
        undoStack.push(clone(state));
        if (undoStack.length > 40) {
            undoStack.shift();
        }
        redoStack = [];
    }

    function persist() {
        localStorage.setItem(storageKey, JSON.stringify(state));
    }

    function createField(type) {
        var meta = findType(type);
        return {
            id: uid(),
            type: meta.type,
            template: meta.template,
            label: meta.name,
            placeholder: meta.placeholder || '',
            min: '',
            max: '',
            defaultValue: '',
            required: false,
            cssClass: '',
            options: meta.options ? defaultOptions(meta.type) : []
        };
    }

    function defaultOptions(type) {
        if (type === 'state') {
            return ['California', 'New York', 'Texas'];
        }
        return ['Option 1', 'Option 2'];
    }

    function schema() {
        return {
            title: state.title,
            submissionUrl: document.getElementById('submissionUrl').textContent,
            fields: state.fields.map(function (field, index) {
                return {
                    id: field.id,
                    order: index + 1,
                    type: field.type,
                    label: field.label,
                    placeholder: field.placeholder,
                    min: field.min,
                    max: field.max,
                    defaultValue: field.defaultValue,
                    required: field.required,
                    cssClass: field.cssClass,
                    options: field.options
                };
            })
        };
    }

    function switchSidebar(tab) {
        var options = tab === 'options';
        addFieldsTab.classList.toggle('active', !options);
        fieldOptionsTab.classList.toggle('active', options);
        addFieldsPanel.hidden = options;
        fieldOptionsPanel.hidden = !options;
    }

    function renderPalette() {
        paletteGrid.innerHTML = '';
        fieldTypes.forEach(function (item) {
            var tile = document.createElement('button');
            tile.className = 'palette-tile';
            tile.type = 'button';
            tile.draggable = true;
            tile.dataset.type = item.type;
            tile.innerHTML = '<strong>' + escapeHtml(item.name) + '</strong><span>' + escapeHtml(item.description) + '</span>';
            tile.addEventListener('dragstart', function (event) {
                event.dataTransfer.setData('text/plain', item.type);
                event.dataTransfer.effectAllowed = 'copy';
            });
            tile.addEventListener('click', function () {
                addField(item.type);
            });
            paletteGrid.appendChild(tile);
        });
    }

    function addField(type, index) {
        pushHistory();
        var field = createField(type);
        if (typeof index === 'number') {
            state.fields.splice(index, 0, field);
        } else {
            state.fields.push(field);
        }
        state.selectedId = field.id;
        render();
        switchSidebar('options');
    }

    function render() {
        state.title = formTitle.value;
        titleCount.textContent = String(formTitle.value.length);
        fieldList.innerHTML = '';
        emptyState.hidden = state.fields.length > 0;

        state.fields.forEach(function (field, index) {
            fieldList.appendChild(renderCard(field, index));
        });

        renderOptions();
        renderPreview();
        persist();
    }

    function renderCard(field, index) {
        var card = document.createElement('article');
        card.className = 'field-card' + (field.id === state.selectedId ? ' selected' : '');
        card.draggable = true;
        card.dataset.id = field.id;

        var meta = findType(field.type);
        var head = document.createElement('div');
        head.className = 'field-card-head';
        head.innerHTML = '<span class="field-kind">' + escapeHtml(meta.name) + '</span>';

        var actions = document.createElement('div');
        actions.className = 'field-actions';
        actions.innerHTML =
            '<button class="drag-handle" type="button" title="Move" aria-label="Move">&varr;</button>' +
            '<button data-action="edit" type="button" title="Edit" aria-label="Edit">&#9998;</button>' +
            '<button data-action="duplicate" type="button" title="Duplicate" aria-label="Duplicate">&#x2398;</button>' +
            '<button data-action="delete" type="button" title="Delete" aria-label="Delete">&times;</button>';
        head.appendChild(actions);
        card.appendChild(head);
        card.appendChild(renderFieldPreview(field));

        card.addEventListener('click', function (event) {
            var action = event.target.dataset.action;
            if (action === 'edit') {
                state.selectedId = field.id;
                render();
                switchSidebar('options');
            }
            if (action === 'duplicate') {
                duplicateField(field.id);
            }
            if (action === 'delete') {
                removeField(field.id);
            }
        });

        card.addEventListener('dragstart', function (event) {
            draggedFieldId = field.id;
            card.classList.add('dragging');
            event.dataTransfer.setData('text/reorder', field.id);
            event.dataTransfer.effectAllowed = 'move';
        });
        card.addEventListener('dragend', function () {
            draggedFieldId = null;
            card.classList.remove('dragging');
        });
        card.addEventListener('dragover', function (event) {
            event.preventDefault();
        });
        card.addEventListener('drop', function (event) {
            event.preventDefault();
            var paletteType = event.dataTransfer.getData('text/plain');
            if (draggedFieldId) {
                reorderField(draggedFieldId, index);
            } else if (paletteType) {
                addField(paletteType, index + 1);
            }
        });

        return card;
    }

    function renderFieldPreview(field) {
        var template = document.querySelector('[data-template="' + field.template + '"]');
        var wrapper = document.createElement('div');
        if (!template) {
            wrapper.textContent = field.label;
            return wrapper;
        }
        wrapper.appendChild(template.content.cloneNode(true));
        hydrateField(wrapper, field, false);
        return wrapper;
    }

    function renderPreview() {
        previewForm.innerHTML = '';
        if (!state.fields.length) {
            previewForm.innerHTML = '<div class="no-selection"><strong>No fields yet</strong><span>Add fields to preview the form.</span></div>';
            return;
        }
        state.fields.forEach(function (field) {
            var block = renderFieldPreview(field);
            hydrateField(block, field, true);
            previewForm.appendChild(block);
        });
    }

    function hydrateField(root, field, interactive) {
        var label = root.querySelector('[data-role="label"]');
        if (label) {
            label.textContent = field.label + (field.required && label.tagName !== 'H3' && label.tagName !== 'P' ? ' *' : '');
        }
        var controls = root.querySelectorAll('input, textarea, select');
        controls.forEach(function (control) {
            control.id = field.id + '_' + control.tagName.toLowerCase();
            control.name = field.id + (control.type === 'checkbox' ? '[]' : '');
            control.required = Boolean(field.required);
            if (field.placeholder && 'placeholder' in control) {
                control.placeholder = field.placeholder;
            }
            if (field.cssClass) {
                control.className = (control.className + ' ' + field.cssClass).trim();
            }
            if (field.min) {
                control.minLength = Number(field.min);
            }
            if (field.max) {
                control.maxLength = Number(field.max);
            }
            if (field.defaultValue && control.type !== 'file' && control.type !== 'radio' && control.type !== 'checkbox') {
                control.value = field.defaultValue;
            }
            control.disabled = !interactive;
        });
        hydrateOptions(root, field);
    }

    function hydrateOptions(root, field) {
        if (!field.options.length) {
            return;
        }
        var select = root.querySelector('select');
        if (select) {
            select.innerHTML = '';
            field.options.forEach(function (option) {
                var optionNode = document.createElement('option');
                optionNode.value = slug(option);
                optionNode.textContent = option;
                select.appendChild(optionNode);
            });
        }
        var choiceGroup = root.querySelector('.fb-choice-group');
        if (choiceGroup) {
            var legend = choiceGroup.querySelector('legend');
            choiceGroup.innerHTML = '';
            if (legend) {
                choiceGroup.appendChild(legend);
            }
            field.options.forEach(function (option) {
                var choiceLabel = document.createElement('label');
                var input = document.createElement('input');
                input.type = field.type;
                input.name = field.id + (field.type === 'checkbox' ? '[]' : '');
                input.value = slug(option);
                input.required = Boolean(field.required);
                input.disabled = true;
                choiceLabel.appendChild(input);
                choiceLabel.appendChild(document.createElement('span')).textContent = option;
                choiceGroup.appendChild(choiceLabel);
            });
        }
    }

    function renderOptions() {
        var field = selectedField();
        noSelection.hidden = Boolean(field);
        optionsForm.hidden = !field;
        if (!field) {
            return;
        }

        var meta = findType(field.type);
        document.getElementById('selectedType').textContent = meta.name;
        inputs.label.value = field.label;
        inputs.placeholder.value = field.placeholder;
        inputs.min.value = field.min;
        inputs.max.value = field.max;
        inputs.defaultValue.value = field.defaultValue;
        inputs.cssClass.value = field.cssClass;
        inputs.required.checked = field.required;

        toggleOption('placeholder', meta.supports && meta.supports.indexOf('placeholder') >= 0);
        toggleOption('min', meta.supports && meta.supports.indexOf('minMax') >= 0);
        toggleOption('max', meta.supports && meta.supports.indexOf('minMax') >= 0);
        toggleOption('defaultValue', meta.supports && meta.supports.indexOf('default') >= 0);

        var optionBlock = document.getElementById('optionsListBlock');
        optionBlock.hidden = !meta.options;
        renderOptionRows(field);
    }

    function toggleOption(option, show) {
        var control = document.querySelector('[data-option="' + option + '"]');
        if (control) {
            control.hidden = !show;
        }
    }

    function renderOptionRows(field) {
        var rows = document.getElementById('optionRows');
        rows.innerHTML = '';
        field.options.forEach(function (option, index) {
            var row = document.createElement('div');
            row.className = 'option-row';
            row.innerHTML = '<input type="text" value="' + escapeHtml(option) + '" aria-label="Option ' + (index + 1) + '">' +
                '<button type="button" title="Remove option" aria-label="Remove option">&times;</button>';
            row.querySelector('input').addEventListener('input', function (event) {
                updateSelected(function (current) {
                    current.options[index] = event.target.value;
                }, false);
            });
            row.querySelector('button').addEventListener('click', function () {
                pushHistory();
                field.options.splice(index, 1);
                if (!field.options.length) {
                    field.options.push('Option 1');
                }
                render();
            });
            rows.appendChild(row);
        });
    }

    function updateSelected(mutator, withHistory) {
        var field = selectedField();
        if (!field) {
            return;
        }
        if (withHistory !== false) {
            pushHistory();
        }
        mutator(field);
        render();
    }

    function duplicateField(id) {
        var index = state.fields.findIndex(function (field) { return field.id === id; });
        if (index < 0) {
            return;
        }
        pushHistory();
        var copy = clone(state.fields[index]);
        copy.id = uid();
        copy.label = copy.label + ' Copy';
        state.fields.splice(index + 1, 0, copy);
        state.selectedId = copy.id;
        render();
        switchSidebar('options');
    }

    function removeField(id) {
        var field = state.fields.filter(function (item) { return item.id === id; })[0];
        if (!field) {
            return;
        }
        var confirmed = window.confirm('Remove "' + field.label + '" from the form?');
        if (!confirmed) {
            return;
        }
        pushHistory();
        state.fields = state.fields.filter(function (item) { return item.id !== id; });
        if (state.selectedId === id) {
            state.selectedId = state.fields[0] ? state.fields[0].id : null;
        }
        render();
        showToast('Field removed');
    }

    function reorderField(id, targetIndex) {
        var fromIndex = state.fields.findIndex(function (field) { return field.id === id; });
        if (fromIndex < 0 || fromIndex === targetIndex) {
            return;
        }
        pushHistory();
        var moved = state.fields.splice(fromIndex, 1)[0];
        state.fields.splice(targetIndex, 0, moved);
        render();
    }

    function restore(nextState) {
        state = clone(nextState);
        formTitle.value = state.title || 'Untitled Form';
        render();
    }

    function showToast(message) {
        toast.textContent = message;
        toast.hidden = false;
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(function () {
            toast.hidden = true;
        }, 2200);
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char];
        });
    }

    function slug(value) {
        return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    formTitle.addEventListener('input', function () {
        state.title = formTitle.value;
        render();
    });

    addFieldsTab.addEventListener('click', function () { switchSidebar('add'); });
    fieldOptionsTab.addEventListener('click', function () { switchSidebar('options'); });

    dropZone.addEventListener('dragover', function (event) {
        event.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', function () {
        dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', function (event) {
        event.preventDefault();
        dropZone.classList.remove('drag-over');
        var type = event.dataTransfer.getData('text/plain');
        if (type && findType(type)) {
            addField(type);
        }
    });

    Object.keys(inputs).forEach(function (key) {
        var input = inputs[key];
        input.addEventListener('input', function () {
            updateSelected(function (field) {
                field[key] = key === 'required' ? input.checked : input.value;
            }, false);
        });
        input.addEventListener('change', function () {
            updateSelected(function (field) {
                field[key] = key === 'required' ? input.checked : input.value;
            });
        });
    });

    document.getElementById('addOptionBtn').addEventListener('click', function () {
        updateSelected(function (field) {
            field.options.push('Option ' + (field.options.length + 1));
        });
    });

    document.getElementById('removeElementBtn').addEventListener('click', function () {
        if (state.selectedId) {
            removeField(state.selectedId);
        }
    });

    document.getElementById('cancelBtn').addEventListener('click', function () {
        if (!window.confirm('Clear the current form builder state?')) {
            return;
        }
        pushHistory();
        state.fields = [];
        state.selectedId = null;
        render();
    });

    document.getElementById('nextBtn').addEventListener('click', function () {
        var output = schema();
        console.log('Form JSON schema:', output);
        window.alert(JSON.stringify(output, null, 2));
    });

    document.getElementById('undoBtn').addEventListener('click', function () {
        if (!undoStack.length) {
            return;
        }
        redoStack.push(clone(state));
        restore(undoStack.pop());
    });

    document.getElementById('redoBtn').addEventListener('click', function () {
        if (!redoStack.length) {
            return;
        }
        undoStack.push(clone(state));
        restore(redoStack.pop());
    });

    previewToggle.addEventListener('change', function () {
        editorMode.hidden = previewToggle.checked;
        previewMode.hidden = !previewToggle.checked;
        renderPreview();
    });

    document.addEventListener('keydown', function (event) {
        if (!event.ctrlKey && !event.metaKey) {
            return;
        }
        if (event.key.toLowerCase() === 'z') {
            event.preventDefault();
            document.getElementById('undoBtn').click();
        }
        if (event.key.toLowerCase() === 'y') {
            event.preventDefault();
            document.getElementById('redoBtn').click();
        }
    });

    function load() {
        try {
            var stored = JSON.parse(localStorage.getItem(storageKey));
            if (stored && Array.isArray(stored.fields)) {
                state = stored;
                formTitle.value = state.title || 'Untitled Form';
            }
        } catch (error) {
            localStorage.removeItem(storageKey);
        }
    }

    load();
    renderPalette();
    render();
})();
