import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'; // ✅ 여기 주목
import { pool } from './db.js';
import { CustomMcpServer } from './customMcpServer.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
export const mcpMeta = {
  name: 'PostgreSQL MCP Server',
  version: '1.0.0',
};

export const registeredTools: { name: string; argsSchema: any }[] = [];
export const server = new CustomMcpServer(mcpMeta);

type ToolHandler = (args: any) => Promise<any>;
export const toolHandlers: Record<string, ToolHandler> = {};


//일반 테이블 조회
server.tool(
  'get-students',
  {}, // no args
  async () => {
    const result = await pool.query('SELECT * FROM students');
    return {
      content: [{ type: 'text', text: JSON.stringify(result.rows, null, 2) }],
    };
  }
);

//만들어진 sql 구문 실행
server.tool(
  'execute-sql',
  {
    type: 'object',
    properties: {
      sql: { type: 'string' }
    },
    required: ['sql']
  },
  async (args: any) => {
    if (!args?.sql) {
      console.error('❌ SQL 파라미터 없음!', args);
      return {
        content: [{ type: 'text', text: JSON.stringify([]) }],
      };
    }

    const sql = args.sql;
    //console.log('🧪 실행할 SQL:', sql);

    try {
      const result = await pool.query(sql);
      //console.log('✅ DB 쿼리 결과 rows:', result.rows);
      //console.log('✅ DB row 수:', result.rowCount);
    

      // ✅ 무조건 JSON 배열 문자열로 반환 (빈 배열도 포함)
      return {
        content: [{ type: 'text', text: JSON.stringify(result.rows ?? []) }],
      };
    } catch (err) {
      console.error('❌ SQL 실행 오류:', err);
      // ✅ 에러일 경우도 비정상 문자열 대신 빈 배열로 처리 (안전한 요약 흐름 유지)
      return {
        content: [{ type: 'text', text: JSON.stringify([]) }],
      };
    }
  }
);


// Gemini를 통해 SQL 생성
server.tool(
  'generate-sql',
  {
    type: 'object',
    properties: {
      question: { type: 'string' },
      tables: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['question', 'tables'],
  },
  async (args: { question: string; tables: string[] }) => {
    // 👉 여기에 방어 코드 추가
    if (!args?.question || !args?.tables) {
      return {
        content: [
          { type: 'text', text: '❌ 필수 파라미터 누락: question과 tables가 필요합니다.' },
        ],
      };
    }

    const { question, tables } = args;
    // 👉 강화된 SQL 키워드 필터링
    const lower = question.trim().toLowerCase();
    //차단류
    const sqlPattern = /\b(select|insert|update|delete|drop|create|alter|truncate|replace|merge|into|from|with)\b/i;
    if (sqlPattern.test(lower)) {
      return {
        content: [{ type: 'text', text: '못하겠습니다' }],
      };
    }
    // select가 질문의 의도가 아닐 때는 허용할 수도 있음
    if (sqlPattern.test(lower) && lower.split(/\s+/).length < 10) {
      // 너무 짧은 경우 → 의심
      return {
        content: [{ type: 'text', text: '못하겠습니다' }],
      };
    }

    const schema = `
          enrollment_year int4 NULL, -- 입학년도
          grade int4 NULL, -- 학년
          "class" int4 NULL, -- 반
          student_number int4 NULL, -- 번호
          "name" text NULL, -- 성명
          gender bpchar(1) NULL, -- 성별 (남/여)로 구성되어 있어
          korean int4 NULL, -- 국어
          math int4 NULL, -- 수학
          english int4 NULL, -- 영어
          science int4 NULL, -- 과학
          social int4 NULL, -- 사회
          pe int4 NULL, -- 체육
          art int4 NULL -- 미술
      `.trim();

    const cleanTables = args.tables.filter(t => t.trim() !== '');
    const prompt =
      "▶ 너는 학생을 성적을 관리하는 챗봇이야. 학생 정보와 성적외의 질문은 다 대답하면 안돼." +
      "▶ 디비컬럼과 컬럼들의 조합이 관련 되지 않은 어떠한 질문도 답변을 하지마." +
      "▶ 디비는 POSTGRESQL 이니까 다른 벤더의 펑션을 쓰지말고 그냥 일반적인 ANSI-SQL로만 구성해 줘." +
      "▶  질문에 포함된 과목이 (국어, 수학, 영어, 과학, 사회, 체육, 미술)에 해당하지 않는다면, “못하겠습니다.” 라고만 응답하세요." +
      "다음 테이블: " + cleanTables.join(", ") + "\n" +
      "컬럼: " + schema + "\n" +
      "질문: " + args.question + "\n" +
      "▶ 순수 SQL SELECT 문만, 마크다운````나 코드 블록 없이 반환하세요. " +
      "▶ 다른 SELECT 문이 아닌 모든 문장(예: DELETE, UPDATE, INSERT) 문을 요구하면 ‘못하겠습니다’만 출력하세요. " +
      "▶ 직접 쿼리를 입력 받으면  ‘못하겠습니다’만 출력하세요. "+
      "만약 답변할 수 없으면 ‘못하겠습니다’만 출력하세요.";

    //console.log('📥 Gemini에 보낸 SQL 프롬프트:\n', prompt);

    const result = await model.generateContent(prompt);
    const sql = (await result.response.text()).trim();

    //console.log('📤 Gemini가 생성한 SQL:\n', sql);
    
    return {
      content: [{ type: 'text', text: sql === '못하겠습니다' ? '답변을 할 수 없습니다.' : sql }],
    };
  }
);
// SQL 결과 요약 툴
server.tool(
  'summarize-sql-result',
  {
    type: 'object',
    properties: {
      sql: { type: 'string' },
      rows: { type: 'array', items: { type: 'object' } },
    },
    required: ['sql', 'rows'],
  },
  async (args: { sql: string; rows: any[] }) => {
    const summaryPrompt = `
        다음 SQL 실행 결과를 사용자에게 이해하기 쉽게 요약해줘.

        - 숫자 값이 있는 열은 평균이나 합계를 계산해서 설명해줘.
        - 텍스트나 범주형 데이터는 주요 그룹별로 개수를 요약해줘.
        - 전체 개수, 주요 분포나 경향, 특이점이 있으면 함께 언급해줘.
        - 성별, 학년, 과목 점수 등 사람이 관련된 정보는 자연스럽게 설명해줘.
        - 제공된 컬럼 설명을 참고해 요약의 정확도를 높여줘.
        - SQL 쿼리는 절대 출력하지 마.
        - 결과가 **진짜로 비어 있을 때만** "검색된 결과가 없습니다."라고 응답해.

        📌 컬럼 설명:
        - enrollment_year: 입학년도
        - grade: 학년
        - class: 반
        - student_number: 번호
        - name: 이름
        - gender: 성별 (남/여)
        - korean, math, english, science, social, pe, art: 과목별 점수

        SQL: ${args.sql}
        결과: ${JSON.stringify(args.rows, null, 2)}
    `.trim();

    const result = await model.generateContent(summaryPrompt);
    const summary = (await result.response.text()).trim();

    return {
      content: [{ type: 'text', text: summary }],
    };
  }
);

export const transport = new StdioServerTransport();
