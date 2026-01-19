import { type ILexingError, type IToken, Lexer } from "chevrotain";
import { allTokens } from "./tokens";

// Lexerインスタンスを作成
const lexerInstance = new Lexer(allTokens);

export interface LexResult {
	tokens: IToken[];
	errors: ILexingError[];
}

/**
 * ソースコードをトークン列に変換する
 */
export function lex(input: string): LexResult {
	const result = lexerInstance.tokenize(input);

	return {
		tokens: result.tokens,
		errors: result.errors,
	};
}

/**
 * トークンをデバッグ用に整形して表示
 */
export function formatToken(token: IToken): string {
	const value = token.image;
	const type = token.tokenType.name;
	const line = token.startLine;
	const col = token.startColumn;

	return `[${type}] "${value}" (${line}:${col})`;
}

/**
 * 全トークンをデバッグ出力
 */
export function printTokens(tokens: IToken[]): void {
	for (const token of tokens) {
		console.log(formatToken(token));
	}
}
