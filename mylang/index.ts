import { Evaluator, parse, valueToString } from "./src";

export interface EvaluateResult {
	output: string[];
	result: string;
	error?: string;
}

/**
 * コードを評価して、print出力と結果を返す
 */
export function evaluate(code: string): EvaluateResult {
	const output: string[] = [];

	try {
		const { ast, errors } = parse(code);

		if (errors.length > 0) {
			return {
				output: [],
				result: "",
				error: errors.join("\n"),
			};
		}

		const evaluator = new Evaluator({
			onOutput: (line) => output.push(line),
		});

		const result = evaluator.evaluate(ast);

		return {
			output,
			result: valueToString(result),
		};
	} catch (e) {
		return {
			output,
			result: "",
			error: e instanceof Error ? e.message : String(e),
		};
	}
}
