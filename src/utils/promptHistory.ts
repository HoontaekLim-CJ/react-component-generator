export const MAX_HISTORY = 20;

/** 최근 프롬프트를 맨 앞에 두고, 중복은 앞으로 옮기며, 최대 MAX_HISTORY개만 남긴다. */
export function addToHistory(history: string[], prompt: string): string[] {
  return [prompt, ...history.filter((item) => item !== prompt)].slice(0, MAX_HISTORY);
}
