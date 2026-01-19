import {
  Value,
  BuiltinFunctionValue,
  createNumber,
  createString,
  createNull,
  createArray,
  valueToString,
} from "./values";

// ========== 組み込み関数 ==========

const print: BuiltinFunctionValue = {
  type: "builtin",
  fn: (...args: Value[]): Value => {
    console.log(...args.map(valueToString));
    return createNull();
  },
};

const len: BuiltinFunctionValue = {
  type: "builtin",
  fn: (arg: Value): Value => {
    if (!arg) {
      throw new Error("len() requires 1 argument");
    }
    if (arg.type === "string") {
      return createNumber(arg.value.length);
    }
    if (arg.type === "array") {
      return createNumber(arg.elements.length);
    }
    throw new Error(`len() not supported for type: ${arg.type}`);
  },
};

const typeOf: BuiltinFunctionValue = {
  type: "builtin",
  fn: (arg: Value): Value => {
    if (!arg) {
      throw new Error("type() requires 1 argument");
    }
    return createString(arg.type);
  },
};

const push: BuiltinFunctionValue = {
  type: "builtin",
  fn: (arr: Value, ...items: Value[]): Value => {
    if (!arr || arr.type !== "array") {
      throw new Error("push() requires an array as first argument");
    }
    return createArray([...arr.elements, ...items]);
  },
};

const pop: BuiltinFunctionValue = {
  type: "builtin",
  fn: (arr: Value): Value => {
    if (!arr || arr.type !== "array") {
      throw new Error("pop() requires an array");
    }
    if (arr.elements.length === 0) {
      return createNull();
    }
    return arr.elements[arr.elements.length - 1];
  },
};

const first: BuiltinFunctionValue = {
  type: "builtin",
  fn: (arr: Value): Value => {
    if (!arr || arr.type !== "array") {
      throw new Error("first() requires an array");
    }
    if (arr.elements.length === 0) {
      return createNull();
    }
    return arr.elements[0];
  },
};

const last: BuiltinFunctionValue = {
  type: "builtin",
  fn: (arr: Value): Value => {
    if (!arr || arr.type !== "array") {
      throw new Error("last() requires an array");
    }
    if (arr.elements.length === 0) {
      return createNull();
    }
    return arr.elements[arr.elements.length - 1];
  },
};

const rest: BuiltinFunctionValue = {
  type: "builtin",
  fn: (arr: Value): Value => {
    if (!arr || arr.type !== "array") {
      throw new Error("rest() requires an array");
    }
    if (arr.elements.length === 0) {
      return createNull();
    }
    return createArray(arr.elements.slice(1));
  },
};

// ========== エクスポート ==========
export const builtins: Record<string, BuiltinFunctionValue> = {
  print,
  len,
  type: typeOf,
  push,
  pop,
  first,
  last,
  rest,
};
