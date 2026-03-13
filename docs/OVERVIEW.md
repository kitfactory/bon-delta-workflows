# docs/OVERVIEW.md（入口 / 運用の正本）

この文書は **プロジェクト運用の正本**です。`AGENTS.md` は最小ルールのみを持ち、詳細な条件と例外はここに集約します。

---

## 現在地（必ず更新）
- 現在フェーズ: P1（MVP）
- 今回スコープ（1〜5行）:
  - delta workflow の軽量化
  - `AGENTS.md` / `docs/OVERVIEW.md` / `skills/delta-*` の整合
  - `Verify Profile` と `Canonical Sync Mode` の共通化
- 非ゴール（やらないこと）:
  - `concept/spec/architecture` のプロダクト内容変更
  - validator script の新規機能追加
- 重要リンク:
  - concept: `./concept.md`
  - spec: `./spec.md`
  - architecture: `./architecture.md`
  - plan: `./plan.md`

---

## Canonical と Phase のルール
- 正本（Canonical）は `docs/` 側（合意の正本）
- `AGENTS.md` は入口の最小ルール、`docs/OVERVIEW.md` は詳細ルールの正本
- `docs/phases/<PHASE>/` は任意（差分＋証跡）
- フェーズ運用を採用した場合、フェーズ完了時に **Phase Close（P3）で正本へ集約**し、フェーズを凍結する

### フェーズ運用の適用条件（任意）
次のいずれかに当てはまる場合のみ、`docs/phases/<PHASE>/` を使う：
- 複数人で進める / レビュー者が複数いる
- 2週間以上の長期・段階的リリース
- 並行で複数の作業塊（フェーズ/ストリーム）が走る
- ユーザーが明示的にフェーズ管理を希望する

当てはまらない場合は **Canonical（`docs/`）のみ**で運用する。

---

## Delta 運用原則
- `1 delta = 1到達点` を原則とする。小修正単位ではなく、ユーザーが到達したい結果単位で切る。
- 同一目的の観測、微修正、最小 verify は同一 delta に含める。
- 観測専用 delta は、原因不明の調査だけを行う場合、またはユーザーが観測だけを求めた場合に限る。
- naming、role、worldbuilding、責務境界のように前提が揺れやすい論点は、implementation 前に `DESIGN delta` で凍結する。
- Active Delta は原則 1 件とする。seed は複数保持してよいが、同時に実行しない。
- `delta` 本体には成功した最終状態を中心に記録し、中間失敗は必要なものだけ残す。
- `review delta` は点検専用とし、広範囲修正を混ぜない。
- validator の実行判断は `delta-request` の `Verify Profile` に従い、既定でフル実行しない。

## Editorial Fast Lane
次の編集は **editorial fast lane** とし、delta / verify を省略してよい。
- 誤字修正
- リンク更新
- 既存意味を変えない明確化
- 表記ゆれの統一（意味変更なし）

次の変更は editorial fast lane に入れない。
- 意味変更
- 受入条件やスコープの変更
- workflow ルールの変更
- `concept/spec/architecture` の内容変更
- review gate や verify 基準に影響する変更

迷う場合は editorial fast lane を使わず `delta-request` を作成する。

## Shared Contract（全 skill 共通）
delta-request から archive まで、以下を共通契約として扱う。
- `Delta Type`
- `In Scope`
- `Out of Scope`
- `Candidate Files/Artifacts`
- `Acceptance Criteria`
- `Verify Profile`
- `Canonical Sync Mode`
- `Review Gate`

### Verify Profile
`Verify Profile` は request 側で決め、verify 側はそれに従う。
- `static check`: `Required` / `Not Required`
- `targeted unit`: `Required` / `Not Required`
- `targeted integration / E2E`: `Required` / `Not Required`
- `delta-project-validator`: `Not Required` / `links-only` / `code-size-only` / `full`

### Canonical Sync Mode
- `post-archive sync`
  - archive PASS 後に正本へ同期する
  - 既定対象: `FEATURE` / `REPAIR` / `REVIEW`
- `direct canonical update`
  - apply 中に正本を直接更新してよい
  - 既定対象: `DESIGN` / `DOCS-SYNC` / `OPS`

`OPS` delta の direct canonical update 対象は次に限定する。
- `AGENTS.md`
- `docs/OVERVIEW.md`
- `docs/plan.md`
- `docs/delta/*`
- `skills/delta-*`

`OPS` delta は原則として `concept/spec/architecture` のプロダクト内容変更には使わない。

---

## レビューゲート（必ず止まる）
共通原則：**自己レビュー → 完成と判断できたらユーザー確認 → 合意で次へ**

### Gate 定義（成果物とDoD）
#### 全体レベル（Project Gates）
- **G0: Project Concept Review**
  - 更新対象: `docs/concept.md`, `docs/OVERVIEW.md`
  - DoD:
    - 目的/スコープ/非ゴールが明確
    - MVP とフェーズ分割がある
    - Spec ID の枠が揃っている
- **G1: Project Spec & Architecture Review**
  - 更新対象: `docs/spec.md`, `docs/architecture.md`
  - DoD:
    - concept ⇄ spec の対応が取れている（Spec ID）
    - 主要仕様の Given/When/Then（前提/条件/振る舞い）が揃っている
    - 依存方向/I-F/エラー方針が明記されている
- **G2: Project Plan Review**
  - 更新対象: `docs/plan.md`（current/future/archive）
  - DoD:
    - plan(current) が spec をカバーしている
    - 出口/DoD が明確

