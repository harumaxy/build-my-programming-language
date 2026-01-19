# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyLang is a programming language interpreter implemented in TypeScript as a job portfolio project. It follows a classic tree-walking interpreter architecture: Source Code → Lexer → Tokens → Parser → AST → Evaluator → Result.

## Build & Test Commands

```bash
# Run the REPL
bun run start
bun run repl

# Run tests (watch mode)
bun run test
# Run tests once
bun run test:run

# CLI usage
bun run index.ts              # Start REPL
bun run index.ts <file>       # Execute a .mylang file
bun run index.ts -e "<code>"  # Execute inline code
```

## Architecture

The interpreter is built using Chevrotain (TypeScript parser library) and consists of four main components:

### Lexer (`/src/lexer/`)

- `tokens.ts` - Token definitions using Chevrotain's `createToken`
- `lexer.ts` - Tokenizer that produces token stream from source code

### Parser (`/src/parser/`)

- `parser.ts` - Recursive descent parser using Chevrotain's `EmbeddedActionsParser`
- Generates AST directly during parsing via embedded actions
- Implements operator precedence through grammar structure

### AST (`/src/ast/`)

- `ast.ts` - Node type definitions using TypeScript discriminated unions
- All nodes have a `type` field for discrimination
- Helper functions like `numberLiteral()`, `binaryExpression()` for node creation

### Evaluator (`/src/evaluator/`)

- `evaluator.ts` - Tree-walking evaluator with recursive `evaluate()` method
- `values.ts` - Runtime value types and `Environment` class for lexical scoping
- `builtins.ts` - Built-in functions (`print`, `len`, `first`, `last`, `rest`, `push`, `pop`, `type`)

## Language Features

- **Types:** number, string, boolean, null, array, object, function
- **Variables:** `let` (mutable) and `const` (immutable)
- **Control flow:** if/else/elif, while, for (C-style)
- **Functions:** Named declarations, anonymous expressions, closures, recursion
- **Operators:** Arithmetic (`+`, `-`, `*`, `/`, `%`), comparison, logical (`&&`, `||`, `!`)

## Key Design Patterns

- Environment chain for lexical scoping - each scope has a parent reference
- Closures capture their defining environment
- AST nodes are plain objects with discriminated union types
- Parser uses embedded actions to build AST during parsing (no separate tree construction phase)
