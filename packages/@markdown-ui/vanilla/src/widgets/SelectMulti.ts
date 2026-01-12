import type { SelectMultiProps, OnChangeCallback } from './types';

export function createSelectMulti(props: SelectMultiProps, onChange: OnChangeCallback): HTMLElement {
  const container = document.createElement('div');
  container.className = 'selector-multi';

  if (props.label) {
    const label = document.createElement('div');
    label.className = 'selector-multi-label';
    label.textContent = props.label;
    container.appendChild(label);
  }

  const checkboxGroup = document.createElement('div');
  checkboxGroup.className = 'checkbox-group';

  // Normalize default value to array
  const defaultValues: string[] = Array.isArray(props.default)
    ? props.default
    : props.default
      ? [props.default]
      : [];

  const selectedValues = new Set(defaultValues);

  props.choices.forEach((choice) => {
    const checkboxItem = document.createElement('label');
    checkboxItem.className = 'checkbox-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = selectedValues.has(choice);

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedValues.add(choice);
      } else {
        selectedValues.delete(choice);
      }
      onChange(Array.from(selectedValues));
    });

    const span = document.createElement('span');
    span.textContent = choice;

    checkboxItem.appendChild(checkbox);
    checkboxItem.appendChild(span);
    checkboxGroup.appendChild(checkboxItem);
  });

  container.appendChild(checkboxGroup);
  return container;
}
