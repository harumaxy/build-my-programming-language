// メインエクスポート
export * from "./lexer";
export * from "./ast";
export * from "./parser";
export * from "./evaluator";

import { parse } from "./parser";
import { Evaluator, valueToString } from "./evaluator";

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
