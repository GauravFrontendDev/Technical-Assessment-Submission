@extends('layouts.admin')

@push('styles')
<link href="{{ asset('css/form-builder.css') }}" rel="stylesheet">
@endpush

@section('content')
<div class="app-content">
    <div class="side-app">
        <section class="builder-shell" data-form-builder>
            <header class="builder-header">
                <div class="builder-title-block">
                    <x-builder-setting id="formTitle" label="Form title" type="text" value="Customer Intake Form" class="builder-title-input" maxlength="200" wrapperClass="builder-title-control" />
                    <div class="builder-meta-row">
                        <span><strong id="titleCount">20</strong>/200</span>
                        <span>Submission URL: <code id="submissionUrl">{{ url('/forms/customer-intake') }}</code></span>
                    </div>
                </div>
                <div class="builder-header-actions">
                    <button class="fb-icon-button" type="button" id="undoBtn" title="Undo" aria-label="Undo">&olarr;</button>
                    <button class="fb-icon-button" type="button" id="redoBtn" title="Redo" aria-label="Redo">&orarr;</button>
                    <x-builder-setting id="previewToggle" label="Preview" type="checkbox" wrapperClass="fb-switch" />
                </div>
            </header>

            <nav class="builder-tabs" aria-label="Form sections">
                <button class="active" type="button">Form Editor</button>
                <button type="button">Settings</button>
            </nav>

            <main class="builder-workspace">
                <section class="builder-canvas-panel">
                    <div id="editorMode">
                        <div class="drop-zone" id="dropZone">
                            <div class="empty-state" id="emptyState">
                                <strong>Drag elements from the right panel to build your form &rarr;</strong>
                                <span>Fields appear here in the order your users will see them.</span>
                            </div>
                            <div class="field-list" id="fieldList" aria-live="polite"></div>
                        </div>
                    </div>

                    <div class="preview-mode" id="previewMode" hidden>
                        <form class="preview-form" id="previewForm"></form>
                    </div>
                </section>

                <aside class="builder-sidebar">
                    <div class="sidebar-tabs" role="tablist">
                        <button class="active" id="addFieldsTab" type="button">Add Fields</button>
                        <button id="fieldOptionsTab" type="button">Field Options</button>
                    </div>

                    <section id="addFieldsPanel" class="sidebar-panel">
                        <div class="palette-grid" id="paletteGrid"></div>
                    </section>

                    <section id="fieldOptionsPanel" class="sidebar-panel" hidden>
                        <div class="no-selection" id="noSelection">
                            <strong>No field selected</strong>
                            <span>Choose the edit button on a canvas field to configure it.</span>
                        </div>

                        <form id="optionsForm" class="options-form" hidden>
                            <div class="option-heading">
                                <span id="selectedType">Field</span>
                                <button id="removeElementBtn" class="danger-link" type="button">Remove Element</button>
                            </div>

                            <x-builder-setting id="fieldLabel" label="Label" type="text" maxlength="120" data-option="label" />

                            <x-builder-setting id="fieldPlaceholder" label="Placeholder" type="text" maxlength="160" data-option="placeholder" />

                            <div class="option-grid">
                                <x-builder-setting id="fieldMin" label="Min characters" type="number" min="0" data-option="min" />
                                <x-builder-setting id="fieldMax" label="Max characters" type="number" min="0" data-option="max" />
                            </div>

                            <x-builder-setting id="fieldDefault" label="Default value" type="text" data-option="defaultValue" />

                            <x-builder-setting id="fieldClass" label="CSS Class" type="text" placeholder="e.g. compact-field" />

                            <x-builder-setting id="fieldRequired" label="Required field" type="checkbox" wrapperClass="required-row" />

                            <div class="options-list" id="optionsListBlock" hidden>
                                <div class="options-list-head">
                                    <span>Options</span>
                                    <button id="addOptionBtn" type="button">Add option</button>
                                </div>
                                <div id="optionRows"></div>
                            </div>
                        </form>
                    </section>
                </aside>
            </main>

            <footer class="builder-footer">
                <button id="cancelBtn" class="btn-outline-builder" type="button">Cancel</button>
                <button id="nextBtn" class="btn-primary-builder" type="button">Next</button>
            </footer>
        </section>
    </div>
</div>

<div class="builder-toast" id="builderToast" role="status" aria-live="polite" hidden></div>

<div id="bladeTemplates" hidden>
    <template data-template="text"><x-builder-control type="text" label="Text Input" name="text_input" placeholder="Enter text" /></template>
    <template data-template="textarea"><x-builder-control type="textarea" label="Text Area" name="text_area" placeholder="Enter longer response" /></template>
    <template data-template="number"><x-builder-control type="number" label="Number Input" name="number_input" placeholder="0" /></template>
    <template data-template="email"><x-builder-control type="email" label="Email Input" name="email_input" placeholder="name@example.com" /></template>
    <template data-template="tel"><x-builder-control type="tel" label="Phone Input" name="phone_input" placeholder="+1 555 000 0000" /></template>
    <template data-template="select"><x-builder-control type="select" label="Dropdown" name="dropdown" :options="['Option 1', 'Option 2']" /></template>
    <template data-template="radio"><x-builder-control type="radio" label="Radio Buttons" name="radio_buttons" :options="['Option 1', 'Option 2']" /></template>
    <template data-template="checkbox"><x-builder-control type="checkbox" label="Checkboxes" name="checkboxes" :options="['Option 1', 'Option 2']" /></template>
    <template data-template="date"><x-builder-control type="date" label="Date Picker" name="date_picker" /></template>
    <template data-template="file"><x-builder-control type="file" label="File Upload" name="file_upload" /></template>
    <template data-template="title"><x-builder-control type="title" label="Section Title" name="section_title" /></template>
    <template data-template="description"><x-builder-control type="description" label="Helpful description text for this section." name="description" /></template>
    <template data-template="new_line"><x-builder-control type="new_line" label="New Line" name="new_line" /></template>
    <template data-template="page_break"><x-builder-control type="page_break" label="Page Break" name="page_break" /></template>
    <template data-template="hidden"><x-builder-control type="hidden" label="Hidden Field" name="hidden_field" defaultValue="internal-value" /></template>
    <template data-template="state"><x-builder-control type="select" label="State" name="state" :options="['California', 'New York', 'Texas']" /></template>
    <template data-template="city"><x-builder-control type="text" label="City" name="city" placeholder="Enter city" /></template>
    <template data-template="state_city"><x-builder-control type="text" label="State & City Combined" name="state_city" placeholder="State, City" /></template>
</div>

@endsection

@push('scripts')
<script src="{{ asset('js/form-builder.js') }}"></script>
@endpush
