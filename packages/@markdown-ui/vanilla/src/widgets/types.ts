export interface BaseWidgetProps {
  id?: string;
  label?: string;
}

export interface TextInputProps extends BaseWidgetProps {
  type: 'text-input';
  placeholder?: string;
  default?: string;
}

export interface ButtonGroupProps extends BaseWidgetProps {
  type: 'button-group';
  choices: string[];
  default?: string;
}

export interface SelectProps extends BaseWidgetProps {
  type: 'select';
  choices: string[];
  default?: string;
}

export interface SelectMultiProps extends BaseWidgetProps {
  type: 'select-multi';
  choices: string[];
  default?: string | string[];
}

export interface SliderProps extends BaseWidgetProps {
  type: 'slider';
  min: number;
  max: number;
  step?: number;
  default?: number;
}

export interface FormProps extends BaseWidgetProps {
  type: 'form';
  submitLabel?: string;
  fields: WidgetProps[];
}

export type WidgetProps =
  | TextInputProps
  | ButtonGroupProps
  | SelectProps
  | SelectMultiProps
  | SliderProps
  | FormProps;

export type OnChangeCallback = (value: unknown) => void;
