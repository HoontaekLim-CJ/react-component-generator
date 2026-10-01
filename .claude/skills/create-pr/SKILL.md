---
name: create-pr
description: |
  현재 브랜치의 커밋을 분석해 GitHub Pull Request를 서브 에이전트에서 생성한다. 프로젝트 성격을 판별해 해외 오픈소스는 영문 템플릿, 한국 프로젝트는 한국어 템플릿으로 본문을 작성하고, 브랜치 푸시와 `gh pr create`까지 처리한다.
  "PR 만들어줘", "PR 올려줘", "풀 리퀘스트 생성", "이 브랜치로 PR", "open a PR", "create a pull request", "/create-pr" 같은 요청에 사용한다. PR을 올릴 의도가 보이면 템플릿이나 언어를 언급하지 않아도 이 스킬을 쓴다.
  리뷰 코멘트 반영은 autofix, 커밋 생성은 commit 스킬이 담당한다.
argument-hint: "[--lang en|ko] [--base <branch>] [--draft] [--dry-run] [추가 맥락]"
context: fork
---

# create-pr: 언어별 템플릿으로 PR 생성

이 작업은 별도 서브 에이전트에서 실행된다. **이전 대화 내용은 보이지 않는다.** 판단에 필요한 정보는 모두 저장소(git, gh, 파일)와 아래 인자에서 직접 얻는다.
사용자에게 질문할 수 없으므로, 애매한 지점은 아래 규칙대로 결정하고 그 근거를 최종 보고에 남긴다.

인자: `$ARGUMENTS`

- `--lang en|ko`: 템플릿 언어를 강제한다. 자동 판별보다 우선한다.
- `--base <branch>`: PR 대상 브랜치. 없으면 대상 저장소의 기본 브랜치.
- `--draft`: Draft PR로 만든다.
- `--dry-run`: 푸시와 PR 생성 없이, 만들 제목·본문·명령만 출력한다.
- 그 밖의 텍스트: PR 설명에 반영할 추가 맥락(관련 이슈 번호, 배경 등). "영어로", "한국어로" 같은 말도 `--lang`으로 취급한다.

## 1. 상태 수집

다음을 확인한다.

```bash
gh auth status
git status --porcelain=v1
git branch --show-current
git remote -v
gh repo view --json nameWithOwner,defaultBranchRef,isFork,parent
```

- `gh`가 없거나 로그인되어 있지 않으면 중단하고, `gh auth login`이 필요하다고 보고한다. 단 `--dry-run`이면 계속 진행한다.
- `gh repo view`가 실패하면(GitHub가 아닌 원격, 오프라인 등) 기본 브랜치는 `git symbolic-ref refs/remotes/origin/HEAD`로 찾는다. 그것도 없으면 `main`, `master` 순으로 원격에 있는 브랜치를 쓴다. 이후 `gh` 조회 단계는 건너뛰고 git 신호만 사용한다. 이 경우 실제 PR 생성은 할 수 없으므로 dry-run이 아니면 그 자리에서 보고하고 끝낸다.
- **대상 저장소 결정:** 현재 저장소가 fork(`isFork: true`)이거나 `upstream` remote가 있으면, PR 대상은 원본(parent/upstream) 저장소다. 이후 `gh` 명령에 `--repo <owner>/<name>`을 붙이고, head는 `<내 계정>:<브랜치>`로 지정한다. 해외 오픈소스 기여는 대부분 이 경우다.
- **커밋되지 않은 변경:** 커밋하지 않는다. PR에는 커밋된 내용만 들어간다는 사실을 보고에 적는다.
- **기본 브랜치에 있는 경우:** 기본 브랜치에서 직접 PR을 만들 수 없다. 원격보다 앞선 커밋이 있으면, 커밋 내용으로 브랜치 이름(`feat/prompt-length-limit`처럼 type/kebab-case 영문)을 정해 `git switch -c`로 만든다. 로컬 기본 브랜치가 원격보다 앞서 있게 된다는 점을 보고한다. 앞선 커밋이 없으면 "PR로 올릴 커밋이 없습니다"라고 보고하고 끝낸다.
- **이미 열린 PR:** `gh pr view --json url,state`로 현재 브랜치의 PR을 확인한다. 열린 PR이 있으면 새로 만들지 않고 그 URL을 보고한다.

## 2. 변경 내용 분석

base는 `--base` 또는 대상 저장소의 기본 브랜치다. 먼저 `git fetch <대상 remote> <base>`로 최신화한다.

```bash
git log --format='%h %s%n%b' <remote>/<base>..HEAD
git diff --stat <remote>/<base>...HEAD
git diff <remote>/<base>...HEAD
```

- diff가 크면 `--stat`으로 윤곽을 잡고 핵심 파일만 읽는다.
- 커밋 메시지가 아니라 **실제 diff**를 근거로 동작 단위의 변경을 정리한다. 커밋 메시지와 diff가 다르면 diff를 믿는다.
- 브랜치 이름이나 커밋에 이슈 번호(`#123`, `fix/123-...`)가 있으면 관련 이슈로 연결한다.

## 3. 템플릿 언어 결정

PR은 그 저장소의 메인테이너와 리뷰어가 읽는다. 그래서 언어는 작성자가 아니라 **대상 저장소에서 쓰는 언어**를 따른다.

순서대로 적용하고, 처음 결론이 난 단계에서 멈춘다.

