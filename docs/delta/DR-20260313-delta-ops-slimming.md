# delta-request

## Delta ID
- DR-20260313-delta-ops-slimming

## Delta Type
- OPS

## 目的
- Delta 運用と関連 skill の責務・verify・正本同期ルールを軽量化し、ユーザー到達点に対するオーバーヘッドを下げる。
- `AGENTS.md`、`docs/OVERVIEW.md`、delta 系 skill の間で、Active Delta、verify、review gate、canonical sync の解釈差をなくす。

## 変更対象（In Scope）
- Delta 運用原則の見直し:
  - `1 delta = 1到達点`
  - 同一目的の観測・微修正・軽verify の同居
  - Active Delta 原則 1 件
- 入口ルールの統一:
  - `AGENTS.md` に editorial fast lane と運用正本参照を置く
  - `docs/OVERVIEW.md` に詳細ルールを集約する
- verify 軽量化ルールの追加:
  - delta type ごとの verify profile
  - docs-only / editorial-only の軽量経路
  - full verify の適用条件明確化
- 正本同期ルールの統一:
  - `DESIGN` / `DOCS-SYNC` / `OPS` delta における canonical 更新条件
  - archive 後同期と文書主成果物更新の整理
  - `OPS` delta は運用文書・テンプレート・skill 定義を直接更新対象とする
- skill 間契約の統一:
  - `Delta Type`
  - `In Scope`
  - `Out of Scope`
  - `Acceptance Criteria`
  - `Verify Profile`
  - `Review Gate`
  - `Canonical Sync Mode`
  - `Candidate Files/Artifacts`
- 変更対象ファイル候補:
  - `AGENTS.md`
  - `docs/OVERVIEW.md`
  - `docs/delta/TEMPLATE.md`
  - `docs/delta/REVIEW_CHECKLIST.md`
  - `skills/delta-request/SKILL.md`
  - `skills/delta-apply/SKILL.md`
  - `skills/delta-verify/SKILL.md`
  - `skills/delta-archive/SKILL.md`
  - `skills/delta-plan-editor/SKILL.md`
  - `skills/delta-project-validator/SKILL.md`
  - `skills/delta-concept-editor/SKILL.md`
  - `skills/delta-spec-editor/SKILL.md`
  - `skills/delta-architecture-editor/SKILL.md`

## 非対象（Out of Scope）
- 個別プロダクト機能の実装方針やアプリ固有仕様の変更
- `concept/spec/architecture` のプロダクト内容変更
- delta workflow 以外の skill 群の全面見直し
- bootstrap asset 全体の再設計
- 既存 delta record の一括書き換え
- verify 用スクリプトの大規模な新規実装
- `tests/` 配下のサンプル `AGENTS.md` の更新

## 差分仕様
- DS-01:
  - Given:
    - Delta 運用の主因として、delta の細分化、観測と修正の往復、verify の過剰適用、Active Delta の多重化が確認されている。
  - When:
    - `AGENTS.md`、`docs/OVERVIEW.md`、delta 系 skill の運用ルールを見直す。
  - Then:
    - Delta の標準運用は `1 delta = 1到達点` を原則とし、同一目的の観測・微修正・最小 verify を同一 delta に含める方針が明文化される。
    - `AGENTS.md` には editorial fast lane の入口ルールを置き、詳細条件は `docs/OVERVIEW.md` を参照する形に統一される。
- DS-02:
  - Given:
    - 現行 skill では docs-only 変更や運用変更でも重い verify が読めてしまう。
  - When:
    - delta type 別の verify profile を定義し、`delta-request` から `delta-verify` まで共有する。
  - Then:
    - docs-only、editorial-only、DESIGN、FEATURE、REPAIR、REVIEW、OPS ごとの最小 verify が明示され、`delta-verify` は request で指定された profile の範囲で判定する。
    - `delta-project-validator` は script 変更なしで、文書ルール上の profile 運用に従う。
