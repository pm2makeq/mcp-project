import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export class CustomMcpServer extends McpServer {
  public _tools: Map<string, Function> = new Map();

  // 오버로드를 수용하는 방식으로 작성
  override tool(name: string, ...rest: any[]): any {
    let handler: Function;
    if (rest.length === 1) {
      handler = rest[0];
    } else if (rest.length === 2) {
      handler = rest[1];
    } else {
      throw new Error('Invalid arguments to tool()');
    }

    this._tools.set(name, handler);
    // @ts-ignore: 타입 일치 무시하고 원래 기능 그대로 호출
    return super.tool(name, ...rest);
  }

  public async callTool(name: string, args: any) {
    const handler = this._tools.get(name);
    if (!handler) throw new Error(`Tool '${name}' not found`);
    return await handler(args);
  }
}
