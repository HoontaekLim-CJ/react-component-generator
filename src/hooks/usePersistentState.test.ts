import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePersistentState } from './usePersistentState';
import { parseHistory } from '../utils/persisted';

describe('usePersistentState', () => {
  it('저장된 값을 복원 함수로 검증해 초기값으로 쓴다', () => {
    localStorage.setItem('history', JSON.stringify(['카드', 1]));
    const { result } = renderHook(() => usePersistentState('history', parseHistory));
    expect(result.current[0]).toEqual(['카드']);
  });

  it('값을 바꾸면 localStorage에 저장한다', () => {
    const { result } = renderHook(() => usePersistentState('history', parseHistory));
    act(() => result.current[1](['새 요청']));
    expect(JSON.parse(localStorage.getItem('history')!)).toEqual(['새 요청']);
  });
});
