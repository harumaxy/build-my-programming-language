import type { BlockStatement, Expression, Program, Statement } from "../ast";
import { builtins } from "./builtins";
import {
	createArray,
	createBoolean,
	createNull,
	createNumber,
	createObject,
	createString,
	Environment,
	isTruthy,
	type Value,
} from "./values";

export class Evaluator {
	private globalEnv: Environment;

	constructor() {
		this.globalEnv = new Environment();
		// 組み込み関数を登録
		for (const [name, fn] of Object.entries(builtins)) {
			this.globalEnv.define(name, fn);
		}
	}

	evaluate(program: Program): Value {
		return this.evaluateStatements(program.body, this.globalEnv);
	}

	private evaluateStatements(statements: Statement[], env: Environment): Value {
		let result: Value = createNull();

		for (const stmt of statements) {
			result = this.evaluateStatement(stmt, env);

			// return文の値が伝播してきたら即座に返す
			if (result.type === "return") {
				return result;
			}
		}

		return result;
	}

	private evaluateStatement(stmt: Statement, env: Environment): Value {
		switch (stmt.type) {
			case "LetStatement":
				return this.evaluateLetStatement(stmt, env);
			case "ConstStatement":
				return this.evaluateConstStatement(stmt, env);
			case "ExpressionStatement":
				return this.evaluateExpression(stmt.expression, env);
			case "BlockStatement":
				return this.evaluateBlockStatement(stmt, env);
			case "IfStatement":
				return this.evaluateIfStatement(stmt, env);
			case "WhileStatement":
				return this.evaluateWhileStatement(stmt, env);
			case "ForStatement":
				return this.evaluateForStatement(stmt, env);
			case "FunctionDeclaration":
				return this.evaluateFunctionDeclaration(stmt, env);
			case "ReturnStatement":
				return this.evaluateReturnStatement(stmt, env);
		}
	}

	private evaluateLetStatement(
		stmt: { name: string; value: Expression },
		env: Environment,
	): Value {
		const value = this.evaluateExpression(stmt.value, env);
		env.define(stmt.name, value, false);
		return createNull();
	}

	private evaluateConstStatement(
		stmt: { name: string; value: Expression },
		env: Environment,
	): Value {
		const value = this.evaluateExpression(stmt.value, env);
		env.define(stmt.name, value, true);
		return createNull();
	}

	private evaluateBlockStatement(
		stmt: BlockStatement,
		env: Environment,
	): Value {
		const blockEnv = env.extend();
		return this.evaluateStatements(stmt.body, blockEnv);
	}

	private evaluateIfStatement(
		stmt: {
			condition: Expression;
			consequence: BlockStatement;
			alternative?: BlockStatement | Statement;
		},
		env: Environment,
	): Value {
		const condition = this.evaluateExpression(stmt.condition, env);

		if (isTruthy(condition)) {
			return this.evaluateBlockStatement(stmt.consequence, env);
		} else if (stmt.alternative) {
			if (stmt.alternative.type === "BlockStatement") {
				return this.evaluateBlockStatement(stmt.alternative, env);
			} else {
				// else if
				return this.evaluateStatement(stmt.alternative, env);
			}
		}

		return createNull();
	}

	private evaluateWhileStatement(
		stmt: { condition: Expression; body: BlockStatement },
		env: Environment,
	): Value {
		let result: Value = createNull();

		while (isTruthy(this.evaluateExpression(stmt.condition, env))) {
			result = this.evaluateBlockStatement(stmt.body, env);
			if (result.type === "return") {
				return result;
			}
		}

		return result;
	}

	private evaluateForStatement(
		stmt: {
			init?: Statement;
			condition?: Expression;
			update?: Expression;
			body: BlockStatement;
		},
		env: Environment,
	): Value {
		const forEnv = env.extend();
		let result: Value = createNull();

		// 初期化
		if (stmt.init) {
			this.evaluateStatement(stmt.init, forEnv);
		}

		// ループ
		while (true) {
			// 条件チェック
			if (stmt.condition) {
				const cond = this.evaluateExpression(stmt.condition, forEnv);
				if (!isTruthy(cond)) {
					break;
				}
			}

			// 本体実行
			result = this.evaluateBlockStatement(stmt.body, forEnv);
			if (result.type === "return") {
				return result;
			}

			// 更新
			if (stmt.update) {
				this.evaluateExpression(stmt.update, forEnv);
			}
		}

		return result;
	}

