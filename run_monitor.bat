@echo off
setlocal enabledelayedexpansion

:: 한글 깨짐 방지를 위한 UTF-8 코드페이지 설정
chcp 65001 > nul

:: 요일 체크 (금요일: 5)
for /f %%a in ('powershell -Command "([int](Get-Date).DayOfWeek)"') do set "day=%%a"
if not "%day%"=="5" (
    echo Today is not Friday. Monitoring is skipped per policy.
    exit /b 0
)

:: 디렉토리 이동
cd /d "C:\Users\zzib0\Downloads\AX_datascience\final_project"

echo [Step 1] 웹사이트 수집 시작 (Scraping)...
node scrape.js
if %errorlevel% neq 0 (
    echo Scraping failed. Exiting.
    exit /b %errorlevel%
)

echo [Step 2] AI 데이터 추출 시작 (Parsing)...
node parse_with_ai.js
if %errorlevel% neq 0 (
    echo Parsing failed. Exiting.
    exit /b %errorlevel%
)

echo [Step 3] 중복 체크 및 필터링 (Filtering)...
node filter.js

echo [Step 4] 알림 메일 발송 (Notifying)...
node notify.js

echo [Step 5] 주간 통합 뉴스레터 발송 시작 (Friday Special)...
node scrape_news.js
node summarize_news.js
node notify_newsletter.js

echo 모든 작업이 성공적으로 완료되었습니다.
pause