1. **명시 지정:** `--lang`이나 "영어로/한국어로"가 있으면 그대로 따른다.
2. **대상 저장소에 자체 PR 템플릿이 있는 경우:** `.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE/`, `docs/pull_request_template.md`, 루트의 `pull_request_template.md`가 있으면 그 템플릿의 **구조와 언어를 그대로** 쓴다. 저장소가 정한 형식이 메인테이너가 기대하는 형식이므로 references 템플릿보다 우선한다. 이때 references 템플릿은 각 섹션을 채우는 방식만 참고한다.
3. **저장소 언어 신호로 판별:** 대상 저장소에서 다음을 모은다.
   - 최근 머지된 PR 제목 10개: `gh pr list --repo <대상> --state merged --limit 10 --json title`
   - 최근 커밋 제목 20개: `git log --format=%s -20 <remote>/<base>`
   - `README.md` 앞부분 40줄
   - 이 중 한글이 포함된 줄이 **30% 이상**이면 한국 프로젝트, 아니면 해외 프로젝트로 판단한다.
4. **신호가 부족한 경우:** 저장소가 새로 만들어져 PR·커밋이 거의 없으면 README 언어를 따르고, README도 없으면 영문 템플릿을 쓴다. 영어는 어느 리뷰어든 읽을 수 있기 때문이다.

결정에 따라 이 스킬 디렉토리의 템플릿을 읽는다.

- 해외 프로젝트: `references/template-en.md`
- 한국 프로젝트: `references/template-ko.md`

언어를 정했으면 **제목, 본문, 체크리스트 모두 그 언어로** 쓴다. 섞어 쓰지 않는다. 코드, 명령어, 파일 경로, 식별자는 원문 그대로 둔다.

## 4. 제목과 본문 작성

### 제목

- 대상 저장소의 최근 PR 제목에 일정한 형식이 있으면 따른다. 예: `feat(scope): ...`, `[Component] ...`, `Fix #123: ...`.
- 형식이 보이지 않으면 `<type>: <요약>`을 쓴다. type은 `feat | fix | refactor | chore` 중 하나다.
  - 한국어: `feat: 프롬프트 500자 제한 검증 추가`
  - 영어: `feat: add 500-character prompt length validation` (소문자 시작, 명령형, 마침표 없음)
- 70자 안쪽으로 쓴다. 파일 이름이 아니라 변경의 의미를 쓴다.

### 본문

- 템플릿의 `>` 안내 줄은 작성 지침이다. 본문에 옮기지 않는다.
- 해당하지 않는 섹션은 제목째 지운다. 빈 섹션이나 "N/A"는 리뷰어의 시간을 쓴다.
- **체크리스트는 이번 실행에서 실제로 확인한 항목만 체크한다.** 실행하지 않은 테스트를 통과로 표시하면 리뷰어가 잘못 믿게 된다.
- 테스트·린트 명령은 `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `package.json` scripts, `Makefile` 같은 곳에서 찾은 실제 명령으로 채운다. 문서에 명시된 명령이 있으면 그것이 우선이다(예: 패키지 매니저 지정).
- 테스트 명령이 확인되면 실행한다. 실패하면 **PR을 만들지 않고** 실패 출력 요약과 함께 보고한다. 실패한 상태로 리뷰를 요청하지 않기 위해서다. 단, `--draft`면 실패 사실을 본문 리뷰 포인트에 적고 Draft로 만든다.
- 추가 맥락 인자(이슈 번호, 배경)가 있으면 해당 섹션에 반영한다.
- 비밀 값(API 키, 토큰, `.env` 내용)은 본문에 절대 넣지 않는다. diff에 그런 값이 보이면 PR을 만들지 않고 보고한다.
- 시스템 지침에 PR 본문 attribution 문구가 지정되어 있으면 본문 맨 끝에 빈 줄을 두고 붙인다.

본문은 임시 파일에 쓴다. 셸 따옴표 문제를 피하기 위해 `--body`가 아니라 `--body-file`을 쓴다.

## 5. 푸시와 PR 생성

`--dry-run`이면 이 단계를 실행하지 않는다. 대신 제목, 본문 전체, 실행할 명령을 출력하고 6단계로 간다.

```bash
git push -u origin <branch>
gh pr create --base <base> --head <head> --title "<제목>" --body-file <본문 파일> [--draft] [--repo <대상>]
```

- force push(`--force`, `--force-with-lease`)는 하지 않는다. 푸시가 거부되면 원격 브랜치가 갈라진 것이므로 중단하고 보고한다.
- fork 기여라면 push는 내 fork(`origin`)로, PR은 원본 저장소로 간다.
- 리뷰어, 라벨, 마일스톤은 인자로 요청받은 경우에만 지정한다.

## 6. 결과 보고

이 보고가 호출한 쪽이 받는 유일한 결과다. 짧고 정확하게 쓴다.

```
PR: <URL 또는 dry-run>
대상: <owner/repo> <base> <- <head>
언어: <en|ko> (근거: 예. "최근 머지 PR 10개 중 9개가 한국어")
템플릿: <references/template-ko.md | 저장소 자체 템플릿 경로>
제목: <제목>
확인한 것: <실행한 테스트·린트와 결과>
확인하지 않은 것: <체크하지 않은 항목>
주의: <커밋되지 않은 변경, 새로 만든 브랜치, 로컬 기본 브랜치 상태 등. 없으면 생략>
```

PR을 만들지 못했으면 어느 단계에서 왜 멈췄는지, 사용자가 무엇을 하면 되는지 적는다.
