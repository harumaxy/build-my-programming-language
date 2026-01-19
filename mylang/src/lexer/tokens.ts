import { createToken, Lexer } from "chevrotain";

// ========== 空白・コメント ==========
export const WhiteSpace = createToken({
	name: "WhiteSpace",
	pattern: /\s+/,
	group: Lexer.SKIPPED,
});

export const LineComment = createToken({
	name: "LineComment",
	pattern: /\/\/[^\n]*/,
	group: Lexer.SKIPPED,
});

// ========== 識別子（キーワードより先に定義してlonger_altで参照） ==========
export const Identifier = createToken({
	name: "Identifier",
	pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
});

// ========== キーワード ==========
export const Let = createToken({
	name: "Let",
	pattern: /let/,
	longer_alt: Identifier,
});
export const Const = createToken({
	name: "Const",
	pattern: /const/,
	longer_alt: Identifier,
});
export const If = createToken({
	name: "If",
	pattern: /if/,
	longer_alt: Identifier,
});
export const Else = createToken({
	name: "Else",
	pattern: /else/,
	longer_alt: Identifier,
});
export const Fn = createToken({
	name: "Fn",
	pattern: /fn/,
	longer_alt: Identifier,
});
export const Return = createToken({
	name: "Return",
	pattern: /return/,
	longer_alt: Identifier,
});
export const While = createToken({
	name: "While",
	pattern: /while/,
	longer_alt: Identifier,
});
export const For = createToken({
	name: "For",
	pattern: /for/,
	longer_alt: Identifier,
});
export const True = createToken({
	name: "True",
	pattern: /true/,
	longer_alt: Identifier,
});
export const False = createToken({
	name: "False",
	pattern: /false/,
	longer_alt: Identifier,
});
export const Null = createToken({
	name: "Null",
	pattern: /null/,
	longer_alt: Identifier,
});

// ========== リテラル ==========
export const NumberLiteral = createToken({
	name: "NumberLiteral",
	pattern: /\d+(\.\d+)?/,
});

export const StringLiteral = createToken({
	name: "StringLiteral",
	pattern: /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/,
});

// ========== 比較演算子（2文字を先に） ==========
export const EqualEqual = createToken({ name: "EqualEqual", pattern: /==/ });
export const NotEqual = createToken({ name: "NotEqual", pattern: /!=/ });
export const LessEqual = createToken({ name: "LessEqual", pattern: /<=/ });
export const GreaterEqual = createToken({
	name: "GreaterEqual",
	pattern: />=/,
});
export const Less = createToken({ name: "Less", pattern: /</ });
export const Greater = createToken({ name: "Greater", pattern: />/ });

// ========== 論理演算子 ==========
export const And = createToken({ name: "And", pattern: /&&/ });
export const Or = createToken({ name: "Or", pattern: /\|\|/ });
export const Not = createToken({ name: "Not", pattern: /!/ });

// ========== 算術演算子 ==========
export const Plus = createToken({ name: "Plus", pattern: /\+/ });
export const Minus = createToken({ name: "Minus", pattern: /-/ });
export const Multiply = createToken({ name: "Multiply", pattern: /\*/ });
export const Divide = createToken({ name: "Divide", pattern: /\// });
export const Modulo = createToken({ name: "Modulo", pattern: /%/ });

// ========== 代入 ==========
export const Equal = createToken({ name: "Equal", pattern: /=/ });

// ========== 区切り文字 ==========
export const LParen = createToken({ name: "LParen", pattern: /\(/ });
export const RParen = createToken({ name: "RParen", pattern: /\)/ });
export const LBrace = createToken({ name: "LBrace", pattern: /\{/ });
export const RBrace = createToken({ name: "RBrace", pattern: /\}/ });
export const LBracket = createToken({ name: "LBracket", pattern: /\[/ });
export const RBracket = createToken({ name: "RBracket", pattern: /\]/ });
export const Comma = createToken({ name: "Comma", pattern: /,/ });
export const Semicolon = createToken({ name: "Semicolon", pattern: /;/ });
export const Colon = createToken({ name: "Colon", pattern: /:/ });

// ========== トークンリスト（順序重要） ==========
// 長いパターンを先に配置
export const allTokens = [
	// スキップ
	WhiteSpace,
	LineComment,

	// キーワード（識別子より先に）
	Let,
	Const,
	If,
	Else,
	Fn,
	Return,
	While,
	For,
	True,
	False,
	Null,

	// リテラル
	NumberLiteral,
	StringLiteral,

	// 識別子（キーワードの後）
	Identifier,

	// 2文字演算子（1文字より先に）
	EqualEqual,
	NotEqual,
	LessEqual,
	GreaterEqual,
	And,
	Or,

	// 1文字演算子
	Less,
	Greater,
	Not,
	Plus,
	Minus,
	Multiply,
	Divide,
	Modulo,
	Equal,

	// 区切り文字
	LParen,
	RParen,
	LBrace,
	RBrace,
	LBracket,
	RBracket,
	Comma,
	Semicolon,
	Colon,
];
