# MyLang 言語仕様

## 概要

MyLangはシンプルで学習しやすいスクリプト言語です。JavaScript/Rustライクな構文を採用しています。

## データ型

### プリミティブ型

| 型 | 説明 | 例 |
|----|------|-----|
| number | 数値（整数・浮動小数点） | `42`, `3.14`, `-10` |
| string | 文字列 | `"hello"`, `'world'` |
| boolean | 真偽値 | `true`, `false` |
| null | 値なし | `null` |

### 複合型

| 型 | 説明 | 例 |
|----|------|-----|
| array | 配列 | `[1, 2, 3]` |
| object | オブジェクト | `{ x: 1, y: 2 }` |
| function | 関数 | `fn(x) { return x * 2; }` |

## リテラル

```
// 数値
42
3.14
-10

// 文字列（ダブルクォート or シングルクォート）
"hello world"
'hello world'

// 真偽値
true
false

// null
null

// 配列
[1, 2, 3]
["a", "b", "c"]
[]

// オブジェクト
{ name: "Alice", age: 30 }
{}
```

## 変数宣言

### let（再代入可能）

```
let x = 10;
x = 20;  // OK
```

### const（再代入不可）

```
const PI = 3.14159;
PI = 3;  // Error: Cannot reassign constant
```

## 演算子

### 算術演算子

| 演算子 | 説明 | 例 |
|--------|------|-----|
| `+` | 加算 / 文字列連結 | `1 + 2` → `3`, `"a" + "b"` → `"ab"` |
| `-` | 減算 | `5 - 3` → `2` |
| `*` | 乗算 | `2 * 3` → `6` |
| `/` | 除算 | `10 / 2` → `5` |
| `%` | 剰余 | `10 % 3` → `1` |

### 比較演算子

| 演算子 | 説明 | 例 |
|--------|------|-----|
| `==` | 等しい | `5 == 5` → `true` |
| `!=` | 等しくない | `5 != 3` → `true` |
| `<` | より小さい | `3 < 5` → `true` |
| `>` | より大きい | `5 > 3` → `true` |
| `<=` | 以下 | `3 <= 3` → `true` |
| `>=` | 以上 | `5 >= 5` → `true` |

### 論理演算子

| 演算子 | 説明 | 例 |
|--------|------|-----|
| `&&` | 論理AND | `true && false` → `false` |
| `\|\|` | 論理OR | `true \|\| false` → `true` |
| `!` | 論理NOT | `!true` → `false` |

### 単項演算子

| 演算子 | 説明 | 例 |
|--------|------|-----|
| `-` | 符号反転 | `-5` → `-5` |
| `!` | 論理否定 | `!true` → `false` |

### 演算子の優先順位（高い順）

1. `!`, `-`（単項）
2. `*`, `/`, `%`
3. `+`, `-`
4. `<`, `>`, `<=`, `>=`
5. `==`, `!=`
6. `&&`
7. `||`
8. `=`（代入）

## 制御構文

### if文

```
if (condition) {
  // condition が真のとき実行
}

if (condition) {
  // 真のとき
} else {
  // 偽のとき
}

if (x == 1) {
  // x が 1
} else if (x == 2) {
  // x が 2
} else {
  // それ以外
}
```

### while文

```
let i = 0;
while (i < 10) {
  print(i);
  i = i + 1;
}
```

### for文

```
for (let i = 0; i < 10; i = i + 1) {
  print(i);
}
```

## 関数

### 関数宣言

```
fn add(a, b) {
  return a + b;
}

let result = add(1, 2);  // 3
```

### 関数式（無名関数）

```
let double = fn(x) {
  return x * 2;
};

print(double(5));  // 10
```

### クロージャ

関数は定義時のスコープを保持します。

```
fn makeCounter() {
  let count = 0;
  return fn() {
    count = count + 1;
    return count;
  };
}

let counter = makeCounter();
print(counter());  // 1
print(counter());  // 2
print(counter());  // 3
```

### 再帰

```
fn factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

print(factorial(5));  // 120
```

## 配列操作

### 作成とアクセス

```
let arr = [1, 2, 3, 4, 5];

print(arr[0]);   // 1（最初の要素）
print(arr[2]);   // 3
print(arr[10]);  // null（範囲外）
```

### 組み込み関数

```
let arr = [1, 2, 3];

len(arr);           // 3
first(arr);         // 1
last(arr);          // 3
rest(arr);          // [2, 3]
push(arr, 4);       // [1, 2, 3, 4]（新しい配列を返す）
```

