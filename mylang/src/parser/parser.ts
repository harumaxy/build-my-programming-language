import { EmbeddedActionsParser } from "chevrotain";
import type {
	BinaryOperator,
	BlockStatement,
	Expression,
	IfStatement,
	Program,
	Statement,
} from "../ast";
import {
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
	Identifier,
	If,
	LBrace,
	LBracket,
	Less,
	LessEqual,
	Let,
	LParen,
	Minus,
	Modulo,
	Multiply,
	Not,
	NotEqual,
	Null,
	NumberLiteral,
	Or,
	Plus,
	RBrace,
	RBracket,
	Return,
	RParen,
	Semicolon,
	StringLiteral,
	True,
	While,
} from "../lexer";

class MyLanguageParser extends EmbeddedActionsParser {
	constructor() {
		super(allTokens);
		this.performSelfAnalysis();
	}

	// ========== Program ==========
	public program = this.RULE("program", (): Program => {
		const body: Statement[] = [];
		this.MANY(() => {
			body.push(this.SUBRULE(this.statement));
		});
		return { type: "Program", body };
	});

	// ========== Statement ==========
	// Note: blockStatement is not included here to avoid ambiguity with object literals.
	// Block statements are only used within control structures (if, while, for, fn).
	private statement = this.RULE("statement", (): Statement => {
		return this.OR([
			{ ALT: () => this.SUBRULE(this.letStatement) },
			{ ALT: () => this.SUBRULE(this.constStatement) },
			{ ALT: () => this.SUBRULE(this.ifStatement) },
			{ ALT: () => this.SUBRULE(this.whileStatement) },
			{ ALT: () => this.SUBRULE(this.forStatement) },
			{ ALT: () => this.SUBRULE(this.functionDeclaration) },
			{ ALT: () => this.SUBRULE(this.returnStatement) },
			{ ALT: () => this.SUBRULE(this.expressionStatement) },
		]);
	});

	// let x = expr
	private letStatement = this.RULE("letStatement", (): Statement => {
		this.CONSUME(Let);
		const name = this.CONSUME(Identifier).image;
		this.CONSUME(Equal);
		const value = this.SUBRULE(this.expression);
		this.OPTION(() => {
			this.CONSUME(Semicolon);
		});
		return { type: "LetStatement", name, value };
	});

	// const x = expr
	private constStatement = this.RULE("constStatement", (): Statement => {
		this.CONSUME(Const);
		const name = this.CONSUME(Identifier).image;
		this.CONSUME(Equal);
		const value = this.SUBRULE(this.expression);
		this.OPTION(() => {
			this.CONSUME(Semicolon);
		});
		return { type: "ConstStatement", name, value };
	});

	// if (cond) { } else { }
	private ifStatement = this.RULE("ifStatement", (): Statement => {
		this.CONSUME(If);
		this.CONSUME(LParen);
		const condition = this.SUBRULE(this.expression);
		this.CONSUME(RParen);
		const consequence = this.SUBRULE(this.blockStatement) as BlockStatement;

		let alternative: BlockStatement | IfStatement | undefined;
		this.OPTION(() => {
			this.CONSUME(Else);
			alternative = this.OR([
				{ ALT: () => this.SUBRULE2(this.ifStatement) as IfStatement },
				{ ALT: () => this.SUBRULE2(this.blockStatement) as BlockStatement },
			]);
		});

		return { type: "IfStatement", condition, consequence, alternative };
	});

	// while (cond) { }
	private whileStatement = this.RULE("whileStatement", (): Statement => {
		this.CONSUME(While);
		this.CONSUME(LParen);
		const condition = this.SUBRULE(this.expression);
		this.CONSUME(RParen);
		const body = this.SUBRULE(this.blockStatement) as BlockStatement;
		return { type: "WhileStatement", condition, body };
	});

