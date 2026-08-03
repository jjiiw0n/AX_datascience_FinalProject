# 이메일 발송 방식 복구 전략

현재 시스템은 토큰 절감을 위해 `nodemailer`를 사용하여 SMTP 방식으로 이메일을 직접 발송합니다. 만약 AI 기반 이메일 발송(`notify_ai.js`)으로 되돌리고 싶다면 다음 단계를 수행하세요.

## 복구 단계

1. **파일 교체:**
   - `legacy/pipeline/notify.js`를 다른 이름으로 백업합니다 (예: `notify_smtp.js`).
   - 백업해 두었던 `legacy/pipeline/notify_ai.js`의 내용을 `legacy/pipeline/notify.js`에 덮어씁니다.
     ```bash
     cp legacy/pipeline/notify_ai.js legacy/pipeline/notify.js
     ```

2. **의존성 정리 (선택 사항):**
   - 더 이상 사용하지 않게 된 `nodemailer`와 `dotenv`를 제거할 수 있습니다.
     ```bash
     npm uninstall nodemailer dotenv
     ```

3. **기타 설정:**
   - `.env` 파일은 그대로 두어도 무방하지만, 보안을 위해 삭제해도 됩니다.

이제 다시 Gemini CLI를 통해 이메일이 발송되는 구조로 복구됩니다.
