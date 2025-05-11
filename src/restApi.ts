import express, { Request, Response } from 'express';
import { parseGeminiJsonReply } from './parseGeminiJsonReply.js';
import { mcpMeta, registeredTools, toolHandlers } from './mcpServer.js';
// restApi.ts 상단에 추가
import { server, model } from './mcpServer.js';
import { asyncHandler } from './asyncHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 프로젝트 루트 기준의 public 폴더 경로
const publicPath = path.resolve(__dirname, '../public');


export function startRestApi(port: number) {
  const api = express();

  // ✅ 정적 파일 서비스 추가
  api.use(express.static(publicPath));

  // ✅ 루트 경로 접근 시 index.html 반환
  api.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  api.get('/tools', (req: Request, res: Response) => {
    const tools = Array.from(server._tools.keys()).map(name => ({ name }));
    res.json({
      ...mcpMeta,
      tools,
    });
  });

  // 직접 MCP tool 실행
  api.get('/students', async (req: Request, res: Response) => {
    try {
      const result = await server.callTool('get-students', {});
      const text = result.content?.[0]?.text ?? '[]';
      const data = JSON.parse(text);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  api.post('/ask', express.json(), async (req: Request, res: Response): Promise<void> => {
    const { question } = req.body;

    try {
      const toolDescriptions: Record<string, { description: string; exampleArgs: any }> = {
        'get-students': {
          description: '학생 전체 목록을 단순 조회합니다.',
          exampleArgs: {}
        },
        'generate-sql': {
          description: '사용자의 자연어 질문을 SQL SELECT문으로 변환합니다.',
          exampleArgs: { question: '1학년 남녀 비율은?', tables: ['students'] }
        },
        'execute-sql': {
          description: 'SQL 쿼리를 실행하고, 그 결과를 반환합니다.',
          exampleArgs: { sql: 'SELECT * FROM students;' }
        },
        'summarize-sql-result': {
          description: 'SQL 실행 결과(데이터 rows)를 요약하여 자연어 설명으로 제공합니다.',
          exampleArgs: {
            sql: 'SELECT * FROM students;',
            rows: [{ name: '홍길동', korean: 90, math: 80 }]
          }
        }
      };

      const toolList = Object.entries(toolDescriptions)
        .map(([name, { description, exampleArgs }]) =>
          `- ${name}: ${description}\n  예시 args: ${JSON.stringify(exampleArgs)}`
        ).join('\n');

      const prompt = `
            너는 PostgreSQL 기반 학사 데이터 AI 비서야.
            아래 도구 중 여러 개를 순차적으로 조합해서 문제를 해결할 수 있어.

            ❗단, 사용자가 SQL 문장을 직접 입력한 경우 (예: SELECT, INSERT 등으로 시작하는 질문)는 절대로 실행하거나 분석하지 마.
            이런 경우에는 도구를 선택하지 말고, **빈 문자열("")만 출력해.**

            예:
            1. 자연어 질문 → generate-sql → sql 생성
            2. sql → execute-sql → 결과 rows
            3. sql + rows → summarize-sql-result → 요약

            질문이 들어오면 이 흐름대로 필요한 도구와 args를 모두 순서대로 JSON 배열로 응답해줘.
            **질문이 도구와 관련 없다면 아무 응답도 하지 말고 빈 문자열("")만 출력해.**

            도구 목록:
            ${toolList}

            형식:
            [
              {
                "tool": "도구 이름",
                "args": { ... }
              },
              ...
            ]

            주의:
            - 반드시 위 JSON 형식만 출력
            - 마크다운(예: \`\`\`) 절대 금지
            - 설명 없이 JSON만 출력

            질문:
            ${question}
        `.trim();

      const result = await model.generateContent(prompt);
      let reply = (await result.response.text()).trim();
      console.log('🧠 Gemini 응답 원문:', reply);

      if (!reply || reply === '""') {
        res.json({ note: '⚠️ AI가 실행할 도구를 선택하지 않았습니다.' });
        return;
      }

      let parsedList;
      reply = reply
        .replace(/^```json/, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();
      try {
        parsedList = JSON.parse(reply);
      } catch (err) {
        res.json({ note: '⚠️ Gemini 응답을 JSON 배열로 파싱할 수 없습니다.', raw: reply });
        return;
      }

      if (!Array.isArray(parsedList)) {
        res.json({ note: '⚠️ Gemini 응답이 JSON 배열 형식이 아닙니다.', raw: reply });
        return;
      }
      let lastSql = '';
      let lastRows: any[] = [];
      let summaryText = '요약 없음';

      for (const step of parsedList) {
        const { tool, args } = step;

        // 💡 도구별 실행 인자 보완
        if (tool === 'execute-sql' && !args.sql) {
          args.sql = lastSql;
        }
        if (tool === 'summarize-sql-result') {
          if (!args.sql) args.sql = lastSql;
          if (!args.rows) args.rows = lastRows;
        }

        const toolResult = await server.callTool(tool, args);
        const text = toolResult.content?.[0]?.text ?? '';

        if (tool === 'generate-sql') {
          lastSql = text;
          //console.log('🧾 생성된 SQL:', lastSql);
        } else if (tool === 'execute-sql') {
          //console.log('📥 execute-sql 응답 텍스트:', text);
          try {
            lastRows = JSON.parse(text);
            //console.log('📦 파싱된 rows:', lastRows);
          } catch {
            console.warn('❌ rows 파싱 실패:', text);
            lastRows = [];
          }
        } else if (tool === 'summarize-sql-result') {
          console.log('🧾 요약 결과:', text);
          summaryText = text;
        }
      }

      res.json({
        sql: lastSql?.trim() || '응답할 수 없는 요청입니다.',
        rows: Array.isArray(lastRows) && lastRows.length > 0 ? lastRows : '응답할 수 없는 요청입니다.',
        summary: summaryText?.trim() || '응답할 수 없는 요청입니다.',
      });
    } catch (err) {
      console.error('❌ 처리 중 오류 발생:', err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  api.listen(port, () => {
    console.log(`🔍 REST API 서버가 http://localhost:${port} 에서 실행 중입니다.`);
  });
}