	// for (init; cond; update) { }
	private forStatement = this.RULE("forStatement", (): Statement => {
		this.CONSUME(For);
		this.CONSUME(LParen);

		let init: Statement | undefined;
		this.OPTION(() => {
			init = this.OR([
				{ ALT: () => this.SUBRULE(this.letStatement) },
				{ ALT: () => this.SUBRULE(this.expressionStatement) },
			]);
		});
		this.OPTION2(() => {
			this.CONSUME(Semicolon);
		});

		let condition: Expression | undefined;
		this.OPTION3(() => {
			condition = this.SUBRULE(this.expression);
		});
		this.CONSUME2(Semicolon);

		let update: Expression | undefined;
		this.OPTION4(() => {
			update = this.SUBRULE2(this.expression);
		});

		this.CONSUME(RParen);
		const body = this.SUBRULE(this.blockStatement) as BlockStatement;

		return { type: "ForStatement", init, condition, update, body };
	});

	// fn name(params) { }
	private functionDeclaration = this.RULE(
		"functionDeclaration",
		(): Statement => {
			this.CONSUME(Fn);
			const name = this.CONSUME(Identifier).image;
			this.CONSUME(LParen);

			const params: string[] = [];
			this.OPTION(() => {
				params.push(this.CONSUME2(Identifier).image);
				this.MANY(() => {
					this.CONSUME(Comma);
					params.push(this.CONSUME3(Identifier).image);
				});
			});

			this.CONSUME(RParen);
			const body = this.SUBRULE(this.blockStatement) as BlockStatement;

			return { type: "FunctionDeclaration", name, params, body };
		},
	);

	// return expr?
	private returnStatement = this.RULE("returnStatement", (): Statement => {
		this.CONSUME(Return);
		let value: Expression | undefined;
		this.OPTION(() => {
			value = this.SUBRULE(this.expression);
		});
		this.OPTION2(() => {
			this.CONSUME(Semicolon);
		});
		return { type: "ReturnStatement", value };
	});

	// { statements }
	private blockStatement = this.RULE("blockStatement", (): Statement => {
		this.CONSUME(LBrace);
		const body: Statement[] = [];
		this.MANY(() => {
			body.push(this.SUBRULE(this.statement));
		});
		this.CONSUME(RBrace);
		return { type: "BlockStatement", body };
	});

	// expr; (セミコロンはオプション)
	private expressionStatement = this.RULE(
		"expressionStatement",
		(): Statement => {
			const expression = this.SUBRULE(this.expression);
			this.OPTION(() => {
				this.CONSUME(Semicolon);
			});
			return { type: "ExpressionStatement", expression };
		},
	);

	// ========== Expression (優先順位を考慮) ==========

	// 代入式（最低優先度）
	private expression = this.RULE("expression", (): Expression => {
		return this.SUBRULE(this.assignmentExpression);
	});

	// 代入: x = expr
	private assignmentExpression = this.RULE(
		"assignmentExpression",
		(): Expression => {
			const left = this.SUBRULE(this.orExpression);

			return this.OR([
				{
					GATE: () => left.type === "Identifier",
					ALT: () => {
						this.CONSUME(Equal);
						const value = this.SUBRULE(this.assignmentExpression);
						return {
							type: "AssignmentExpression" as const,
							name: (left as { name: string }).name,
							value,
						};
					},
				},
				{ ALT: () => left },
			]);
		},
	);

	// ||
	private orExpression = this.RULE("orExpression", (): Expression => {
		let left = this.SUBRULE(this.andExpression);
		this.MANY(() => {
			this.CONSUME(Or);
			const right = this.SUBRULE2(this.andExpression);
			left = { type: "BinaryExpression", operator: "||", left, right };
		});
		return left;
	});

	// &&
	private andExpression = this.RULE("andExpression", (): Expression => {
		let left = this.SUBRULE(this.equalityExpression);
		this.MANY(() => {
			this.CONSUME(And);
			const right = this.SUBRULE2(this.equalityExpression);
			left = { type: "BinaryExpression", operator: "&&", left, right };
		});
		return left;
	});

