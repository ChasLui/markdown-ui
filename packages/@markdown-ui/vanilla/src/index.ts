import { createWidget, type WidgetProps } from './widgets';

export interface WidgetEventDetail {
  id: string;
  value: unknown;
}

export interface MarkdownUIOptions {
  container: HTMLElement | string;
  onWidgetEvent?: (event: CustomEvent<WidgetEventDetail>) => void;
}

let customElementRegistered = false;

function registerCustomElement(): void {
  if (typeof window === 'undefined' || customElementRegistered) {
    return;
  }

  // Check if already defined (by another instance or framework renderer)
  if (customElements.get('markdown-ui-widget')) {
    customElementRegistered = true;
    return;
  }

  class MarkdownUIWidgetElement extends HTMLElement {
    private widgetElement: HTMLElement | null = null;
    private rendered = false;

    connectedCallback(): void {
      // Avoid re-rendering if already done
      if (this.rendered) return;
      this.rendered = true;

      const id = this.getAttribute('id') || '';
      const content = this.getAttribute('content') || '';

      try {
        const props: WidgetProps = JSON.parse(decodeURIComponent(content));

        // Clear existing content
        this.innerHTML = '';

        // Create widget with dispatch callback
        const dispatch = (value: unknown) => {
          const event = new CustomEvent('widget-event', {
            detail: { id, value },
            bubbles: true,
            composed: true,
          });

          // Find container and dispatch
          const container = this.closest('.widget-container');
          if (container) {
            container.dispatchEvent(event);
          } else {
            // Fallback: dispatch on self
            this.dispatchEvent(event);
          }
        };

        this.widgetElement = createWidget(props, dispatch);
        this.appendChild(this.widgetElement);
      } catch (error) {
        console.error('Failed to parse widget content:', error);
        this.innerHTML = '<span style="color: red;">Widget parse error</span>';
      }
    }

    disconnectedCallback(): void {
      this.widgetElement = null;
      this.rendered = false;
    }
  }

  customElements.define('markdown-ui-widget', MarkdownUIWidgetElement);
  customElementRegistered = true;
}

export class MarkdownUI {
  private container: HTMLElement;
  private eventHandler: ((e: Event) => void) | null = null;

  constructor(options: MarkdownUIOptions) {
    // Resolve container
    const container =
      typeof options.container === 'string'
        ? document.querySelector(options.container)
        : options.container;

    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('MarkdownUI: Container not found');
    }

    this.container = container;

    // Add wrapper class for event bubbling
    this.container.classList.add('widget-container');

    // Register custom element
    registerCustomElement();

    // Set up event listener
    if (options.onWidgetEvent) {
      this.eventHandler = (e: Event) => {
        options.onWidgetEvent!(e as CustomEvent<WidgetEventDetail>);
      };
      this.container.addEventListener('widget-event', this.eventHandler);
    }
  }

  /**
   * Static factory method for simple initialization
   */
  static init(
    container: HTMLElement | string,
    options?: Partial<Omit<MarkdownUIOptions, 'container'>>
  ): MarkdownUI {
    return new MarkdownUI({ container, ...options });
  }

  /**
   * Render HTML content with widgets
   */
  render(html: string): void {
    this.container.innerHTML = html;
  }

  /**
   * Cleanup event listeners and state
   */
  destroy(): void {
    if (this.eventHandler) {
      this.container.removeEventListener('widget-event', this.eventHandler);
      this.eventHandler = null;
    }
    this.container.classList.remove('widget-container');
  }
}

// Export types and utilities
export { createWidget } from './widgets';
export type {
  WidgetProps,
  TextInputProps,
  ButtonGroupProps,
  SelectProps,
  SelectMultiProps,
  SliderProps,
  FormProps,
  OnChangeCallback,
} from './widgets';

// Default export for convenience
export default MarkdownUI;
