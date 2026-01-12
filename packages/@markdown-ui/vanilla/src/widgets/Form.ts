import type { FormProps, WidgetProps, OnChangeCallback } from './types';
import { createTextInput } from './TextInput';
import { createButtonGroup } from './ButtonGroup';
import { createSelect } from './Select';
import { createSelectMulti } from './SelectMulti';
import { createSlider } from './Slider';

function getDefaultValue(field: WidgetProps): unknown {
  switch (field.type) {
    case 'text-input':
      return field.default ?? '';
    case 'button-group':
      return field.default ?? field.choices[0];
    case 'select':
      return field.default ?? field.choices[0];
    case 'select-multi':
      return Array.isArray(field.default)
        ? field.default
        : field.default
          ? [field.default]
          : [];
    case 'slider':
      return field.default ?? field.min;
    default:
      return '';
  }
}

function createFieldWidget(
  field: WidgetProps,
  onFieldChange: (id: string, value: unknown) => void
): HTMLElement | null {
  const fieldId = field.id || '';
  const fieldOnChange = (value: unknown) => onFieldChange(fieldId, value);

  switch (field.type) {
    case 'text-input':
      return createTextInput(field, fieldOnChange);
    case 'button-group':
      return createButtonGroup(field, fieldOnChange);
    case 'select':
      return createSelect(field, fieldOnChange);
    case 'select-multi':
      return createSelectMulti(field, fieldOnChange);
    case 'slider':
      return createSlider(field, fieldOnChange);
    default:
      return null;
  }
}

export function createForm(props: FormProps, onChange: OnChangeCallback): HTMLElement {
  const container = document.createElement('div');
  container.className = 'widget-form';

  // Initialize form data with defaults
  const formData: Record<string, unknown> = {};
  props.fields.forEach((field) => {
    if (field.id) {
      formData[field.id] = getDefaultValue(field);
    }
  });

  const setFieldValue = (id: string, value: unknown) => {
    formData[id] = value;
  };

  // Render each field
  props.fields.forEach((field) => {
    const fieldElement = createFieldWidget(field, setFieldValue);
    if (fieldElement) {
      container.appendChild(fieldElement);
    }
  });

  // Submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'button';
  submitButton.textContent = props.submitLabel || 'Submit';
  submitButton.addEventListener('click', () => {
    onChange({ ...formData });
  });

  container.appendChild(submitButton);

  return container;
}
