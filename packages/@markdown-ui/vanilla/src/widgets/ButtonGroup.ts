import type { ButtonGroupProps, OnChangeCallback } from './types';

export function createButtonGroup(props: ButtonGroupProps, onChange: OnChangeCallback): HTMLElement {
  const container = document.createElement('div');
  container.className = 'widget-button-group';

  if (props.label) {
    const label = document.createElement('label');
    label.textContent = props.label;
    container.appendChild(label);
  }

  const group = document.createElement('div');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', props.label || 'Button group');

  let selectedValue = props.default ?? props.choices[0];

  props.choices.forEach((choice) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = choice;
    button.setAttribute('aria-pressed', choice === selectedValue ? 'true' : 'false');

    button.addEventListener('click', () => {
      selectedValue = choice;
      // Update all button states
      group.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-pressed', btn.textContent === choice ? 'true' : 'false');
      });
      onChange(choice);
    });

    group.appendChild(button);
  });

  container.appendChild(group);
  return container;
}
