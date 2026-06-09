# Drag-and-Drop Form Builder Assignment

This Laravel project implements a fully functional Form Builder UI at `/`.

## Setup

```bash
composer install
php artisan serve
```

If your default `php` binary is older than the versions in `composer.lock`, run the same commands with PHP 8:

```bash
php8.4 /usr/local/bin/composer install --ignore-platform-reqs
php8.4 artisan serve
```

Then open the URL printed by Laravel, for example `http://127.0.0.1:8000`.

## What Is Included

- Form title input with 200 character live counter.
- Form Editor and Settings tabs.
- Dashed drag-and-drop canvas with empty state and drag-over highlight.
- Right-side field palette with all required field types.
- Field Options panel with live label, placeholder, min/max, options, required, CSS class, default value, and remove controls.
- Reorder, edit, duplicate, and delete actions for placed fields.
- JSON schema export through the Next button.
- Bonus features: undo/redo, preview mode, localStorage persistence, delete confirmation, drag-over feedback.
- Blade components for rendered form controls and builder setting controls.

## Drag-and-Drop Choice

I used the native HTML5 Drag and Drop API instead of adding a third-party library. The assignment does not require nested sorting or cross-page drag sources, so native DnD keeps the project dependency-free, easy to run with `php artisan serve`, and easier to review inside the existing Laravel/Blade codebase.

## Assumptions

- The Settings tab is intentionally non-functional because the assignment only requires the Form Editor tab to work.
- No backend persistence or form submission endpoint is needed.
- Location fields are represented as configurable form fields: State as a dropdown, City as text, and State & City as a combined text input.
- The JSON schema is logged to the console and displayed in an alert when Next is clicked.

## Sample JSON Output

```json
{
  "title": "Customer Intake Form",
  "submissionUrl": "http://127.0.0.1:8000/forms/customer-intake",
  "fields": [
    {
      "id": "field_lx1_text",
      "order": 1,
      "type": "text",
      "label": "Full Name",
      "placeholder": "Enter full name",
      "min": "2",
      "max": "80",
      "defaultValue": "",
      "required": true,
      "cssClass": "full-name-field",
      "options": []
    },
    {
      "id": "field_lx2_dropdown",
      "order": 2,
      "type": "select",
      "label": "Department",
      "placeholder": "",
      "min": "",
      "max": "",
      "defaultValue": "",
      "required": false,
      "cssClass": "",
      "options": ["Sales", "Support", "Operations"]
    }
  ]
}
```
