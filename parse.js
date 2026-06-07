const fs = require('fs');
const path = require('path');

// 요일 체크 (금요일: 5, 토요일: 6)
const now = new Date();
const dayOfWeek = now.getDay();
if (dayOfWeek === 5 || dayOfWeek === 6) {
    console.log(`Today is ${dayOfWeek === 5 ? 'Friday' : 'Saturday'}. Monitoring is skipped per policy.`);
    process.exit(0);
}

const HISTORY_FILE = 'history.json';

// 히스토리 로드
function loadHistory() {
    if (fs.existsSync(HISTORY_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        } catch (e) {
            console.error('Error loading history:', e);
            return { etri: [], btp: [], youth: [] };
        }
    }
    return { etri: [], btp: [], youth: [] };
}

// 히스토리 저장
function saveHistory(history) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
}

// 링크 정규화: jsessionid 제거 및 핵심 파라미터(b_idx, internId)만 유지
function normalizeLink(link) {
    if (!link) return '';
    // 1. jsessionid 부분만 제거 (뒤의 쿼리 스트링은 보존)
    let normalized = link.replace(/;jsessionid=[^?#]*/, '');
    
    if (normalized.includes('?')) {
        const [base, search] = normalized.split('?');
        const params = new URLSearchParams(search);
        const newParams = new URLSearchParams();
        
        // 핵심 식별자만 보존
        if (params.has('b_idx')) newParams.set('b_idx', params.get('b_idx'));
        if (params.has('internId')) newParams.set('internId', params.get('internId'));
        
        const queryString = newParams.toString();
        return queryString ? `${base}?${queryString}` : base;
    }
    return normalized;
}

function parseEtri() {
    if (!fs.existsSync('etri.html')) return [];
    const html = fs.readFileSync('etri.html', 'utf8');
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

function parseBtp() {
    if (!fs.existsSync('btp.html')) return [];
    const html = fs.readFileSync('btp.html', 'utf8');
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

function parseYouth() {
    if (!fs.existsSync('youth.html')) return [];
    const html = fs.readFileSync('youth.html', 'utf8');
    const posts = [];
    const rows = html.match(/<tr[^>]*?>([\s\S]*?)<\/tr>/g);
    if (rows) {
        rows.forEach(row => {
            const titleMatch = row.match(/<a[^>]*?>([\s\S]*?)<\/a>/);
            const linkMatch = row.match(/href="([^"]*?)"/);
            const periodMatch = row.match(/\d{4}\.\d{2}\.\d{2}\s*~\s*\d{4}\.\d{2}\.\d{2}/);
            const orgMatch = row.match(/<td[^>]*?class="org"[^>]*?>([\s\S]*?)<\/td>/) || row.match(/<td[^>]*?>([^<]*?)<\/td>/g);
            
            if (titleMatch && linkMatch) {
                let org = 'N/A';
                if (orgMatch && orgMatch.length > 2) {
                    org = orgMatch[2].replace(/<[^>]*>?/gm, '').trim();
                }
                posts.push({
                    title: titleMatch[1].replace(/<[^>]*>?/gm, '').trim(),
                    link: 'https://www.2030db.go.kr' + linkMatch[1],
                    period: periodMatch ? periodMatch[0] : 'N/A',
                    org: org
                });
            }
        });
    }
    return posts;
}

const history = loadHistory();
const currentResults = {
    etri: parseEtri(),
    btp: parseBtp(),
    youth: parseYouth()
};

const newResults = {
    etri: [],
    btp: [],
    youth: []
};

// 중복 제거 및 신규 항목 추출
Object.keys(currentResults).forEach(site => {
    if (!history[site]) history[site] = [];
    currentResults[site].forEach(post => {
        const normalizedLink = normalizeLink(post.link);
        const cleanTitle = post.title.trim();
        const postKey = `${cleanTitle}_${normalizedLink}`;
        if (!history[site].includes(postKey)) {
            newResults[site].push(post);
            history[site].push(postKey);
        }
    });
});

// 결과 저장
fs.writeFileSync('results.json', JSON.stringify(currentResults, null, 2), 'utf8');
fs.writeFileSync('new_results.json', JSON.stringify(newResults, null, 2), 'utf8');
saveHistory(history);

console.log('--- Monitoring Report ---');
console.log(`ETRI: ${newResults.etri.length} new posts`);
console.log(`BTP: ${newResults.btp.length} new posts`);
console.log(`Youth: ${newResults.youth.length} new posts`);
console.log('-------------------------');
console.log('Successfully updated results.json, new_results.json and history.json');
