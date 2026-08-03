const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function scrapeNews() {
    console.log('Starting Newsletter Scraping (Improved)...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const results = {
        science: [],
        ai: [],
        defense: []
    };

    // 우선순위 키워드 설정
    const priorityKeywords = {
        science: [],
        ai: ['ETRI', 'KT', 'SKT', 'LG'],
        defense: ['LIG', '한화', 'KAI', '현대']
    };

    function filterAndSort(articles, keywords) {
        if (keywords.length === 0) return articles.slice(0, 3);
        
        const priority = articles.filter(a => keywords.some(k => a.title.toUpperCase().includes(k.toUpperCase())));
        const others = articles.filter(a => !keywords.some(k => a.title.toUpperCase().includes(k.toUpperCase())));
        return [...priority, ...others].slice(0, 3);
    }

    try {
        // 1. 동아사이언스 (인기 순위)
        console.log('Scraping DongA Science...');
        const sciencePage = await context.newPage();
        await sciencePage.goto('https://www.dongascience.com/', { waitUntil: 'domcontentloaded' });
        
        const scienceArticles = await sciencePage.evaluate(() => {
            const allLinks = Array.from(document.querySelectorAll('a'));
            return allLinks
                .filter(a => a.href.includes('/news/') && !a.href.includes('/list'))
                .map(a => ({ title: a.innerText.trim(), link: a.href }))
                .filter(a => a.title.length > 15);
        });
        // 키워드 없이 인기 순위(가져온 순서) 3개
        results.science = scienceArticles.slice(0, 3);
        await sciencePage.close();

        // 2. AI타임즈 (최신순 + 키워드)
        console.log('Scraping AI Times...');
        const aiPage = await context.newPage();
        await aiPage.goto('https://www.aitimes.kr/news/articleList.html?sc_sub_section_code=S2N16&view_type=sm', { waitUntil: 'domcontentloaded' });
        
        const aiArticlesRaw = await aiPage.evaluate(() => {
            const items = Array.from(document.querySelectorAll('h4.titles a'));
            return items.map(a => ({ title: a.innerText.trim(), link: a.href }));
        });
        results.ai = filterAndSort(aiArticlesRaw, priorityKeywords.ai);
        await aiPage.close();

        // 3. 데일리디펜스 (국내방산 최신순 + 키워드)
        console.log('Scraping Daily Defense...');
        const defPage = await context.newPage();
        try {
            await defPage.goto('https://www.dailydefense.co.kr/news/articleList.html?sc_section_code=S1N1&view_type=sm', { waitUntil: 'domcontentloaded', timeout: 30000 });
            const defArticlesRaw = await defPage.evaluate(() => {
                const list = Array.from(document.querySelectorAll('.altlist-subject a'));
                return list.map(a => ({ title: a.innerText.trim(), link: a.href }));
            });
            results.defense = filterAndSort(defArticlesRaw, priorityKeywords.defense);
        } catch (err) {
            console.error('Daily Defense failed, skipping.');
        }
        await defPage.close();

        fs.writeFileSync('data/legacy/news_selected.json', JSON.stringify(results, null, 2), 'utf8');
        console.log('Successfully saved news_selected.json');
        console.log(`Final Count: Science(${results.science.length}), AI(${results.ai.length}), Defense(${results.defense.length})`);

    } catch (error) {
        console.error('Error during newsletter scraping:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

scrapeNews();
