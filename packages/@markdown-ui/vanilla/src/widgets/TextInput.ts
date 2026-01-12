import type { TextInputProps, OnChangeCallback } from './types';

export function createTextInput(props: TextInputProps, onChange: OnChangeCallback): HTMLElement {
  const container = document.createElement('div');
  container.className = 'widget-button';

  if (props.label) {
    const label = document.createElement('label');
    label.textContent = props.label;
    container.appendChild(label);
  }

  const input = document.createElement('input');
  input.type = 'text';
  input.value = props.default || '';
  input.placeholder = props.placeholder || '';

  // Fire event on blur (matches React behavior)
  input.addEventListener('blur', () => {
    onChange(input.value);
  });

  // Also support Enter key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      onChange(input.value);
    }
  });

  container.appendChild(input);
  return container;
}
