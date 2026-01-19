// メインエクスポート
// Note: lexer tokens (Identifier, NumberLiteral, StringLiteral) conflict with AST types
// Export lexer selectively to avoid naming conflicts

export * from "./ast";
export * from "./evaluator";
export {
	And,
	allTokens,
	Colon,
	Comma,
	Const,
	Divide,
	Else,
	Equal,
	EqualEqual,
	False,
	Fn,
	For,
	Greater,
	GreaterEqual,
	// Rename conflicting tokens
	Identifier as IdentifierToken,
	If,
	LBrace,
	LBracket,
	Less,
	LessEqual,
	Let,
	LParen,
	lex,
	Minus,
	Modulo,
	Multiply,
	Not,
	NotEqual,
	Null,
	NumberLiteral as NumberLiteralToken,
	Or,
	Plus,
	RBrace,
	RBracket,
	Return,
	RParen,
	Semicolon,
	StringLiteral as StringLiteralToken,
	True,
	While,
} from "./lexer";
export * from "./parser";

import { Evaluator, valueToString } from "./evaluator";
import { parse } from "./parser";

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