- DS-03:
  - Given:
    - 文書系 skill は archive 後同期を前提にしており、`DESIGN` / `DOCS-SYNC` / `OPS` delta の主成果物更新と衝突しうる。
  - When:
    - canonical sync のモードを定義し、editor 系 skill の責務を調整する。
  - Then:
    - archive 後同期と、文書自体を成果物とする delta の更新条件が区別され、skill 間で矛盾なく正本更新できる。
    - `OPS` delta は運用文書、テンプレート、skill 定義を apply 時点で直接更新できる。
    - `concept/spec/architecture` は原則 `OPS` の直接更新対象に含めない。
- DS-04:
  - Given:
    - `plan` と `delta-request` の間で seed と Active Delta の関係が明文化されていない。
  - When:
    - `delta-plan-editor` と `docs/OVERVIEW.md` に共通ルールを追加する。
  - Then:
    - seed は複数保持できても、進行中の Active Delta は原則 1 件であることが明示される。
- DS-05:
  - Given:
    - 誤字修正や意味不変の明確化でも delta/verify を回してしまい、速度低下を招いている。
  - When:
    - editorial fast lane を定義する。
  - Then:
    - 意味不変の編集は delta なし・verify なし、または最小記録のみで処理できる条件が明示される。
- DS-06:
  - Given:
    - `delta-request` の品質ゲートは変更対象ファイル候補を要求する一方、テンプレートには共有契約項目が不足している。
  - When:
    - request/apply/verify/archive のテンプレートとルールを更新する。
  - Then:
    - 後続 skill が独自解釈せずに進められる最小契約が定義される。

## 受入条件（Acceptance Criteria）
- AC-01:
  - `AGENTS.md` に editorial fast lane の入口ルールと `docs/OVERVIEW.md` 参照が明記され、`docs/OVERVIEW.md` に `1 delta = 1到達点`、同一目的の観測/修正/軽verify の同居、Active Delta 原則 1 件、editorial fast lane の詳細条件が明記されている。
- AC-02:
  - `skills/delta-request/SKILL.md`、`skills/delta-apply/SKILL.md`、`skills/delta-verify/SKILL.md`、`skills/delta-archive/SKILL.md` が、`Verify Profile`、`Canonical Sync Mode`、`Candidate Files/Artifacts` を共通契約として扱っている。
- AC-03:
  - `skills/delta-verify/SKILL.md` と `skills/delta-project-validator/SKILL.md` で、delta type ごとの最小 verify が定義され、docs-only や OPS 変更に full verify を一律要求しない。
  - validator script 自体の機能追加なしで、この運用が説明可能になっている。
- AC-04:
  - `skills/delta-concept-editor/SKILL.md`、`skills/delta-spec-editor/SKILL.md`、`skills/delta-architecture-editor/SKILL.md` が、archive 後同期と文書主成果物更新の両モードを矛盾なく扱える。
  - `OPS` delta が対象とする運用文書・skill 定義と、プロダクト正本である `concept/spec/architecture` の境界が明記されている。
- AC-05:
  - `skills/delta-plan-editor/SKILL.md` と `docs/OVERVIEW.md` で、seed は複数可、Active Delta は原則 1 件という関係が明文化されている。
- AC-06:
  - `docs/delta/TEMPLATE.md` と `docs/delta/REVIEW_CHECKLIST.md` が新しい共有契約と verify 軽量化方針に整合している。

## Verify Profile
- static check: Not Required
- targeted unit: Not Required
- targeted integration / E2E: Not Required
- delta-project-validator: links-only

## Canonical Sync Mode
- mode: direct canonical update
- reason:
  - `OPS` delta であり、運用文書と skill 定義そのものが主成果物だから。

