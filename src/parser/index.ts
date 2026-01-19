import { IToken } from "chevrotain";
import { lex } from "../lexer";
import { parserInstance } from "./parser";
import { Program } from "../ast";

export interface ParseResult {
  ast: Program;
  errors: string[];
}

/**
 * ソースコードをパースしてASTを生成
 */
export function parse(input: string): ParseResult {
  // 字句解析
  const lexResult = lex(input);

  if (lexResult.errors.length > 0) {
    return {
      ast: { type: "Program", body: [] },
      errors: lexResult.errors.map(
        (e) => `Lexer error at ${e.line}:${e.column}: ${e.message}`
      ),
    };
  }

  // 構文解析
  parserInstance.input = lexResult.tokens;
  const ast = parserInstance.program();

  const errors = parserInstance.errors.map((e) => {
    const token = e.token;
    const line = token.startLine ?? 0;
    const col = token.startColumn ?? 0;
    return `Parse error at ${line}:${col}: ${e.message}`;
  });

  return { ast, errors };
}

export { parserInstance } from "./parser";
