// Known widget types for early detection
const WIDGET_TYPES = [
    'text-input', 'button-group', 'select', 'select-multi', 'slider',
    'form', 'chart-line', 'chart-bar', 'chart-pie', 'chart-scatter',
    'multiple-choice-question', 'short-answer-question', 'quiz'
];
export class DSLParser {
    parse(input) {
        try {
            const tokens = this.tokenize(input.trim());
            if (tokens.length === 0) {
                return { success: false, error: "Empty input" };
            }
            const widgetType = tokens[0];
            switch (widgetType) {
                case 'text-input':
                    return this.parseTextInput(tokens);
                case 'button-group':
                    return this.parseButtonGroup(tokens);
                case 'select':
                    return this.parseSelect(tokens);
                case 'select-multi':
                    return this.parseSelectMulti(tokens);
                case 'slider':
                    return this.parseSlider(tokens);
                case 'form':
                    return this.parseForm(tokens, input);
                case 'chart-line':
                case 'chart-bar':
                case 'chart-pie':
                case 'chart-scatter':
                    return this.parseChart(tokens, input, widgetType);
                case 'multiple-choice-question':
                    return this.parseMultipleChoiceQuestion(tokens);
                case 'short-answer-question':
                    return this.parseShortAnswerQuestion(tokens);
                case 'quiz':
                    return this.parseQuiz(tokens, input);
                default:
                    return { success: false, error: `Unknown widget type: ${widgetType}` };
            }
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }
    tokenize(input) {
        const tokens = [];
        let current = '';
        let inQuotes = false;
        let inArray = false;
        let i = 0;
        while (i < input.length) {
            const char = input[i];
            if (char === '"' && !inArray) {
                inQuotes = !inQuotes;
                i++;
                continue;
            }
            if (char === '[' && !inQuotes) {
                inArray = true;
                i++;
                continue;
            }
            if (char === ']' && !inQuotes && inArray) {
                inArray = false;
                tokens.push(`[${current.trim()}]`);
                current = '';
                i++;
                continue;
            }
            if ((char === ' ' || char === '\n') && !inQuotes && !inArray) {
                if (current.trim()) {
                    tokens.push(current.trim());
                    current = '';
                }
                i++;
                continue;
            }
            current += char;
            i++;
        }
        if (current.trim()) {
            tokens.push(current.trim());
        }
        return tokens;
    }
    /**
     * Normalize array syntax to handle common AI output variations.
     * Converts formats like ["a","b","c"] or ["a", "b", "c"] to ["a" "b" "c"]
     */
    normalizeArraySyntax(arrayToken) {
        if (!arrayToken.startsWith('[') || !arrayToken.endsWith(']')) {
            return arrayToken;
        }
        const content = arrayToken.slice(1, -1).trim();
        if (!content)
            return '[]';
        // Strategy: Parse the content handling both comma and space separators,
        // with or without quotes, then reconstruct in canonical format
        const items = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        let i = 0;
        while (i < content.length) {
            const char = content[i];
            // Handle both single and double quotes
            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
                i++;
                continue;
            }
            if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
                i++;
                continue;
            }
            // Comma or space outside quotes = separator
            if ((char === ',' || char === ' ') && !inQuotes) {
                if (current.trim()) {
                    items.push(current.trim());
                    current = '';
                }
                i++;
                continue;
            }
            current += char;
            i++;
        }
        if (current.trim()) {
            items.push(current.trim());
        }
        // Reconstruct in canonical format: [item1 item2 item3]
        // Quote items that contain spaces
        const normalized = items.map(item => {
            if (item.includes(' ')) {
                return `"${item}"`;
            }
            return item;
        }).join(' ');
        return `[${normalized}]`;
    }
    parseArray(arrayToken) {
        if (!arrayToken.startsWith('[') || !arrayToken.endsWith(']')) {
            throw new Error('Invalid array format');
        }
        // First normalize the array syntax to handle AI variations
        const normalizedToken = this.normalizeArraySyntax(arrayToken);
        const content = normalizedToken.slice(1, -1).trim();
        if (!content)
            return [];
        // Parse array content with support for quoted strings
        const items = [];
        let current = '';
        let inQuotes = false;
        let i = 0;
        while (i < content.length) {
            const char = content[i];
            if (char === '"') {
                inQuotes = !inQuotes;
                i++;
                continue;
            }
            if (char === ' ' && !inQuotes) {
                if (current.trim()) {
                    items.push(current.trim());
                    current = '';
                }
                i++;
                continue;
            }
            current += char;
            i++;
        }
        if (current.trim()) {
            items.push(current.trim());
        }
        return items;
    }
    parseTextInput(tokens) {
        if (tokens.length < 2) {
            return { success: false, error: "text-input requires at least an id" };
        }
        const widget = {
            type: "text-input",
            id: tokens[1]
        };
        if (tokens.length > 2)
            widget.label = tokens[2];
        if (tokens.length > 3)
            widget.placeholder = tokens[3];
        if (tokens.length > 4)
            widget.default = tokens[4];
        return { success: true, widget };
    }
    parseButtonGroup(tokens) {
        if (tokens.length < 3) {
            return { success: false, error: "button-group requires id and choices array" };
        }
        try {
            const choices = this.parseArray(tokens[2]);
            const widget = {
                type: "button-group",
                id: tokens[1],
                choices
            };
            if (tokens.length > 3)
                widget.default = tokens[3];
            return { success: true, widget };
        }
        catch (error) {
            return { success: false, error: `Invalid choices array: ${error}` };
        }
    }
    parseSelect(tokens) {
        if (tokens.length < 3) {
            return { success: false, error: "select requires id and choices array" };
        }
        try {
            const choices = this.parseArray(tokens[2]);
            const widget = {
                type: "select",
                id: tokens[1],
                choices
            };
            if (tokens.length > 3)
                widget.default = tokens[3];
            return { success: true, widget };
        }
        catch (error) {
            return { success: false, error: `Invalid choices array: ${error}` };
        }
    }
    parseSelectMulti(tokens) {
        if (tokens.length < 3) {
            return { success: false, error: "select-multi requires id and choices array" };
        }
        try {
            const choices = this.parseArray(tokens[2]);
            const widget = {
                type: "select-multi",
                id: tokens[1],
                choices
            };
            if (tokens.length > 3) {
                if (tokens[3].startsWith('[')) {
                    widget.default = this.parseArray(tokens[3]);
                }
                else {
                    widget.default = tokens[3];
                }
            }
            return { success: true, widget };
        }
        catch (error) {
            return { success: false, error: `Invalid format: ${error}` };
        }
    }
    parseSlider(tokens) {
        if (tokens.length < 5) {
            return { success: false, error: "slider requires id, min, max, step" };
        }
        const min = parseFloat(tokens[2]);
        const max = parseFloat(tokens[3]);
        const step = parseFloat(tokens[4]);
        if (isNaN(min) || isNaN(max) || isNaN(step)) {
            return { success: false, error: "min, max, and step must be numbers" };
        }
        const widget = {
            type: "slider",
            id: tokens[1],
            min,
            max,
            step
        };
        if (tokens.length > 5) {
            const defaultVal = parseFloat(tokens[5]);
            if (!isNaN(defaultVal)) {
                widget.default = defaultVal;
            }
        }
        return { success: true, widget };
    }
    parseForm(tokens, fullInput) {
        if (tokens.length < 2) {
            return { success: false, error: "form requires at least an id" };
        }
        const lines = fullInput.split('\n');
        const firstLine = lines[0];
        const firstTokens = this.tokenize(firstLine);
        const widget = {
            type: "form",
            id: firstTokens[1],
            fields: []
        };
        if (firstTokens.length > 2) {
            widget.submitLabel = firstTokens[2];
        }
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('  ')) {
                const fieldLine = line.slice(2);
                const fieldResult = this.parse(fieldLine);
                if (fieldResult.success && fieldResult.widget) {
                    widget.fields.push(fieldResult.widget);
                }
            }
        }
        return { success: true, widget };
    }
    parseChart(tokens, fullInput, chartType) {
        const lines = fullInput.split('\n');
        if (lines.length < 2) {
            return { success: false, error: "chart requires CSV data" };
        }
        const widget = {
            type: chartType,
            labels: [],
            datasets: []
        };
        // Check if using old token-based format or new key-value format
        // Old format has multiple tokens on the first line: "chart-line id title"
        // New format has only widget type on first line: "chart-line"
        const firstLineTokens = this.tokenize(lines[0]);
        const isOldFormat = firstLineTokens.length > 1; // Old format: chart-line id title
        let csvStartIndex = 1;
        if (isOldFormat) {
            // Old format: chart-line chart_id "Chart Title"
            widget.id = firstLineTokens[1];
            if (firstLineTokens.length > 2) {
                widget.title = firstLineTokens[2];
            }
            // CSV starts at line 1
            csvStartIndex = 1;
        }
        else {
            // New format: key-value parameters before CSV
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line)
                    continue;
                // Check if this line contains a key:value parameter
                if (line.includes(':')) {
                    const colonIndex = line.indexOf(':');
                    const key = line.substring(0, colonIndex).trim().toLowerCase();
                    if (['id', 'title', 'height'].includes(key)) {
                        const value = line.substring(colonIndex + 1).trim();
                        switch (key) {
                            case 'id':
                                widget.id = value;
                                break;
                            case 'title':
                                widget.title = value;
                                break;
                            case 'height':
                                const height = parseInt(value);
                                if (!isNaN(height)) {
                                    widget.height = height;
                                }
                                break;
                        }
                        csvStartIndex = i + 1;
                    }
                    else {
                        // This line has a colon but isn't a known parameter, treat as CSV data
                        csvStartIndex = i;
                        break;
                    }
                }
                else {
                    // This line doesn't contain a colon, start CSV parsing here
                    csvStartIndex = i;
                    break;
                }
            }
        }
        // Parse CSV data starting from csvStartIndex
        const csvLines = lines.slice(csvStartIndex);
        if (csvLines.length === 0) {
            return { success: false, error: "No CSV data provided" };
        }
        // Parse header row
        const headerLine = csvLines[0].trim();
        if (!headerLine) {
            return { success: false, error: "Empty CSV header" };
        }
        const headers = headerLine.split(',').map(h => h.trim());
        if (headers.length < 2) {
            return { success: false, error: "CSV must have at least 2 columns" };
        }
        // Initialize datasets for each data column (skip first column which is labels)
        for (let i = 1; i < headers.length; i++) {
            widget.datasets.push({
                label: headers[i],
                data: []
            });
        }
        // Parse data rows
        for (let i = 1; i < csvLines.length; i++) {
            const dataLine = csvLines[i].trim();
            if (!dataLine)
                continue; // Skip empty lines
            const values = dataLine.split(',').map(v => v.trim());
            if (values.length !== headers.length) {
                return { success: false, error: `Row ${i + 1} has ${values.length} columns, expected ${headers.length}` };
            }
            // First column is the label
            widget.labels.push(values[0]);
            // Remaining columns are data points
            for (let j = 1; j < values.length; j++) {
                const numValue = parseFloat(values[j]);
                if (isNaN(numValue)) {
                    return { success: false, error: `Invalid number "${values[j]}" in row ${i + 1}, column ${j + 1}` };
                }
                widget.datasets[j - 1].data.push(numValue);
            }
        }
        return { success: true, widget };
    }
    parseMultipleChoiceQuestion(tokens) {
        if (tokens.length < 4) {
            return { success: false, error: "multiple-choice-question requires id, question, and choices array" };
        }
        try {
            const choices = this.parseArray(tokens[3]);
            const widget = {
                type: "multiple-choice-question",
                id: tokens[1],
                question: tokens[2],
                choices
            };
            if (tokens.length > 4)
                widget.correctAnswer = tokens[4];
            if (tokens.length > 5)
                widget.showFeedback = tokens[5].toLowerCase() === 'true';
            return { success: true, widget };
        }
        catch (error) {
            return { success: false, error: `Invalid choices array: ${error}` };
        }
    }
    parseShortAnswerQuestion(tokens) {
        if (tokens.length < 3) {
            return { success: false, error: "short-answer-question requires id and question" };
        }
        const widget = {
            type: "short-answer-question",
            id: tokens[1],
            question: tokens[2]
        };
        if (tokens.length > 3)
            widget.placeholder = tokens[3];
        if (tokens.length > 4) {
            try {
                if (tokens[4].startsWith('[')) {
                    widget.correctAnswers = this.parseArray(tokens[4]);
                }
                else {
                    widget.correctAnswer = tokens[4];
                }
            }
            catch (error) {
                return { success: false, error: `Invalid answers value: ${error}` };
            }
        }
        if (tokens.length > 5)
            widget.showFeedback = tokens[5].toLowerCase() === 'true';
        return { success: true, widget };
    }
    parseQuiz(tokens, fullInput) {
        if (tokens.length < 3) {
            return { success: false, error: "quiz requires id and title" };
        }
        const lines = fullInput.split('\n');
        const firstLine = lines[0];
        const firstTokens = this.tokenize(firstLine);
        const widget = {
            type: "quiz",
            id: firstTokens[1],
            title: firstTokens[2],
            questions: [],
            showScore: true,
            showProgress: true
        };
        let i = 1;
        // Parse configuration lines (key: value format)
        while (i < lines.length) {
            const line = lines[i].trim();
            if (!line) {
                i++;
                continue;
            }
            // Check if this is a configuration line (contains colon)
            if (line.includes(':')) {
                const colonIndex = line.indexOf(':');
                const key = line.substring(0, colonIndex).trim().toLowerCase();
                const value = line.substring(colonIndex + 1).trim();
                switch (key) {
                    case 'showscore':
                        widget.showScore = value.toLowerCase() === 'true';
                        break;
                    case 'showprogress':
                        widget.showProgress = value.toLowerCase() === 'true';
                        break;
                    case 'passingscore':
                        const score = parseInt(value);
                        if (!isNaN(score)) {
                            widget.passingScore = score;
                        }
                        break;
                    default:
                        // Not a known config, might be start of questions
                        break;
                }
                i++;
            }
            else {
                // This line doesn't contain a colon, start parsing questions
                break;
            }
        }
        // Parse questions
        while (i < lines.length) {
            const line = lines[i].trim();
            if (!line) {
                i++;
                continue;
            }
            const questionTokens = this.tokenize(line);
            if (questionTokens.length === 0) {
                i++;
                continue;
            }
            const questionType = questionTokens[0];
            let question = {};
            if (questionType === 'mcq') {
                // mcq questionId "Question text" points ["choice1" "choice2"] "correctAnswer"
                if (questionTokens.length < 5) {
                    return { success: false, error: `MCQ question on line ${i + 1} requires: id, question, points, and choices` };
                }
                const points = parseInt(questionTokens[3]);
                if (isNaN(points)) {
                    return { success: false, error: `Invalid points value "${questionTokens[3]}" on line ${i + 1}` };
                }
                try {
                    const choices = this.parseArray(questionTokens[4]);
                    question = {
                        id: questionTokens[1],
                        type: "mcq",
                        question: questionTokens[2],
                        points: points,
                        choices: choices
                    };
                    if (questionTokens.length > 5) {
                        question.correctAnswer = questionTokens[5];
                    }
                }
                catch (error) {
                    return { success: false, error: `Invalid choices array on line ${i + 1}: ${error}` };
                }
            }
            else if (questionType === 'short-answer') {
                // short-answer questionId "Question text" points "placeholder" ["answer1" "answer2"]
                if (questionTokens.length < 4) {
                    return { success: false, error: `Short answer question on line ${i + 1} requires: id, question, and points` };
                }
                const points = parseInt(questionTokens[3]);
                if (isNaN(points)) {
                    return { success: false, error: `Invalid points value "${questionTokens[3]}" on line ${i + 1}` };
                }
                question = {
                    id: questionTokens[1],
                    type: "short-answer",
                    question: questionTokens[2],
                    points: points
                };
                if (questionTokens.length > 4) {
                    question.placeholder = questionTokens[4];
                }
                if (questionTokens.length > 5) {
                    try {
                        if (questionTokens[5].startsWith('[')) {
                            question.correctAnswers = this.parseArray(questionTokens[5]);
                        }
                        else {
                            question.correctAnswers = [questionTokens[5]];
                        }
                    }
                    catch (error) {
                        return { success: false, error: `Invalid answers value on line ${i + 1}: ${error}` };
                    }
                }
            }
            else {
                return { success: false, error: `Unknown question type "${questionType}" on line ${i + 1}` };
            }
            widget.questions.push(question);
            i++;
        }
        if (widget.questions.length === 0) {
            return { success: false, error: "Quiz must contain at least one question" };
        }
        return { success: true, widget };
    }
    /**
     * Streaming-aware parsing that returns partial results for incomplete input.
     * This is designed for AI streaming scenarios where content arrives incrementally.
     */
    parseStreaming(input) {
        const trimmedInput = input.trim();
        if (!trimmedInput) {
            return { complete: false, error: "Empty input" };
        }
        // Check for unclosed brackets or quotes
        const pending = this.detectPendingState(trimmedInput);
        // Try to detect widget type from first token
        const firstSpaceOrNewline = trimmedInput.search(/[\s\n]/);
        const firstToken = firstSpaceOrNewline > 0
            ? trimmedInput.substring(0, firstSpaceOrNewline)
            : trimmedInput;
        const detectedType = WIDGET_TYPES.includes(firstToken) ? firstToken : undefined;
        // If we can't even detect the type yet, return early
        if (!detectedType) {
            // Check if it might be a partial type name
            const partialMatch = WIDGET_TYPES.find(t => t.startsWith(firstToken));
            if (partialMatch && firstToken.length < partialMatch.length) {
                return {
                    complete: false,
                    pending: { unclosedQuote: false, unclosedBracket: false }
                };
            }
            return { complete: false, error: `Unknown widget type: ${firstToken}` };
        }
        // If there are pending unclosed brackets/quotes, try partial parsing
        if (pending.unclosedBracket || pending.unclosedQuote) {
            return this.parsePartialWidget(trimmedInput, detectedType, pending);
        }
        // Try full parsing
        const result = this.parse(trimmedInput);
        if (result.success && result.widget) {
            return {
                complete: true,
                detectedType,
                widget: result.widget
            };
        }
        // Full parse failed, try partial parsing
        return this.parsePartialWidget(trimmedInput, detectedType, pending);
    }
    /**
     * Detect if input has unclosed brackets or quotes
     */
    detectPendingState(input) {
        let inQuotes = false;
        let quoteChar = '';
        let bracketDepth = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            }
            else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
            }
            else if (char === '[' && !inQuotes) {
                bracketDepth++;
            }
            else if (char === ']' && !inQuotes) {
                bracketDepth--;
            }
        }
        return {
            unclosedBracket: bracketDepth > 0,
            unclosedQuote: inQuotes
        };
    }
    /**
     * Parse widget with incomplete input, filling in defaults for missing parts
     */
    parsePartialWidget(input, detectedType, pending) {
        // For quiz, try to extract what we can
        if (detectedType === 'quiz') {
            return this.parsePartialQuiz(input, pending);
        }
        // For form, try to extract what we can
        if (detectedType === 'form') {
            return this.parsePartialForm(input, pending);
        }
        // For charts, try to extract what we can
        if (detectedType.startsWith('chart-')) {
            return this.parsePartialChart(input, detectedType, pending);
        }
        // For simple widgets, try to complete arrays if needed
        if (pending.unclosedBracket) {
            const completedInput = this.autoCompleteArrays(input);
            const result = this.parse(completedInput);
            if (result.success && result.widget) {
                return {
                    complete: false,
                    detectedType,
                    widget: result.widget,
                    pending: { unclosedBracket: true }
                };
            }
        }
        // Return minimal partial widget
        const lines = input.split('\n');
        const tokens = this.tokenize(lines[0]);
        return {
            complete: false,
            detectedType,
            widget: {
                type: detectedType,
                id: tokens[1] || 'pending'
            },
            pending
        };
    }
    /**
     * Auto-complete unclosed arrays by adding closing bracket
     */
    autoCompleteArrays(input) {
        let result = input;
        let bracketDepth = 0;
        let inQuotes = false;
        let quoteChar = '';
        for (const char of input) {
            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            }
            else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
            }
            else if (char === '[' && !inQuotes) {
                bracketDepth++;
            }
            else if (char === ']' && !inQuotes) {
                bracketDepth--;
            }
        }
        // Close unclosed quotes first
        if (inQuotes) {
            result += quoteChar;
        }
        // Close unclosed brackets
        while (bracketDepth > 0) {
            result += ']';
            bracketDepth--;
        }
        return result;
    }
    /**
     * Parse partial quiz, extracting whatever questions are complete
     */
    parsePartialQuiz(input, pending) {
        const lines = input.split('\n');
        const firstTokens = this.tokenize(lines[0]);
        const widget = {
            type: 'quiz',
            id: firstTokens[1] || 'pending',
            title: firstTokens[2] || 'Loading...',
            questions: [],
            showScore: true,
            showProgress: true,
            _streaming: true // Mark as streaming for UI
        };
        let i = 1;
        // Parse config lines
        while (i < lines.length) {
            const line = lines[i].trim();
            if (!line) {
                i++;
                continue;
            }
            if (line.includes(':')) {
                const colonIndex = line.indexOf(':');
                const key = line.substring(0, colonIndex).trim().toLowerCase();
                const value = line.substring(colonIndex + 1).trim();
                switch (key) {
                    case 'showscore':
                        widget.showScore = value.toLowerCase() === 'true';
                        break;
                    case 'showprogress':
                        widget.showProgress = value.toLowerCase() === 'true';
                        break;
                    case 'passingscore':
                        const score = parseInt(value);
                        if (!isNaN(score))
                            widget.passingScore = score;
                        break;
                }
                i++;
            }
            else {
                break;
            }
        }
        // Parse questions, handling incomplete ones gracefully
        while (i < lines.length) {
            const line = lines[i].trim();
            if (!line) {
                i++;
                continue;
            }
            const question = this.parsePartialQuestion(line, i);
            if (question) {
                widget.questions.push(question);
            }
            i++;
        }
        return {
            complete: false,
            detectedType: 'quiz',
            widget,
            pending: {
                ...pending,
                awaitingQuestions: widget.questions.length === 0
            }
        };
    }
    /**
     * Parse a single question line, handling incomplete input
     */
    parsePartialQuestion(line, lineNum) {
        // Auto-complete the line if needed
        const completedLine = this.autoCompleteArrays(line);
        try {
            const tokens = this.tokenize(completedLine);
            if (tokens.length === 0)
                return null;
            const questionType = tokens[0];
            if (questionType === 'mcq') {
                return {
                    id: tokens[1] || `q${lineNum}`,
                    type: 'mcq',
                    question: tokens[2] || 'Loading question...',
                    points: parseInt(tokens[3]) || 0,
                    choices: tokens[4] ? this.parseArray(tokens[4]) : [],
                    correctAnswer: tokens[5],
                    _streaming: tokens.length < 5 // Mark incomplete
                };
            }
            if (questionType === 'short-answer') {
                const question = {
                    id: tokens[1] || `q${lineNum}`,
                    type: 'short-answer',
                    question: tokens[2] || 'Loading question...',
                    points: parseInt(tokens[3]) || 0,
                    _streaming: tokens.length < 4
                };
                if (tokens[4])
                    question.placeholder = tokens[4];
                if (tokens[5]) {
                    try {
                        question.correctAnswers = tokens[5].startsWith('[')
                            ? this.parseArray(tokens[5])
                            : [tokens[5]];
                    }
                    catch { /* ignore */ }
                }
                return question;
            }
        }
        catch {
            // Return partial question on parse error
            const partialTokens = line.split(/\s+/);
            if (partialTokens[0] === 'mcq' || partialTokens[0] === 'short-answer') {
                return {
                    id: partialTokens[1] || `q${lineNum}`,
                    type: partialTokens[0] === 'mcq' ? 'mcq' : 'short-answer',
                    question: 'Loading...',
                    points: 0,
                    choices: partialTokens[0] === 'mcq' ? [] : undefined,
                    _streaming: true
                };
            }
        }
        return null;
    }
    /**
     * Parse partial form
     */
    parsePartialForm(input, pending) {
        const lines = input.split('\n');
        const firstTokens = this.tokenize(lines[0]);
        const widget = {
            type: 'form',
            id: firstTokens[1] || 'pending',
            submitLabel: firstTokens[2],
            fields: [],
            _streaming: true
        };
        // Parse indented fields
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('  ')) {
                const fieldLine = this.autoCompleteArrays(line.slice(2));
                try {
                    const fieldResult = this.parse(fieldLine);
                    if (fieldResult.success && fieldResult.widget) {
                        widget.fields.push(fieldResult.widget);
                    }
                }
                catch { /* skip incomplete fields */ }
            }
        }
        return {
            complete: false,
            detectedType: 'form',
            widget,
            pending: {
                ...pending,
                awaitingFields: true
            }
        };
    }
    /**
     * Parse partial chart
     */
    parsePartialChart(input, detectedType, pending) {
        const lines = input.split('\n');
        const firstTokens = this.tokenize(lines[0]);
        const widget = {
            type: detectedType,
            id: firstTokens[1] || 'pending',
            title: firstTokens[2],
            labels: [],
            datasets: [],
            _streaming: true
        };
        // Try to parse any complete CSV rows
        let csvStarted = false;
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line)
                continue;
            if (line.includes(':') && !csvStarted) {
                // Config line
                const [key, value] = line.split(':').map(s => s.trim());
                if (key.toLowerCase() === 'title')
                    widget.title = value;
                if (key.toLowerCase() === 'id')
                    widget.id = value;
            }
            else if (line.includes(',')) {
                csvStarted = true;
                // CSV data - just mark that we have data coming
            }
        }
        return {
            complete: false,
            detectedType,
            widget,
            pending: {
                ...pending,
                awaitingData: true
            }
        };
    }
}
export function parseDSL(input) {
    const parser = new DSLParser();
    return parser.parse(input);
}
export function parseDSLStreaming(input) {
    const parser = new DSLParser();
    return parser.parseStreaming(input);
}
