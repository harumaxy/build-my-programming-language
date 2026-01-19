// メインエクスポート
// Note: lexer tokens (Identifier, NumberLiteral, StringLiteral) conflict with AST types
// Export lexer selectively to avoid naming conflicts
export {
  allTokens,
  lex,
  Let,
  Const,
  If,
  Else,
  Function,
  Return,
  While,
  For,
  True,
  False,
  Null,
  Plus,
  Minus,
  Multiply,
  Divide,
  Modulo,
  EqualEqual,
  NotEqual,
  Less,
  Greater,
  LessEqual,
  GreaterEqual,
  And,
  Or,
  Not,
  Equal,
  LParen,
  RParen,
  LBrace,
  RBrace,
  LBracket,
  RBracket,
  Comma,
  Semicolon,
  Colon,
  // Rename conflicting tokens
  Identifier as IdentifierToken,
  NumberLiteral as NumberLiteralToken,
  StringLiteral as StringLiteralToken,
} from "./lexer";
export * from "./ast";
export * from "./parser";
export * from "./evaluator";

import { parse } from "./parser";
import { Evaluator, valueToString } from "./evaluator";

/**
 * ソースコードを実行して結果を返す
 */
export function run(source: string): string {
  const { ast, errors } = parse(source);

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  const evaluator = new Evaluator();
  const result = evaluator.evaluate(ast);

  return valueToString(result);
}
