---
name: site-lig
description: Monitors LIG Recruitment board for new posts.
---

# LIG Recruitment Monitoring

## 📋 Target Site
- **LIG Recruitment:** [Link](https://ligdna.recruiter.co.kr/app/jobnotice/list)

## 🛠 Collection Logic
1. **Navigate:** Go to the LIG recruitment board.
2. **Filter:** Search for '신입' keyword.
3. **Extract:** Scrape the table rows (Title, Date, Link).
4. **Database (History):** Compare with previous results in `crawl_history`.

## 🎨 Notification Standard (Template)
- **Report Section Title:** `[LIG] LIG 채용 공고`
- **HTML Layout:** Standard table format (Title, Date, Link).
