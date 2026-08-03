# Legacy data

Supabase 전환 전에 사용한 로컬 파일 기반 파이프라인의 데이터 영역입니다.

`*.example.*` 파일은 당시 데이터 형식을 보존한 예시이며, 현재 GitHub Actions 운영에는 사용되지 않습니다. `legacy/pipeline/`을 실행하면 예시 이름에서 `.example`을 뺀 런타임 파일이 이 디렉터리에 생성됩니다. 런타임 파일은 `.gitignore`로 제외됩니다.

`news_selected.corrupt.txt`는 기존 저장소에 있던 손상된 JSON 원문을 자료 보존 목적으로 이름만 명확히 바꾼 파일입니다. 실행 입력으로 사용하면 안 됩니다.
