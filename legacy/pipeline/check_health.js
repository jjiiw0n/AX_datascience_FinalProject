const { chromium } = require('playwright');

async function checkHealth() {
    console.log('\n==================================================');
    console.log('[Health Check] 채용공고 웹사이트 상태 확인 중...');
    console.log('==================================================');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    const targets = [
        { name: 'ETRI 채용', url: 'https://www.etri.re.kr/kor/bbs/list.etri?b_board_id=ETRI39' },
        { name: 'BTP (부산테크노파크) 채용', url: 'https://www.btp.or.kr/index.php?pCode=MN2000192' },
        { name: '2030 청년인턴 채용', url: 'https://www.2030db.go.kr/user/youthIntern/selectYouthInternList.do' }
    ];

    for (const target of targets) {
        try {
            const page = await context.newPage();
            // 15초 타임아웃으로 빠른 헬스체크 수행
            const response = await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            const status = response ? response.status() : 'N/A';

            if (status >= 200 && status < 400) {
                console.log(`✔ [정상] ${target.name} 사이트가 원활하게 운영 중입니다. (Status: ${status})`);
            } else {
                console.log(`❌ [이상] ${target.name} 사이트 접속 상태가 올바르지 않습니다. (Status: ${status})`);
            }
            await page.close();
        } catch (error) {
            console.log(`❌ [오류] ${target.name} 사이트 접속 중 에러가 발생했습니다. (Reason: ${error.message})`);
        }
    }

    await browser.close();
    console.log('==================================================\n');
}

checkHealth();
