import * as readline from "readline";
import { parse } from "./parser";
import { Evaluator, valueToString } from "./evaluator";

const PROMPT = ">> ";

export function startRepl(): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const evaluator = new Evaluator();

  console.log("Welcome to MyLang REPL!");
  console.log("Type expressions to evaluate. Type 'exit' to quit.\n");

  const prompt = (): void => {
    rl.question(PROMPT, (input) => {
      const trimmed = input.trim();

      if (trimmed === "exit" || trimmed === "quit") {
        console.log("Goodbye!");
        rl.close();
        return;
      }

      if (trimmed === "") {
        prompt();
        return;
      }

      try {
        const { ast, errors } = parse(trimmed);

        if (errors.length > 0) {
          console.error("Parse errors:");
          for (const err of errors) {
            console.error(`  ${err}`);
          }
        } else {
          const result = evaluator.evaluate(ast);
          console.log(valueToString(result));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
        } else {
          console.error("Unknown error");
        }
      }

      prompt();
    });
  };

  prompt();
}

// CLIから直接実行された場合
if (import.meta.main) {
  startRepl();
}