## オブジェクト操作

### 作成とアクセス

```
let person = {
  name: "Alice",
  age: 30
};

// ブラケット記法でアクセス
print(person["name"]);  // "Alice"
print(person["age"]);   // 30
```

## 文字列操作

### 連結

```
let greeting = "Hello" + " " + "World";
print(greeting);  // "Hello World"
```

### 長さ取得

```
let s = "hello";
print(len(s));  // 5
```

### インデックスアクセス

```
let s = "hello";
print(s[0]);  // "h"
print(s[4]);  // "o"
```

## 組み込み関数

| 関数 | 説明 | 例 |
|------|------|-----|
| `print(...)` | 値を出力 | `print("hello", 123)` |
| `len(x)` | 配列/文字列の長さ | `len([1,2,3])` → `3` |
| `type(x)` | 値の型を文字列で返す | `type(42)` → `"number"` |
| `first(arr)` | 配列の最初の要素 | `first([1,2,3])` → `1` |
| `last(arr)` | 配列の最後の要素 | `last([1,2,3])` → `3` |
| `rest(arr)` | 最初の要素を除いた配列 | `rest([1,2,3])` → `[2,3]` |
| `push(arr, x)` | 要素を追加した新配列 | `push([1,2], 3)` → `[1,2,3]` |
| `pop(arr)` | 最後の要素を返す | `pop([1,2,3])` → `3` |

## コメント

```
// これは行コメントです
let x = 10;  // 行末コメント
```

## 真偽値の評価（Truthy/Falsy）

以下の値は `false` として評価されます：

- `false`
- `null`
- `0`
- `""`（空文字列）
- `[]`（空配列）

それ以外の値は `true` として評価されます。

## スコープ

MyLangはレキシカルスコープを採用しています。

```
let x = "global";

fn outer() {
  let x = "outer";

  fn inner() {
    print(x);  // "outer"（外側のスコープを参照）
  }

  inner();
}

outer();
print(x);  // "global"
```

## 文法（BNF）

```bnf
<program>     ::= <statement>*

<statement>   ::= <let-stmt>
                | <const-stmt>
                | <if-stmt>
                | <while-stmt>
                | <for-stmt>
                | <fn-decl>
                | <return-stmt>
                | <expr-stmt>

<let-stmt>    ::= "let" <identifier> "=" <expression> ";"
<const-stmt>  ::= "const" <identifier> "=" <expression> ";"
<if-stmt>     ::= "if" "(" <expression> ")" <block> ("else" (<if-stmt> | <block>))?
<while-stmt>  ::= "while" "(" <expression> ")" <block>
<for-stmt>    ::= "for" "(" <statement>? ";" <expression>? ";" <expression>? ")" <block>
<fn-decl>     ::= "fn" <identifier> "(" <params>? ")" <block>
<return-stmt> ::= "return" <expression>? ";"
<expr-stmt>   ::= <expression> ";"

<block>       ::= "{" <statement>* "}"

<expression>  ::= <assignment>
<assignment>  ::= <identifier> "=" <assignment> | <or-expr>
<or-expr>     ::= <and-expr> ("||" <and-expr>)*
<and-expr>    ::= <equality> ("&&" <equality>)*
<equality>    ::= <comparison> (("==" | "!=") <comparison>)*
<comparison>  ::= <additive> (("<" | ">" | "<=" | ">=") <additive>)*
<additive>    ::= <multiplicative> (("+" | "-") <multiplicative>)*
<multiplicative> ::= <unary> (("*" | "/" | "%") <unary>)*
<unary>       ::= ("-" | "!") <unary> | <call>
<call>        ::= <primary> (("(" <args>? ")") | ("[" <expression> "]"))*
<primary>     ::= <number> | <string> | "true" | "false" | "null"
                | <identifier> | <array> | <object> | <fn-expr>
                | "(" <expression> ")"

<array>       ::= "[" (<expression> ("," <expression>)*)? "]"
<object>      ::= "{" (<identifier> ":" <expression> ("," <identifier> ":" <expression>)*)? "}"
<fn-expr>     ::= "fn" "(" <params>? ")" <block>

<params>      ::= <identifier> ("," <identifier>)*
<args>        ::= <expression> ("," <expression>)*
```

## キーワード一覧

```
let const fn return if else while for true false null
```

## 予約済み（将来の拡張用）

以下のキーワードは将来の拡張のために予約されています：

```
class import export async await break continue
```