## 制約
- 変更は delta workflow の運用ルールと skill 定義に限定し、個別プロダクト仕様へ波及させない。
- 既存 skill 名や基本的な役割分担（request/apply/verify/archive/editor/validator/plan）は維持する。
- `review delta` は点検専用とし、広範囲修正を混ぜない原則を保持する。
- 既存文書との整合を優先し、同じ概念に複数の用語を導入しない。
- `delta-project-validator` は script 引数追加や新規 script 実装を行わず、文書ルールと skill 説明の更新にとどめる。
- `AGENTS.md` は最小ルールのみを持ち、詳細条件は `docs/OVERVIEW.md` に集約する。
- `OPS` delta の canonical 直接更新対象は `AGENTS.md`、`docs/OVERVIEW.md`、`docs/plan.md`、`docs/delta/*`、`skills/delta-*` に限定する。

## Review Gate
- required: Yes
- reason:
  - 複数 skill、運用正本、verify 基準、文書同期ルールを横断して変更するため。

## Review Focus（REVIEW または review gate required の場合）
- checklist: `docs/delta/REVIEW_CHECKLIST.md`
- target area:
  - Delta 運用原則
  - verify profile の軽重設計
  - canonical sync の責務境界
  - seed と Active Delta の整合
  - editorial fast lane の適用条件

## 未確定事項
- なし

# delta-apply

## Delta ID
- DR-20260313-delta-ops-slimming

## Delta Type
- OPS

## 実行ステータス
- APPLIED

## 確認済み Candidate Files/Artifacts
- `AGENTS.md`
- `docs/OVERVIEW.md`
- `docs/plan.md`
- `docs/delta/TEMPLATE.md`
- `docs/delta/REVIEW_CHECKLIST.md`
- `skills/delta-request/SKILL.md`
- `skills/delta-apply/SKILL.md`
- `skills/delta-verify/SKILL.md`
- `skills/delta-archive/SKILL.md`
- `skills/delta-plan-editor/SKILL.md`
- `skills/delta-project-validator/SKILL.md`
- `skills/delta-concept-editor/SKILL.md`
- `skills/delta-spec-editor/SKILL.md`
- `skills/delta-architecture-editor/SKILL.md`

## 変更ファイル/成果物
- `AGENTS.md`
- `docs/OVERVIEW.md`
- `docs/plan.md`
- `docs/delta/TEMPLATE.md`
- `docs/delta/REVIEW_CHECKLIST.md`
- `skills/delta-request/SKILL.md`
- `skills/delta-apply/SKILL.md`
- `skills/delta-verify/SKILL.md`
- `skills/delta-archive/SKILL.md`
- `skills/delta-plan-editor/SKILL.md`
- `skills/delta-project-validator/SKILL.md`
- `skills/delta-concept-editor/SKILL.md`
- `skills/delta-spec-editor/SKILL.md`
- `skills/delta-architecture-editor/SKILL.md`

## 適用内容（AC対応）
- AC-01:
  - 変更:
    - `AGENTS.md` を新設し、editorial fast lane、Active Delta 原則 1 件、`Verify Profile` 参照、`OPS delta` の境界を入口ルールとして定義した。
    - `docs/OVERVIEW.md` に `1 delta = 1到達点`、同一目的の観測/微修正/最小 verify の同居、shared contract、verify profile、canonical sync mode を追記した。
  - 根拠:
    - request の軽量運用原則と入口/正本の分離要件を直接満たすため。
- AC-02:
  - 変更:
    - `skills/delta-request/SKILL.md`、`skills/delta-apply/SKILL.md`、`skills/delta-verify/SKILL.md`、`skills/delta-archive/SKILL.md` に `Verify Profile`、`Canonical Sync Mode`、`Candidate Files/Artifacts` を共通入力として追加した。
  - 根拠:
    - request / apply / verify / archive 間の独自解釈をなくすため。
- AC-03:
  - 変更:
    - `skills/delta-verify/SKILL.md` で request profile 外の重い verify を合否基準に混ぜないルールを追加した。
    - `skills/delta-project-validator/SKILL.md` で `Not Required` / `links-only` / `code-size-only` / `full` を定義し、script 非変更で運用できるようにした。
  - 根拠:
    - OPS 変更にもフル verify を一律要求しないため。