	private evaluateFunctionDeclaration(
		stmt: { name: string; params: string[]; body: BlockStatement },
		env: Environment,
	): Value {
		const fn: Value = {
			type: "function",
			params: stmt.params,
			body: stmt.body,
			env: env,
		};
		env.define(stmt.name, fn);
		return createNull();
	}

	private evaluateReturnStatement(
		stmt: { value?: Expression },
		env: Environment,
	): Value {
		const value = stmt.value
			? this.evaluateExpression(stmt.value, env)
			: createNull();
		return { type: "return", value };
	}

	private evaluateExpression(expr: Expression, env: Environment): Value {
		switch (expr.type) {
			case "NumberLiteral":
				return createNumber(expr.value);
			case "StringLiteral":
				return createString(expr.value);
			case "BooleanLiteral":
				return createBoolean(expr.value);
			case "NullLiteral":
				return createNull();
			case "Identifier":
				return env.get(expr.name);
			case "BinaryExpression":
				return this.evaluateBinaryExpression(expr, env);
			case "UnaryExpression":
				return this.evaluateUnaryExpression(expr, env);
			case "CallExpression":
				return this.evaluateCallExpression(expr, env);
			case "AssignmentExpression":
				return this.evaluateAssignmentExpression(expr, env);
			case "ArrayLiteral":
				return this.evaluateArrayLiteral(expr, env);
			case "ObjectLiteral":
				return this.evaluateObjectLiteral(expr, env);
			case "IndexExpression":
				return this.evaluateIndexExpression(expr, env);
			case "MemberExpression":
				return this.evaluateMemberExpression(expr, env);
			case "FunctionExpression":
				return {
					type: "function",
					params: expr.params,
					body: expr.body,
					env: env,
				};
		}
	}

	private evaluateBinaryExpression(
		expr: { operator: string; left: Expression; right: Expression },
		env: Environment,
	): Value {
		const left = this.evaluateExpression(expr.left, env);
		const right = this.evaluateExpression(expr.right, env);

		// 短絡評価
		if (expr.operator === "&&") {
			return createBoolean(isTruthy(left) && isTruthy(right));
		}
		if (expr.operator === "||") {
			return createBoolean(isTruthy(left) || isTruthy(right));
		}

		// 数値演算
		if (left.type === "number" && right.type === "number") {
			switch (expr.operator) {
				case "+":
					return createNumber(left.value + right.value);
				case "-":
					return createNumber(left.value - right.value);
				case "*":
					return createNumber(left.value * right.value);
				case "/":
					if (right.value === 0) {
						throw new Error("Division by zero");
					}
					return createNumber(left.value / right.value);
				case "%":
					return createNumber(left.value % right.value);
				case "<":
					return createBoolean(left.value < right.value);
				case ">":
					return createBoolean(left.value > right.value);
				case "<=":
					return createBoolean(left.value <= right.value);
				case ">=":
					return createBoolean(left.value >= right.value);
				case "==":
					return createBoolean(left.value === right.value);
				case "!=":
					return createBoolean(left.value !== right.value);
			}
		}

		// 文字列連結
		if (left.type === "string" && right.type === "string") {
			if (expr.operator === "+") {
				return createString(left.value + right.value);
			}
			if (expr.operator === "==") {
				return createBoolean(left.value === right.value);
			}
			if (expr.operator === "!=") {
				return createBoolean(left.value !== right.value);
			}
		}

		// 等値比較（型が違う場合）
		if (expr.operator === "==") {
			if (left.type !== right.type) {
				return createBoolean(false);
			}
			if (left.type === "boolean" && right.type === "boolean") {
				return createBoolean(left.value === right.value);
			}
			if (left.type === "null" && right.type === "null") {
				return createBoolean(true);
			}
		}
		if (expr.operator === "!=") {
			if (left.type !== right.type) {
				return createBoolean(true);
			}
			if (left.type === "boolean" && right.type === "boolean") {
				return createBoolean(left.value !== right.value);
			}
			if (left.type === "null" && right.type === "null") {
				return createBoolean(false);
			}
		}

		throw new Error(
			`Unsupported operator ${expr.operator} for types ${left.type} and ${right.type}`,
		);
	}

