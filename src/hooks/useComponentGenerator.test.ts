import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';
import { STORAGE_KEYS } from '../utils/persisted';

describe('useComponentGenerator', () => {
  it('새로고침 전에 저장된 컴포넌트 목록을 복원한다', () => {
    localStorage.setItem(
      STORAGE_KEYS.components,
      JSON.stringify([{ id: 'a', prompt: '카드', code: 'render(<A />)', createdAt: '2026-10-01T05:00:00.000Z' }]),
    );
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.components.map((c) => c.prompt)).toEqual(['카드']);
  });
});
