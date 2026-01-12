import { describe, it, expect } from 'vitest';
import { parseDSL, parseDSLStreaming } from './parser.js';

describe('DSL Parser', () => {
  describe('text-input', () => {
    it('parses minimal text-input', () => {
      const result = parseDSL('text-input myId');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'text-input',
        id: 'myId'
      });
    });

    it('parses text-input with all parameters', () => {
      const result = parseDSL('text-input username "Username" "Enter username" "defaultValue"');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'text-input',
        id: 'username',
        label: 'Username',
        placeholder: 'Enter username',
        default: 'defaultValue'
      });
    });

    it('handles quoted strings with spaces', () => {
      const result = parseDSL('text-input id "Long label text" "Placeholder with spaces"');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'text-input',
        id: 'id',
        label: 'Long label text',
        placeholder: 'Placeholder with spaces'
      });
    });
  });

  describe('button-group', () => {
    it('parses button-group with choices', () => {
      const result = parseDSL('button-group env [dev staging prod]');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'button-group',
        id: 'env',
        choices: ['dev', 'staging', 'prod']
      });
    });

    it('parses button-group with default', () => {
      const result = parseDSL('button-group env [dev staging prod] dev');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'button-group',
        id: 'env',
        choices: ['dev', 'staging', 'prod'],
        default: 'dev'
      });
    });

    it('handles single choice', () => {
      const result = parseDSL('button-group confirm [yes]');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'button-group',
        id: 'confirm',
        choices: ['yes']
      });
    });

    it('requires choices array', () => {
      const result = parseDSL('button-group env');
      expect(result.success).toBe(false);
      expect(result.error).toContain('requires id and choices array');
    });
  });

  describe('select', () => {
    it('parses select with choices', () => {
      const result = parseDSL('select region [us-east-1 us-west-2 eu-west-1]');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'select',
        id: 'region',
        choices: ['us-east-1', 'us-west-2', 'eu-west-1']
      });
    });

    it('parses select with default', () => {
      const result = parseDSL('select region [us-east-1 us-west-2] us-east-1');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'select',
        id: 'region',
        choices: ['us-east-1', 'us-west-2'],
        default: 'us-east-1'
      });
    });
  });

  describe('select-multi', () => {
    it('parses select-multi with choices', () => {
      const result = parseDSL('select-multi services [redis postgres nginx]');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'select-multi',
        id: 'services',
        choices: ['redis', 'postgres', 'nginx']
      });
    });

    it('parses select-multi with single default', () => {
      const result = parseDSL('select-multi services [redis postgres nginx] redis');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'select-multi',
        id: 'services',
        choices: ['redis', 'postgres', 'nginx'],
        default: 'redis'
      });
    });

    it('parses select-multi with array default', () => {
      const result = parseDSL('select-multi services [redis postgres nginx] [redis postgres]');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'select-multi',
        id: 'services',
        choices: ['redis', 'postgres', 'nginx'],
        default: ['redis', 'postgres']
      });
    });
  });

  describe('slider', () => {
    it('parses slider with min, max, step', () => {
      const result = parseDSL('slider cpu 1 32 1');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'slider',
        id: 'cpu',
        min: 1,
        max: 32,
        step: 1
      });
    });

    it('parses slider with default', () => {
      const result = parseDSL('slider cpu 1 32 1 4');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'slider',
        id: 'cpu',
        min: 1,
        max: 32,
        step: 1,
        default: 4
      });
    });

    it('handles decimal values', () => {
      const result = parseDSL('slider temp 0.0 100.0 0.1 22.5');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'slider',
        id: 'temp',
        min: 0.0,
        max: 100.0,
        step: 0.1,
        default: 22.5
      });
    });

    it('requires numeric parameters', () => {
      const result = parseDSL('slider cpu one two three');
      expect(result.success).toBe(false);
      expect(result.error).toContain('must be numbers');
    });

    it('requires all numeric parameters', () => {
      const result = parseDSL('slider cpu 1 2');
      expect(result.success).toBe(false);
      expect(result.error).toContain('requires id, min, max, step');
    });
  });

  describe('form', () => {
    it('parses form with id only', () => {
      const result = parseDSL('form config');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'form',
        id: 'config',
        fields: []
      });
    });

    it('parses form with submit label', () => {
      const result = parseDSL('form config "Deploy Now"');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'form',
        id: 'config',
        submitLabel: 'Deploy Now',
        fields: []
      });
    });

    it('parses form with indented fields', () => {
      const input = `form server-config "Deploy"
  select env [dev prod]
  slider replicas 1 10 1 3
  text-input name "Server Name"`;

      const result = parseDSL(input);
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'form',
        id: 'server-config',
        submitLabel: 'Deploy',
        fields: [
          {
            type: 'select',
            id: 'env',
            choices: ['dev', 'prod']
          },
          {
            type: 'slider',
            id: 'replicas',
            min: 1,
            max: 10,
            step: 1,
            default: 3
          },
          {
            type: 'text-input',
            id: 'name',
            label: 'Server Name'
          }
        ]
      });
    });

    it('ignores non-indented lines in form', () => {
      const input = `form config
  text-input field1
not indented
  select field2 [a b]`;

      const result = parseDSL(input);
      expect(result.success).toBe(true);
      expect(result.widget?.type).toBe('form');
      expect((result.widget as any).fields).toHaveLength(2);
    });
  });

  describe('error cases', () => {
    it('handles empty input', () => {
      const result = parseDSL('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Empty input');
    });

    it('handles unknown widget type', () => {
      const result = parseDSL('unknown-widget id');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown widget type');
    });

    it('handles malformed arrays', () => {
      const result = parseDSL('select id [unclosed');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });
  });

  describe('tokenization edge cases', () => {
    it('handles Chinese characters in button groups', () => {
      const result = parseDSL('button-group language [英文 中文 日本語]');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'button-group',
        id: 'language',
        choices: ['英文', '中文', '日本語']
      });
    });

    it('handles multiple spaces', () => {
      const result = parseDSL('text-input    id     "label"');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'text-input',
        id: 'id',
        label: 'label'
      });
    });

    it('handles quotes in arrays', () => {
      const result = parseDSL('select id [choice1 choice2]');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'select',
        id: 'id',
        choices: ['choice1', 'choice2']
      });
    });

    it('handles empty arrays', () => {
      const result = parseDSL('select id []');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'select',
        id: 'id',
        choices: []
      });
    });

    it('handles quoted choices with spaces in arrays', () => {
      const result = parseDSL('select location [Chicago "New York" "San Francisco"]');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'select',
        id: 'location',
        choices: ['Chicago', 'New York', 'San Francisco']
      });
    });

    it('handles mixed quoted and unquoted choices', () => {
      const result = parseDSL('button-group options [simple "Complex Option" another]');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'button-group',
        id: 'options',
        choices: ['simple', 'Complex Option', 'another']
      });
    });

    it('handles quoted defaults with spaces', () => {
      const result = parseDSL('select location [Chicago "New York"] "New York"');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'select',
        id: 'location',
        choices: ['Chicago', 'New York'],
        default: 'New York'
      });
    });
  });

  describe('AI output compatibility - array syntax variations', () => {
    it('handles comma-separated arrays ["a","b","c"]', () => {
      const result = parseDSL('button-group env ["dev","staging","prod"]');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'button-group',
        id: 'env',
        choices: ['dev', 'staging', 'prod']
      });
    });

    it('handles comma-space separated arrays ["a", "b", "c"]', () => {
      const result = parseDSL('select region ["us-east", "us-west", "eu-west"]');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'select',
        id: 'region',
        choices: ['us-east', 'us-west', 'eu-west']
      });
    });

    it('handles unquoted comma-separated arrays [a,b,c]', () => {
      const result = parseDSL('button-group size [small,medium,large]');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'button-group',
        id: 'size',
        choices: ['small', 'medium', 'large']
      });
    });

    it('handles single quotes [\'a\',\'b\',\'c\']', () => {
      const result = parseDSL("button-group lang ['en','zh','ja']");
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'button-group',
        id: 'lang',
        choices: ['en', 'zh', 'ja']
      });
    });

    it('handles mixed quoted and unquoted with commas', () => {
      const result = parseDSL('select loc [home, "New York", office]');
      expect(result.success).toBe(true);
      expect(result.widget).toEqual({
        type: 'select',
        id: 'loc',
        choices: ['home', 'New York', 'office']
      });
    });

    it('handles arrays in quiz mcq questions with comma syntax', () => {
      const input = `quiz test "Test Quiz"
mcq q1 "Question?" 10 ["A","B","C"] A`;
      const result = parseDSL(input);
      expect(result.success).toBe(true);
      expect((result.widget as any).questions[0].choices).toEqual(['A', 'B', 'C']);
    });
  });
});

