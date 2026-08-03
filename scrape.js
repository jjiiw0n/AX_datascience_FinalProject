const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function scrape() {
    // 요일 체크 (토요일: 6) - 토요일 실행 스킵
    const now = new Date();
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 6) {
        console.log(`Today is Saturday. Monitoring is skipped per policy.`);
        process.exit(0);
    }

    console.log('Starting scraping process...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    try {
        /* 
        // 1. ETRI - Paused per user request
        console.log('Scraping ETRI (Paused)...');
        // ... scraping logic commented out
        */

        /*
        // 2. BTP (Busan Techno Park) - Paused per user request
        console.log('Scraping BTP (Paused)...');
        // ... scraping logic commented out
        */

        // 3. Youth Intern
        console.log('Scraping Youth Intern...');
        const youthPage = await context.newPage();
        await youthPage.goto('https://www.2030db.go.kr/user/youthIntern/selectYouthInternList.do', { waitUntil: 'networkidle' });
        const youthHtml = await youthPage.content();
        fs.writeFileSync('youth.html', youthHtml, 'utf8');
        await youthPage.close();

        console.log('Scraping completed successfully.');
    } catch (error) {
        console.error('Error during scraping:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

scrape();
