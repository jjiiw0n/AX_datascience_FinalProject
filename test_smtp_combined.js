require('dotenv').config();
const fs = require('fs');
const nodemailer = require('nodemailer');

async function sendCombinedTest() {
    console.log('Preparing Combined SMTP Test Email...');
    
    const jobResults = JSON.parse(fs.readFileSync('new_results.json', 'utf8'));
    const newsData = JSON.parse(fs.readFileSync('news_selected.json', 'utf8'));
    
    // 1. 뉴스레터 섹션 생성 (JSON 기반 링크 포함)
    let newsletterHtml = '';
    const categories = [
        { key: 'science', name: '과학' },
        { key: 'ai', name: 'AI/네트워크' },
        { key: 'defense', name: '방산/국방' }
    ];

    categories.forEach(cat => {
        newsletterHtml += `<h3 style="color: #2c3e50; margin-top: 25px;">📌 이번 주 ${cat.name} TOP 3</h3><ul style="list-style: none; padding: 0;">`;
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

    let html = `
    <div style="font-family: 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #eee; color: #333;">
        <h1 style="color: #1a73e8; text-align: center; border-bottom: 2px solid #1a73e8; padding-bottom: 15px;">🚀 주간 모니터링 & 뉴스레터 통합 리포트</h1>
        
        <div style="margin-top: 30px;">
            <h2 style="background-color: #1a73e8; color: white; padding: 10px; margin: 0;">📢 신규 채용 공고</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                <thead>
                    <tr style="background-color: #f2f2f2; text-align: left;">
                        <th style="padding: 10px; border: 1px solid #ddd;">구분</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">공고명</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">기관</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">링크</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // 공고 데이터 채우기
    const sites = [
        { key: 'etri', name: 'ETRI' },
        { key: 'btp', name: 'BTP' },
        { key: 'youth', name: '청년인턴' }
    ];

    sites.forEach(site => {
        const posts = jobResults[site.key] || [];
        if (posts.length === 0) {
            html += `<tr><td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: #999;">${site.name}</td><td colspan="3" style="padding: 10px; border: 1px solid #ddd; text-align: center; color: #999;">신규 소식 없음</td></tr>`;
        } else {
            posts.forEach(post => {
                html += `<tr>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${site.name}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${post.title}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${post.org || post.date || '-'}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;"><a href="${post.link}" style="color: #1a73e8; text-decoration: none; font-weight: bold;">보기</a></td>
                </tr>`;
            });
        }
    });

    html += `
                </tbody>
            </table>
        </div>

        <div style="margin-top: 50px; padding: 25px; background-color: #fcfcfc; border: 1px dashed #1a73e8; border-radius: 10px;">
            ${newsletterHtml}
        </div>

        <p style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">
            본 메일은 시스템에 의해 자동으로 발송된 통합 테스트 리포트입니다.<br>
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
        to: 'jeew0n.lee.217@gmail.com',
        subject: `[통합 테스트] 🚀 주간 공고 및 뉴스레터 (${new Date().toLocaleDateString()})`,
        html: html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Combined test email sent successfully via SMTP:', info.response);
    } catch (error) {
        console.error('Failed to send combined test email:', error);
    }
}

sendCombinedTest();
