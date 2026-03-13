# delta record template

Markdown is the canonical format. Do not require JSON/YAML sidecars.

## Delta ID
- DR-YYYYMMDD-<short-name>

## Delta Type
- FEATURE / REPAIR / DESIGN / REVIEW / DOCS-SYNC / OPS

## Step 1: delta-request
- purpose:
- In Scope:
- Out of Scope:
- Candidate Files/Artifacts:
- Acceptance Criteria:
- constraints:
- verify profile:
  - static check:
  - targeted unit:
  - targeted integration / E2E:
  - delta-project-validator:
- canonical sync mode: direct canonical update / post-archive sync
- review gate required: Yes / No
- review checklist: `docs/delta/REVIEW_CHECKLIST.md` (when Delta Type = REVIEW or review gate required)

## Step 2: delta-apply
- confirmed candidate files/artifacts:
- changed files/artifacts:
- applied AC:
- out of scope maintained:
- canonical sync:
  - mode:
  - action:
  - status:
- code split check:
  - file over 500 lines: Yes / No
  - file over 800 lines: Yes / No
  - file over 1000 lines: Yes / No
  - long function: Yes / No
  - multi-responsibility module: Yes / No
- status: APPLIED / BLOCKED

## Step 3: delta-verify
- requested verify profile:
  - static check:
  - targeted unit:
  - targeted integration / E2E:
  - delta-project-validator:
- executed verify:
  - static check:
  - targeted unit:
  - targeted integration / E2E:
  - delta-project-validator:
- review delta outcome:
  - pass:
  - follow-up delta seeds:
- AC result table:
- scope deviation:
- optional observations:
- review findings:
  - layer integrity:
  - docs sync:
  - data size:
  - code split health:
  - file-size threshold:
- overall: PASS / FAIL

## Step 4: delta-archive
- verify result: PASS
- review gate: PASSED / NOT REQUIRED
- canonical sync mode:
- canonical sync status:
- archive status: archived
- unresolved items:
- follow-up delta seeds:

## Canonical Sync
- synced artifacts:

## Validation
- use `delta-project-validator` skill only when the request verify profile requires it

## Record Hygiene
- keep the final state and key decisions
- do not retain incidental failed attempts unless they matter for later work