describe('Streaming Parser', () => {
  describe('widget type detection', () => {
    it('detects quiz type from partial input', () => {
      const result = parseDSLStreaming('quiz');
      expect(result.complete).toBe(false);
      expect(result.detectedType).toBe('quiz');
    });

    it('detects button-group type', () => {
      const result = parseDSLStreaming('button-group env');
      expect(result.detectedType).toBe('button-group');
    });

    it('returns error for unknown type', () => {
      const result = parseDSLStreaming('unknown-widget id');
      expect(result.complete).toBe(false);
      expect(result.error).toContain('Unknown widget type');
    });
  });

  describe('unclosed bracket handling', () => {
    it('detects unclosed bracket in button-group', () => {
      const result = parseDSLStreaming('button-group env [dev staging');
      expect(result.complete).toBe(false);
      expect(result.pending?.unclosedBracket).toBe(true);
      expect(result.detectedType).toBe('button-group');
    });

    it('auto-completes array and returns partial widget', () => {
      const result = parseDSLStreaming('button-group env [dev staging prod');
      expect(result.complete).toBe(false);
      expect(result.widget?.type).toBe('button-group');
      // Should have parsed the partial choices
      expect((result.widget as any).choices).toEqual(['dev', 'staging', 'prod']);
    });

    it('detects unclosed quote', () => {
      const result = parseDSLStreaming('text-input id "Label with');
      expect(result.complete).toBe(false);
      expect(result.pending?.unclosedQuote).toBe(true);
    });
  });

  describe('partial quiz parsing', () => {
    it('parses quiz header only', () => {
      const result = parseDSLStreaming('quiz math "Math Quiz"');
      expect(result.complete).toBe(false);
      expect(result.detectedType).toBe('quiz');
      expect(result.widget?.type).toBe('quiz');
      expect((result.widget as any).title).toBe('Math Quiz');
      expect(result.pending?.awaitingQuestions).toBe(true);
    });

    it('parses quiz with config but no questions', () => {
      const input = `quiz math "Math Quiz"
showScore: true
showProgress: false`;
      const result = parseDSLStreaming(input);
      expect(result.complete).toBe(false);
      expect((result.widget as any).showScore).toBe(true);
      expect((result.widget as any).showProgress).toBe(false);
      expect(result.pending?.awaitingQuestions).toBe(true);
    });

    it('parses quiz with partial mcq question', () => {
      const input = `quiz math "Math Quiz"
mcq q1 "What is 2+2?" 10 [3 4`;
      const result = parseDSLStreaming(input);
      expect(result.complete).toBe(false);
      expect(result.pending?.unclosedBracket).toBe(true);
      const questions = (result.widget as any).questions;
      expect(questions.length).toBe(1);
      expect(questions[0].question).toBe('What is 2+2?');
      expect(questions[0].choices).toEqual(['3', '4']);
    });

    it('parses quiz with complete question', () => {
      const input = `quiz math "Math Quiz"
mcq q1 "What is 2+2?" 10 [3 4 5] 4`;
      const result = parseDSLStreaming(input);
      // Still incomplete because normal parser requires at least one question to succeed
      // but streaming parser provides partial data
      expect(result.widget?.type).toBe('quiz');
      const questions = (result.widget as any).questions;
      expect(questions.length).toBe(1);
      expect(questions[0].correctAnswer).toBe('4');
    });

    it('parses partial short-answer question', () => {
      const input = `quiz math "Math Quiz"
short-answer q1 "What is the capital of France?" 10`;
      const result = parseDSLStreaming(input);
      const questions = (result.widget as any).questions;
      expect(questions.length).toBe(1);
      expect(questions[0].type).toBe('short-answer');
      expect(questions[0].question).toBe('What is the capital of France?');
    });
  });

  describe('complete parsing', () => {
    it('returns complete=true for valid complete input', () => {
      const result = parseDSLStreaming('text-input myId "Label" "Placeholder"');
      expect(result.complete).toBe(true);
      expect(result.widget?.type).toBe('text-input');
    });

    it('returns complete=true for valid button-group', () => {
      const result = parseDSLStreaming('button-group env [dev staging prod]');
      expect(result.complete).toBe(true);
      expect((result.widget as any).choices).toEqual(['dev', 'staging', 'prod']);
    });
  });

  describe('streaming simulation', () => {
    it('handles progressive quiz input', () => {
      const stages = [
        'quiz',
        'quiz math',
        'quiz math "Math',
        'quiz math "Math Quiz"',
        'quiz math "Math Quiz"\nmcq',
        'quiz math "Math Quiz"\nmcq q1',
        'quiz math "Math Quiz"\nmcq q1 "Question?"',
        'quiz math "Math Quiz"\nmcq q1 "Question?" 10',
        'quiz math "Math Quiz"\nmcq q1 "Question?" 10 [A',
        'quiz math "Math Quiz"\nmcq q1 "Question?" 10 [A B',
        'quiz math "Math Quiz"\nmcq q1 "Question?" 10 [A B C]',
        'quiz math "Math Quiz"\nmcq q1 "Question?" 10 [A B C] A',
      ];

      for (const input of stages) {
        const result = parseDSLStreaming(input);
        // Should never throw
        expect(result.detectedType).toBe('quiz');
      }

      // Final stage should have complete question data
      const final = parseDSLStreaming(stages[stages.length - 1]);
      expect((final.widget as any).questions[0].choices).toEqual(['A', 'B', 'C']);
    });
  });
});