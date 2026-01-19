import { describe, it, expect } from "vitest";
import { parse } from "../../parser";
import { Evaluator } from "../evaluator";
import type { Value } from "../values";

function evaluate(code: string): Value {
  const { ast, errors } = parse(code);
  if (errors.length > 0) {
    throw new Error(`Parse errors: ${errors.join(", ")}`);
  }
  const evaluator = new Evaluator();
  return evaluator.evaluate(ast);
}

describe("Evaluator", () => {
  describe("arithmetic", () => {
    it("should evaluate addition", () => {
      const result = evaluate("1 + 2;");
      expect(result).toEqual({ type: "number", value: 3 });
    });

    it("should evaluate subtraction", () => {
      const result = evaluate("10 - 3;");
      expect(result).toEqual({ type: "number", value: 7 });
    });

    it("should evaluate multiplication", () => {
      const result = evaluate("3 * 4;");
      expect(result).toEqual({ type: "number", value: 12 });
    });

    it("should evaluate division", () => {
      const result = evaluate("10 / 2;");
      expect(result).toEqual({ type: "number", value: 5 });
    });

    it("should respect operator precedence", () => {
      const result = evaluate("1 + 2 * 3;");
      expect(result).toEqual({ type: "number", value: 7 });
    });

    it("should handle parentheses", () => {
      const result = evaluate("(1 + 2) * 3;");
      expect(result).toEqual({ type: "number", value: 9 });
    });

    it("should handle negative numbers", () => {
      const result = evaluate("-5;");
      expect(result).toEqual({ type: "number", value: -5 });
    });
  });

  describe("variables", () => {
    it("should define and use variables", () => {
      const result = evaluate("let x = 10; x;");
      expect(result).toEqual({ type: "number", value: 10 });
    });

    it("should allow variable reassignment", () => {
      const result = evaluate("let x = 10; x = 20; x;");
      expect(result).toEqual({ type: "number", value: 20 });
    });

    it("should not allow const reassignment", () => {
      expect(() => evaluate("const x = 10; x = 20;")).toThrow(
        "Cannot reassign constant"
      );
    });

    it("should handle variable expressions", () => {
      const result = evaluate("let x = 5; let y = 10; x + y;");
      expect(result).toEqual({ type: "number", value: 15 });
    });
  });

  describe("comparisons", () => {
    it("should evaluate ==", () => {
      expect(evaluate("5 == 5;")).toEqual({ type: "boolean", value: true });
      expect(evaluate("5 == 3;")).toEqual({ type: "boolean", value: false });
    });

    it("should evaluate !=", () => {
      expect(evaluate("5 != 3;")).toEqual({ type: "boolean", value: true });
      expect(evaluate("5 != 5;")).toEqual({ type: "boolean", value: false });
    });

    it("should evaluate <", () => {
      expect(evaluate("3 < 5;")).toEqual({ type: "boolean", value: true });
      expect(evaluate("5 < 3;")).toEqual({ type: "boolean", value: false });
    });

    it("should evaluate >", () => {
      expect(evaluate("5 > 3;")).toEqual({ type: "boolean", value: true });
      expect(evaluate("3 > 5;")).toEqual({ type: "boolean", value: false });
    });
  });

  describe("booleans", () => {
    it("should evaluate true and false", () => {
      expect(evaluate("true;")).toEqual({ type: "boolean", value: true });
      expect(evaluate("false;")).toEqual({ type: "boolean", value: false });
    });

    it("should evaluate logical not", () => {
      expect(evaluate("!true;")).toEqual({ type: "boolean", value: false });
      expect(evaluate("!false;")).toEqual({ type: "boolean", value: true });
    });

    it("should evaluate logical and", () => {
      expect(evaluate("true && true;")).toEqual({ type: "boolean", value: true });
      expect(evaluate("true && false;")).toEqual({ type: "boolean", value: false });
    });

    it("should evaluate logical or", () => {
      expect(evaluate("false || true;")).toEqual({ type: "boolean", value: true });
      expect(evaluate("false || false;")).toEqual({ type: "boolean", value: false });
    });
  });

  describe("if statement", () => {
    it("should execute consequence when condition is true", () => {
      const result = evaluate("let x = 0; if (true) { x = 10; } x;");
      expect(result).toEqual({ type: "number", value: 10 });
    });

    it("should execute alternative when condition is false", () => {
      const result = evaluate(
        "let x = 0; if (false) { x = 10; } else { x = 20; } x;"
      );
      expect(result).toEqual({ type: "number", value: 20 });
    });

    it("should handle else if", () => {
      const result = evaluate(`
        let x = 2;
        let result = 0;
        if (x == 1) {
          result = 10;
        } else if (x == 2) {
          result = 20;
        } else {
          result = 30;
        }
        result;
      `);
      expect(result).toEqual({ type: "number", value: 20 });
    });
  });

  describe("while loop", () => {
    it("should execute while condition is true", () => {
      const result = evaluate(`
        let i = 0;
        let sum = 0;
        while (i < 5) {
          sum = sum + i;
          i = i + 1;
        }
        sum;
      `);
      expect(result).toEqual({ type: "number", value: 10 }); // 0+1+2+3+4
    });
  });

  describe("functions", () => {
    it("should define and call function", () => {
      const result = evaluate(`
        fn add(a, b) {
          return a + b;
        }
        add(3, 4);
      `);
      expect(result).toEqual({ type: "number", value: 7 });
    });

    it("should handle recursive functions", () => {
      const result = evaluate(`
        fn factorial(n) {
          if (n <= 1) {
            return 1;
          }
          return n * factorial(n - 1);
        }
        factorial(5);
      `);
      expect(result).toEqual({ type: "number", value: 120 });
    });

    it("should handle closures", () => {
      const result = evaluate(`
        fn makeAdder(x) {
          return fn(y) {
            return x + y;
          };
        }
        let add5 = makeAdder(5);
        add5(3);
      `);
      expect(result).toEqual({ type: "number", value: 8 });
    });
  });

  describe("arrays", () => {
    it("should create and index arrays", () => {
      const result = evaluate("let arr = [1, 2, 3]; arr[1];");
      expect(result).toEqual({ type: "number", value: 2 });
    });

    it("should return null for out of bounds", () => {
      const result = evaluate("let arr = [1, 2, 3]; arr[10];");
      expect(result).toEqual({ type: "null" });
    });
  });

  describe("objects", () => {
    it("should create and access objects", () => {
      const result = evaluate('let obj = { x: 10, y: 20 }; obj["x"];');
      expect(result).toEqual({ type: "number", value: 10 });
    });
  });

  describe("strings", () => {
    it("should concatenate strings", () => {
      const result = evaluate('"hello" + " " + "world";');
      expect(result).toEqual({ type: "string", value: "hello world" });
    });

    it("should compare strings", () => {
      expect(evaluate('"abc" == "abc";')).toEqual({ type: "boolean", value: true });
      expect(evaluate('"abc" != "xyz";')).toEqual({ type: "boolean", value: true });
    });
  });

  describe("builtins", () => {
    it("should return length of array", () => {
      const result = evaluate("len([1, 2, 3]);");
      expect(result).toEqual({ type: "number", value: 3 });
    });

    it("should return length of string", () => {
      const result = evaluate('len("hello");');
      expect(result).toEqual({ type: "number", value: 5 });
    });

    it("should return type of value", () => {
      expect(evaluate("type(42);")).toEqual({ type: "string", value: "number" });
      expect(evaluate('type("hi");')).toEqual({ type: "string", value: "string" });
    });

    it("should push to array", () => {
      const result = evaluate("let arr = push([1, 2], 3); len(arr);");
      expect(result).toEqual({ type: "number", value: 3 });
    });
  });
});
