# bon-agents-md

`bon-agents-md` is a CLI that generates lean AI-working guides plus a Delta-first documentation skeleton.

It is designed for teams and solo developers who want to:

- start AI-assisted work quickly
- keep concept / spec / architecture / plan aligned
- reduce scope creep and document drift
- keep long-running AI work reviewable

---

## What It Generates

Run one command and `bon` creates:

- an editor-facing guide
  - `AGENTS.md` for Codex / Claude Code
  - `.cursorrules` for Cursor
  - `copilot-instructions.md` for Copilot
- canonical project docs under `docs/`
  - `docs/OVERVIEW.md`
  - `docs/concept.md`
  - `docs/spec.md`
  - `docs/architecture.md`
  - `docs/plan.md`
  - `docs/delta/TEMPLATE.md`
  - `docs/delta/REVIEW_CHECKLIST.md`
- project-local skills
- validation scripts
  - `scripts/validate_delta_links.js`
  - `scripts/check_code_size.js`

The generated structure is intentionally opinionated: the guide stays lean, and project-specific truth lives under `docs/`.

---

## Philosophy

`bon-agents-md` is built around a simple idea:

**AI work is safest when change is small, reviewable, and tied to a canonical record.**

That leads to these operating principles:

1. Delta-first
   - Every requirement is handled as a delta:
     `delta request -> delta apply -> delta verify -> delta archive`
2. Canonical docs first
   - `docs/OVERVIEW.md` is the operational entrypoint
   - `concept / spec / architecture / plan` are the canonical project record
3. Minimal diffs
   - A delta should change only what it needs to change
   - speculative cleanup and unrelated refactors stay out
4. Review at milestones
   - when a major feature completes, run a `review delta`
   - if a plan item spreads across multiple deltas, review earlier
5. Keep the system readable
   - `plan.md` stays thin
   - archive details move to monthly archive files
   - oversized source files are reviewed and split

This is not just a prompt template. It is an operating model for AI-assisted development.

Reference:

- [`docs/philosophy.py`](docs/philosophy.py)

---

## Install

```bash
npm install -g bon-agents-md
```

Requires Node.js 16+.

---

## Basic Usage

```bash
bon
bon --dir path/to/project
bon --force
bon --lang ts
bon --editor cursor
bon --help
bon --version
```

Options:

- `--dir`: output directory
- `--force`: overwrite an existing guide file
- `--lang`: `python | js | ts | rust`
- `--editor`: `codex | cursor | claudecode | copilot`

---

## How To Use It

### 1. Generate the guide and docs

```bash
bon --editor codex --lang python
```

### 2. Open the entrypoint

Read:

- `AGENTS.md` or the editor-specific guide
- `docs/OVERVIEW.md`

`OVERVIEW.md` tells you:

- current scope
- canonical links
- review rules
- plan slimming rules
- delta operating rules

### 3. Add one small plan item

Start from `docs/plan.md`.

Keep it small. One plan item should normally become one delta seed.

### 4. Create a delta

Copy `docs/delta/TEMPLATE.md` into a new file:

```text
docs/delta/DR-YYYYMMDD-short-name.md
```

Fill in:

- `Delta Type`
- purpose
- In Scope
- Out of Scope
- Acceptance Criteria
- review gate requirement

### 5. Implement only the delta

Work only on AC-linked changes.

Do not mix in:

- unrelated refactors
- broad redesign
- speculative extension

### 6. Verify

Run:

```bash
node scripts/validate_delta_links.js --dir .
node scripts/check_code_size.js --dir .
```

And run the relevant tests for the change.

### 7. Archive

When verify is PASS:

- archive the delta
- move plan completion into plan archive summary if needed
- sync canonical docs with minimal diffs

---

## Delta Types

The generated workflow supports these delta types:

- `FEATURE`
- `REPAIR`
- `DESIGN`
- `REVIEW`
- `DOCS-SYNC`
- `OPS`

### REVIEW delta

`REVIEW` is important for long-running AI work.

Use it when:

- a major feature is complete
- one plan item has grown into 3 or more deltas
- 5 non-review deltas have continued without a review
- architecture / docs / data hygiene need a checkpoint
- you simply want a design review now

Manual trigger examples:

- `run a review delta`
- `do a design review`

`REVIEW` delta uses:

- `docs/delta/REVIEW_CHECKLIST.md`

It checks:

- layer integrity
- docs sync
- data size / record hygiene
- code split health
- verify coverage

If problems are found, the review delta should record follow-up seeds rather than mixing large fixes into the review itself.

---

## Plan Slimming

`docs/plan.md` is intentionally thin.

It should contain only:

- `current`
- `review timing`
- `future`
- `archive`
- `archive index`

Detailed history moves into monthly files such as:

- `docs/plan_archive_2026_03.md`

Manual trigger examples:

- `shrink the plan`
- `organize the archive`

Codex may also slim the plan when:

- archive summary grows past 5 items
- `plan.md` exceeds 120 lines
- archive becomes clearly larger than current + future
- a month boundary makes archival natural

---

## Validation

### Delta consistency

```bash
node scripts/validate_delta_links.js --dir .
```

Checks:

- `docs/plan.md`
- `docs/delta/DR-*.md`
- archive PASS consistency

### Code size

```bash
node scripts/check_code_size.js --dir .
```

Defaults:

- over 500 lines: review target
- over 800 lines: should be split
- over 1000 lines: exception only

This applies to source-code file extensions, not Markdown docs.

---

## Practical Working Pattern

A realistic cycle looks like this:

1. add one plan item
2. create one delta
3. implement the smallest useful change
4. verify with tests + validators
5. archive
6. run a `REVIEW` delta at a meaningful boundary
7. slim the plan when it starts getting noisy

That is the intended workflow.

---

## Generated Structure

### Guides

- Codex / Claude Code: `AGENTS.md`
- Cursor: `.cursorrules`
- Copilot: `copilot-instructions.md`

### Canonical docs

- `docs/OVERVIEW.md`
- `docs/concept.md`
- `docs/spec.md`
- `docs/architecture.md`
- `docs/plan.md`
- `docs/delta/TEMPLATE.md`
- `docs/delta/REVIEW_CHECKLIST.md`

### Support scripts

- `scripts/validate_delta_links.js`
- `scripts/check_code_size.js`

### Project-local skills

- codex / claudecode: `./.codex/skills`
- cursor: `./.cursor/skills`
- copilot: `./.github/copilot/skills`

Skills are copied into the project. They are not installed globally by `bon`.

---

## Locale

Locale is inferred from:

- `LANG`
- `LC_ALL`
- OS locale

WSL prefers Windows locale.

If the locale is Japanese, generated docs are Japanese-oriented.

---

## Development

Run tests:

```bash
npm test
```

Run validators:

```bash
node scripts/validate_delta_links.js --dir .
node scripts/check_code_size.js --dir .
```

---

## Why This Shape Works

This project is intentionally biased toward:

- clarity over cleverness
- reviewable milestones over fully open-ended AI autonomy
- canonical documentation over scattered notes
- controlled evolution over prompt sprawl

If you want AI to work longer without drifting, this shape is the point.
