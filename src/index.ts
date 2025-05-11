import { server, transport } from './mcpServer.js';
import { startRestApi } from './restApi.js';

await server.connect(transport); // MCP 시작
console.log('✅ MCP 서버 (Stdio) 시작됨');

startRestApi(8080);

// 종료 방지
setInterval(() => {}, 1 << 30);
