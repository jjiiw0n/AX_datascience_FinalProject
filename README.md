# Career Newsletter Service

관심 채용 사이트의 새 게시물을 자동으로 수집하고, 구독자별 신규 정보를 이메일로 전달하는 커리어 뉴스레터 서비스입니다.

현재 운영 버전은 GitHub Actions에서 매일 실행되며, Playwright로 사이트를 수집하고 Supabase에서 구독자와 발송 이력을 관리합니다.

## 주요 기능

- ETRI, 부산테크노파크, 2030 청년인턴 게시판 자동 수집
- 구독자별 모니터링 사이트 설정 조회
- Supabase `crawl_history`를 이용한 중복 게시물 차단
- Gmail SMTP를 통한 HTML 뉴스레터 발송
- GitHub Actions 수동 실행 및 매일 정기 실행

## 운영 흐름

```text
GitHub Actions
  → Node.js 22 / Playwright
  → 채용 사이트 수집
  → Supabase 구독자·이력 조회
  → 신규 게시물 판별
  → Gmail 뉴스레터 발송
```

## 프로젝트 구조

```text
.
├─ .github/workflows/monitor.yml  # 운영 스케줄 및 실행 환경
├─ lib/supabase.js                # Supabase 클라이언트
├─ monitor_v2.js                  # 현재 운영 진입점
├─ data/legacy/                   # 과거 로컬 파이프라인의 데이터·산출물
├─ legacy/pipeline/               # 과거 단계별 수집·분석·발송 스크립트
├─ legacy/windows/                # Windows 작업 스케줄러 자료
├─ legacy/integrated-web-monitor/ # 과거 사이트·인프라 참고 문서
├─ tests/manual/                  # 수동 SMTP·프롬프트 테스트
├─ docs/                          # 운영 및 복구 문서
├─ package.json
└─ package-lock.json
```

## 요구 사항

- Node.js 22 이상
- npm
- Supabase 프로젝트와 필요한 테이블
- Gmail 앱 비밀번호

## 환경 변수

로컬 실행 시 저장소 루트에 `.env` 파일을 만들고 다음 값을 설정합니다. `.env`는 Git에 포함되지 않습니다.

```dotenv
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

GitHub Actions에서는 동일한 이름을 저장소의 Actions secrets로 등록해야 합니다.

## 로컬 실행

```bash
npm ci
npx playwright install chromium
npm start
```

## GitHub Actions

`.github/workflows/monitor.yml`은 다음 방식으로 실행됩니다.

- 수동 실행: GitHub의 Actions 탭에서 `Career Newsletter Service` 선택 후 실행
- 정기 실행: 매일 `00:00 UTC` (`09:00 KST`)

워크플로는 `ubuntu-latest`, Node.js 22, Playwright Chromium을 사용합니다.

## 주요 데이터베이스 객체

운영 코드는 다음 Supabase 객체를 사용합니다.

- `subscribers`: 활성 구독자와 이메일 정보
- `monitoring_sites`: 구독자별 모니터링 사이트
- `crawl_history`: 이미 발송한 게시물 링크와 제목

## 레거시 자료

`legacy/`와 `data/legacy/`는 Supabase 전환 전 사용하던 로컬 파일 기반 파이프라인을 보존한 영역입니다. 현재 GitHub Actions는 이 파일들을 실행하지 않습니다.

과거 스크립트를 실행할 때는 저장소 루트를 현재 디렉터리로 사용해야 합니다.

## 보안

- `.env`, 서비스 계정 키, Gmail 앱 비밀번호를 커밋하지 마세요.
- 운영 비밀값은 GitHub Actions secrets에서 관리하세요.
- 로그에 이메일 비밀번호나 Supabase 키를 출력하지 마세요.

## 문서

- 상세 개발 기록: `project.md`
- 이메일 설정 복구 기록: `docs/REVERT_EMAIL_CONFIG.md`
- 과거 사이트별 참고 자료: `legacy/integrated-web-monitor/sites/`

## Author

jjiiw0n
