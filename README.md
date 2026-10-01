# React 컴포넌트 생성기

프롬프트를 입력하면 AI가 React 컴포넌트를 즉시 생성하고, 실시간 미리보기와 코드를 제공합니다.

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Bun (AI API 프록시 서버)
- **AI Provider**: Anthropic Claude / Google Gemini (선택 가능)
- **미리보기**: react-live (런타임 렌더링)

## 실행 방법

```bash
# 의존성 설치
bun install

# (선택) .env에 API 키 설정
cp .env.example .env
# .env 파일에 ANTHROPIC_API_KEY 또는 GOOGLE_API_KEY 입력

# API 서버 + 프론트엔드 동시 실행
bun run dev
```

브라우저에서 `http://localhost:5173` 접속 후 사용할 수 있습니다.

- `.env`에 API 키를 설정하면 UI에서 별도 입력 없이 바로 사용 가능
- `.env` 없이도 UI에서 직접 API 키를 입력하여 사용 가능

## 주요 기능

- **멀티 프로바이더**: Anthropic Claude / Google Gemini 선택
- **실시간 미리보기**: 생성된 컴포넌트를 즉시 렌더링
- **치수 표시**: 렌더링된 컴포넌트의 실제 가로·세로 크기(px)를 치수선으로 표시
- **새로고침**: 애니메이션 컴포넌트를 리마운트하여 다시 보기
- **재생성**: 같은 프롬프트로 AI에 다시 요청
- **예시 프롬프트**: 시각적 임팩트가 큰 예시 제공
- **프롬프트 길이 제한**: 최대 500자. 입력 중 글자 수를 보여주고, 넘으면 생성을 막고 줄일 글자 수를 안내
- **프롬프트 히스토리**: 최근 요청한 프롬프트 20개를 다시 불러오기. 기록 지우기 지원
- **상태 유지**: 선택한 Provider, 프롬프트 히스토리, 생성된 컴포넌트 목록을 브라우저(localStorage)에 저장해 새로고침 후에도 유지
  - API 키는 저장하지 않습니다. 생성된 코드가 같은 페이지에서 실행되므로, 저장된 키를 읽어 갈 수 있기 때문입니다. 매번 입력하지 않으려면 `.env`에 설정하세요.
