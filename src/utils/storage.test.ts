import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadJSON, saveJSON } from './storage';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('loadJSON', () => {
  it('저장된 값이 없으면 기본값을 반환한다', () => {
    expect(loadJSON('missing', ['기본'])).toEqual(['기본']);
  });

  it('저장된 JSON 값을 읽어 반환한다', () => {
    localStorage.setItem('k', JSON.stringify({ a: 1 }));
    expect(loadJSON('k', null)).toEqual({ a: 1 });
  });

  it('저장된 값이 깨진 JSON이면 기본값을 반환한다', () => {
    localStorage.setItem('k', '{not json');
    expect(loadJSON('k', 'fallback')).toBe('fallback');
  });

  it('저장소 접근이 막혀 예외가 나면 기본값을 반환한다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(loadJSON('k', 42)).toBe(42);
  });
});

describe('saveJSON', () => {
  it('값을 JSON 문자열로 저장한다', () => {
    saveJSON('k', { a: [1, 2] });
    expect(localStorage.getItem('k')).toBe('{"a":[1,2]}');
  });

  it('저장 공간이 가득 차 예외가 나도 던지지 않는다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(() => saveJSON('k', 'big')).not.toThrow();
  });
});
