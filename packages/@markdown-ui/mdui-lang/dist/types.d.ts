export interface TextInputWidget {
    type: "text-input";
    id?: string;
    label?: string;
    placeholder?: string;
    default?: string;
}
export interface ButtonGroupWidget {
    type: "button-group";
    id?: string;
    label?: string;
    choices: string[];
    default?: string;
}
export interface SelectWidget {
    type: "select";
    id?: string;
    label?: string;
    choices: string[];
    default?: string;
}
export interface SelectMultiWidget {
    type: "select-multi";
    id?: string;
    label?: string;
    choices: string[];
    default?: string | string[];
}
export interface SliderWidget {
    type: "slider";
    id?: string;
    label?: string;
    min: number;
    max: number;
    step?: number;
    default?: number;
}
export interface FormWidget {
    type: "form";
    id?: string;
    submitLabel?: string;
    fields: Widget[];
}
export interface ChartWidget {
    type: "chart-line" | "chart-bar" | "chart-pie" | "chart-scatter";
    id?: string;
    title?: string;
    height?: number;
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
    }>;
    options?: Record<string, any>;
}
export interface MultipleChoiceQuestionWidget {
    type: "multiple-choice-question";
    id?: string;
    question: string;
    choices: string[];
    correctAnswer?: string;
    showFeedback?: boolean;
}
export interface ShortAnswerQuestionWidget {
    type: "short-answer-question";
    id?: string;
    question: string;
    placeholder?: string;
    correctAnswer?: string;
    correctAnswers?: string[];
    showFeedback?: boolean;
}
export interface QuizQuestion {
    id: string;
    type: "mcq" | "short-answer";
    question: string;
    points: number;
    choices?: string[];
    correctAnswer?: string;
    placeholder?: string;
    correctAnswers?: string[];
}
export interface QuizWidget {
    type: "quiz";
    id?: string;
    title: string;
    questions: QuizQuestion[];
    showScore?: boolean;
    showProgress?: boolean;
    passingScore?: number;
}
export type Widget = TextInputWidget | ButtonGroupWidget | SelectWidget | SelectMultiWidget | SliderWidget | FormWidget | ChartWidget | MultipleChoiceQuestionWidget | ShortAnswerQuestionWidget | QuizWidget;
export interface ParseResult {
    success: boolean;
    widget?: Widget;
    error?: string;
}
/**
 * Result from streaming-aware parsing.
 * Provides partial widget data even when input is incomplete.
 */
export interface StreamingParseResult {
    /** Whether parsing completed successfully with all required fields */
    complete: boolean;
    /** Detected widget type (available even for incomplete input) */
    detectedType?: string;
    /** Partial or complete widget data */
    widget?: Partial<Widget> & {
        type: string;
    };
    /** What's still needed to complete parsing */
    pending?: {
        /** True if we're waiting for an unclosed bracket */
        unclosedBracket?: boolean;
        /** True if we're waiting for an unclosed quote */
        unclosedQuote?: boolean;
        /** True if we're waiting for more questions in a quiz */
        awaitingQuestions?: boolean;
        /** True if we're waiting for more fields in a form */
        awaitingFields?: boolean;
        /** True if we're waiting for more CSV data in a chart */
        awaitingData?: boolean;
    };
    /** Error message if parsing failed completely */
    error?: string;
}
