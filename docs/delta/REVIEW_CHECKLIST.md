# review delta checklist

Use this checklist when `Delta Type = REVIEW` or when `review gate required = Yes`.

## Trigger
- manual:
  - user says `review deltaを回して`
  - user says `設計レビューして`
- a major feature is complete
- a cross-layer change landed
- concept/spec/architecture may be stale
- management data or operational records grew
- temporary fixes or exception paths increased
- one plan item expanded into 3 or more deltas
- 5 non-review deltas have continued since the last review delta

## Required checks
- layer integrity:
  - responsibilities are still separated
  - dependency direction is still coherent
- docs sync:
  - `concept/spec/architecture` still match the implementation
  - stable knowledge is promoted out of delta notes when needed
- data size:
  - plan/archive/meta data is still minimal
  - no operational file has become noisy without reason
- code split health:
  - no file over the agreed thresholds without review
  - no multi-responsibility module remains unexamined
- verify coverage:
  - the verify profile used for the delta is still sufficient

## Outcome
- PASS:
  - no blocking issue
  - archive may proceed
- FOLLOW-UP REQUIRED:
  - create `repair delta`, `design delta`, or `docs sync delta` seeds
  - do not mix the broad fix into the review delta itself

## Recording rule
- record the final findings, not the whole exploration log
- keep the follow-up delta seeds explicit
