@props([
    'label' => '',
    'type' => 'text',
    'id' => '',
    'name' => '',
    'value' => '',
    'wrapperClass' => 'option-control',
])

@if ($type === 'checkbox')
    <label class="{{ $wrapperClass }}">
        <input id="{{ $id }}" name="{{ $name ?: $id }}" type="checkbox" {{ $attributes }}>
        <span>{{ $label }}</span>
    </label>
@else
    <label class="{{ $wrapperClass }}" {{ $attributes->only('data-option') }}>
        @if ($label)
            <span>{{ $label }}</span>
        @endif
        <input
            id="{{ $id }}"
            name="{{ $name ?: $id }}"
            type="{{ $type }}"
            value="{{ $value }}"
            {{ $attributes->except('data-option') }}
        >
    </label>
@endif
