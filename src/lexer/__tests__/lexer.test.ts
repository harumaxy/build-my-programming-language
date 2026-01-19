import { describe, it, expect } from "vitest";
import { lex } from "../lexer";
import {
  Let,
  Identifier,
  Equal,
  NumberLiteral,
  Plus,
  Semicolon,
  StringLiteral,
  If,
  LParen,
  RParen,
  LBrace,
  RBrace,
  EqualEqual,
  Function,
  Return,
  Comma,
  True,
  False,
  Minus,
  Multiply,
  Divide,
} from "../tokens";

describe("Lexer", () => {
  it("should tokenize variable declaration", () => {
    const result = lex("let x = 10;");

    expect(result.errors).toHaveLength(0);
    expect(result.tokens).toHaveLength(5);

    expect(result.tokens[0].tokenType).toBe(Let);
    expect(result.tokens[1].tokenType).toBe(Identifier);
    expect(result.tokens[1].image).toBe("x");
    expect(result.tokens[2].tokenType).toBe(Equal);
    expect(result.tokens[3].tokenType).toBe(NumberLiteral);
    expect(result.tokens[3].image).toBe("10");
    expect(result.tokens[4].tokenType).toBe(Semicolon);
  });

  it("should tokenize arithmetic expression", () => {
    const result = lex("1 + 2 * 3 - 4 / 2");

    expect(result.errors).toHaveLength(0);
    expect(result.tokens).toHaveLength(9);

    expect(result.tokens[0].tokenType).toBe(NumberLiteral);
    expect(result.tokens[1].tokenType).toBe(Plus);
    expect(result.tokens[2].tokenType).toBe(NumberLiteral);
    expect(result.tokens[3].tokenType).toBe(Multiply);
    expect(result.tokens[4].tokenType).toBe(NumberLiteral);
    expect(result.tokens[5].tokenType).toBe(Minus);
    expect(result.tokens[6].tokenType).toBe(NumberLiteral);
    expect(result.tokens[7].tokenType).toBe(Divide);
    expect(result.tokens[8].tokenType).toBe(NumberLiteral);
  });

  it("should tokenize string literals", () => {
    const result = lex('"hello" \'world\'');

    expect(result.errors).toHaveLength(0);
    expect(result.tokens).toHaveLength(2);

    expect(result.tokens[0].tokenType).toBe(StringLiteral);
    expect(result.tokens[0].image).toBe('"hello"');
    expect(result.tokens[1].tokenType).toBe(StringLiteral);
    expect(result.tokens[1].image).toBe("'world'");
  });

  it("should tokenize if statement", () => {
    const result = lex("if (x == 10) { }");

    expect(result.errors).toHaveLength(0);
    expect(result.tokens).toHaveLength(8);

    expect(result.tokens[0].tokenType).toBe(If);
    expect(result.tokens[1].tokenType).toBe(LParen);
    expect(result.tokens[2].tokenType).toBe(Identifier);
    expect(result.tokens[3].tokenType).toBe(EqualEqual);
    expect(result.tokens[4].tokenType).toBe(NumberLiteral);
    expect(result.tokens[5].tokenType).toBe(RParen);
    expect(result.tokens[6].tokenType).toBe(LBrace);
    expect(result.tokens[7].tokenType).toBe(RBrace);
  });

  it("should tokenize function definition", () => {
    const result = lex("fn add(a, b) { return a + b; }");

    expect(result.errors).toHaveLength(0);

    expect(result.tokens[0].tokenType).toBe(Function);
    expect(result.tokens[1].tokenType).toBe(Identifier);
    expect(result.tokens[1].image).toBe("add");
    expect(result.tokens[2].tokenType).toBe(LParen);
    expect(result.tokens[3].tokenType).toBe(Identifier);
    expect(result.tokens[4].tokenType).toBe(Comma);
    expect(result.tokens[5].tokenType).toBe(Identifier);
    expect(result.tokens[6].tokenType).toBe(RParen);
    expect(result.tokens[7].tokenType).toBe(LBrace);
    expect(result.tokens[8].tokenType).toBe(Return);
  });

  it("should tokenize boolean literals", () => {
    const result = lex("true false");

    expect(result.errors).toHaveLength(0);
    expect(result.tokens).toHaveLength(2);

    expect(result.tokens[0].tokenType).toBe(True);
    expect(result.tokens[1].tokenType).toBe(False);
  });

  it("should tokenize decimal numbers", () => {
    const result = lex("3.14 0.5 10.0");

    expect(result.errors).toHaveLength(0);
    expect(result.tokens).toHaveLength(3);

    expect(result.tokens[0].image).toBe("3.14");
    expect(result.tokens[1].image).toBe("0.5");
    expect(result.tokens[2].image).toBe("10.0");
  });

  it("should skip comments", () => {
    const result = lex(`
      // this is a comment
      let x = 10;
    `);

    expect(result.errors).toHaveLength(0);
    // コメントはスキップされるので、let x = 10; の5トークンのみ
    expect(result.tokens).toHaveLength(5);
  });

  it("should distinguish keywords from identifiers", () => {
    const result = lex("let letter = 1;");

    expect(result.errors).toHaveLength(0);
    expect(result.tokens[0].tokenType).toBe(Let);
    expect(result.tokens[1].tokenType).toBe(Identifier);
    expect(result.tokens[1].image).toBe("letter"); // "let"で始まるが識別子
  });

  it("should track line and column numbers", () => {
    const result = lex("let x = 10;\nlet y = 20;");

    expect(result.errors).toHaveLength(0);

    // 1行目
    expect(result.tokens[0].startLine).toBe(1);
    expect(result.tokens[0].startColumn).toBe(1);

    // 2行目
    expect(result.tokens[5].startLine).toBe(2);
    expect(result.tokens[5].startColumn).toBe(1);
  });
});
