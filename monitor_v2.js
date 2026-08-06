require('dotenv').config();
const { chromium } = require('playwright');
const nodemailer = require('nodemailer');
const supabase = require('./lib/supabase');

// --- Helpers & Parsers ---
// ... (existing helper functions: normalizeLink, parseEtri, parseBtp, parseYouth)
// --- Newsletter Helpers ---

function filterAndSort(articles, keywords) {
    if (keywords.length === 0) return articles.slice(0, 3);
    const priority = articles.filter(a => keywords.some(k => a.title.toUpperCase().includes(k.toUpperCase())));
    const others = articles.filter(a => !keywords.some(k => a.title.toUpperCase().includes(k.toUpperCase())));
    return [...priority, ...others].slice(0, 3);
}

async function scrapeNews(context) {
    console.log('Starting Newsletter Scraping...');
    const results = { science: [], ai: [], defense: [] };
    const priorityKeywords = {
        science: [],
        ai: ['ETRI', 'KT', 'SKT', 'LG'],
        defense: ['LIG', '한화', 'KAI', '현대']
    };

    try {
        const sciencePage = await context.newPage();
        await sciencePage.goto('https://www.dongascience.com/', { waitUntil: 'domcontentloaded' });
        results.science = await sciencePage.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .filter(a => a.href.includes('/news/') && !a.href.includes('/list'))
                .map(a => ({ title: a.innerText.trim(), link: a.href }))
                .filter(a => a.title.length > 15)
                .slice(0, 3);
        });
        await sciencePage.close();
    } catch (e) {
        console.error('DongA Science scrape failed:', e.message);
    }

    try {
        const aiPage = await context.newPage();
        await aiPage.goto('https://www.aitimes.kr/news/articleList.html?sc_sub_section_code=S2N16&view_type=sm', { waitUntil: 'domcontentloaded' });
        results.ai = filterAndSort(await aiPage.evaluate(() => Array.from(document.querySelectorAll('h4.titles a')).map(a => ({ title: a.innerText.trim(), link: a.href }))), priorityKeywords.ai);
        await aiPage.close();
    } catch (e) {
        console.error('AI Times scrape failed:', e.message);
    }

    try {
        const defPage = await context.newPage();
        await defPage.goto('https://www.dailydefense.co.kr/news/articleList.html?sc_section_code=S1N1&view_type=sm', { waitUntil: 'domcontentloaded' });
        results.defense = filterAndSort(await defPage.evaluate(() => Array.from(document.querySelectorAll('.altlist-subject a')).map(a => ({ title: a.innerText.trim(), link: a.href }))), priorityKeywords.defense);
        await defPage.close();
    } catch (e) {
        console.error('Daily Defense scrape failed:', e.message);
    }

    const totalArticles = Object.values(results).reduce((sum, articles) => sum + articles.length, 0);
    if (totalArticles === 0) {
        throw new Error('All newsletter sources returned zero articles; refusing to send an empty newsletter.');
    }
    return results;
}

async function sendNewsletter(to, userName, newsData, insight) {
    const today = new Date().toLocaleDateString('ko-KR');
    let newsletterHtml = '';
    const categories = [{ key: 'science', name: '과학' }, { key: 'ai', name: 'AI/네트워크' }, { key: 'defense', name: '방산/국방' }];

    categories.forEach(cat => {
        newsletterHtml += `<hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;">`;
        newsletterHtml += `<h3 style="color: #2c3e50; margin-top: 0;">📌 오늘의 ${cat.name} 주요 뉴스</h3><ul style="list-style: none; padding: 0;">`;
        (newsData[cat.key] || []).forEach((art, i) => {
            newsletterHtml += `<li style="margin-top: 10px;"><a href="${art.link}" style="text-decoration: none; color: #333;"><strong>${i+1}. ${art.title}</strong></a></li>`;
        });
        newsletterHtml += `</ul>`;
    });

    let html = `
    <div style="font-family: 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #eee; color: #333;">
        <h1 style="color: #1a73e8; text-align: center; border-bottom: 2px solid #1a73e8; padding-bottom: 15px;">🚀 ${userName}님을 위한 데일리 뉴스레터</h1>
    `;
    // ... (rest of html building logic from notify_newsletter.js)
    html += `<div style="margin-top: 30px; padding: 25px; background-color: #fcfcfc; border: 1px dashed #1a73e8; border-radius: 10px;">
             <p style="background-color: #f8f9fa; padding: 15px; border-left: 5px solid #1a73e8; font-style: italic; font-size: 1.1em;">"${insight}"</p>
            ${newsletterHtml}
        </div>
        <p style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">발송 시각: ${new Date().toLocaleString('ko-KR')}</p>
    </div>
    `;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject: `[데일리 뉴스레터] 오늘의 산업 동향 (${today})`, html });
}

