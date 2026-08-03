@echo off
setlocal enabledelayedexpansion

:: 한글 깨짐 방지를 위한 UTF-8 코드페이지 설정
chcp 65001 > nul

:: 요일 체크 (토요일: 6) - 토요일은 스킵
for /f %%a in ('powershell -Command "([int](Get-Date).DayOfWeek)"') do set "day=%%a"
if "%day%"=="6" (
    echo Today is Saturday. Monitoring is skipped per policy.
    exit /b 0
)

:: 디렉토리 이동
cd /d "C:\Users\zzib0\Downloads\AX_datascience\final_project"

echo [Step 1] 웹사이트 수집 시작 (Scraping)...
node legacy\pipeline\scrape.js
if %errorlevel% neq 0 (
    echo Scraping failed. Exiting.
    exit /b %errorlevel%
)

echo [Step 2] AI 데이터 추출 시작 (Parsing)...
node legacy\pipeline\parse_with_ai.js
if %errorlevel% neq 0 (
    echo Parsing failed. Exiting.
    exit /b %errorlevel%
)

echo [Step 3] 중복 체크 및 필터링 (Filtering)...
node legacy\pipeline\filter.js

echo [Step 4] 알림 메일 발송 (Notifying)...
node legacy\pipeline\notify.js

echo [Step 5] 주간 통합 뉴스레터 발송 시작 (Friday Special)...
node legacy\pipeline\scrape_news.js
node legacy\pipeline\summarize_news.js
node legacy\pipeline\notify_newsletter.js

echo 모든 작업이 성공적으로 완료되었습니다.
pause