- AC-04:
  - 変更:
    - `skills/delta-concept-editor/SKILL.md`、`skills/delta-spec-editor/SKILL.md`、`skills/delta-architecture-editor/SKILL.md` に `post-archive sync` と `direct canonical update` の両モードを追加した。
    - `OPS` delta では `concept/spec/architecture` のプロダクト内容変更を行わない境界を追加した。
  - 根拠:
    - 文書系 skill と canonical sync の衝突をなくすため。
- AC-05:
  - 変更:
    - `skills/delta-plan-editor/SKILL.md` と `docs/OVERVIEW.md` に、seed は複数可、実行中 Active Delta は原則 1 件という運用を追加した。
    - `docs/plan.md` archive に本 delta の完了記録を追加した。
  - 根拠:
    - seed と Active Delta を分離し、plan/validator の整合も取るため。
- AC-06:
  - 変更:
    - `docs/delta/TEMPLATE.md` と `docs/delta/REVIEW_CHECKLIST.md` を shared contract と軽量 verify 方針に合わせて更新した。
  - 根拠:
    - delta record と review gate の観点を新ルールへ揃えるため。

## 非対象維持の確認
- Out of Scope への変更なし: Yes
- もし No の場合の理由:

## Canonical Sync
- mode: direct canonical update
- action:
  - `AGENTS.md`、`docs/OVERVIEW.md`、`docs/plan.md`、`docs/delta/*`、`skills/delta-*` を In Scope の範囲で直接更新した。
- status: DONE

## コード分割健全性
- 500行超のファイルあり: No
- 800行超のファイルあり: No
- 1000行超のファイルあり: No
- 長大な関数なし: Yes
- 責務過多のモジュールなし: Yes

## verify 依頼メモ
- request profile:
  - static check: Not Required
  - targeted unit: Not Required
  - targeted integration / E2E: Not Required
  - delta-project-validator: links-only
- 検証してほしい観点:
  - AC-01 から AC-06 の文書整合
  - review gate 観点の衝突有無
  - plan / delta link 整合
- review evidence:
  - `AGENTS.md` / `docs/OVERVIEW.md` / `skills/delta-*` / `docs/delta/*` の差分

# delta-verify

## Delta ID
- DR-20260313-delta-ops-slimming

## Requested Verify Profile
- static check: Not Required
- targeted unit: Not Required
- targeted integration / E2E: Not Required
- delta-project-validator: links-only

## Executed Verify
- static check: Not Required
- targeted unit: Not Required
- targeted integration / E2E: Not Required
- delta-project-validator:
  - `node scripts/validate_delta_links.js --dir .`

## 検証結果（AC単位）
| AC | 結果(PASS/FAIL) | 根拠 |
|---|---|---|
| AC-01 | PASS | `AGENTS.md` と `docs/OVERVIEW.md` に editorial fast lane、Active Delta 原則 1 件、軽量 verify の詳細が追加された。 |
| AC-02 | PASS | request/apply/verify/archive の各 skill に `Verify Profile`、`Canonical Sync Mode`、`Candidate Files/Artifacts` が追加された。 |
| AC-03 | PASS | `skills/delta-verify/SKILL.md` が request profile 外の重い verify を合否基準へ追加しないと明記し、`skills/delta-project-validator/SKILL.md` が profile 運用を script 非変更で定義した。 |
| AC-04 | PASS | concept/spec/architecture editor が `post-archive sync` と `direct canonical update` を扱い、`OPS` の product content 非対象を明記した。 |
| AC-05 | PASS | `skills/delta-plan-editor/SKILL.md` と `docs/OVERVIEW.md` が seed と Active Delta の関係を明記し、`docs/plan.md` archive に delta を記録した。 |
| AC-06 | PASS | `docs/delta/TEMPLATE.md` と `docs/delta/REVIEW_CHECKLIST.md` が shared contract と軽量 verify 観点に更新された。 |