	// == !=
	private equalityExpression = this.RULE(
		"equalityExpression",
		(): Expression => {
			let left = this.SUBRULE(this.comparisonExpression);
			this.MANY(() => {
				const operator = this.OR([
					{
						ALT: () => {
							this.CONSUME(EqualEqual);
							return "==" as BinaryOperator;
						},
					},
					{
						ALT: () => {
							this.CONSUME(NotEqual);
							return "!=" as BinaryOperator;
						},
					},
				]);
				const right = this.SUBRULE2(this.comparisonExpression);
				left = { type: "BinaryExpression", operator, left, right };
			});
			return left;
		},
	);

	// < > <= >=
	private comparisonExpression = this.RULE(
		"comparisonExpression",
		(): Expression => {
			let left = this.SUBRULE(this.additiveExpression);
			this.MANY(() => {
				const operator = this.OR([
					{
						ALT: () => {
							this.CONSUME(Less);
							return "<" as BinaryOperator;
						},
					},
					{
						ALT: () => {
							this.CONSUME(Greater);
							return ">" as BinaryOperator;
						},
					},
					{
						ALT: () => {
							this.CONSUME(LessEqual);
							return "<=" as BinaryOperator;
						},
					},
					{
						ALT: () => {
							this.CONSUME(GreaterEqual);
							return ">=" as BinaryOperator;
						},
					},
				]);
				const right = this.SUBRULE2(this.additiveExpression);
				left = { type: "BinaryExpression", operator, left, right };
			});
			return left;
		},
	);

	// + -
	private additiveExpression = this.RULE(
		"additiveExpression",
		(): Expression => {
			let left = this.SUBRULE(this.multiplicativeExpression);
			this.MANY(() => {
				const operator = this.OR([
					{
						ALT: () => {
							this.CONSUME(Plus);
							return "+" as BinaryOperator;
						},
					},
					{
						ALT: () => {
							this.CONSUME(Minus);
							return "-" as BinaryOperator;
						},
					},
				]);
				const right = this.SUBRULE2(this.multiplicativeExpression);
				left = { type: "BinaryExpression", operator, left, right };
			});
			return left;
		},
	);

	// * / %
	private multiplicativeExpression = this.RULE(
		"multiplicativeExpression",
		(): Expression => {
			let left = this.SUBRULE(this.unaryExpression);
			this.MANY(() => {
				const operator = this.OR([
					{
						ALT: () => {
							this.CONSUME(Multiply);
							return "*" as BinaryOperator;
						},
					},
					{
						ALT: () => {
							this.CONSUME(Divide);
							return "/" as BinaryOperator;
						},
					},
					{
						ALT: () => {
							this.CONSUME(Modulo);
							return "%" as BinaryOperator;
						},
					},
				]);
				const right = this.SUBRULE2(this.unaryExpression);
				left = { type: "BinaryExpression", operator, left, right };
			});
			return left;
		},
	);

	// - ! (単項演算子)
	private unaryExpression = this.RULE("unaryExpression", (): Expression => {
		return this.OR([
			{
				ALT: () => {
					this.CONSUME(Minus);
					const argument = this.SUBRULE(this.unaryExpression);
					return {
						type: "UnaryExpression" as const,
						operator: "-" as const,
						argument,
					};
				},
			},
			{
				ALT: () => {
					this.CONSUME(Not);
					const argument = this.SUBRULE2(this.unaryExpression);
					return {
						type: "UnaryExpression" as const,
						operator: "!" as const,
						argument,
					};
				},
			},
			{ ALT: () => this.SUBRULE(this.callMemberExpression) },
		]);
	});

