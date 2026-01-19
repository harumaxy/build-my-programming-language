import { useState, useCallback } from "react";
import { evaluate } from "mylang";
import "./App.css";

const SAMPLE_CODE = `// MyLang Playground
// Try writing some code!

fn fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

print("Fibonacci sequence:");
for (let i = 0; i < 10; i = i + 1) {
  print(fibonacci(i));
}
`;

export function App() {
	const [code, setCode] = useState(SAMPLE_CODE);
	const [output, setOutput] = useState<string[]>([]);
	const [result, setResult] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isRunning, setIsRunning] = useState(false);

	const runCode = useCallback(() => {
		setIsRunning(true);
		setOutput([]);
		setResult(null);
		setError(null);

		// 非同期で実行して UI をブロックしない
		setTimeout(() => {
			const evalResult = evaluate(code);

			setOutput(evalResult.output);
			if (evalResult.error) {
				setError(evalResult.error);
			} else if (evalResult.result !== "null") {
				setResult(evalResult.result);
			}
			setIsRunning(false);
		}, 0);
	}, [code]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			// Ctrl/Cmd + Enter で実行
			if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
				e.preventDefault();
				runCode();
			}
			// Tab キーでインデント
			if (e.key === "Tab") {
				e.preventDefault();
				const target = e.target as HTMLTextAreaElement;
				const start = target.selectionStart;
				const end = target.selectionEnd;
				const newCode = code.substring(0, start) + "\t" + code.substring(end);
				setCode(newCode);
				// カーソル位置を調整
				setTimeout(() => {
					target.selectionStart = target.selectionEnd = start + 1;
				}, 0);
			}
		},
		[code, runCode],
	);

	return (
		<div className="playground">
			<header className="header">
				<h1>MyLang Playground</h1>
				<button
					type="button"
					className="run-button"
					onClick={runCode}
					disabled={isRunning}
				>
					{isRunning ? "Running..." : "Run"}
				</button>
			</header>

			<main className="main">
				<section className="panel editor-panel">
					<div className="panel-header">Code</div>
					<textarea
						className="code-editor"
						value={code}
						onChange={(e) => setCode(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Write your MyLang code here..."
						spellCheck={false}
					/>
					<div className="hint">Press Ctrl+Enter to run</div>
				</section>

				<section className="panel output-panel">
					<div className="panel-header">Output</div>
					<div className="output">
						{error ? (
							<pre className="error">{error}</pre>
						) : output.length > 0 || result ? (
							<pre className="result">
								{output.map((line, i) => (
									<div key={`output-${i}`}>{line}</div>
								))}
								{result && <div className="return-value">{"=> " + result}</div>}
							</pre>
						) : (
							<div className="placeholder">
								Click "Run" or press Ctrl+Enter to execute
							</div>
						)}
					</div>
				</section>
			</main>
		</div>
	);
}
