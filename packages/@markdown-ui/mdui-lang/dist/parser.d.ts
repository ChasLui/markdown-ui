import { ParseResult, StreamingParseResult } from './types.js';
export declare class DSLParser {
    parse(input: string): ParseResult;
    private tokenize;
    /**
     * Normalize array syntax to handle common AI output variations.
     * Converts formats like ["a","b","c"] or ["a", "b", "c"] to ["a" "b" "c"]
     */
    private normalizeArraySyntax;
    private parseArray;
    private parseTextInput;
    private parseButtonGroup;
    private parseSelect;
    private parseSelectMulti;
    private parseSlider;
    private parseForm;
    private parseChart;
    private parseMultipleChoiceQuestion;
    private parseShortAnswerQuestion;
    private parseQuiz;
    /**
     * Streaming-aware parsing that returns partial results for incomplete input.
     * This is designed for AI streaming scenarios where content arrives incrementally.
     */
    parseStreaming(input: string): StreamingParseResult;
    /**
     * Detect if input has unclosed brackets or quotes
     */
    private detectPendingState;
    /**
     * Parse widget with incomplete input, filling in defaults for missing parts
     */
    private parsePartialWidget;
    /**
     * Auto-complete unclosed arrays by adding closing bracket
     */
    private autoCompleteArrays;
    /**
     * Parse partial quiz, extracting whatever questions are complete
     */
    private parsePartialQuiz;
    /**
     * Parse a single question line, handling incomplete input
     */
    private parsePartialQuestion;
    /**
     * Parse partial form
     */
    private parsePartialForm;
    /**
     * Parse partial chart
     */
    private parsePartialChart;
}
export declare function parseDSL(input: string): ParseResult;
export declare function parseDSLStreaming(input: string): StreamingParseResult;
