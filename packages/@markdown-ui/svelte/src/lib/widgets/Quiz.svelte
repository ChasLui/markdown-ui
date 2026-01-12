<script lang="ts">
  interface QuizQuestion {
    id: string;
    type: 'mcq' | 'short-answer';
    question: string;
    points: number;
    choices?: string[];
    correctAnswer?: string;
    placeholder?: string;
    correctAnswers?: string[];
    _streaming?: boolean; // Indicates question is still being streamed
  }

  interface QuizAnswer {
    answer: string;
    isCorrect: boolean;
    points: number;
    submitted: boolean;
  }

  interface QuizState {
    answers: Record<string, QuizAnswer>;
    totalScore: number;
    maxScore: number;
    questionsAnswered: number;
    isCompleted: boolean;
  }

  interface Props {
    title: string;
    questions: QuizQuestion[];
    showScore?: boolean;
    showProgress?: boolean;
    passingScore?: number;
    onchange: (value: QuizState) => void;
    _streaming?: boolean; // Indicates quiz is still being streamed
    _pending?: { awaitingQuestions?: boolean };
  }

  let { title, questions = [], showScore = true, showProgress = true, passingScore = undefined, onchange, _streaming = false, _pending }: Props = $props();

  // Filter out incomplete questions that don't have enough data to render
  const validQuestions = $derived(questions.filter(q => q.id && q.question));

  let answers = $state<Record<string, QuizAnswer>>({});
  let draftInputs = $state<Record<string, string>>({});

  // Use validQuestions for calculations to handle streaming gracefully
  const maxScore = $derived(validQuestions.reduce((s, q) => s + q.points, 0));
  const totalScore = $derived(Object.values(answers).reduce((s, a) => s + a.points, 0));
  const questionsAnswered = $derived(Object.keys(answers).length);
  // Only mark as completed when not streaming and all questions answered
  const isCompleted = $derived(!_streaming && validQuestions.length > 0 && questionsAnswered === validQuestions.length);
  const progressPercentage = $derived(validQuestions.length > 0 ? Math.round((questionsAnswered / validQuestions.length) * 100) : 0);
  const scorePercentage = $derived(maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0);
  const isPassing = $derived(passingScore !== undefined ? scorePercentage >= (passingScore as number) : false);

  // Check if we're awaiting questions
  const awaitingQuestions = $derived(_streaming && validQuestions.length === 0);

  function emitChange() {
    onchange({
      answers: { ...answers },
      totalScore,
      maxScore,
      questionsAnswered,
      isCompleted
    });
  }

  function onAnswer(questionId: string, userAnswer: string) {
    const q = validQuestions.find(q => q.id === questionId);
    if (!q || answers[questionId]?.submitted) return;

    let correct = false;
    if (q.type === 'mcq') {
      correct = q.correctAnswer === userAnswer;
    } else if (q.type === 'short-answer') {
      if (q.correctAnswers) {
        correct = q.correctAnswers.some(a => a.toLowerCase() === userAnswer.toLowerCase());
      }
    }

    answers = { ...answers, [questionId]: { answer: userAnswer, isCorrect: correct, points: correct ? q.points : 0, submitted: true } };
    if (draftInputs[questionId]) {
      const { [questionId]: _, ...rest } = draftInputs; // remove draft
      draftInputs = rest;
    }
    emitChange();
  }

  function submitShort(q: QuizQuestion) {
    const val = (draftInputs[q.id] || '').trim();
    if (!val) return;
    onAnswer(q.id, val);
  }

  function mcqChoiceClass(q: QuizQuestion, choice: string) {
    const ans = answers[q.id];
    let cls = 'quiz-choice';
    if (ans?.submitted && typeof q.correctAnswer !== 'undefined') {
      if (choice === q.correctAnswer) cls += ' quiz-choice-correct';
      else if (choice === ans.answer && choice !== q.correctAnswer) cls += ' quiz-choice-incorrect';
    }
    return cls;
  }
</script>

