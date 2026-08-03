const fs = require('fs');
const { execSync } = require('child_process');

async function summarizeNews() {
    console.log('Starting AI Insight Generation (Lightweight)...');
    
    if (!fs.existsSync('news_selected.json')) {
        console.error('news_selected.json not found!');
        return;
    }

    const rawData = fs.readFileSync('news_selected.json', 'utf8');
    const news = JSON.parse(rawData);

    // AI에게는 전체 요약이 아닌, 이번 주의 전반적인 흐름을 짚어주는 키워드 리스트 요청 (매우 빠름)
    const promptData = `
아래 뉴스 제목들을 보고, 이번 주 산업 동향을 관통하는 핵심 키워드 5~7개를 선정해줘.
형식은 반드시 '산업 동향: 키워드1, 키워드2, 키워드3, ...' 형태로만 작성해줘.

[뉴스 목록]
${[...news.science, ...news.ai, ...news.defense].map(n => n.title).join('\n')}
    `;

    try {
        fs.writeFileSync('news_insight_prompt.txt', promptData, 'utf8');
        const command = `gemini.cmd -y "첨부된 'news_insight_prompt.txt'의 뉴스들을 보고 이번 주 산업 동향을 '산업 동향: 키워드1, 키워드2, ...' 형식으로만 작성해줘."`;
        const insight = execSync(command, { encoding: 'utf8' }).trim();
        
        fs.writeFileSync('news_insight.txt', insight, 'utf8');
        console.log('Successfully saved AI insight.');
    } catch (error) {
        console.error('Failed to generate AI insight:', error);
        fs.writeFileSync('news_insight.txt', '이번 주 최신 산업 및 기술 동향을 전해드립니다.', 'utf8');
    }
}

summarizeNews();
