require('dotenv').config();
const fs = require('fs');
const { chromium } = require('playwright');
const nodemailer = require('nodemailer');
const supabase = require('./lib/supabase');

// --- Helpers & Parsers ---

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
    const { html, totalNew } = generateHtml(userResults, userName);
    const subject = totalNew > 0
        ? `[Career News] ● ${userName}님, 신규 공고 ${totalNew}건이 있습니다!`
        : `[Career News] ○ 오늘자 업데이트 소식 (신규 없음)`;

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

    // 2. Scrape Unique Sites
    // Only scrape on Mondays (day 1)
    const isMonday = new Date().getDay() === 1;
    let dataCache = {};
    let htmlCache = {};

    if (isMonday) {
        console.log('Monday detected. Starting site scraping...');
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();

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

        await browser.close();
    } else {
        console.log('Not Monday. Skipping site scraping.');
    }

    // 3. Process each subscriber
    for (const subscriber of subscribers) {
        console.log(`Processing subscriber: ${subscriber.email}`);
        const userResults = {};

        for (const site of subscriber.monitoring_sites) {
            let posts = [];
            if (site.url.includes('etri.re.kr') && htmlCache['etri']) {
                posts = parseEtri(htmlCache['etri']);
            } else if (site.url.includes('btp.or.kr') && htmlCache['btp']) {
                posts = parseBtp(htmlCache['btp']);
            } else if (site.url.includes('2030db.go.kr') && htmlCache['youth']) {
                posts = parseYouth(htmlCache['youth']);
            } else if (site.url.includes('ligdna.recruiter.co.kr')) {
                posts = dataCache['lig_data'] || [];
            } else if (site.url.includes('hanwhain.com')) {
                posts = dataCache['hanwha_data'] || [];
            } else if (site.url.includes('koreaaero.recruiter.co.kr')) {
                posts = dataCache['kai_data'] || [];
            }

            // Filter New Posts using DB
            const newPosts = [];
            for (const post of posts) {
                const normalizedLink = normalizeLink(post.link);
                const { data: existing } = await supabase
                    .from('crawl_history')
                    .select('id')
                    .eq('site_id', site.id)
                    .eq('job_link', normalizedLink)
                    .maybeSingle();

                if (!existing) {
                    newPosts.push(post);
                    await supabase.from('crawl_history').insert({ site_id: site.id, job_title: post.title.trim(), job_link: normalizedLink });
                }
            }
            userResults[site.site_name] = newPosts;
        }

        // 4. Send Notification
        try {
            await sendEmail(subscriber.email, subscriber.user_name || '회원', userResults);
            console.log(`Email sent to ${subscriber.email}`);
        } catch (e) {
            console.error(`Failed to notify ${subscriber.email}:`, e);
        }
    }

    console.log('Monitor run completed.');
}

monitor();