<div class="widget-quiz" class:streaming={_streaming}>
  <div class="quiz-header">
    <h2 class="quiz-title">{title}{#if _streaming}<span class="streaming-indicator">...</span>{/if}</h2>
    <div class="quiz-stats">
      {#if showProgress}
        <div class="quiz-progress">
          <span class="quiz-progress-text">
            Progress: {questionsAnswered}/{_streaming ? `${validQuestions.length}+` : validQuestions.length} questions
          </span>
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style={`width: ${progressPercentage}%`}></div>
          </div>
        </div>
      {/if}
      {#if showScore}
        <div class="quiz-score">
          <span class="quiz-score-text">Score: {totalScore}/{_streaming ? `${maxScore}+` : maxScore} ({scorePercentage}%)</span>
        </div>
      {/if}
    </div>
  </div>

  <div class="quiz-questions">
    {#if awaitingQuestions}
      <!-- Skeleton loading state while waiting for questions -->
      <div class="quiz-question quiz-question-skeleton">
        <div class="quiz-question-header">
          <h3 class="quiz-question-text skeleton-text">Loading question...</h3>
          <span class="quiz-question-points skeleton-text">-- pts</span>
        </div>
        <div class="quiz-choices">
          <div class="quiz-choice skeleton-choice"></div>
          <div class="quiz-choice skeleton-choice"></div>
          <div class="quiz-choice skeleton-choice"></div>
        </div>
      </div>
    {/if}
    {#each validQuestions as q (q.id)}
      {#if q.type === 'mcq'}
        <div class="quiz-question" class:question-streaming={q._streaming}>
          <div class="quiz-question-header">
            <h3 class="quiz-question-text">{q.question}{#if q._streaming}<span class="streaming-indicator">...</span>{/if}</h3>
            <span class="quiz-question-points">{q.points} pts</span>
          </div>
          <div class="quiz-choices">
            {#if q.choices && q.choices.length > 0}
              {#each q.choices as choice}
                <button class={mcqChoiceClass(q, choice)} onclick={() => onAnswer(q.id, choice)} disabled={answers[q.id]?.submitted || q._streaming}>{choice}</button>
              {/each}
              {#if q._streaming}
                <div class="quiz-choice skeleton-choice">...</div>
              {/if}
            {:else if q._streaming}
              <div class="quiz-choice skeleton-choice"></div>
              <div class="quiz-choice skeleton-choice"></div>
            {/if}
          </div>
          {#if answers[q.id]?.submitted}
            {#if typeof q.correctAnswer !== 'undefined'}
              <div class={`quiz-feedback ${answers[q.id].isCorrect ? 'correct' : 'incorrect'}`}>
                {answers[q.id].isCorrect ? `✓ Correct! (+${answers[q.id].points} pts)` : `✗ Incorrect. The correct answer is: ${q.correctAnswer}`}
              </div>
            {:else}
              <div class="quiz-feedback">You selected: {answers[q.id].answer}</div>
            {/if}
          {/if}
        </div>
      {:else}
        <div class="quiz-question">
          <div class="quiz-question-header">
            <h3 class="quiz-question-text">{q.question}</h3>
            <span class="quiz-question-points">{q.points} pts</span>
          </div>
          <div class="quiz-input-container">
            <input
              type="text"
              value={answers[q.id]?.submitted ? answers[q.id].answer : (draftInputs[q.id] || '')}
              oninput={(e) => { if (!answers[q.id]?.submitted) draftInputs[q.id] = (e.target as HTMLInputElement).value; }}
              onkeydown={(e) => { if (e.key === 'Enter' && !answers[q.id]?.submitted) submitShort(q); }}
              placeholder={q.placeholder || 'Type your answer here...'}
              disabled={answers[q.id]?.submitted}
              class={`quiz-input ${answers[q.id]?.submitted ? ((q.correctAnswers && q.correctAnswers.length > 0) ? (answers[q.id].isCorrect ? 'quiz-input-correct' : 'quiz-input-incorrect') : '') : ''}`}
            />
            {#if !answers[q.id]?.submitted}
              <button class="quiz-submit" onclick={() => submitShort(q)} disabled={!((draftInputs[q.id] || '').trim())}>Submit</button>
            {/if}
          </div>
          {#if answers[q.id]?.submitted}
            {#if (q.correctAnswers && q.correctAnswers.length > 0)}
              <div class={`quiz-feedback ${answers[q.id].isCorrect ? 'correct' : 'incorrect'}`}>
                {answers[q.id].isCorrect ? `✓ Correct! (+${answers[q.id].points} pts)` : `✗ Incorrect. Accepted answers: ${(q.correctAnswers || []).join(', ') || 'N/A'}`}
              </div>
            {:else}
              <div class="quiz-feedback">Your answer: {answers[q.id].answer}</div>
            {/if}
          {/if}
        </div>
      {/if}
    {/each}
  </div>

  {#if isCompleted}
    <div class="quiz-summary">
      <h3>Quiz Complete!</h3>
      <div class="quiz-final-score">Final Score: {totalScore}/{maxScore} points ({scorePercentage}%)</div>
      {#if passingScore !== undefined}
        <div class={`quiz-result ${isPassing ? 'passed' : 'failed'}`}>
          {isPassing ? '🎉 Passed!' : '❌ Failed'} (Passing: {passingScore}%)
        </div>
      {/if}
    </div>
  {/if}

  {#if _streaming && validQuestions.length > 0}
    <!-- Show indicator that more questions may be loading -->
    <div class="quiz-streaming-footer">
      <span class="streaming-dots">Loading more content</span>
    </div>
  {/if}
</div>

<style>
  .streaming-indicator {
    animation: pulse 1.5s ease-in-out infinite;
    opacity: 0.6;
  }

  .streaming-dots::after {
    content: '...';
    animation: dots 1.5s steps(4, end) infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  @keyframes dots {
    0%, 20% { content: ''; }
    40% { content: '.'; }
    60% { content: '..'; }
    80%, 100% { content: '...'; }
  }

  .quiz-question-skeleton {
    opacity: 0.6;
  }

  .skeleton-text {
    background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
  }

  .skeleton-choice {
    background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    height: 2.5rem;
    border-radius: 6px;
    pointer-events: none;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .question-streaming {
    border-left: 3px solid #3b82f6;
  }

  .quiz-streaming-footer {
    text-align: center;
    padding: 0.75rem;
    color: #6b7280;
    font-size: 0.875rem;
  }
</style>
