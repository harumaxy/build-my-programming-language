# Build My Programming Language

プログラミング言語実装してみるプロジェクト

## 技術スタック

- 実装言語: TypeScript
- パーサー: [chevrotain](https://chevrotain.io/)
- ランタイム: Node.js
- テスト: Vitest

### TypeScript を選んだ理由

1. **デモのしやすさ**: ブラウザ上でプレイグラウンドを作成可能。すぐに試せる
2. **型システム**: Union型やDiscriminated Unionを使ったAST定義が直感的
3. **エコシステム**: npm公開やWebアプリ化が容易
4. **chevrotain**: 高速で実績のあるTypeScript製パーサーライブラリ (prettier なども使用)

## プログラミング言語実装の構成要素

```
ソースコード → [Lexer] → トークン列 → [Parser] → AST → [Evaluator] → 実行結果
```

### 1. 字句解析（Lexer / Tokenizer）

ソースコードの文字列を「トークン」という最小単位に分割する処理。

```
入力: let x = 10 + 20;

出力:
  [LET]
  [IDENTIFIER: "x"]
  [EQUALS]
  [NUMBER: 10]
  [PLUS]
  [NUMBER: 20]
  [SEMICOLON]
```

**役割:**

- 空白やコメントの除去
- キーワード（`let`, `if`, `function`など）の認識
- リテラル（数値、文字列）の抽出
- 演算子や記号の分類

### 2. 構文解析（Parser）

トークン列を文法規則に従って解析し、抽象構文木（AST）に変換する処理。

**文法の例（BNF記法）:**

```bnf
<program>    ::= <statement>*
<statement>  ::= <let-stmt> | <expr-stmt>
<let-stmt>   ::= "let" <identifier> "=" <expression> ";"
<expression> ::= <term> (("+" | "-") <term>)*
<term>       ::= <factor> (("*" | "/") <factor>)*
<factor>     ::= <number> | <identifier> | "(" <expression> ")"
```

**パース手法:**

- [ ] **再帰下降構文解析**: 文法規則をそのまま関数として実装
- [ ] **Pratt Parser**: 演算子の優先順位を柔軟に扱える
- [x] **パーサーコンビネータ**: 小さなパーサーを組み合わせる（chevrotainが採用）

### 3. 抽象構文木（AST: Abstract Syntax Tree）

プログラムの構造を木構造で表現したデータ。

```
let x = 10 + 20;

        LetStatement
       /     |      \
    "x"     "="    BinaryExpression
                   /      |      \
              Number    "+"    Number
               (10)             (20)
```

**TypeScriptでの表現例:**

```typescript
type Expression =
  | { type: "NumberLiteral"; value: number }
  | { type: "Identifier"; name: string }
  | {
      type: "BinaryExpression";
      operator: string;
      left: Expression;
      right: Expression;
    };

type Statement =
  | { type: "LetStatement"; name: string; value: Expression }
  | { type: "ExpressionStatement"; expression: Expression };
```

### 4. 意味解析（Semantic Analysis）

ASTの意味的な正しさを検証する処理。

**検証内容:**

- **スコープ解決**: 変数がどのスコープで定義されているか追跡
- **未定義変数の検出**: 宣言されていない変数の使用をエラーに
- **型チェック**（オプション）: 型の整合性を検証
- **定数畳み込み**（最適化）: `1 + 2` を `3` に事前計算

### 5. 評価器（Evaluator / Interpreter）

ASTを走査しながら、実際に計算を実行する処理。

**Tree-Walking Interpreter:**

```typescript
function evaluate(node: Expression, env: Environment): Value {
  switch (node.type) {
    case "NumberLiteral":
      return node.value;
    case "Identifier":
      return env.get(node.name);
    case "BinaryExpression":
      const left = evaluate(node.left, env);
      const right = evaluate(node.right, env);
      switch (node.operator) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        // ...
      }
  }
}
```

### 6. ランタイム（Runtime）

プログラム実行時に必要な環境と組み込み機能。

**含まれるもの:**

- **環境（Environment）**: 変数とその値を保持するスコープチェーン
- **組み込み関数**: `print()`, `len()`, `type()` など
- **組み込み型**: 数値、文字列、配列、オブジェクトなど
- **ガベージコレクション**: 不要なメモリの解放（JSランタイムに委譲可能）

## 実装ロードマップ

### Phase 1: 基礎

- [x] プロジェクトセットアップ（TypeScript, chevrotain, Vitest）
- [x] Lexer実装（基本トークン）
- [x] Parser実装（式、変数宣言）
- [x] AST定義
- [x] 基本的なEvaluator

### Phase 2: 制御構文

- [x] if/else文
- [x] while/forループ
- [x] 関数定義と呼び出し
- [x] スコープとクロージャ

### Phase 3: データ構造

- [x] 文字列操作
- [x] 配列
- [x] オブジェクト/辞書

### Phase 4: 発展

- [ ] エラーメッセージの改善（行番号、列番号）
- [x] REPL（対話型実行環境）
- [ ] Webプレイグラウンド
- [ ] VSCode拡張（シンタックスハイライト）

## 参考資料

- [Crafting Interpreters](https://craftinginterpreters.com/) - 言語実装の名著（無料Web版あり）
- [Writing An Interpreter In Go](https://interpreterbook.com/) - Goでの実装例（TypeScript版もある）
- [chevrotain Documentation](https://chevrotain.io/docs/) - パーサーライブラリの公式ドキュメント
- [The Super Tiny Compiler](https://github.com/jamiebuilds/the-super-tiny-compiler) - 200行で学ぶコンパイラの基礎

## まとめ: プログラミング言語実装の6要素

- Lexer: 文字列 → トークン列に分割
- Parser: トークン列 → AST（木構造）に変換
- AST(Abstract Syntax Tree): プログラムの構造を表すデータ
- 意味解析（Semantic Analysis）: スコープ解決、未定義変数チェック等
- Evaluator: ASTを辿って実際に計算を実行
- Runtime: 環境、組み込み関数、標準機能
