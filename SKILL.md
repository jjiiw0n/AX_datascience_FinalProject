# ETRI 채용공고 모니터링 자동화 스킬

이 스킬은 ETRI 채용공고 게시판을 모니터링하고 신규 게시물을 탐지하여 기록 및 알림을 수행합니다.

## 📋 자동화 정보
- **모니터링 대상:** [ETRI 채용공고](https://www.etri.re.kr/kor/bbs/list.etri?b_board_id=ETRI39)
- **데이터베이스:** [Google Docs - ETRI 채용공고 모니터링 DB](https://docs.google.com/document/d/1MnKxCrVYzdu6qGdvrnCNCttLcIfSQs-WAWFOXVTu7S4/edit)
- **알림 수신:** `zzib0808@gmail.com`

## 🛠 실행 워크플로우
1. **사이트 접속:** Playwright를 사용하여 ETRI 채용공고 게시판에 접속합니다.
2. **데이터 추출:** 테이블에서 `제목`, `등록일`, `상세 링크`를 추출합니다.
3. **중복 검사:** 위 Google Docs의 내용을 읽어와서 이미 기록된 `제목`인지 확인합니다.
4. **결과 처리:**
   - **새 공고 발견 시:** 
     - Google Docs 하단에 `수집일시`, `제목`, `등록일`, `링크`를 추가합니다.
     - `zzib0808@gmail.com`으로 상세 내용이 포함된 HTML 메일을 전송합니다.
   - **새 공고 없을 시:** 작업을 종료합니다.

## 💡 실행 명령어
이 스킬을 실행하려면 Gemini CLI에서 다음을 입력하세요:
`"ETRI 채용공고 모니터링 스킬 실행해줘"`
