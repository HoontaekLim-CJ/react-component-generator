import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { STORAGE_KEYS } from './utils/persisted';

beforeEach(() => {
  // jsdom에는 ResizeObserver가 없다. 미리보기 치수선이 쓰므로 빈 구현으로 대체한다.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      url === '/api/config'
        ? Response.json({ envKeys: { anthropic: true, google: true } })
        : Response.json({ code: 'render(<div>ok</div>);' }),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App 상태 유지', () => {
  it('새로고침 전에 선택한 Provider를 복원한다', () => {
    localStorage.setItem(STORAGE_KEYS.provider, JSON.stringify('anthropic'));
    render(<App />);
    expect(screen.getByRole('combobox', { name: 'AI 제공자' })).toHaveValue('anthropic');
  });

  it('컴포넌트 생성을 요청하면 프롬프트가 최근 프롬프트에 추가된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: '무엇을 만들까요?' }), '프로필 카드');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));

    const history = await screen.findByRole('heading', { name: '최근 프롬프트' });
    expect(within(history.closest('div.prompt-history') as HTMLElement).getByRole('button', { name: '프로필 카드' })).toBeInTheDocument();
  });

  it('기록 지우기를 누르면 저장된 프롬프트 히스토리를 비운다', async () => {
    localStorage.setItem(STORAGE_KEYS.promptHistory, JSON.stringify(['예전 요청']));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '기록 지우기' }));

    expect(screen.queryByRole('heading', { name: '최근 프롬프트' })).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.promptHistory)!)).toEqual([]);
  });
});
