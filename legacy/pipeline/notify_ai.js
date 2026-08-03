const fs = require('fs');
const { execSync } = require('child_process');

function generateHtml(newResults) {
    let html = `
    <div style="font-family: 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #333; border-bottom: 2px solid #1a73e8; padding-bottom: 10px;">🚀 웹 모니터링 통합 리포트</h2>
    `;

    const sites = [
        { key: 'etri', name: 'ETRI 한국전자통신연구원', cols: ['제목', '날짜', '링크'] },
        { key: 'btp', name: 'BTP 부산테크노파크 (부산지역인재)', cols: ['제목', '날짜', '링크'] },
        { key: 'youth', name: '2030 청년인턴 모집', cols: ['제목', '기간', '기관', '링크'] }
    ];

    let totalNew = 0;

    sites.forEach(site => {
        const posts = newResults[site.key] || [];
        totalNew += posts.length;
        const hasNew = posts.length > 0;
        const headerColor = hasNew ? '#1a73e8' : '#808080';
        const statusText = hasNew ? `● [NEW] ${posts.length}건` : '○ [No Updates]';

        html += `
        <div style="margin-top: 30px;">
            <h3 style="background-color: ${headerColor}; color: white; padding: 10px; margin: 0;">${site.name} ${statusText}</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                <thead>
                    <tr style="background-color: #f2f2f2; text-align: left;">
        `;

        site.cols.forEach(col => {
            html += `<th style="padding: 10px; border: 1px solid #ddd;">${col}</th>`;
        });

        html += `
                    </tr>
                </thead>
                <tbody>
        `;

        if (posts.length === 0) {
            html += `<tr><td colspan="${site.cols.length}" style="padding: 15px; border: 1px solid #ddd; text-align: center; color: #999;">새로운 공고가 없습니다.</td></tr>`;
        } else {
            posts.forEach(post => {
                html += `<tr>`;
                html += `<td style="padding: 10px; border: 1px solid #ddd;">${post.title}</td>`;
                html += `<td style="padding: 10px; border: 1px solid #ddd;">${post.date || post.period || 'N/A'}</td>`;
                if (site.key === 'youth') {
                    html += `<td style="padding: 10px; border: 1px solid #ddd;">${post.org || 'N/A'}</td>`;
                }
                html += `<td style="padding: 10px; border: 1px solid #ddd;"><a href="${post.link}" style="color: #1a73e8; text-decoration: none; font-weight: bold;">상세보기</a></td>`;
                html += `</tr>`;
            });
        }

        html += `
                </tbody>
            </table>
        </div>
        `;
    });

    html += `
        <p style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">
            본 메일은 시스템에 의해 자동으로 발송되었습니다.<br>
            발송 시각: ${new Date().toLocaleString('ko-KR')}
        </p>
    </div>
    `;

    return { html, totalNew };
}

const NEW_RESULTS_FILE = 'data/legacy/new_results.json';
if (!fs.existsSync(NEW_RESULTS_FILE)) {
    console.log('new_results.json not found. Skipping notification.');
    process.exit(0);
}

const newResults = JSON.parse(fs.readFileSync(NEW_RESULTS_FILE, 'utf8'));
const { html, totalNew } = generateHtml(newResults);

const subject = totalNew > 0 
    ? `[통합 알림] ● 신규 공고 ${totalNew}건이 발견되었습니다!` 
    : `[통합 알림] ○ 오늘자 모니터링 결과 (신규 소식 없음)`;

console.log(`Sending email: ${subject}`);

// HTML 본문을 파일로 저장
fs.writeFileSync('data/legacy/email_body.html', html, 'utf8');

try {
    // gemini-cli를 사용하여 메일 발송
    // UTF-8 명시 및 HTML 형식을 강조하는 프롬프트로 수정
    const command = `gemini.cmd -y "jeew0n.lee.217@gmail.com 계정으로 이메일을 보내줘. 제목은 '${subject}'이야. 본문은 'data/legacy/email_body.html' 파일 안에 들어있어. 이 파일은 UTF-8로 저장되어 있고 HTML 형식이니, 글자가 깨지지 않게 주의해서 HTML 메일로 보내줘."`;
    execSync(command);
    console.log('Email sent successfully via Gemini CLI.');
} catch (error) {
    console.error('Failed to send email:', error);
} finally {
    if (fs.existsSync('data/legacy/email_body.html')) fs.unlinkSync('data/legacy/email_body.html');
}
