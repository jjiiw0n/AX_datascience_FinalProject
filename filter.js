const fs = require('fs');

const HISTORY_FILE = 'history.json';
const RESULTS_FILE = 'results.json';
const NEW_RESULTS_FILE = 'new_results.json';

// 요일 체크 로직 (운영 시 필요하면 활성화)
// ...

function loadJson(file, defaultVal = {}) {
    if (fs.existsSync(file)) {
        try {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (e) {
            console.error(`Error loading ${file}:`, e);
            return defaultVal;
        }
    }
    return defaultVal;
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

const history = loadJson(HISTORY_FILE, { etri: [], btp: [], youth: [] });
const currentResults = loadJson(RESULTS_FILE, { etri: [], btp: [], youth: [] });

const newResults = {
    etri: [],
    btp: [],
    youth: []
};

// 중복 제거 및 신규 항목 추출
Object.keys(currentResults).forEach(site => {
    if (!history[site]) history[site] = [];
    
    const siteData = currentResults[site];
    if (Array.isArray(siteData)) {
        siteData.forEach(post => {
            const normalizedLink = normalizeLink(post.link);
            const cleanTitle = post.title.trim();
            const postKey = `${cleanTitle}_${normalizedLink}`;
            if (!history[site].includes(postKey)) {
                newResults[site].push(post);
                history[site].push(postKey);
            }
        });
    }
});

// 결과 저장
fs.writeFileSync(NEW_RESULTS_FILE, JSON.stringify(newResults, null, 2), 'utf8');
fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');

console.log('--- Filtering Report ---');
console.log(`ETRI: ${newResults.etri.length} new posts`);
console.log(`BTP: ${newResults.btp.length} new posts`);
console.log(`Youth: ${newResults.youth.length} new posts`);
console.log('-------------------------');
console.log('Successfully updated history.json and new_results.json');
