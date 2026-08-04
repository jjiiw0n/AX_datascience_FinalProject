@echo off
setlocal enabledelayedexpansion

:: 한글 깨짐 방지를 위한 UTF-8 코드페이지 설정
chcp 65001 > nul

:: 주간 채용공고 이메일 발송 요일 설정 (1: 월요일, 2: 화요일, ..., 5: 금요일, 0: 일요일)
:: 기본값은 1(월요일)로 설정하여 주 1회 발송되도록 합니다.
set "weekly_day=1"

:: 요일 체크 (토요일: 6) - 토요일은 스킵
for /f %%a in ('powershell -Command "([int](Get-Date).DayOfWeek)"') do set "day=%%a"
if "%day%"=="6" (
    echo Today is Saturday. Monitoring is skipped per policy.
    exit /b 0
)

:: 디렉토리 이동
cd /d "C:\Users\zzib0\Downloads\AX_datascience\final_project"

:: 채용공고 발송 요일 여부에 따라 분기 처리
if "%day%"=="%weekly_day%" (
    echo ===================================================
    echo [Weekly Option] 오늘은 주간 채용공고 수집 및 발송일입니다.
    echo ===================================================

    echo [Step 1] 웹사이트 수집 시작 (Scraping)...
    node legacy\pipeline\scrape.js
    if !errorlevel! neq 0 (
        echo Scraping failed. Exiting.
        exit /b !errorlevel!
    )

    echo [Step 2] AI 데이터 추출 시작 (Parsing)...
    node legacy\pipeline\parse_with_ai.js
    if !errorlevel! neq 0 (
        echo Parsing failed. Exiting.
        exit /b !errorlevel!
    )

    echo [Step 3] 중복 체크 및 필터링 (Filtering)...
    node legacy\pipeline\filter.js

    echo [Step 4] 알림 메일 발송 (Notifying)...
    node legacy\pipeline\notify.js
) else (
    echo ===================================================
    echo [Daily Option] 오늘은 채용공고 단순 점검일입니다. (주간 발송일 아님)
    echo ===================================================

    :: 자료 저장 및 메일 발송 없이 정상 가동되는지만 cmd 상에 출력
    node legacy\pipeline\check_health.js
)

echo [Step 5] 뉴스레터 발송 시작 (Daily Special)...
node legacy\pipeline\scrape_news.js
node legacy\pipeline\summarize_news.js
node legacy\pipeline\notify_newsletter.js

echo 모든 작업이 성공적으로 완료되었습니다.
pause
