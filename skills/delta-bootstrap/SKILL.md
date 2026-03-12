---
name: delta-bootstrap
description: Create or update AGENTS.md and the canonical docs skeleton for a repository. Use when a repo needs Proactive Delta Context initialization, when AGENTS.md or the agent-specific guide is missing, or when the user asks to set up delta-based workflows with docs/OVERVIEW.md, docs/concept.md, docs/spec.md, docs/architecture.md, docs/plan.md, and docs/delta templates.
---

# Delta Bootstrap

Initialize a repository for delta-based workflows without overwriting user content unless explicitly requested.

## Rules

- Create missing bootstrap files:
  - `AGENTS.md` or the agent-specific guide file
  - `docs/OVERVIEW.md`
  - `docs/concept.md`
  - `docs/spec.md`
  - `docs/architecture.md`
  - `docs/plan.md`
  - `docs/delta/TEMPLATE.md`
  - `docs/delta/REVIEW_CHECKLIST.md`
- Detect the target agent from the user request when possible; otherwise default to `codex`.
- Detect locale from existing repo text or environment when possible; otherwise default to `en`.
- Use `scripts/bootstrap_repo.js` for file generation so the output stays aligned with `bon`.
- Do not overwrite existing files unless the user explicitly asks for replacement.
- If a file exists, preserve it and apply only missing-file creation by default.

## Workflow

1. Check which guide file already exists:
   - `AGENTS.md`
   - `CLAUDE.md`
   - `.cursorrules`
   - `copilot-instructions.md`
2. Determine the target guide filename from the requested agent.
3. Run:
   - `node scripts/bootstrap_repo.js --dir <repo> --agent <agent> --locale <ja|en> --mode create-missing`
4. Review what was created and what remained unchanged.
5. Summarize the result to the user.

## Target Guide Mapping

- `codex` -> `AGENTS.md`
- `claudecode` -> `CLAUDE.md`
- `cursor` -> `.cursorrules`
- `copilot` -> `copilot-instructions.md`
- `opencode` -> `AGENTS.md`

## Notes

- Treat `docs/OVERVIEW.md` as the canonical entrypoint.
- Keep `docs/plan.md` thin and move archive details into monthly archive files.
- Keep delta workflow wording aligned with the bon standard assets in `assets/templates/`.


