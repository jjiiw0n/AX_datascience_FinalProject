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
        // 1. ETRI
        console.log('Scraping ETRI...');
        const etriPage = await context.newPage();
        await etriPage.goto('https://www.etri.re.kr/kor/bbs/list.etri?b_board_id=ETRI39', { waitUntil: 'networkidle' });
        const etriHtml = await etriPage.content();
        fs.writeFileSync('etri.html', etriHtml, 'utf8');
        await etriPage.close();

        // 2. BTP (Busan Techno Park) - with search
        console.log('Scraping BTP...');
        const btpPage = await context.newPage();
        await btpPage.goto('https://www.btp.or.kr/kor/CMS/Board/Board.do?mCode=MN018', { waitUntil: 'networkidle' });
        
        // 검색어 입력 및 검색 수행
        const searchInput = await btpPage.locator('input[name="searchKeyword"]').first();
        await searchInput.fill('부산지역인재');
        
        // 검색 버튼 클릭 (엔터키 또는 버튼 클릭)
        await searchInput.press('Enter');
        await btpPage.waitForLoadState('networkidle');
        
        const btpHtml = await btpPage.content();
        fs.writeFileSync('btp.html', btpHtml, 'utf8');
        await btpPage.close();

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