	private evaluateUnaryExpression(
		expr: { operator: string; argument: Expression },
		env: Environment,
	): Value {
		const arg = this.evaluateExpression(expr.argument, env);

		switch (expr.operator) {
			case "-":
				if (arg.type !== "number") {
					throw new Error(`Cannot negate ${arg.type}`);
				}
				return createNumber(-arg.value);
			case "!":
				return createBoolean(!isTruthy(arg));
		}

		throw new Error(`Unknown unary operator: ${expr.operator}`);
	}

	private evaluateCallExpression(
		expr: { callee: Expression; arguments: Expression[] },
		env: Environment,
	): Value {
		const callee = this.evaluateExpression(expr.callee, env);
		const args = expr.arguments.map((arg) => this.evaluateExpression(arg, env));

		if (callee.type === "builtin") {
			return callee.fn(...args);
		}

		if (callee.type === "function") {
			if (args.length !== callee.params.length) {
				throw new Error(
					`Expected ${callee.params.length} arguments, got ${args.length}`,
				);
			}

			// 新しいスコープを作成（クロージャの環境を親に）
			const fnEnv = callee.env.extend();
			for (let i = 0; i < callee.params.length; i++) {
				fnEnv.define(callee.params[i], args[i]);
			}

			const result = this.evaluateBlockStatement(callee.body, fnEnv);

			// return値を展開
			if (result.type === "return") {
				return result.value;
			}
			return result;
		}

		throw new Error(`${callee.type} is not a function`);
	}

	private evaluateAssignmentExpression(
		expr: { name: string; value: Expression },
		env: Environment,
	): Value {
		const value = this.evaluateExpression(expr.value, env);
		env.assign(expr.name, value);
		return value;
	}

	private evaluateArrayLiteral(
		expr: { elements: Expression[] },
		env: Environment,
	): Value {
		const elements = expr.elements.map((el) =>
			this.evaluateExpression(el, env),
		);
		return createArray(elements);
	}

	private evaluateObjectLiteral(
		expr: { properties: { key: string; value: Expression }[] },
		env: Environment,
	): Value {
		const properties = new Map<string, Value>();
		for (const prop of expr.properties) {
			properties.set(prop.key, this.evaluateExpression(prop.value, env));
		}
		return createObject(properties);
	}

	private evaluateIndexExpression(
		expr: { object: Expression; index: Expression },
		env: Environment,
	): Value {
		const obj = this.evaluateExpression(expr.object, env);
		const index = this.evaluateExpression(expr.index, env);

		if (obj.type === "array" && index.type === "number") {
			const idx = Math.floor(index.value);
			if (idx < 0 || idx >= obj.elements.length) {
				return createNull();
			}
			return obj.elements[idx];
		}

		if (obj.type === "string" && index.type === "number") {
			const idx = Math.floor(index.value);
			if (idx < 0 || idx >= obj.value.length) {
				return createNull();
			}
			return createString(obj.value[idx]);
		}

		if (obj.type === "object" && index.type === "string") {
			return obj.properties.get(index.value) ?? createNull();
		}

		throw new Error(`Cannot index ${obj.type} with ${index.type}`);
	}

	private evaluateMemberExpression(
		expr: { object: Expression; property: string },
		env: Environment,
	): Value {
		const obj = this.evaluateExpression(expr.object, env);

		if (obj.type === "object") {
			return obj.properties.get(expr.property) ?? createNull();
		}

		throw new Error(`Cannot access property on ${obj.type}`);
	}
}