// --- Main Logic ---
// ... (existing monitor function, updated to include newsletter logic)

function normalizeLink(link) {
    if (!link) return '';
    let normalized = link.replace(/;jsessionid=[^?#]*/, '');
    if (normalized.includes('?')) {
        const urlObj = new URL(normalized);
        const params = urlObj.searchParams;
        const newParams = new URLSearchParams();
        if (params.has('b_idx')) newParams.set('b_idx', params.get('b_idx'));
        if (params.has('internId')) newParams.set('internId', params.get('internId'));
        if (params.has('id')) newParams.set('internId', params.get('id'));
        if (params.has('youthId')) newParams.set('youthId', params.get('youthId'));
        const queryString = newParams.toString();
        return queryString ? `${urlObj.origin}${urlObj.pathname}?${queryString}` : `${urlObj.origin}${urlObj.pathname}`;
    }
    return normalized;
}

function parseEtri(html) {
    const posts = [];
    const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/);
    if (tbodyMatch) {
        const rows = tbodyMatch[1].match(/<tr>([\s\S]*?)<\/tr>/g);
        if (rows) {
            rows.forEach(row => {
                const titleMatch = row.match(/<a[^>]*?>([\s\S]*?)<\/a>/);
                const linkMatch = row.match(/href="([^"]*?)"/);
                const dateMatch = row.match(/\d{4}-\d{2}-\d{2}/);
                if (titleMatch && linkMatch) {
                    posts.push({
                        title: titleMatch[1].replace(/<[^>]*>?/gm, '').trim(),
                        link: 'https://www.etri.re.kr' + linkMatch[1],
                        date: dateMatch ? dateMatch[0] : 'N/A'
                    });
                }
            });
        }
    }
    return posts;
}

function parseBtp(html) {
    const posts = [];
    const rows = html.match(/<tr>([\s\S]*?)<\/tr>/g);
    if (rows) {
        rows.forEach(row => {
            if (row.includes('부산지역인재')) {
                const titleMatch = row.match(/<a[^>]*?>([\s\S]*?)<\/a>/);
                const linkMatch = row.match(/href="([^"]*?)"/);
                const dateMatch = row.match(/\d{4}-\d{2}-\d{2}/);
                if (titleMatch && linkMatch) {
                    posts.push({
                        title: titleMatch[1].replace(/<[^>]*>?/gm, '').trim(),
                        link: 'https://www.btp.or.kr' + linkMatch[1].replace(/&amp;/g, '&'),
                        date: dateMatch ? dateMatch[0] : 'N/A'
                    });
                }
            }
        });
    }
    return posts;
}

