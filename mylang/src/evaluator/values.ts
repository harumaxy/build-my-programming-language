import type { BlockStatement } from "../ast";

// ========== ランタイム値 ==========
export type Value =
	| NumberValue
	| StringValue
	| BooleanValue
	| NullValue
	| ArrayValue
	| ObjectValue
	| FunctionValue
	| BuiltinFunctionValue
	| ReturnValue;

export interface NumberValue {
	type: "number";
	value: number;
}

export interface StringValue {
	type: "string";
	value: string;
}

export interface BooleanValue {
	type: "boolean";
	value: boolean;
}

export interface NullValue {
	type: "null";
}

export interface ArrayValue {
	type: "array";
	elements: Value[];
}

export interface ObjectValue {
	type: "object";
	properties: Map<string, Value>;
}

export interface FunctionValue {
	type: "function";
	params: string[];
	body: BlockStatement;
	env: Environment;
}

export interface BuiltinFunctionValue {
	type: "builtin";
	fn: (...args: Value[]) => Value;
}

// return文の値を伝播させるための特殊な値
export interface ReturnValue {
	type: "return";
	value: Value;
}

// ========== ヘルパー関数 ==========
export function createNumber(value: number): NumberValue {
	return { type: "number", value };
}

export function createString(value: string): StringValue {
	return { type: "string", value };
}

export function createBoolean(value: boolean): BooleanValue {
	return { type: "boolean", value };
}

export function createNull(): NullValue {
	return { type: "null" };
}

export function createArray(elements: Value[]): ArrayValue {
	return { type: "array", elements };
}

export function createObject(properties: Map<string, Value>): ObjectValue {
	return { type: "object", properties };
}

// ========== 環境（スコープ） ==========
export class Environment {
	private store: Map<string, Value> = new Map();
	private constants: Set<string> = new Set();
	private parent?: Environment;

	constructor(parent?: Environment) {
		this.parent = parent;
	}

	get(name: string): Value {
		const value = this.store.get(name);
		if (value !== undefined) {
			return value;
		}
		if (this.parent) {
			return this.parent.get(name);
		}
		throw new Error(`Undefined variable: ${name}`);
	}

	define(name: string, value: Value, isConst: boolean = false): void {
		if (this.store.has(name)) {
			throw new Error(`Variable already defined: ${name}`);
		}
		this.store.set(name, value);
		if (isConst) {
			this.constants.add(name);
		}
	}

	assign(name: string, value: Value): void {
		if (this.store.has(name)) {
			if (this.constants.has(name)) {
				throw new Error(`Cannot reassign constant: ${name}`);
			}
			this.store.set(name, value);
			return;
		}
		if (this.parent) {
			this.parent.assign(name, value);
			return;
		}
		throw new Error(`Undefined variable: ${name}`);
	}

	extend(): Environment {
		return new Environment(this);
	}
}

// ========== 値の表示 ==========
export function valueToString(value: Value): string {
	switch (value.type) {
		case "number":
			return String(value.value);
		case "string":
			return value.value;
		case "boolean":
			return String(value.value);
		case "null":
			return "null";
		case "array":
			return `[${value.elements.map(valueToString).join(", ")}]`;
		case "object": {
			const pairs = Array.from(value.properties.entries())
				.map(([k, v]) => `${k}: ${valueToString(v)}`)
				.join(", ");
			return `{ ${pairs} }`;
		}
		case "function":
			return `<function(${value.params.join(", ")})>`;
		case "builtin":
			return "<builtin function>";
		case "return":
			return valueToString(value.value);
	}
}

// ========== 真偽値判定 ==========
export function isTruthy(value: Value): boolean {
	switch (value.type) {
		case "boolean":
			return value.value;
		case "null":
			return false;
		case "number":
			return value.value !== 0;
		case "string":
			return value.value !== "";
		case "array":
			return value.elements.length > 0;
		default:
			return true;
	}
}
