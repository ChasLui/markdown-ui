export interface WidgetEventDetail {
    id: string;
    value: unknown;
}
export interface MarkdownUIOptions {
    container: HTMLElement | string;
    onWidgetEvent?: (event: CustomEvent<WidgetEventDetail>) => void;
}
export declare class MarkdownUI {
    private container;
    private eventHandler;
    constructor(options: MarkdownUIOptions);
    /**
     * Static factory method for simple initialization
     */
    static init(container: HTMLElement | string, options?: Partial<Omit<MarkdownUIOptions, 'container'>>): MarkdownUI;
    /**
     * Render HTML content with widgets
     */
    render(html: string): void;
    /**
     * Cleanup event listeners and state
     */
    destroy(): void;
}
export { createWidget } from './widgets';
export type { WidgetProps, TextInputProps, ButtonGroupProps, SelectProps, SelectMultiProps, SliderProps, FormProps, OnChangeCallback, } from './widgets';
export default MarkdownUI;
//# sourceMappingURL=index.d.ts.map