const fs = require('fs');
const { execSync } = require('child_process');

async function parseAll() {
    const sites = [
        { name: 'etri', file: 'etri.html' },
        { name: 'btp', file: 'btp.html' },
        { name: 'youth', file: 'youth.html' }
    ];

    const allResults = {};

    for (const site of sites) {
        if (!fs.existsSync(site.file)) {
            allResults[site.name] = [];
            continue;
        }

        console.log(`Parsing ${site.name} using AI...`);
        const html = fs.readFileSync(site.file, 'utf8');
        
        // HTML 크기를 줄이기 위해 핵심 본문(table 또는 tbody)만 추출
        let bodyContent = html;
        const tableMatch = html.match(/<table[\s\S]*?<\/table>/i);
        const tbodyMatch = html.match(/<tbody[\s\S]*?<\/tbody>/i);
        
        if (tbodyMatch) bodyContent = tbodyMatch[0];
        else if (tableMatch) bodyContent = tableMatch[0];

        const cleanHtml = bodyContent
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .substring(0, 15000); // 1.5만자면 리스트 파싱에 충분함

        try {
            // gemini-cli를 호출하여 JSON 추출
            const prompt = `다음 HTML에서 채용 공고 리스트를 추출해줘. JSON 형식 [{ "title": "...", "link": "...", "date": "...", "org": "..." }]으로만 답변해. 링크는 절대경로가 아니면 도메인(etri: https://www.etri.re.kr, btp: https://www.btp.or.kr, youth: https://www.2030db.go.kr)을 붙여줘. \n\nHTML:\n${cleanHtml}`;
            
            // 임시 프롬프트 파일 생성 (명령행 길이 제한 방지)
            fs.writeFileSync('temp_prompt.txt', prompt, 'utf8');
            
            const output = execSync('gemini.cmd -y "temp_prompt.txt 내용을 읽고 지시대로 JSON만 출력해줘"', { encoding: 'utf8' });
            
            // JSON 부분만 추출 (가끔 AI가 ```json ... ``` 을 붙일 수 있으므로)
            const jsonMatch = output.match(/\[\s*{[\s\S]*}\s*\]/);
            if (jsonMatch) {
                allResults[site.name] = JSON.parse(jsonMatch[0]);
            } else {
                console.error(`Failed to find JSON in AI output for ${site.name}`);
                allResults[site.name] = [];
            }
        } catch (error) {
            console.error(`Error parsing ${site.name}:`, error);
            allResults[site.name] = [];
        }
    }

    fs.writeFileSync('results.json', JSON.stringify(allResults, null, 2), 'utf8');
    console.log('Successfully saved results.json');
    
    // 임시 파일 삭제
    if (fs.existsSync('temp_prompt.txt')) fs.unlinkSync('temp_prompt.txt');
}

parseAll();
