const fs = require('fs');

function parseEtri() {
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

const results = {
    etri: parseEtri(),
    btp: parseBtp(),
    youth: parseYouth()
};

fs.writeFileSync('results.json', JSON.stringify(results, null, 2), 'utf8');
console.log('Successfully wrote results to results.json');
