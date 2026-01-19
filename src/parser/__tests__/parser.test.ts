import { describe, it, expect } from "vitest";
import { parse } from "../index";

describe("Parser", () => {
  describe("let statement", () => {
    it("should parse let statement with number", () => {
      const result = parse("let x = 10;");

      expect(result.errors).toHaveLength(0);
      expect(result.ast.body).toHaveLength(1);

      const stmt = result.ast.body[0];
      expect(stmt.type).toBe("LetStatement");
      if (stmt.type === "LetStatement") {
        expect(stmt.name).toBe("x");
        expect(stmt.value.type).toBe("NumberLiteral");
      }
    });

    it("should parse let statement with expression", () => {
      const result = parse("let y = 1 + 2 * 3;");

      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      if (stmt.type === "LetStatement") {
        expect(stmt.value.type).toBe("BinaryExpression");
      }
    });
  });

  describe("arithmetic expressions", () => {
    it("should parse addition", () => {
      const result = parse("1 + 2;");

      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      if (stmt.type === "ExpressionStatement") {
        const expr = stmt.expression;
        expect(expr.type).toBe("BinaryExpression");
        if (expr.type === "BinaryExpression") {
          expect(expr.operator).toBe("+");
        }
      }
    });

    it("should respect operator precedence (* before +)", () => {
      const result = parse("1 + 2 * 3;");

      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      if (stmt.type === "ExpressionStatement") {
        const expr = stmt.expression;
        // 1 + (2 * 3) の構造になるべき
        expect(expr.type).toBe("BinaryExpression");
        if (expr.type === "BinaryExpression") {
          expect(expr.operator).toBe("+");
          expect(expr.left.type).toBe("NumberLiteral");
          expect(expr.right.type).toBe("BinaryExpression");
          if (expr.right.type === "BinaryExpression") {
            expect(expr.right.operator).toBe("*");
          }
        }
      }
    });
  });

  describe("if statement", () => {
    it("should parse if statement", () => {
      const result = parse("if (x == 10) { let y = 1; }");

      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      expect(stmt.type).toBe("IfStatement");
      if (stmt.type === "IfStatement") {
        expect(stmt.condition.type).toBe("BinaryExpression");
        expect(stmt.consequence.body).toHaveLength(1);
        expect(stmt.alternative).toBeUndefined();
      }
    });

    it("should parse if-else statement", () => {
      const result = parse("if (x == 10) { let y = 1; } else { let z = 2; }");

      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      if (stmt.type === "IfStatement") {
        expect(stmt.alternative).toBeDefined();
        if (stmt.alternative?.type === "BlockStatement") {
          expect(stmt.alternative.body).toHaveLength(1);
        }
      }
    });
  });

  describe("function declaration", () => {
    it("should parse function declaration", () => {
      const result = parse("fn add(a, b) { return a + b; }");

      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      expect(stmt.type).toBe("FunctionDeclaration");
      if (stmt.type === "FunctionDeclaration") {
        expect(stmt.name).toBe("add");
        expect(stmt.params).toEqual(["a", "b"]);
        expect(stmt.body.body).toHaveLength(1);
      }
    });

    it("should parse function without params", () => {
      const result = parse("fn greet() { return 42; }");

      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      if (stmt.type === "FunctionDeclaration") {
        expect(stmt.name).toBe("greet");
        expect(stmt.params).toEqual([]);
      }
    });
  });

  describe("call expression", () => {
    it("should parse function call", () => {
      const result = parse("add(1, 2);");

      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      if (stmt.type === "ExpressionStatement") {
        expect(stmt.expression.type).toBe("CallExpression");
        if (stmt.expression.type === "CallExpression") {
          expect(stmt.expression.arguments).toHaveLength(2);
        }
      }
    });
  });

  describe("array literal", () => {
    it("should parse array literal", () => {
      const result = parse("[1, 2, 3];");

      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      if (stmt.type === "ExpressionStatement") {
        expect(stmt.expression.type).toBe("ArrayLiteral");
        if (stmt.expression.type === "ArrayLiteral") {
          expect(stmt.expression.elements).toHaveLength(3);
        }
      }
    });

    it("should parse empty array", () => {
      const result = parse("[];");

      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      if (stmt.type === "ExpressionStatement" && stmt.expression.type === "ArrayLiteral") {
        expect(stmt.expression.elements).toHaveLength(0);
      }
    });
  });

  describe("object literal", () => {
    it("should parse object literal", () => {
      const result = parse("{ x: 1, y: 2 };");

      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      if (stmt.type === "ExpressionStatement") {
        expect(stmt.expression.type).toBe("ObjectLiteral");
        if (stmt.expression.type === "ObjectLiteral") {
          expect(stmt.expression.properties).toHaveLength(2);
          expect(stmt.expression.properties[0].key).toBe("x");
        }
      }
    });
  });

  describe("unary expression", () => {
    it("should parse negative number", () => {
      const result = parse("-5;");

      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      if (stmt.type === "ExpressionStatement") {
        expect(stmt.expression.type).toBe("UnaryExpression");
        if (stmt.expression.type === "UnaryExpression") {
          expect(stmt.expression.operator).toBe("-");
        }
      }
    });

    it("should parse not expression", () => {
      const result = parse("!true;");

      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      if (stmt.type === "ExpressionStatement") {
        expect(stmt.expression.type).toBe("UnaryExpression");
        if (stmt.expression.type === "UnaryExpression") {
          expect(stmt.expression.operator).toBe("!");
        }
      }
    });
  });

  describe("while statement", () => {
    it("should parse while loop", () => {
      const result = parse("while (x < 10) { x = x + 1; }");

      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      expect(stmt.type).toBe("WhileStatement");
    });
  });

  describe("boolean and null literals", () => {
    it("should parse true", () => {
      const result = parse("true;");
      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      if (stmt.type === "ExpressionStatement") {
        expect(stmt.expression.type).toBe("BooleanLiteral");
        if (stmt.expression.type === "BooleanLiteral") {
          expect(stmt.expression.value).toBe(true);
        }
      }
    });

    it("should parse false", () => {
      const result = parse("false;");
      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      if (stmt.type === "ExpressionStatement" && stmt.expression.type === "BooleanLiteral") {
        expect(stmt.expression.value).toBe(false);
      }
    });

    it("should parse null", () => {
      const result = parse("null;");
      expect(result.errors).toHaveLength(0);
      const stmt = result.ast.body[0];
      if (stmt.type === "ExpressionStatement") {
        expect(stmt.expression.type).toBe("NullLiteral");
      }
    });
  });
});
