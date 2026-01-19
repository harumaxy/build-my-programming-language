# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing **MyLang**, a programming language interpreter implemented in TypeScript, along with a web playground. The interpreter follows a classic tree-walking architecture: Source Code → Lexer → Tokens → Parser → AST → Evaluator → Result.

## Monorepo Structure

- `mylang/` - Core language implementation (Chevrotain-based lexer/parser, tree-walking evaluator)
- `playground/` - React + Vite web playground for trying MyLang in the browser

## Build & Test Commands

All commands run from the `mylang/` directory:

```bash
bun run start              # Start REPL
bun run test               # Run tests (watch mode)
bun run test:run           # Run tests once
bun run check              # Lint and format with Biome

# CLI usage
bun run cli.ts                    # Start REPL
bun run cli.ts <file.mylang>      # Execute a .mylang file
bun run cli.ts -e "<code>"        # Execute inline code
```

Playground (from `playground/` directory):
```bash
bun run dev                # Dev server
bun run build              # Production build
```

## Architecture

### Lexer (`mylang/src/lexer/`)
- Uses Chevrotain's `createToken` for token definitions
- `tokens.ts` defines all tokens; `lexer.ts` produces token stream

### Parser (`mylang/src/parser/`)
- Recursive descent parser using Chevrotain's `EmbeddedActionsParser`
- Generates AST directly during parsing via embedded actions (no separate tree construction)
- Operator precedence implemented through grammar structure

### AST (`mylang/src/ast/`)
- TypeScript discriminated unions with `type` field on all nodes
- Factory functions for node creation (e.g., `numberLiteral()`, `binaryExpression()`)

### Evaluator (`mylang/src/evaluator/`)
- `evaluator.ts` - Tree-walking interpreter with recursive `evaluate()` method
- `values.ts` - Runtime value types and `Environment` class for lexical scoping
- `builtins.ts` - Built-in functions: `print`, `len`, `first`, `last`, `rest`, `push`, `pop`, `type`
- Environment chain enables closures (each scope has parent reference)

### Public API (`mylang/src/index.ts`)
- Main export: `run(source: string): string`
- Handles naming conflicts between lexer tokens and AST types via aliased exports

## Language Reference

See `mylang/syntax.md` for complete language specification including:
- Data types: number, string, boolean, null, array, object, function
- Variables: `let` (mutable), `const` (immutable)
- Control flow: if/else/else if, while, for (C-style)
- Functions: Named declarations, anonymous expressions, closures, recursion
- Truthy/falsy: `false`, `null`, `0`, `""`, `[]` are falsy
