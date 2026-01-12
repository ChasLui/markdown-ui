import type { SelectProps, OnChangeCallback } from './types';

export function createSelect(props: SelectProps, onChange: OnChangeCallback): HTMLElement {
  const container = document.createElement('div');
  container.className = 'selector';

  if (props.label) {
    const label = document.createElement('label');
    label.textContent = props.label;
    container.appendChild(label);
  }

  const select = document.createElement('select');
  const defaultValue = props.default ?? props.choices[0];

  props.choices.forEach((choice) => {
    const option = document.createElement('option');
    option.value = choice;
    option.textContent = choice;
    option.selected = choice === defaultValue;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    onChange(select.value);
  });

  container.appendChild(select);
  return container;
}
