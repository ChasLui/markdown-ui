import { type MarkedExtension } from 'marked';
import { nanoid } from 'nanoid';
import { parseDSL, parseDSLStreaming } from '@markdown-ui/mdui-lang';

export interface MarkedUiExtensionOptions {
    /**
     * Enable streaming mode for AI content generation.
     * When true, uses streaming-aware parser that handles incomplete input gracefully.
     */
    streaming?: boolean;
}

/**
 * Create a marked extension for markdown-ui widgets.
 * @param options Configuration options
 */
export function createMarkedUiExtension(options: MarkedUiExtensionOptions = {}): MarkedExtension {
    const { streaming = false } = options;

    return {
        renderer: {
            code(token) {
                const lang = token.lang;

                if (lang === "markdown-ui-widget") {
                    const text = token.text.trim();
                    let payloadJson: any = {};
                    let finalPayload: string;

                    // Try JSON first
                    try {
                        payloadJson = JSON.parse(text);
                        finalPayload = text; // Use original JSON
                    } catch (e) {
                        // Not JSON, try DSL parsing
                        if (streaming) {
                            // Use streaming-aware parser for AI content
                            const result = parseDSLStreaming(text);
                            if (result.widget) {
                                payloadJson = result.widget;
                                // Add streaming metadata
                                payloadJson._streaming = !result.complete;
                                payloadJson._pending = result.pending;
                                finalPayload = JSON.stringify(payloadJson);
                            } else {
                                // Can't even detect widget type, render as code block
                                return false;
                            }
                        } else {
                            // Use standard parser
                            const result = parseDSL(text);
                            if (result.success && result.widget) {
                                payloadJson = result.widget;
                                finalPayload = JSON.stringify(result.widget);
                            } else {
                                // Failed to parse, render as code block
                                return false;
                            }
                        }
                    }

                    const payload = encodeURIComponent(finalPayload);
                    const id = payloadJson.id || nanoid();

                    return `<markdown-ui-widget id="${id}" content="${payload}"></markdown-ui-widget>\n`;
                }

                // fall back to default rendering
                return false; // tells marked to use its default renderer for other languages
            },
        },
    };
}

/**
 * Default marked extension (non-streaming mode for backward compatibility)
 */
export const markedUiExtension: MarkedExtension = createMarkedUiExtension({ streaming: false });

/**
 * Streaming-aware marked extension for AI content generation
 */
export const markedUiStreamingExtension: MarkedExtension = createMarkedUiExtension({ streaming: true });