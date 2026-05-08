---
name: site-kt
description: Monitors KT Careers for new job postings.
---

# KT Careers Monitoring

## 📋 Target Site
- **KT Careers:** [Link](https://recruit.kt.com/careers)

## 🛠 Collection Logic
1. **Navigate:** Go to the KT Careers page.
2. **Extract:** Scrape the current job listings (Title, Period, Link).
3. **Database:** Compare with the Central DB (Google Doc).
4. **Action:** If new, append to DB and notify via Gmail.