function parseYouth(html) {
    const posts = [];
    const rows = html.match(/<tr[^>]*?>([\s\S]*?)<\/tr>/g);
    if (rows) {
        rows.forEach(row => {
            const titleMatch = row.match(/<a[^>]*?>([\s\S]*?)<\/a>/);
            const idMatch = row.match(/fn_selectYouthInternDetail\s*\(\s*'([^']+)'/);
            const periodMatch = row.match(/\d{4}\.\d{2}\.\d{2}\s*~\s*\d{4}\.\d{2}\.\d{2}/);
            const orgMatch = row.match(/<td[^>]*?class="org"[^>]*?>([\s\S]*?)<\/td>/) || row.match(/<td[^>]*?>([^<]*?)<\/td>/g);

            if (titleMatch && idMatch) {
                let org = 'N/A';
                if (orgMatch && orgMatch.length > 2) {
                    org = orgMatch[2].replace(/<[^>]*>?/gm, '').trim();
                }
                const youthId = idMatch[1];
                posts.push({
                    title: titleMatch[1].replace(/<[^>]*>?/gm, '').trim(),
                    link: `https://www.2030db.go.kr/user/youthIntern/selectYouthInternDetail.do?youthId=${youthId}`,
                    period: periodMatch ? periodMatch[0] : 'N/A',
                    org: org
                });
            }
        });
    }
    return posts;
}

// --- Email Notification ---

