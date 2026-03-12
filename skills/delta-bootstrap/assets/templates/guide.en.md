{{HEADING}}

This `AGENTS.md` contains **minimal operating rules**.
For details (review gate checklist, Phase Close, spec/plan split rules, DoD, error/message list, etc.), treat **`docs/OVERVIEW.md`** as canonical.
However, for user-requirement execution, **delta flow (request → apply → verify → archive) is the highest-priority procedure**.
Do not place secrets in this file.

## Top 5 (Must Follow)
1. **Process every user requirement via delta 4 steps**: `delta request → delta apply → delta verify → delta archive`.
2. **Delta takes precedence on conflicts**: if AGENTS/OVERVIEW/notes conflict, follow the active Delta ID definition (In Scope / Out of Scope / AC).
3. **Single entrypoint is `docs/OVERVIEW.md`** (status, scope, links). Check/update it before and after work.
4. **`docs/plan.md` uses current / review timing / future / archive summary / archive index**, with detailed archive moved into monthly files.
5. **Stop at review gates**: self-review → ask user to confirm when “done” → proceed only with agreement.

## Requirement Protocol (Delta-First / Required)
### Step 1: `delta request` (Define)
- Define the **minimal delta** from the user requirement (In Scope / Out of Scope / Acceptance Criteria).
- Explicitly list what will NOT be changed to prevent scope creep.

### Step 2: `delta apply` (Implement)
- Implement only what was defined in request.
- Do not include opportunistic side-fixes that are outside request.

### Step 3: `delta verify` (Validate)
- Validate against acceptance criteria.
- If any Out-of-Scope change exists, mark FAIL and stop.
- Use the `delta-project-validator` skill to validate plan↔delta↔archive links and detect oversized code files.

### Step 4: `delta archive` (Finalize)
- Archive only verified PASS deltas and close the change.
- When a major feature is complete, run a `Delta Type: REVIEW` first and use `docs/delta/REVIEW_CHECKLIST.md`.
- The user may trigger this manually by saying `run a review delta`.
- Do not add new requirements in archive.

### Deviation Guardrails
- Every code/doc change must map to acceptance criteria; otherwise remove or split into the next delta.
- If scope must change, pause and update request first, then continue.

## Role Boundary (Canonical Docs vs Delta)
- `concept/spec/architecture` skills are for **canonical document maintenance**.
- User-requirement execution must run through **delta 4 steps** (request/apply/verify/archive).
- `delta-spec-editor` / `delta-architecture-editor` / `delta-concept-editor` do not create or execute delta.
- If there is no Delta ID, do not start requirement implementation; create `delta request` first.
- Treat each implementation item in `docs/plan.md` as a seed for one `delta request` (default 1:1).
- If an item is too large, split it into multiple deltas (1:N allowed).
- Keep delta records canonical in Markdown (`docs/delta/*.md`); do not require JSON/YAML sidecars.
- Sync canonical docs only after `delta-archive` PASS, with minimal diffs.
- While an Active Delta exists, limit canonical updates to In Scope; do not change Out of Scope.
- `docs/plan.md` archive records completed plan tasks; it is not the same as `delta archive` (delta finalization).

## Design Rules (Required / Short)
- **Keep user-facing I/F simple**: minimize argument count and type variety; do not leak internal types/states.
- **Unify data models by shared attributes**: avoid fragmented objects; extract shared core attributes.
- **Extend via composition**: express diffs with nested `details/meta` while keeping I/F stable (no god data).
- **No `details/meta` dumping**: define keys/shape in spec; forbid “any key OK”; promote shared fields into core over time.
- **No god APIs/classes**: split responsibilities; keep I/F minimal.
- **No dependency inversion**: document dependency direction in architecture and keep outer -> inner flow.
- **Fix design-output order**: classification -> value flow -> minimum change -> layer map -> contracts -> state transitions -> errors -> observability -> tests -> boundary checks -> pre-change checks -> task breakdown.
- **Conflict priority for design guidance**: `spec.md > architecture.md > OVERVIEW/AGENTS > design-assist-guide`.

## 60-second Start Routine
1) `docs/OVERVIEW.md`: confirm current phase/scope/links
2) `docs/concept.md`: confirm target Spec IDs and scope
3) `docs/spec.md`: jump to the relevant section (split when needed)
4) `docs/plan.md`: confirm the current checklist and links
5) (Optional) If using phases, check `docs/phases/<PHASE>/`

## Safe Updates (Practical)
### OK without agreement
- Typos, link updates, additive notes (no meaning change)
- Plan checkbox progress updates
- Small clarifications aligned with existing policy

### Require “propose → agree → apply”
- Large deletions, restructuring, moves/renames
- Spec ID / Error ID changes or compatibility-affecting spec changes
- API / data-shape changes
- Security fixes or major bug fixes that change behavior (proposal must be explicit)

## Language & Comments
- Write `docs/**` in English (this guide is English)
- Write source-code comments in English (bilingual comments are optional if your team needs them)

{{LANGUAGE_SECTION}}

{{EDITOR_SECTION}}{{PLACEMENT_SECTION}}

## Minimal Examples
- Success: `bon --dir ./project --lang ts --agent codex --skills workspace`
- Failure: `bon --agent unknown` → `[bon][E_AGENT_UNSUPPORTED] Unsupported agent: unknown`

## Canonical Details Live in OVERVIEW
See `docs/OVERVIEW.md`.


