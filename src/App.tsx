import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState<Provider>('google');
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({
    anthropic: false,
    google: false,
  });
  const { components, isLoading, error, generate, removeComponent, clearAll } =
    useComponentGenerator();

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setEnvKeys(data.envKeys))
      .catch(() => {});
  }, []);

  const hasEnvKey = envKeys[provider];

  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      alert(`${PROVIDER_CONFIG[provider].label} API 키를 입력하거나 .env에 설정해주세요.`);
      return;
    }
    generate(prompt, apiKey || undefined, provider);
  };

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    setApiKey('');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <h1>컴포넌트 제도판</h1>
          <p>만들 UI를 글로 설명하면 React 컴포넌트를 만들어 바로 그려 보여줍니다.</p>
        </div>

        <div className="runtime" role="group" aria-label="AI 연결 설정">
          <div className="field">
            <label htmlFor="provider">AI 제공자</label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as Provider)}
            >
              {Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="field field--key">
            <label htmlFor="api-key">API 키</label>
            <div className="api-key-field">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                aria-describedby="key-status"
                placeholder={hasEnvKey ? '서버 키 사용 중' : PROVIDER_CONFIG[provider].placeholder}
              />
              <button
                className="btn btn-toggle-key"
                onClick={() => setShowKey(!showKey)}
                type="button"
                aria-pressed={showKey}
              >
                {showKey ? '숨기기' : '보기'}
              </button>
            </div>
            <p id="key-status" className={`key-status ${hasEnvKey ? 'key-status--ready' : ''}`}>
              {hasEnvKey
                ? '.env의 키를 사용합니다. 입력하면 이 키로 바꿔 씁니다.'
                : '키를 입력하거나 서버 .env에 설정하세요.'}
            </p>
          </div>
        </div>
      </header>

      <main>
        <section className="composer" aria-label="컴포넌트 생성">
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
        </section>

        {error && (
          <div className="error-banner" role="alert">
            <p>
              <strong>생성하지 못했습니다.</strong> {error}
            </p>
          </div>
        )}

        <section className="drawings" aria-label="생성된 컴포넌트">
          {components.length > 0 && (
            <div className="drawings-header">
              <h2>도면 {components.length}장</h2>
              <button className="btn btn-remove" onClick={clearAll}>
                전체 삭제
              </button>
            </div>
          )}

          {isLoading && (
            <div className="sheet sheet--drafting" role="status">
              <div className="drafting-line" aria-hidden="true" />
              <p>컴포넌트를 그리는 중입니다. 보통 10–30초 걸려요.</p>
            </div>
          )}

          {components.length === 0 && !isLoading && (
            <div className="sheet sheet--empty">
              <div className="empty-drawing">
                <p>아직 그린 도면이 없습니다.</p>
                <p className="empty-hint">
                  위에 만들 UI를 설명하고 <strong>컴포넌트 생성</strong>을 누르면 이 자리에
                  첫 도면이 놓입니다.
                </p>
              </div>
              <div className="title-block title-block--blank" aria-hidden="true">
                <div className="tb-cell tb-number">
                  <span className="tb-label">도면</span>
                  <span className="tb-value">1</span>
                </div>
                <div className="tb-cell tb-prompt">
                  <span className="tb-label">요청</span>
                </div>
                <div className="tb-cell tb-time">
                  <span className="tb-label">생성</span>
                </div>
              </div>
            </div>
          )}

          <div className="drawings-list">
            {components.map((component, index) => (
              <ComponentCard
                key={component.id}
                component={component}
                sheetNumber={components.length - index}
                onRemove={removeComponent}
                onRegenerate={handleGenerate}
                isLoading={isLoading}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
