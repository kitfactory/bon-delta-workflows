---
name: delta-request
description: 「delta request」「差分要求を作る」「変更を最小スコープで定義したい」などの依頼で使用。1つの到達点を最小スコープで定義し、apply/verify/archive が迷わない要求仕様を作る。
---

# Delta Request

## 目的
- 1つのユーザー要求を、1つの到達点に閉じた delta として定義する。
- apply/verify/archive が追加解釈なしで進められる入力を作る。

## 厳守ルール（逸脱禁止）
- `1 delta = 1到達点` を守る。
- 同一目的の観測、微修正、最小 verify は同じ delta に含める。
- 原因不明の調査だけを行う場合を除き、観測専用 delta を乱立させない。
- editorial fast lane に入る変更では、この skill を使わない。
- 要求は「今回変えること」に限定し、背景説明を膨らませない。
- 非対象（今回変えないこと）を必ず明記する。
- 設計刷新、広範囲リファクタ、将来要望を混ぜない。
- 不明点は推測で埋めず、未確定として残す。
- 同時に複数 Delta を進めない（Active Delta は原則 1 件）。
- seed は複数保持してよいが、Active Delta と混同しない。
- 差分定義は `docs/delta/<Delta ID>.md` として保存する。
- Delta Type を必ず 1 つ選ぶ（FEATURE / REPAIR / DESIGN / REVIEW / DOCS-SYNC / OPS）。
- `Verify Profile`、`Canonical Sync Mode`、`Candidate Files/Artifacts` を必ず定義する。
- 大機能、設計影響、レイヤー横断、文書同期影響がある場合は `review gate required: Yes` とする。
- `Delta Type = REVIEW` は点検専用とし、広範囲修正を混ぜない。
- ユーザーが `review deltaを回して` と言った場合は `Delta Type = REVIEW` を選ぶ。
- 同一 plan item が 3 delta 以上になった場合、または REVIEW 以外の delta が 5 件続いた場合は `Delta Type = REVIEW` を提案してよい。

## 作成フロー
1. 変更が editorial fast lane か delta 対象かを判定する。
2. ユーザー要求から「明示要求」を抽出する。
3. Delta Type を決める。
4. 最小スコープを決める（対象ファイル/機能/振る舞い）。
5. `Candidate Files/Artifacts` を列挙する。
6. 非対象を列挙する（巻き込み防止）。
7. 受入条件を Given/When/Then または観測可能な条件で定義する。
8. `Verify Profile` を決める。
9. `Canonical Sync Mode` を決める。
10. `review gate required` の要否を決める。
11. `Delta Type = REVIEW` の場合は `docs/delta/REVIEW_CHECKLIST.md` を Review Focus に入れる。
12. apply へ渡す作業境界を確定する。

## 出力テンプレート（固定）
```markdown
# delta-request

## Delta ID
- DR-YYYYMMDD-<short-name>

## Delta Type
- FEATURE / REPAIR / DESIGN / REVIEW / DOCS-SYNC / OPS

## 目的
- （1-2行）

## 変更対象（In Scope）
- 対象1:
- 対象2:

## 非対象（Out of Scope）
- 非対象1:
- 非対象2:

## Candidate Files/Artifacts
- path/to/file1
- path/to/file2

## 差分仕様
- DS-01:
  - Given:
  - When:
  - Then:
- DS-02:
  - Given:
  - When:
  - Then:

## 受入条件（Acceptance Criteria）
- AC-01:
- AC-02:

## Verify Profile
- static check: Required / Not Required
- targeted unit: Required / Not Required
- targeted integration / E2E: Required / Not Required
- delta-project-validator: Not Required / links-only / code-size-only / full

## Canonical Sync Mode
- mode: direct canonical update / post-archive sync
- reason:

## 制約
- 制約1:
- 制約2:

## Review Gate
- required: Yes/No
- reason:

## Review Focus（REVIEW または review gate required の場合）
- checklist: `docs/delta/REVIEW_CHECKLIST.md`
- target area:

## 未確定事項
- Q-01:
```

## 品質ゲート（出力前チェック）
- Delta Type が 1 つに決まっている。
- In Scope が 1 到達点に閉じている。
- Out of Scope が具体的に書かれている。
- Candidate Files/Artifacts が In Scope と矛盾していない。
- AC が観測可能で、曖昧語（「いい感じ」「適切に」など）を含まない。
- Verify Profile が明示されている。
- Canonical Sync Mode が明示されている。
- review gate の要否が明示されている。
- REVIEW delta では Review Focus が明示されている。
- 未確定事項と確定事項が混在していない。