#### フェーズレベル（Phase Gates：フェーズ運用時のみ）
- **P0: Phase Concept Review**
- **P1: Phase Spec & Architecture Review**
- **P2: Phase Plan Review**
- **P3: Phase Close Gate**

### 大機能レビュー（Feature Review Delta）
- 発火条件:
  - 大機能が一段落した
  - レイヤーをまたぐ変更が入った
  - `concept/spec/architecture` に影響する変更が入った
  - 管理データや運用データが増加した
  - 一時対応や例外処理が増えてきた
- レビュー結果:
  - 問題なし: archive へ進む
  - 軽微なズレ: `repair delta`
  - 設計上のズレ: `design delta`
  - 文書ズレ: `docs sync delta`

### Review Delta 標準運用
- `Delta Type: REVIEW` を使い、対象範囲は「完了した大機能」または「横断的に見直す境界」に限定する。
- `review delta` では実装修正を混ぜず、点検結果と次の delta seed を残す。
- 点検観点は `docs/delta/REVIEW_CHECKLIST.md` を使い、毎回同じ順序で確認する。
- 問題が見つかった場合は、その場で広範囲修正を始めず `repair delta` / `design delta` / `docs sync delta` へ分離する。
- ユーザーはいつでも `review deltaを回して` と手動発動してよい。
- Codex は次の場合、`review delta` を自発的に提案または起票してよい:
  - 1つの plan item が **3件以上の delta** に分割された
  - `REVIEW` 以外の delta が **5件連続** した
  - 大機能が一段落した
  - 設計文書やレイヤー境界に繰り返し手が入った

---

## 自己レビューのチェック項目（Step A）
- concept ⇄ spec ⇄ architecture ⇄ plan の整合
- Spec ID の対応（concept ⇄ spec）
- plan が spec をカバーし、DoD（完了条件）が明確
- レイヤー構造と依存方向が崩れていない
- データモデルが乱立していない（共通属性で集約され、ユーザーI/Fが単純）
- `details/meta` がゴミ箱化していない（キー集合/構造が定義されている）
- 管理データや運用データが最小限を超えて膨らんでいない
- `concept/spec/architecture` が実装に対して古くなっていない
- `docs/plan.md` の current が肥大化しておらず、archive の詳細が月別ファイルへ分離されている
- 長大なファイル、長大な関数、責務過多のモジュールが残っていない
- 深いネストや重複処理が残っていない
- 変更が大きい場合は「提案→合意→適用」になっている

### plan slim の運用
- `docs/plan.md` は **入口**として保ち、`current / review timing / future / archive summary / archive index` だけを置く。
- `current` の実行中 delta は原則 1 件とする。seed は複数保持してよいが、未着手として扱う。
- `review timing` には手動発動条件と自動発火条件を短く残し、レビューを呼びやすくする。
- archive の詳細は `docs/plan_archive_YYYY_MM.md` へ月別に分離する。
- `archive summary` には直近の重要完了だけを残し、履歴本文は monthly archive へ逃がす。
- `OVERVIEW.md` と `plan.md` には monthly archive へのリンクを残す。
- ユーザーはいつでも `planをシュリンクして` または `archiveを整理して` と手動発動してよく、その場合は `delta-plan-shrinker` skill を使う。
- Codex は次の場合、`plan slim` を自発的に提案または実行してよい:
  - plan の `archive` 領域が **100行超**
  - archive 部分が `current + future` より明らかに長い

### コードサイズの運用閾値
- 通常のソースコードは **500行超でレビュー対象**とする。
- **800行超は原則分割**とし、責務単位で分割する。
- **1000行超は例外扱い**とし、生成コード・fixture・定義集などを除いて残さない。
- 行数が少なくても責務が混在している場合は分割対象とする。
- 長大な関数も同様に扱い、長さより責務分離を優先して見直す。

### 標準 verify プロファイル
- `editorial-only`
  - verify なし
- `docs-light`
  - 文書構造確認
  - 必要時のみ `delta-project-validator: links-only`
- `design-light`
  - 文書整合確認
  - 設計境界や命名変更がある場合は review gate を検討
  - 必要時のみ `delta-project-validator: links-only`
- `feature-targeted` / `repair-targeted`
  - `static check`
  - `targeted unit`
  - 必要時のみ `targeted integration / E2E`
  - 必要時のみ `delta-project-validator: code-size-only` または `full`
- `ops-light`
  - 運用文書と skill 定義の整合確認
  - `delta-project-validator` は plan/delta link を触った場合のみ `links-only`
- `review-check`
  - `docs/delta/REVIEW_CHECKLIST.md`
  - 必要時のみ `delta-project-validator`

フル verify は request で明示された場合、または高リスク変更で合理的理由がある場合に限る。

### archive 前の最低条件
- request で定義された必要な verify が完了している
- 大機能または設計影響のある変更では `review delta` が完了している
- 未解決の設計崩れ、文書ズレ、データ肥大、長大コードが残っていない
- 500行超のファイルはレビュー済みである
- 800行超のファイルは分割済み、または例外理由が明示されている

---

## 更新の安全ルール（判断用）
### 合意不要
- editorial fast lane に該当する変更
- plan のチェック更新
- 小さな明確化（既存方針に沿う）

### 提案→合意→適用（必須）
- 大量削除、章構成変更、移動/リネーム
- Spec ID / Error ID の変更、互換性に影響する仕様変更
- API/データモデルの形を変える設計変更
- セキュリティ/重大バグ修正で挙動が変わるもの
- workflow ルール、review gate、verify 基準を変更するもの


