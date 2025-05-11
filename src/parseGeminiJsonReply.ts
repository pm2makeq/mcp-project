interface ParsedResult {
  tool: string;
  args: any;
}

type ParseResult = ParsedResult | { error: string; reply: string };

export function parseGeminiJsonReply(reply: string): ParseResult {
  let parsed;

  try {
    parsed = JSON.parse(
      reply.replace(/^```json/, '')
            .replace(/^```/, '')
            .replace(/```$/, '')
            .trim()
    );
  } catch (e) {
    return { error: '⚠️ Gemini가 JSON 형식으로 응답하지 않았습니다.', reply };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { error: '⚠️ Gemini 응답이 올바른 JSON 객체가 아닙니다.', reply };
  }

  const { tool, args } = parsed;

  if (!tool || typeof tool !== 'string' || !args || typeof args !== 'object') {
    return { error: '⚠️ tool 또는 args 필드가 잘못되었습니다.', reply };
  }

  return { tool, args };
}
