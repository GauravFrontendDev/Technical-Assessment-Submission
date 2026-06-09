@props([
    'type' => 'text',
    'label' => 'Field label',
    'name' => 'field',
    'placeholder' => '',
    'required' => false,
    'className' => '',
    'defaultValue' => '',
    'options' => ['Option 1', 'Option 2'],
])

@php
    $fieldId = $attributes->get('id', 'field_' . uniqid());
    $isRequired = filter_var($required, FILTER_VALIDATE_BOOLEAN);
    $fieldClass = trim('fb-render-control ' . $className);
@endphp

@if ($type === 'title')
    <h3 class="fb-render-title" data-role="label">{{ $label }}</h3>
@elseif ($type === 'description')
    <p class="fb-render-description" data-role="label">{{ $label }}</p>
@elseif ($type === 'new_line')
    <div class="fb-render-new-line" aria-hidden="true"></div>
@elseif ($type === 'page_break')
    <div class="fb-render-page-break"><span data-role="label">{{ $label }}</span></div>
@elseif ($type === 'hidden')
    <div class="fb-hidden-preview">
        <span data-role="label">{{ $label }}</span>
        <code>Hidden field</code>
        <input type="hidden" id="{{ $fieldId }}" name="{{ $name }}" value="{{ $defaultValue }}">
    </div>
@elseif ($type === 'textarea')
    <div class="fb-render-field">
        <label for="{{ $fieldId }}" data-role="label">{{ $label }}@if($isRequired)<span>*</span>@endif</label>
        <textarea id="{{ $fieldId }}" name="{{ $name }}" class="{{ $fieldClass }}" placeholder="{{ $placeholder }}" @if($isRequired) required @endif>{{ $defaultValue }}</textarea>
    </div>
@elseif ($type === 'select')
    <div class="fb-render-field">
        <label for="{{ $fieldId }}" data-role="label">{{ $label }}@if($isRequired)<span>*</span>@endif</label>
        <select id="{{ $fieldId }}" name="{{ $name }}" class="{{ $fieldClass }}" @if($isRequired) required @endif>
            @foreach($options as $option)
                <option value="{{ \Illuminate\Support\Str::slug($option) }}">{{ $option }}</option>
            @endforeach
        </select>
    </div>
@elseif ($type === 'radio' || $type === 'checkbox')
    <fieldset class="fb-render-field fb-choice-group">
        <legend data-role="label">{{ $label }}@if($isRequired)<span>*</span>@endif</legend>
        @foreach($options as $option)
            <label>
                <input type="{{ $type }}" name="{{ $name }}{{ $type === 'checkbox' ? '[]' : '' }}" value="{{ \Illuminate\Support\Str::slug($option) }}" @if($isRequired) required @endif>
                <span>{{ $option }}</span>
            </label>
        @endforeach
    </fieldset>
@else
    <div class="fb-render-field">
        <label for="{{ $fieldId }}" data-role="label">{{ $label }}@if($isRequired)<span>*</span>@endif</label>
        <input type="{{ $type }}" id="{{ $fieldId }}" name="{{ $name }}" class="{{ $fieldClass }}" placeholder="{{ $placeholder }}" value="{{ $defaultValue }}" @if($isRequired) required @endif>
    </div>
@endif
