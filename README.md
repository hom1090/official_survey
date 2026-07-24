# Executive AI Hands-on 사전 설문

Vercel 배포를 위한 표준 Next.js 애플리케이션입니다. 설문 제출은 서버의
`/api/submit` 경로를 거쳐 Google Apps Script로 전달됩니다.

## 로컬 실행

Node.js 22 이상과 프로젝트 루트의 `.env.local` 파일이 필요합니다.

```env
APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

```bash
npm install
npm run dev
```

## Vercel 배포

1. 이 저장소를 GitHub에 푸시합니다.
2. Vercel에서 저장소를 Import하고 Framework Preset을 `Next.js`로 둡니다.
3. Project Settings → Environment Variables에 `APPS_SCRIPT_URL`을 등록합니다.
4. Production, Preview, Development 환경에 적용한 뒤 배포합니다.

별도의 Build Command나 Output Directory를 지정하지 않습니다. Vercel의
Next.js 기본값인 `npm run build`와 `.next`를 사용합니다.

## 주요 명령

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm test`: 빌드 및 설문 전송 구조 검증
- `npm run lint`: 코드 정적 검사
