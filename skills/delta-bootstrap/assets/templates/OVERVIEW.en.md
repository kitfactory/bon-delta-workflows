# docs/OVERVIEW.md (Entry / Canonical Operations)

This document is the **canonical source for project operations**. Keep `AGENTS.md` minimal and put details here.
Execute user requirements in **delta-first flow (request → apply → verify → archive)**.
If documents conflict, prioritize the active Delta ID definition (In Scope / Out of Scope / AC).
Document skills (concept/spec/architecture) are for canonical maintenance only; they do not create/execute delta.
If there is no Delta ID, do not start requirement implementation; create delta request first.
Treat each implementation item in plan.md as a seed for one delta request (default 1:1).
If an implementation item is too large, split it into multiple deltas (1:N).
Keep delta records canonical in Markdown (docs/delta/*.md); do not require JSON/YAML sidecars.
Sync canonical docs only after delta-archive PASS, using minimal diffs.
When a major feature is complete, create a review delta and use `docs/delta/REVIEW_CHECKLIST.md`.
The user may say `run a review delta` at any time, and Codex may propose one when a plan item expands to 3+ deltas or when 5 non-review deltas continue.
Treat normal source files above 500 lines as review targets, above 800 lines as split candidates, and above 1000 lines as exceptions.
Keep `docs/plan.md` thin with only current / review timing / future / archive summary / archive index, and move detailed archive into monthly files.
The user may say `shrink the plan` at any time, and Codex may slim it when the archive section exceeds 100 lines.
plan.md archive is for completed plan tasks and is not the same as delta archive (delta finalization).

---

## Current Status (Always Update)
- Current phase: P0
- Current scope (1–5 lines):
  - ...
- Non-goals:
  - ...
- Key links:
  - concept: `./concept.md`
  - spec: `./spec.md`
  - architecture: `./architecture.md`
  - plan: `./plan.md`

---

## Review Gates (Stop Here)
Principle: **self-review → ask user to confirm when “done” → proceed only with agreement**

---

## Safe Update Policy
### No agreement needed
- Typos, link updates, additive notes (no meaning change)
- Updating plan checkboxes
- Small clarifications aligned with existing policy

### “Propose → Agree → Apply” required
- Large deletions, restructuring, moves/renames
- Spec ID / Error ID changes
- API / data-shape changes
- Security fixes or major bug fixes that change behavior
