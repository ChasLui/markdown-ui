import type { SliderProps, OnChangeCallback } from './types';

export function createSlider(props: SliderProps, onChange: OnChangeCallback): HTMLElement {
  const container = document.createElement('div');
  container.className = 'widget-slider';

  if (props.label) {
    const label = document.createElement('label');
    label.textContent = props.label;
    container.appendChild(label);
  }

  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'slider-container';

  const values = document.createElement('div');
  values.className = 'slider-values';

  const minSpan = document.createElement('span');
  minSpan.className = 'min-value';
  minSpan.textContent = String(props.min);

  const currentSpan = document.createElement('span');
  currentSpan.className = 'current-value';
  currentSpan.textContent = String(props.default ?? props.min);

  const maxSpan = document.createElement('span');
  maxSpan.className = 'max-value';
  maxSpan.textContent = String(props.max);

  values.appendChild(minSpan);
  values.appendChild(currentSpan);
  values.appendChild(maxSpan);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(props.min);
  input.max = String(props.max);
  input.step = String(props.step ?? 1);
  input.value = String(props.default ?? props.min);

  // Update display on input change
  input.addEventListener('input', () => {
    currentSpan.textContent = input.value;
  });

  // Fire event when interaction completes
  input.addEventListener('change', () => {
    onChange(Number(input.value));
  });

  sliderContainer.appendChild(values);
  sliderContainer.appendChild(input);
  container.appendChild(sliderContainer);

  return container;
}
