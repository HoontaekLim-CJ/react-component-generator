import { describe, it, expect } from 'vitest';
import { validatePrompt, PROMPT_MAX_LENGTH } from './validatePrompt';

const chars = (n: number) => '가'.repeat(n);

describe('validatePrompt', () => {
  it('500자 이하 프롬프트는 유효하다', () => {
    expect(validatePrompt(chars(PROMPT_MAX_LENGTH)).valid).toBe(true);
  });

  it('500자를 넘으면 tooLong으로 유효하지 않다', () => {
    expect(validatePrompt(chars(PROMPT_MAX_LENGTH + 1))).toEqual({
      valid: false,
      error: 'tooLong',
      length: 501,
    });
  });

  it('앞뒤 공백은 길이에 포함하지 않는다', () => {
    expect(validatePrompt(`  ${chars(PROMPT_MAX_LENGTH)}\n `)).toEqual({
      valid: true,
      error: null,
      length: 500,
    });
  });

  it('공백만 있으면 empty로 유효하지 않다', () => {
    expect(validatePrompt('  \n ')).toEqual({ valid: false, error: 'empty', length: 0 });
  });

  it('이모지는 한 글자로 센다', () => {
    expect(validatePrompt('😀'.repeat(PROMPT_MAX_LENGTH))).toEqual({
      valid: true,
      error: null,
      length: 500,
    });
  });
});
