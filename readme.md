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

# 📚 MCP를 활용한 챗봇 구축기 시리즈 목차

아래는 본 블로그 시리즈의 전체 구성입니다. 각 편은 단계적으로 MCP 기반 챗봇을 구현해가는 여정을 설명합니다:

---

### 1️⃣ [MCP를 활용한 챗봇 구축기 - 장대한 서막 (1/6)](https://pm2makeq.tistory.com/manage/posts/#:~:text=MCP%EB%A5%BC%20%ED%99%9C%EC%9A%A9%ED%95%9C%20%EC%B1%97%EB%B4%87%20%EA%B5%AC%EC%B6%95%EA%B8%B0%20%2D%20%EC%9E%A5%EB%8C%80%ED%95%9C%20%EC%84%9C%EB%A7%89%20(1/6))

### 2️⃣ [MCP를 활용한 챗봇 구축기 - RestAPI를 적용 (2/6)](https://pm2makeq.tistory.com/manage/posts/#:~:text=MCP%EB%A5%BC%20%ED%99%9C%EC%9A%A9%ED%95%9C%20%EC%B1%97%EB%B4%87%20%EA%B5%AC%EC%B6%95%EA%B8%B0%20%2D%20RestAPI%EB%A5%BC%20%EC%A0%81%EC%9A%A9%20(2/6))

### 3️⃣ [MCP를 활용한 챗봇 구축기 - MCP 툴 기반으로 확장해보기 개요 (3/6)](https://pm2makeq.tistory.com/manage/posts/#:~:text=MCP%EB%A5%BC%20%ED%99%9C%EC%9A%A9%ED%95%9C%20%EC%B1%97%EB%B4%87%20%EA%B5%AC%EC%B6%95%EA%B8%B0%20%2D%20MCP%20%ED%88%B4%20%EA%B8%B0%EB%B0%98%EC%9C%BC%EB%A1%9C%20%ED%99%95%EC%9E%A5%ED%95%B4%EB%B3%B4%EA%B8%B0%20%EA%B0%9C%EC%9A%94%20(3/6))

### 4️⃣ [MCP를 활용한 챗봇 구축기 - 클라이언트 편 (4/6)](https://pm2makeq.tistory.com/manage/posts/#:~:text=MCP%EB%A5%BC%20%ED%99%9C%EC%9A%A9%ED%95%9C%20%EC%B1%97%EB%B4%87%20%EA%B5%AC%EC%B6%95%EA%B8%B0%20%2D%20%ED%81%B4%EB%9D%BC%EC%9D%B4%EC%96%B8%ED%8A%B8%20%ED%8E%B8%20(4/6))

### 5️⃣ [MCP를 활용한 챗봇 구축기 - REST API 서버 편 (5/6)](https://pm2makeq.tistory.com/manage/posts/#:~:text=MCP%EB%A5%BC%20%ED%99%9C%EC%9A%A9%ED%95%9C%20%EC%B1%97%EB%B4%87%20%EA%B5%AC%EC%B6%95%EA%B8%B0%20%2D%20REST%20API%20%EC%84%9C%EB%B2%84%20%ED%8E%B8%20(5/6))

### 6️⃣ [MCP를 활용한 챗봇 구축기 - MCP 서버 편 (6/6)](https://pm2makeq.tistory.com/manage/posts/#:~:text=MCP%EB%A5%BC%20%ED%99%9C%EC%9A%A9%ED%95%9C%20%EC%B1%97%EB%B4%87%20%EA%B5%AC%EC%B6%95%EA%B8%B0%20%2D%20MCP%20%EC%84%9C%EB%B2%84%20%ED%8E%B8%20(6/6))

---
