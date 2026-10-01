export const PROMPT_MAX_LENGTH = 500;

export interface PromptValidation {
  valid: boolean;
  error: 'empty' | 'tooLong' | null;
  length: number;
}

/**
 * 전송될 프롬프트(앞뒤 공백 제거 후)의 길이를 검증한다.
 * 길이는 코드 포인트 단위로 세어 이모지를 한 글자로 취급한다.
 */
export function validatePrompt(prompt: string): PromptValidation {
  const length = [...prompt.trim()].length;
  if (length === 0) {
    return { valid: false, error: 'empty', length };
  }
  if (length > PROMPT_MAX_LENGTH) {
    return { valid: false, error: 'tooLong', length };
  }
  return { valid: true, error: null, length };
}
