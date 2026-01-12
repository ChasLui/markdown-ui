import type { WidgetProps, OnChangeCallback } from './types';
import { createTextInput } from './TextInput';
import { createButtonGroup } from './ButtonGroup';
import { createSelect } from './Select';
import { createSelectMulti } from './SelectMulti';
import { createSlider } from './Slider';
import { createForm } from './Form';

type WidgetCreator = (props: any, onChange: OnChangeCallback) => HTMLElement;

const widgetCreators: Record<string, WidgetCreator> = {
  'text-input': createTextInput,
  'button-group': createButtonGroup,
  'select': createSelect,
  'select-multi': createSelectMulti,
  'slider': createSlider,
  'form': createForm,
};

export function createWidget(props: WidgetProps, onChange: OnChangeCallback): HTMLElement {
  const creator = widgetCreators[props.type];

  if (!creator) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'widget';
    const errorSpan = document.createElement('span');
    errorSpan.style.color = 'red';
    errorSpan.textContent = `Unknown widget "${props.type}"`;
    errorDiv.appendChild(errorSpan);
    return errorDiv;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'widget';
  wrapper.appendChild(creator(props, onChange));
  return wrapper;
}
