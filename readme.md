# MCP Project

이 프로젝트는 Model Context Protocol (MCP)을 활용하여 AI 모델이 외부 도구 및 데이터를 안전하게 사용할 수 있도록 하는 MCP 서버의 데모 구현입니다.

## 📁 프로젝트 구조

- `.vscode/`: VSCode 설정 파일
- `public/`: 정적 파일 디렉토리
- `src/`: TypeScript 소스 코드 디렉토리
- `build-run.sh`: 빌드 및 실행 스크립트
- `package.json`: 프로젝트 메타데이터 및 의존성 관리
- `tsconfig.json`: TypeScript 컴파일러 설정

## ✅ 주요 기능

- MCP 서버 구현
- Express.js를 활용한 RESTful API 서버 구현
- 클라이언트로부터의 POST 요청을 처리하고, 요청 본문(message)을 기반으로 제미나이로 응답 반환(gemini-1.5-flash)
- TypeScript를 사용하여 정적 타입 검사 및 코드 품질 향상

## ⚙️ 설치 및 실행

1. 레포지토리 클론:
   ```bash
   git clone https://github.com/pm2makeq/mcp-project.git
   cd mcp-project
   ```

2. 의존성 설치:
   ```bash
   npm install
   ```

3. 환경 변수 설정:
   `.env` 파일을 생성하고 필요한 API 키를 설정합니다. 예:
   ```env
    GEMINI_API_KEY=본인의 제미나이 API KEY

    PG_HOST=0.0.0.0
    PG_PORT=port
    PG_USER=id
    PG_PASSWORD=password
    PG_DATABASE=database
    
    PORT=webserver port

   ```

4. 서버 실행:
   ```bash
   npm run dev
   ```

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
