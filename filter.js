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

// 링크 정규화: jsessionid 제거 및 핵심 파라미터(b_idx, internId, id)만 유지
function normalizeLink(link) {
    if (!link) return '';
    // 2030db.go.kr 목록 페이지는 그대로 반환
    if (link.includes('selectYouthInternList.do')) return link;
    
    // 1. jsessionid 부분만 제거
    let normalized = link.replace(/;jsessionid=[^?#]*/, '');
    
    if (normalized.includes('?')) {
        const urlObj = new URL(normalized);
        const params = urlObj.searchParams;
        const newParams = new URLSearchParams();
        
        // 핵심 식별자 보존 (id 추가)
        if (params.has('b_idx')) newParams.set('b_idx', params.get('b_idx'));
        if (params.has('internId')) newParams.set('internId', params.get('internId'));
        if (params.has('id')) newParams.set('internId', params.get('id')); // id도 internId로 통일하여 체크
        
        const queryString = newParams.toString();
        return queryString ? `${urlObj.origin}${urlObj.pathname}?${queryString}` : `${urlObj.origin}${urlObj.pathname}`;
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

// 30일(밀리초) 계산
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const now = Date.now();

// 중복 제거 및 신규 항목 추출
Object.keys(currentResults).forEach(site => {
    if (!history[site]) history[site] = [];
    
    // 1. 오래된 데이터 삭제 (30일 초과) 및 구조 마이그레이션 (기존 string -> object)
    history[site] = history[site].filter(record => {
        // 기존 포맷(string)일 경우, 안전하게 유지하기 위해 오래되지 않은 것으로 간주
        if (typeof record === 'string') return true;
        // 새 포맷(object)일 경우, timestamp 확인
        return (now - record.timestamp) < ONE_MONTH_MS;
    });

    const siteData = currentResults[site];
    if (Array.isArray(siteData)) {
        siteData.forEach(post => {
            const normalizedLink = normalizeLink(post.link);
            const cleanTitle = post.title.trim();
            const postKey = `${cleanTitle}_${normalizedLink}`;
            
            // history에 이미 존재하는지 확인 (기존 string포맷과 새 object 포맷 모두 대응)
            const isExists = history[site].some(record => 
                (typeof record === 'string' && record === postKey) || 
                (typeof record === 'object' && record.key === postKey)
            );

            if (!isExists) {
                newResults[site].push(post);
                history[site].push({ key: postKey, timestamp: now });
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
