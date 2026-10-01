import { useState } from 'react';
import type { GeneratedComponent } from '../types';
import { LivePreview } from './LivePreview';
import { CodeView } from './CodeView';

interface ComponentCardProps {
  component: GeneratedComponent;
  sheetNumber: number;
  onRemove: (id: string) => void;
  onRegenerate: (prompt: string) => void;
  isLoading: boolean;
}

type Tab = 'preview' | 'code';

const TABS: { id: Tab; label: string }[] = [
  { id: 'preview', label: '미리보기' },
  { id: 'code', label: '코드' },
];

export function ComponentCard({
  component,
  sheetNumber,
  onRemove,
  onRegenerate,
  isLoading,
}: ComponentCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [previewKey, setPreviewKey] = useState(0);
  const createdAt = component.createdAt.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const panelId = `sheet-${component.id}`;

  return (
    <article className="sheet" aria-label={`도면 ${sheetNumber}`}>
      <div className="sheet-tabs" role="tablist" aria-label="보기 전환">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={panelId}
            className="sheet-tab"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="sheet-body" id={panelId} role="tabpanel">
        {activeTab === 'preview' ? (
          <LivePreview key={previewKey} code={component.code} />
        ) : (
          <CodeView code={component.code} />
        )}
      </div>

      <footer className="title-block">
        <div className="tb-cell tb-number">
          <span className="tb-label">도면</span>
          <span className="tb-value">{sheetNumber}</span>
        </div>
        <div className="tb-cell tb-prompt">
          <span className="tb-label">요청</span>
          <p className="tb-value">{component.prompt}</p>
        </div>
        <div className="tb-cell tb-time">
          <span className="tb-label">생성</span>
          <span className="tb-value">{createdAt}</span>
        </div>
        <div className="tb-cell tb-actions">
          <button
            className="btn"
            onClick={() => setPreviewKey((k) => k + 1)}
            title="애니메이션을 처음부터 다시 봅니다"
          >
            새로고침
          </button>
          <button
            className="btn"
            onClick={() => onRegenerate(component.prompt)}
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '재생성'}
          </button>
          <button className="btn btn-remove" onClick={() => onRemove(component.id)}>
            삭제
          </button>
        </div>
      </footer>
    </article>
  );
}
