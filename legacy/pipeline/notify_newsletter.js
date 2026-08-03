require('dotenv').config();
const fs = require('fs');
const nodemailer = require('nodemailer');

async function notifyNewsletter() {
    console.log('Generating Newsletter Email (Code-based)...');
    
    if (!fs.existsSync('data/legacy/new_results.json') || !fs.existsSync('data/legacy/news_selected.json')) {
        console.error('Data files not found!');
        return;
    }

    const jobResults = JSON.parse(fs.readFileSync('data/legacy/new_results.json', 'utf8'));
    const newsData = JSON.parse(fs.readFileSync('data/legacy/news_selected.json', 'utf8'));
    
    let insight = "이번 주 최신 산업 및 기술 동향을 전해드립니다.";
    if (fs.existsSync('data/legacy/news_insight.txt')) {
        insight = fs.readFileSync('data/legacy/news_insight.txt', 'utf8').trim();
    }

    const today = new Date().toLocaleDateString('ko-KR');

    // 뉴스레터 섹션 생성
    let newsletterHtml = '';
    const categories = [
        { key: 'science', name: '과학' },
        { key: 'ai', name: 'AI/네트워크' },
        { key: 'defense', name: '방산/국방' }
    ];

    categories.forEach(cat => {
        newsletterHtml += `<hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;">`; // 섹션 구분선 추가
        newsletterHtml += `<h3 style="color: #2c3e50; margin-top: 0;">📌 이번 주 ${cat.name} TOP 3</h3><ul style="list-style: none; padding: 0;">`;
        const articles = newsData[cat.key] || [];
        articles.forEach((art, i) => {
            newsletterHtml += `<li style="margin-top: 10px;">
                <a href="${art.link}" style="text-decoration: none; color: #333;">
                    <strong>${i+1}. ${art.title}</strong>
                </a>
            </li>`;
        });
        newsletterHtml += `</ul>`;
    });

    // 전체 HTML 구성 (테이블 구조 수정: 외부 컨테이너 테이블 제거)
    let html = `
    <div style="font-family: 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #eee; color: #333;">
        <h1 style="color: #1a73e8; text-align: center; border-bottom: 2px solid #1a73e8; padding-bottom: 15px;">🚀 주간 모니터링 & 뉴스레터 통합 리포트</h1>
        
        <div style="margin-top: 30px;">
            <h2 style="color: #333; margin-bottom: 15px;">📢 신규 채용 공고</h2>
    `;

    const sites = [
        { key: 'etri', name: 'ETRI' },
        { key: 'btp', name: 'BTP' },
        { key: 'youth', name: '청년인턴' }
    ];

    sites.forEach(site => {
        const posts = jobResults[site.key] || [];
        const hasNew = posts.length > 0;
        const headerColor = hasNew ? '#1a73e8' : '#808080';
        const headerStatus = hasNew ? `(신규 ${posts.length}건)` : '(신규 없음)';

        html += `
            <div style="margin-bottom: 20px;">
                <h3 style="background-color: ${headerColor}; color: white; padding: 10px; margin: 0; font-size: 15px;">
                    ${site.name} ${headerStatus}
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 0; border: 1px solid #ddd;">
        `;

        if (!hasNew) {
            html += `
                <tr><td style="padding: 10px; text-align: center; color: #888; font-size: 13px; border: 1px solid #ddd;">새로운 공고가 없습니다.</td></tr>
            `;
        } else {
            html += `
                <thead>
                    <tr style="background-color: #f2f2f2; text-align: left;">
                        <th style="padding: 8px; border: 1px solid #ddd; font-size: 12px; text-align: center;">구분</th>
                        <th style="padding: 8px; border: 1px solid #ddd; font-size: 12px;">공고명</th>
                        <th style="padding: 8px; border: 1px solid #ddd; font-size: 12px; text-align: center;">기관</th>
                        <th style="padding: 8px; border: 1px solid #ddd; font-size: 12px; text-align: center;">링크</th>
                    </tr>
                </thead>
                <tbody>
            `;
            posts.forEach(post => {
                html += `<tr>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; font-size: 13px; width: 60px;">${site.name}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; font-size: 13px; word-break: break-all;">${post.title}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-size: 13px; width: 70px;">${post.org || post.date || '-'}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-size: 13px; width: 50px;"><a href="${post.link}" style="color: #1a73e8; text-decoration: none; font-weight: bold;">보기</a></td>
                </tr>`;
            });
            html += `</tbody>`;
        }
        html += `</table></div>`;
    });

    html += `
        </div>

        <div style="margin-top: 50px; padding: 25px; background-color: #fcfcfc; border: 1px dashed #1a73e8; border-radius: 10px;">
             <p style="background-color: #f8f9fa; padding: 15px; border-left: 5px solid #1a73e8; font-style: italic; font-size: 1.1em;">
                "${insight}"
            </p>
            ${newsletterHtml}
        </div>

        <p style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">
            본 메일은 시스템에 의해 자동으로 발송됩니다.<br>
            발송 시각: ${new Date().toLocaleString('ko-KR')}
        </p>
    </div>
    `;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `[주간 뉴스레터] 🚀 이번 주 산업 동향 리포트 (${today})`,
        html: html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Newsletter sent successfully via SMTP:', info.response);
    } catch (error) {
        console.error('Failed to send newsletter:', error);
    }
}

notifyNewsletter();