## スコープ逸脱チェック
- Out of Scope 変更の有無: No
- 逸脱内容:

## Canonical Sync Check
- mode: direct canonical update
- status: DONE
- result: PASS

## 不整合/回帰リスク
- R-01:
  - validator script 自体は未変更のため、profile 運用は文書ルール依存である。

## Review Gate
- required: Yes
- checklist: `docs/delta/REVIEW_CHECKLIST.md`
- layer integrity: PASS
- docs sync: PASS
- data size: PASS
- code split health: NOT CHECKED
- file-size threshold: NOT CHECKED

## Review Delta Outcome
- pass: Yes
- follow-up delta seeds:
  - なし

## 参考所見（合否外）
- O-01:
  - verify は docs/skill 更新のみのため、`ops-light` 相当として links-only validator に留めた。

## 判定
- Overall: PASS

## FAIL時の最小修正指示
- なし

# delta-archive

## Delta ID
- DR-20260313-delta-ops-slimming

## クローズ判定
- verify結果: PASS
- review gate: PASSED
- canonical sync mode: direct canonical update
- canonical sync status: DONE
- archive可否: 可

## 確定内容
- 目的:
  - delta workflow の軽量化と skill 間契約の統一
- 変更対象:
  - `AGENTS.md`
  - `docs/OVERVIEW.md`
  - `docs/plan.md`
  - `docs/delta/TEMPLATE.md`
  - `docs/delta/REVIEW_CHECKLIST.md`
  - `skills/delta-*`
- 非対象:
  - 個別プロダクト仕様
  - `concept/spec/architecture` のプロダクト内容変更
  - validator script の機能追加
- Candidate Files/Artifacts:
  - `AGENTS.md`
  - `docs/OVERVIEW.md`
  - `docs/plan.md`
  - `docs/delta/TEMPLATE.md`
  - `docs/delta/REVIEW_CHECKLIST.md`
  - `skills/delta-request/SKILL.md`
  - `skills/delta-apply/SKILL.md`
  - `skills/delta-verify/SKILL.md`
  - `skills/delta-archive/SKILL.md`
  - `skills/delta-plan-editor/SKILL.md`
  - `skills/delta-project-validator/SKILL.md`
  - `skills/delta-concept-editor/SKILL.md`
  - `skills/delta-spec-editor/SKILL.md`
  - `skills/delta-architecture-editor/SKILL.md`

## 実装記録
- 変更ファイル/成果物:
  - `AGENTS.md`
  - `docs/OVERVIEW.md`
  - `docs/plan.md`
  - `docs/delta/TEMPLATE.md`
  - `docs/delta/REVIEW_CHECKLIST.md`
  - `skills/delta-request/SKILL.md`
  - `skills/delta-apply/SKILL.md`
  - `skills/delta-verify/SKILL.md`
  - `skills/delta-archive/SKILL.md`
  - `skills/delta-plan-editor/SKILL.md`
  - `skills/delta-project-validator/SKILL.md`
  - `skills/delta-concept-editor/SKILL.md`
  - `skills/delta-spec-editor/SKILL.md`
  - `skills/delta-architecture-editor/SKILL.md`
- AC達成状況:
  - AC-01 から AC-06 まで PASS

## 検証記録
- verify要約:
  - 文書レビューと `links-only` validator により PASS
- 主要な根拠:
  - AC 単位の PASS 判定
  - `node scripts/validate_delta_links.js --dir .` の OK 結果

## Canonical Sync
- target:
  - `AGENTS.md`
  - `docs/OVERVIEW.md`
  - `docs/plan.md`
  - `docs/delta/*`
  - `skills/delta-*`
- action:
  - `OPS` delta の主成果物を apply 中に直接更新した。
- reason:
  - direct canonical update が request で定義されていたため。

## 未解決事項
- なし

## 次のdeltaへの引き継ぎ（任意）
- Seed-01:
  - 実運用で 2 から 3 件の実 delta を回し、ops-light / docs-light / feature-targeted の運用差を観測する。