	// 関数呼び出し・メンバーアクセス・インデックスアクセス
	private callMemberExpression = this.RULE(
		"callMemberExpression",
		(): Expression => {
			let expr = this.SUBRULE(this.primaryExpression);

			this.MANY(() => {
				expr = this.OR([
					{
						ALT: () => {
							this.CONSUME(LParen);
							const args: Expression[] = [];
							this.OPTION(() => {
								args.push(this.SUBRULE(this.expression));
								this.MANY2(() => {
									this.CONSUME(Comma);
									args.push(this.SUBRULE2(this.expression));
								});
							});
							this.CONSUME(RParen);
							return {
								type: "CallExpression" as const,
								callee: expr,
								arguments: args,
							};
						},
					},
					{
						ALT: () => {
							this.CONSUME(LBracket);
							const index = this.SUBRULE3(this.expression);
							this.CONSUME(RBracket);
							return { type: "IndexExpression" as const, object: expr, index };
						},
					},
				]);
			});

			return expr;
		},
	);

	// 基本要素
	private primaryExpression = this.RULE("primaryExpression", (): Expression => {
		return this.OR([
			// リテラル
			{
				ALT: () => {
					const token = this.CONSUME(NumberLiteral);
					return {
						type: "NumberLiteral" as const,
						value: parseFloat(token.image),
					};
				},
			},
			{
				ALT: () => {
					const token = this.CONSUME(StringLiteral);
					// クォートを除去
					const value = token.image.slice(1, -1);
					return { type: "StringLiteral" as const, value };
				},
			},
			{
				ALT: () => {
					this.CONSUME(True);
					return { type: "BooleanLiteral" as const, value: true };
				},
			},
			{
				ALT: () => {
					this.CONSUME(False);
					return { type: "BooleanLiteral" as const, value: false };
				},
			},
			{
				ALT: () => {
					this.CONSUME(Null);
					return { type: "NullLiteral" as const };
				},
			},
			// 識別子
			{
				ALT: () => {
					const token = this.CONSUME(Identifier);
					return { type: "Identifier" as const, name: token.image };
				},
			},
			// 配列リテラル
			{
				ALT: () => {
					this.CONSUME(LBracket);
					const elements: Expression[] = [];
					this.OPTION(() => {
						elements.push(this.SUBRULE(this.expression));
						this.MANY(() => {
							this.CONSUME(Comma);
							elements.push(this.SUBRULE2(this.expression));
						});
					});
					this.CONSUME(RBracket);
					return { type: "ArrayLiteral" as const, elements };
				},
			},
			// オブジェクトリテラル
			{
				ALT: () => {
					this.CONSUME(LBrace);
					const properties: { key: string; value: Expression }[] = [];
					this.OPTION2(() => {
						const key = this.CONSUME2(Identifier).image;
						this.CONSUME(Colon);
						const value = this.SUBRULE3(this.expression);
						properties.push({ key, value });
						this.MANY2(() => {
							this.CONSUME2(Comma);
							const key = this.CONSUME3(Identifier).image;
							this.CONSUME2(Colon);
							const value = this.SUBRULE4(this.expression);
							properties.push({ key, value });
						});
					});
					this.CONSUME(RBrace);
					return { type: "ObjectLiteral" as const, properties };
				},
			},
			// 関数式: fn(params) { }
			{
				ALT: () => {
					this.CONSUME(Fn);
					this.CONSUME(LParen);
					const params: string[] = [];
					this.OPTION3(() => {
						params.push(this.CONSUME4(Identifier).image);
						this.MANY3(() => {
							this.CONSUME3(Comma);
							params.push(this.CONSUME5(Identifier).image);
						});
					});
					this.CONSUME(RParen);
					const body = this.SUBRULE(this.blockStatement) as BlockStatement;
					return { type: "FunctionExpression" as const, params, body };
				},
			},
			// 括弧でグループ化
			{
				ALT: () => {
					this.CONSUME2(LParen);
					const expr = this.SUBRULE5(this.expression);
					this.CONSUME2(RParen);
					return expr;
				},
			},
		]);
	});
}

// シングルトンパーサーインスタンス
const parserInstance = new MyLanguageParser();

export { parserInstance, MyLanguageParser };