function generateHtml(userResults, userName) {
    let html = `
    <div style="font-family: 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #333; border-bottom: 2px solid #1a73e8; padding-bottom: 10px;">🚀 ${userName}님을 위한 커리어 뉴스레터</h2>
    `;

    let totalNew = 0;
    Object.keys(userResults).forEach(siteName => {
        const posts = userResults[siteName];
        totalNew += posts.length;
        const hasNew = posts.length > 0;
        const headerColor = hasNew ? '#1a73e8' : '#808080';
        const statusText = hasNew ? `● [NEW] ${posts.length}건` : '○ [No Updates]';

        html += `
        <div style="margin-top: 30px;">
            <h3 style="background-color: ${headerColor}; color: white; padding: 10px; margin: 0;">${siteName} ${statusText}</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                <thead>
                    <tr style="background-color: #f2f2f2; text-align: left;">
                        <th style="padding: 10px; border: 1px solid #ddd;">제목</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">정보</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">링크</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (posts.length === 0) {
            html += `<tr><td colspan="3" style="padding: 15px; border: 1px solid #ddd; text-align: center; color: #999;">새로운 소식이 없습니다.</td></tr>`;
        } else {
            posts.forEach(post => {
                html += `<tr>`;
                html += `<td style="padding: 10px; border: 1px solid #ddd;">${post.title}</td>`;
                html += `<td style="padding: 10px; border: 1px solid #ddd;">${post.date || post.period || 'N/A'}</td>`;
                html += `<td style="padding: 10px; border: 1px solid #ddd;"><a href="${post.link}" style="color: #1a73e8; text-decoration: none; font-weight: bold;">상세보기</a></td>`;
                html += `</tr>`;
            });
        }

        html += `</tbody></table></div>`;
    });

    html += `
        <p style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">
            본 메일은 구독하신 사이트의 정보를 기반으로 자동 발송되었습니다.<br>
            발송 시각: ${new Date().toLocaleString('ko-KR')}
        </p>
    </div>
    `;

    return { html, totalNew };
}

async function sendEmail(to, userName, userResults) {
    if (Object.keys(userResults).length === 0) {
        throw new Error(`No monitoring sites are connected to ${to}; refusing to send an empty job email.`);
    }
    const { html, totalNew } = generateHtml(userResults, userName);
    const subject = totalNew > 0
        ? `[주간 공고] ${userName}님, 신규 공고 ${totalNew}건이 있습니다!`
        : `[주간 공고] 이번 주 신규 공고가 없습니다`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: html
    });
}

// --- Main Logic ---

async function monitor() {
    console.log('Starting Service Monitor...');

    // 1. Fetch Subscribers & Sites
    const { data: subscribers, error: subError } = await supabase
        .from('subscribers')
        .select(`
            *,
            monitoring_sites (*)
        `)
        .eq('is_active', true);

    if (subError) {
        console.error('Error fetching subscribers:', subError);
        return;
    }

    if (!subscribers || subscribers.length === 0) {
        console.log('No active subscribers found.');
        return;
    }

    // Legacy single-user data may have monitoring_sites.subscriber_id = null.
    // Use those rows only when there is exactly one active subscriber, so a
    // broken foreign key cannot produce an empty email or leak data to others.
    if (subscribers.length === 1 && subscribers[0].monitoring_sites.length === 0) {
        const { data: orphanSites, error: orphanError } = await supabase
            .from('monitoring_sites')
            .select('*')
            .is('subscriber_id', null);
        if (orphanError) throw orphanError;
        if (orphanSites?.length) {
            console.warn(`Using ${orphanSites.length} legacy monitoring site(s) with no subscriber_id.`);
            subscribers[0].monitoring_sites = orphanSites;
        }
    }

    // GitHub Actions runs in UTC, so determine the weekly delivery day in KST.
    const isMonday = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Seoul',
        weekday: 'short'
    }).format(new Date()) === 'Mon';
    let dataCache = {};
    let htmlCache = {};
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    // 2. The industry newsletter is collected and sent every day.
    try {
        const newsData = await scrapeNews(context);
        const insight = '오늘의 과학·AI·방산 분야 주요 소식을 전해드립니다.';
        for (const subscriber of subscribers) {
            await sendNewsletter(subscriber.email, subscriber.user_name || '회원', newsData, insight);
            console.log(`Daily newsletter sent to ${subscriber.email}`);
        }
    } catch (error) {
        console.error('Daily newsletter failed:', error);
    }

    // 3. Recruitment sites are collected and mailed once a week on Monday.
    if (isMonday) {
        console.log('Monday detected. Starting site scraping...');

        // --- Static/Regex Sites ---
        // Scrape ETRI
        try {
            const page = await context.newPage();
            await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });
            await page.goto('https://www.etri.re.kr/kor/bbs/list.etri?b_board_id=ETRI39', { waitUntil: 'domcontentloaded' });
            htmlCache['etri'] = await page.content();
            await page.close();
        } catch (e) { console.error('ETRI scrape failed'); }

        // Scrape BTP
        try {
            const page = await context.newPage();
            await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });
            await page.goto('https://www.btp.or.kr/index.php?pCode=MN2000192', { waitUntil: 'domcontentloaded' });
            htmlCache['btp'] = await page.content();
            await page.close();
        } catch (e) { console.error('BTP scrape failed'); }

        // Scrape Youth
        try {
            const page = await context.newPage();
            await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });
            await page.goto('https://www.2030db.go.kr/user/youthIntern/selectYouthInternList.do', { waitUntil: 'domcontentloaded' });
            htmlCache['youth'] = await page.content();
            await page.close();
        } catch (e) { console.error('Youth scrape failed'); }

        // --- Dynamic/Evaluate Sites ---
        // Scrape Lig
        try {
            const page = await context.newPage();
            await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });
            await page.goto('https://ligdna.recruiter.co.kr/app/jobnotice/list', { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('li', { timeout: 10000 }).catch(() => {});
            dataCache['lig_data'] = await page.evaluate(() => {
                const results = [];
                document.querySelectorAll('li').forEach(li => {
                    const linkAnchor = li.querySelector('a[href*="/app/jobnotice/view"]');
                    if (linkAnchor && li.innerText.includes('접수중')) {
                        const title = linkAnchor.innerText.trim();
                        if (title.includes('신입')) {
                            const dateMatch = li.innerText.match(/\d{4}\.\d{2}\.\d{2}/);
                            results.push({ title, link: linkAnchor.href, date: dateMatch ? dateMatch[0] : 'N/A' });
                        }
                    }
                });
                return results;
            });
            await page.close();
        } catch (e) { console.error('Lig scrape failed'); }

        // Scrape Hanwha
        try {
            const page = await context.newPage();
            await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });
            await page.goto('https://www.hanwhain.com/portal/apply/recruit', { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(5000);
            dataCache['hanwha_data'] = await page.evaluate(() => {
                const results = [];
                document.querySelectorAll('li').forEach(li => {
                    const affiliate = li.querySelector('.affiliate-name')?.innerText || '';
                    const title = li.querySelector('.recruit-title')?.innerText || '';
                    if ((affiliate.includes('한화시스템') || affiliate.includes('한화에어로스페이스')) && title.includes('신입')) {
                        const dateMatch = li.innerText.match(/\d{4}\.\d{2}\.\d{2}/);
                        results.push({ title: `[${affiliate}] ${title}`, link: 'https://www.hanwhain.com/portal/apply/recruit', date: dateMatch ? dateMatch[0] : 'N/A' });
                    }
                });
                return results;
            });
            await page.close();
        } catch (e) { console.error('Hanwha scrape failed'); }

        // Scrape KoreaAero
        try {
            const page = await context.newPage();
            await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });
            await page.goto('https://koreaaero.recruiter.co.kr/career/job', { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('li', { timeout: 10000 }).catch(() => {});
            dataCache['kai_data'] = await page.evaluate(() => {
                const results = [];
                document.querySelectorAll('li').forEach(li => {
                    const linkAnchor = li.querySelector('a[href*="/career/jobs/"]');
                    if (linkAnchor && li.innerText.includes('접수중')) {
                        const title = li.innerText.split('\n')[0].trim();
                        if (title.includes('신입')) {
                            const dateMatch = li.innerText.match(/\d{4}\.\d{2}\.\d{2}/);
                            results.push({ title, link: linkAnchor.href, date: dateMatch ? dateMatch[0] : 'N/A' });
                        }
                    }
                });
                return results;
            });
            await page.close();
        } catch (e) { console.error('KoreaAero scrape failed'); }

    } else {
        console.log('Not Monday. Skipping site scraping.');
    }

    // 4. Build and send each subscriber's weekly recruitment digest.
    if (isMonday) {
        for (const subscriber of subscribers) {
            console.log(`Processing weekly jobs for: ${subscriber.email}`);
            const userResults = {};

            for (const site of subscriber.monitoring_sites) {
                let posts = [];
                if (site.url.includes('etri.re.kr') && htmlCache.etri) {
                    posts = parseEtri(htmlCache.etri);
                } else if (site.url.includes('btp.or.kr') && htmlCache.btp) {
                    posts = parseBtp(htmlCache.btp);
                } else if (site.url.includes('2030db.go.kr') && htmlCache.youth) {
                    posts = parseYouth(htmlCache.youth);
                } else if (site.url.includes('ligdna.recruiter.co.kr')) {
                    posts = dataCache.lig_data || [];
                } else if (site.url.includes('hanwhain.com')) {
                    posts = dataCache.hanwha_data || [];
                } else if (site.url.includes('koreaaero.recruiter.co.kr')) {
                    posts = dataCache.kai_data || [];
                }

                const newPosts = [];
                for (const post of posts) {
                    const normalizedLink = normalizeLink(post.link);
                    const { data: existing, error: historyError } = await supabase
                        .from('crawl_history')
                        .select('id')
                        .eq('site_id', site.id)
                        .eq('job_link', normalizedLink)
                        .maybeSingle();
                    if (historyError) throw historyError;

                    if (!existing) {
                        newPosts.push({ ...post, link: normalizedLink });
                    }
                }
                userResults[site.site_name] = newPosts;
            }

            try {
                await sendEmail(subscriber.email, subscriber.user_name || '회원', userResults);

                // Mark posts as sent only after SMTP succeeds.
                for (const site of subscriber.monitoring_sites) {
                    for (const post of userResults[site.site_name] || []) {
                        const { error: insertError } = await supabase.from('crawl_history').insert({
                            site_id: site.id,
                            job_title: post.title.trim(),
                            job_link: post.link
                        });
                        if (insertError && insertError.code !== '23505') throw insertError;
                    }
                }
                console.log(`Weekly job digest sent to ${subscriber.email}`);
            } catch (error) {
                console.error(`Weekly job digest failed for ${subscriber.email}:`, error);
            }
        }
    }

    await context.close();
    await browser.close();
    console.log('Monitor run completed.');
}

if (require.main === module) {
    monitor().catch(error => {
        console.error('Fatal monitor error:', error);
        process.exitCode = 1;
    });
}

module.exports = {
    filterAndSort,
    normalizeLink,
    parseEtri,
    parseBtp,
    parseYouth,
    generateHtml
};
