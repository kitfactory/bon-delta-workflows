# bon-agents-md ⚡️

`bon-agents-md` is a **one-command tool** to generate AI assistant guides (AGENTS.md, etc.).

- Auto-generates guides per editor (Codex CLI / Cursor / Claude Code / Copilot)
- Keeps concept / spec / architecture / plan **linked by Spec IDs**
- Separates project-specific details into `docs/` to reduce AI misreads/misgeneration

Use it as a **starter kit** when you want a fast design guide for AI, and to cut spec drift and rework.

---

## Why bon? 🌈

| You want | bon gives you |
| --- | --- |
| High-quality concept/spec/architecture/plan templates | Spec-ID-linked guardrails with clear approval points |
| Unambiguous specs | Headings with Spec IDs + numbered Given / When / Then and error behaviors |
| AI-ready architecture know-how | Layer responsibilities + key interfaces, with “no god API/data” baked in |
| Quick, crystal-clear samples | One-line success/failure examples with Error IDs matching implementation messages |
| Multi-editor outputs | Automatically picks `AGENTS.md` / `.cursorrules` / `copilot-instructions.md` for codex/cursor/claudecode/copilot |

---

## Install

```bash
npm install -g bon-agents-md
```

Requires Node.js 16+

---

## Usage

```bash
bon                     # generate guide + docs/OVERVIEW.md (if missing), locale auto-detected
bon --dir path/to       # set output directory (creates if missing)
bon --force             # overwrite existing guide file
bon --lang ts           # choose python|js|ts|rust (default: python)
bon --editor cursor     # choose codex|cursor|claudecode|copilot (default: codex)
bon --help              # show help
bon --version           # show version
```

---

## First 10 minutes (recommended)
1. Generate the guide and docs:

```bash
bon --editor codex --lang python
```

2. Open `AGENTS.md` (or editor-specific guide) and `docs/OVERVIEW.md`.
3. In `docs/plan.md` current section, add one small implementation item.
4. Create one delta record from `docs/delta/TEMPLATE.md` (assign Delta ID, In Scope, Out of Scope, AC).
5. Run implementation only for AC-linked changes.
6. Run verification:

```bash
node scripts/validate_delta_links.js --dir .
```

7. If verification is PASS, archive the delta, then sync canonical docs with minimal diffs.

---

## One requirement, end-to-end (happy path)
Example requirement: "Add request timeout to API client."

1. `delta request`:
   - Create `docs/delta/DR-YYYYMMDD-timeout.md`.
   - Define In Scope (`API client timeout`), Out of Scope (`retry redesign`), and measurable AC.
2. `delta apply`:
   - Implement timeout handling in code.
   - Update only the exact related canonical docs (`spec/architecture/plan`) if needed.
3. `delta verify`:
   - Run tests and `node scripts/validate_delta_links.js --dir .`.
   - Ensure AC mapping is explicit and all checks are PASS.
4. `delta archive`:
   - Mark verify result PASS in the delta record.
   - Move plan item from current to archive (plan completion), keeping delta archive as the change finalization record.

---

## Generated structure

### Editor-facing guides
- Codex / Claude Code: `AGENTS.md`
- Cursor: `.cursorrules`
- Copilot: `copilot-instructions.md`

### Project docs (`docs/`)
- `docs/OVERVIEW.md` (created if missing)
  - Single entrypoint: current status + scope + links + operating rules
- Minimal stubs are also created if missing (you fill in project specifics):
  - `docs/concept.md`, `docs/spec.md`, `docs/architecture.md`, `docs/plan.md`
- Delta workflow assets are also created if missing:
  - `docs/delta/TEMPLATE.md` (canonical Markdown record template)
  - `scripts/validate_delta_links.js` (plan↔delta↔archive consistency check)

### Project-local skills
bon copies bundled skills into the project (no global install), based on the target editor:
- codex / claudecode: `./.codex/skills`
- cursor: `./.cursor/skills`
- copilot: `./.github/copilot/skills`

---

## Requirement workflow (Delta-first)
- Process each user requirement in 4 steps:
  - `delta request` -> `delta apply` -> `delta verify` -> `delta archive`
- If guidance conflicts, prioritize the active delta definition (In Scope / Out of Scope / Acceptance Criteria).
- Treat each implementation item in `docs/plan.md` as a seed for one `delta request` (default 1:1; split to 1:N when large).
- Keep delta records canonical in Markdown (`docs/delta/*.md`) and do not require JSON/YAML sidecars.
- Sync canonical docs/code only after `delta-archive` is PASS.

Quick validation:

```bash
node scripts/validate_delta_links.js --dir .
```

---

## If validation fails (`validate_delta_links`)
1. Read the reported Delta ID / plan section mismatch.
2. Fix links first:
   - Missing delta file: create or rename `docs/delta/DR-*.md`.
   - Archive without PASS: finish verify or keep it out of archive.
   - Plan archived but delta still open: resolve delta status first.
3. Re-run:

```bash
node scripts/validate_delta_links.js --dir .
```

4. Repeat until PASS, then proceed to `delta archive`.

---

## Definition of Done (before `delta archive`)
- One requirement item is mapped to one delta (or explicitly split deltas).
- Delta record has In Scope / Out of Scope / Acceptance Criteria.
- Every code/doc change maps to an AC.
- Tests required by the change are PASS.
- `node scripts/validate_delta_links.js --dir .` is PASS.
- Canonical docs are updated only by minimal, delta-scoped diffs.
- No unrelated refactor or speculative extension is mixed in.

---

## Design quality guardrails
- `architecture-editor` applies a fixed 12-part design-assist output to reduce design omissions.
- Dependency direction is fixed from outside to inside (Adapter/Infra -> UseCase -> Domain).
- Conflict priority for design guidance:
  - `spec.md > architecture.md > OVERVIEW/AGENTS > design-assist-guide`
- The guide explicitly avoids overdesign and mixed responsibilities.

---

## Philosophy reference (this repo)
- [`docs/philosophy.py`](docs/philosophy.py) provides the Delta-first philosophy in both Japanese and English.
- It is executable for language-specific rendering:
  - `python3 docs/philosophy.py --lang ja`
  - `python3 docs/philosophy.py --lang en`
  - `python3 docs/philosophy.py --lang both`

---

## Template guidance 🎯
- Locale: detect `LANG` / `LC_ALL` / OS (WSL prefers Windows) and emit JA/EN accordingly.
- Docs-first: AGENTS is lean and points to `docs/OVERVIEW.md`; project specifics live under `docs/`.
- Concept: Spec ID feature table with dependencies/phases; get agreement when created/updated.
- Spec: Spec IDs in headings; Given / When / Then; validation and errors numbered, with an error/message list.
- Architecture: Layers + interfaces spelled out; no god API/data; fixed error format (e.g., `[bon][E_EDITOR_UNSUPPORTED] ...`).
- Plan: current/future/archive; current is a checklist; get agreement when the plan is done.
- Samples/snippets: one-line success + one-line failure with Error IDs matching implementation.
- `.env`: no `.env.sample`; AGENTS tells required keys and where they’re used.

---

## Locale and writing style
- Locale from `LANG` / `LC_ALL` / OS (WSL prefers Windows).
- If Japanese: docs are in Japanese; code comments are bilingual to keep both humans and AI on the same page.

---

## Development

Tests:

```bash
npm test
```

PRs and feedback are welcome.
