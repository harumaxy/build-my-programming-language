#!/usr/bin/env bun
import { Evaluator } from "./src/evaluator";
import { parse } from "./src/parser";
import { startRepl } from "./src/repl";

const args = process.argv.slice(2);

if (args.length === 0) {
	// 引数なし: REPL起動
	startRepl();
} else if (args[0] === "--help" || args[0] === "-h") {
	console.log(`
MyLang - A simple programming language

Usage:
  mylang              Start REPL
  mylang <file>       Execute a file
  mylang -e <code>    Execute inline code
  mylang --help       Show this help

Examples:
  mylang program.ml
  mylang -e "print(1 + 2);"
`);
} else if (args[0] === "-e" && args[1]) {
	// インラインコード実行
	const code = args[1];
	try {
		const { ast, errors } = parse(code);
		if (errors.length > 0) {
			console.error("Parse errors:");
			for (const err of errors) {
				console.error(`  ${err}`);
			}
			process.exit(1);
		}
		const evaluator = new Evaluator();
		evaluator.evaluate(ast);
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error: ${error.message}`);
		}
		process.exit(1);
	}
} else {
	// ファイル実行
	const filename = args[0];
	try {
		const file = Bun.file(filename);
		const code = await file.text();

		const { ast, errors } = parse(code);
		if (errors.length > 0) {
			console.error("Parse errors:");
			for (const err of errors) {
				console.error(`  ${err}`);
			}
			process.exit(1);
		}

		const evaluator = new Evaluator();
		evaluator.evaluate(ast);
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error: ${error.message}`);
		}
		process.exit(1);
	}
}
