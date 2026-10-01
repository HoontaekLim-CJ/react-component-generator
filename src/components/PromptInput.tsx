import { useState } from 'react';
import { validatePrompt, PROMPT_MAX_LENGTH } from '../utils/validatePrompt';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  history?: string[];
  onClearHistory?: () => void;
}

const EXAMPLES = [
  'SaaS 관리자용 KPI 카드 3개. 매출, 활성 사용자, 전환율을 비교 가능한 형태로 표시',
  '설정 페이지의 알림 토글 패널. 이메일, 슬랙, 주간 리포트 옵션 포함',
  '검색 필터 바. 상태, 담당자, 날짜 범위를 선택하고 결과 수를 보여주는 UI',
  '온보딩 체크리스트. 5단계 진행률과 완료/대기 상태를 보여주는 카드',
  '요금제 비교 카드 3개. 추천 플랜을 강조하고 CTA 버튼 포함',
  '테이블 행 상세보기 패널. 선택한 고객의 기본 정보와 최근 활동 표시',
];

export function PromptInput({
  onGenerate,
  isLoading,
  history = [],
  onClearHistory,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const validation = validatePrompt(prompt);
  const isTooLong = validation.error === 'tooLong';
  const overBy = validation.length - PROMPT_MAX_LENGTH;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation.valid && !isLoading) {
      onGenerate(prompt.trim());
    }
  };

  return (
    <div className="prompt-section">
      <form onSubmit={handleSubmit} className="prompt-form">
        <label htmlFor="prompt" className="prompt-label">
          무엇을 만들까요?
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="예: 고객 목록 테이블 위에 들어갈 검색 필터 바. 상태, 담당자, 날짜 범위 필터가 필요해요."
          className="prompt-textarea"
          rows={3}
          aria-invalid={isTooLong}
          aria-describedby={isTooLong ? 'prompt-error' : undefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
        />
        {isTooLong && (
          <p id="prompt-error" className="prompt-error">
            {PROMPT_MAX_LENGTH}자 이하로 줄여 주세요. {overBy}자를 더 지워야 합니다.
          </p>
        )}
        <div className="prompt-submit">
          <span className={`prompt-count ${isTooLong ? 'prompt-count--over' : ''}`}>
            {validation.length} / {PROMPT_MAX_LENGTH}자
          </span>
          <span className="prompt-hint">Ctrl + Enter로도 생성할 수 있어요</span>
          <button
            type="submit"
            className="btn-generate"
            disabled={!validation.valid || isLoading}
          >
            {isLoading ? '생성 중...' : '컴포넌트 생성'}
          </button>
        </div>
      </form>

      {history.length > 0 && (
        <div className="prompt-history">
          <div className="prompt-history-header">
            <h2 className="examples-label">최근 프롬프트</h2>
            <button className="btn-text" onClick={onClearHistory} type="button">
              기록 지우기
            </button>
          </div>
          <ul>
            {history.map((item) => (
              <li key={item}>
                <button className="example-line" onClick={() => setPrompt(item)} type="button">
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="prompt-examples">
        <h2 className="examples-label">이런 걸 그려볼 수 있어요</h2>
        <ul>
          {EXAMPLES.map((example) => (
            <li key={example}>
              <button
                className="example-line"
                onClick={() => setPrompt(example)}
                type="button"
              >
                {example}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
