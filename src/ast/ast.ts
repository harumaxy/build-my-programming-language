// ========== プログラム ==========
export interface Program {
  type: "Program";
  body: Statement[];
}

// ========== 文 (Statement) ==========
export type Statement =
  | LetStatement
  | ConstStatement
  | ExpressionStatement
  | BlockStatement
  | IfStatement
  | WhileStatement
  | ForStatement
  | FunctionDeclaration
  | ReturnStatement;

export interface LetStatement {
  type: "LetStatement";
  name: string;
  value: Expression;
}

export interface ConstStatement {
  type: "ConstStatement";
  name: string;
  value: Expression;
}

export interface ExpressionStatement {
  type: "ExpressionStatement";
  expression: Expression;
}

export interface BlockStatement {
  type: "BlockStatement";
  body: Statement[];
}

export interface IfStatement {
  type: "IfStatement";
  condition: Expression;
  consequence: BlockStatement;
  alternative?: BlockStatement | IfStatement; // else or else if
}

export interface WhileStatement {
  type: "WhileStatement";
  condition: Expression;
  body: BlockStatement;
}

export interface ForStatement {
  type: "ForStatement";
  init?: Statement;
  condition?: Expression;
  update?: Expression;
  body: BlockStatement;
}

export interface FunctionDeclaration {
  type: "FunctionDeclaration";
  name: string;
  params: string[];
  body: BlockStatement;
}

export interface ReturnStatement {
  type: "ReturnStatement";
  value?: Expression;
}

// ========== 式 (Expression) ==========
export type Expression =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | NullLiteral
  | Identifier
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | MemberExpression
  | IndexExpression
  | AssignmentExpression
  | ArrayLiteral
  | ObjectLiteral
  | FunctionExpression;

export interface NumberLiteral {
  type: "NumberLiteral";
  value: number;
}

export interface StringLiteral {
  type: "StringLiteral";
  value: string;
}

export interface BooleanLiteral {
  type: "BooleanLiteral";
  value: boolean;
}

export interface NullLiteral {
  type: "NullLiteral";
}

export interface Identifier {
  type: "Identifier";
  name: string;
}

export interface BinaryExpression {
  type: "BinaryExpression";
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

export type BinaryOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "=="
  | "!="
  | "<"
  | ">"
  | "<="
  | ">="
  | "&&"
  | "||";

export interface UnaryExpression {
  type: "UnaryExpression";
  operator: UnaryOperator;
  argument: Expression;
}

export type UnaryOperator = "-" | "!";

export interface CallExpression {
  type: "CallExpression";
  callee: Expression;
  arguments: Expression[];
}

export interface MemberExpression {
  type: "MemberExpression";
  object: Expression;
  property: string;
}

export interface IndexExpression {
  type: "IndexExpression";
  object: Expression;
  index: Expression;
}

export interface AssignmentExpression {
  type: "AssignmentExpression";
  name: string;
  value: Expression;
}

export interface ArrayLiteral {
  type: "ArrayLiteral";
  elements: Expression[];
}

export interface ObjectLiteral {
  type: "ObjectLiteral";
  properties: { key: string; value: Expression }[];
}

export interface FunctionExpression {
  type: "FunctionExpression";
  params: string[];
  body: BlockStatement;
}

// ========== ヘルパー関数 ==========
export function createProgram(body: Statement[]): Program {
  return { type: "Program", body };
}

export function createLetStatement(name: string, value: Expression): LetStatement {
  return { type: "LetStatement", name, value };
}

export function createNumberLiteral(value: number): NumberLiteral {
  return { type: "NumberLiteral", value };
}

export function createStringLiteral(value: string): StringLiteral {
  return { type: "StringLiteral", value };
}

export function createBooleanLiteral(value: boolean): BooleanLiteral {
  return { type: "BooleanLiteral", value };
}

export function createIdentifier(name: string): Identifier {
  return { type: "Identifier", name };
}

export function createBinaryExpression(
  operator: BinaryOperator,
  left: Expression,
  right: Expression
): BinaryExpression {
  return { type: "BinaryExpression", operator, left, right };
}

export function createCallExpression(
  callee: Expression,
  args: Expression[]
): CallExpression {
  return { type: "CallExpression", callee, arguments: args };
}
