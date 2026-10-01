import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from './PromptInput';

async function pastePrompt(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.click(screen.getByRole('textbox'));
  await user.paste(text);
}

describe('PromptInput', () => {
  it('프롬프트가 비어 있으면 생성 버튼이 비활성이다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it('입력하면 버튼이 활성화되고 클릭 시 입력값으로 onGenerate가 호출된다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    await user.type(screen.getByRole('textbox'), '프로필 카드');
    const submit = screen.getByRole('button', { name: '컴포넌트 생성' });
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(onGenerate).toHaveBeenCalledWith('프로필 카드');
  });

  it('로딩 중에는 생성 버튼이 비활성이고 "생성 중..." 을 보여준다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('button', { name: '생성 중...' })).toBeDisabled();
  });

  it('500자를 넘으면 생성 버튼이 비활성이다', async () => {
    const user = userEvent.setup();
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);

    await pastePrompt(user, '가'.repeat(501));

    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it('500자를 넘으면 Ctrl+Enter로도 onGenerate가 호출되지 않는다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    await pastePrompt(user, '가'.repeat(501));
    await user.keyboard('{Control>}{Enter}{/Control}');

    expect(onGenerate).not.toHaveBeenCalled();
  });

  it('500자를 넘으면 입력란이 invalid가 되고 줄일 글자 수를 안내한다', async () => {
    const user = userEvent.setup();
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);

    await pastePrompt(user, '가'.repeat(503));

    const textbox = screen.getByRole('textbox');
    expect(textbox).toHaveAttribute('aria-invalid', 'true');
    expect(textbox).toHaveAccessibleDescription('500자 이하로 줄여 주세요. 3자를 더 지워야 합니다.');
  });

  it('입력한 글자 수를 최대 길이와 함께 보여준다', async () => {
    const user = userEvent.setup();
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);

    await user.type(screen.getByRole('textbox'), '프로필 카드');

    expect(screen.getByText('6 / 500자')).toBeInTheDocument();
  });
});

describe('PromptInput 프롬프트 히스토리', () => {
  it('최근 프롬프트를 누르면 입력란에 채운다', async () => {
    const user = userEvent.setup();
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} history={['요금제 카드', '검색 필터']} />);

    await user.click(screen.getByRole('button', { name: '검색 필터' }));

    expect(screen.getByRole('textbox')).toHaveValue('검색 필터');
  });

  it('히스토리가 없으면 최근 프롬프트 영역을 표시하지 않는다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} history={[]} />);

    expect(screen.queryByRole('heading', { name: '최근 프롬프트' })).not.toBeInTheDocument();
  });

  it('기록 지우기를 누르면 onClearHistory를 호출한다', async () => {
    const onClearHistory = vi.fn();
    const user = userEvent.setup();
    render(
      <PromptInput onGenerate={vi.fn()} isLoading={false} history={['카드']} onClearHistory={onClearHistory} />,
    );

    await user.click(screen.getByRole('button', { name: '기록 지우기' }));

    expect(onClearHistory).toHaveBeenCalledTimes(1);
  });
});
