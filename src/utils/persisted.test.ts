import { describe, it, expect } from 'vitest';
import { parseComponents, parseHistory, parseProvider } from './persisted';

describe('parseProvider', () => {
  it('저장된 값이 지원하는 Provider면 그대로 반환한다', () => {
    expect(parseProvider('anthropic')).toBe('anthropic');
  });

  it('지원하지 않는 값이면 기본 Provider인 google을 반환한다', () => {
    expect(parseProvider('openai')).toBe('google');
    expect(parseProvider(null)).toBe('google');
  });
});

describe('parseComponents', () => {
  it('문자열로 저장된 createdAt을 Date로 복원한다', () => {
    const raw = [{ id: 'a', prompt: '카드', code: 'render(<A />)', createdAt: '2026-10-01T05:00:00.000Z' }];
    const [restored] = parseComponents(raw);
    expect(restored.createdAt).toBeInstanceOf(Date);
    expect(restored.createdAt.toISOString()).toBe('2026-10-01T05:00:00.000Z');
  });

  it('필드가 빠졌거나 형식이 틀린 항목은 버리고 정상 항목만 남긴다', () => {
    const valid = { id: 'ok', prompt: 'p', code: 'c', createdAt: '2026-10-01T05:00:00.000Z' };
    const raw = [
      valid,
      { id: 'no-code', prompt: 'p', createdAt: '2026-10-01T05:00:00.000Z' },
      { id: 'bad-date', prompt: 'p', code: 'c', createdAt: 'not a date' },
      { id: 3, prompt: 'p', code: 'c', createdAt: '2026-10-01T05:00:00.000Z' },
      null,
    ];
    expect(parseComponents(raw).map((c) => c.id)).toEqual(['ok']);
  });

  it('배열이 아니면 빈 목록을 반환한다', () => {
    expect(parseComponents({ id: 'a' })).toEqual([]);
    expect(parseComponents('oops')).toEqual([]);
  });
});

describe('parseHistory', () => {
  it('문자열 항목만 남긴다', () => {
    expect(parseHistory(['카드', 3, null, '표'])).toEqual(['카드', '표']);
  });

  it('배열이 아니면 빈 목록을 반환한다', () => {
    expect(parseHistory('카드')).toEqual([]);
  });
});
