---
name: delta-plan-editor
description: 「plan.mdを作成/直す」「実装計画を書く/更新」「開発計画（実装/テスト/文書化）を整理する」「planに追加して」「planをアーカイブにして」などの依頼で使用。delta-based workflow の current / review timing / future / archive summary を保ちながら plan.md をロケール（ja/en）に合わせて更新する。
---

# Delta Plan Editor

## 基本方針
- 出力言語は `AGENTS.md` とロケールに合わせる（ja は日本語、en は英語）。
- 出力は plan.md 本文のみとし、前後の説明文を付けない。
- current / future / archive の3区分で管理する。
- 各章の切れ目に空行を1行入れる。

## 役割境界（Deltaとの分離）
- 本スキルの責務は `plan.md` の実行計画管理に限定する。
- ユーザー要件の差分定義、適用、検証、確定は `delta-request` / `delta-apply` / `delta-verify` / `delta-archive` の責務とする。
- `plan.md` の `archive` は計画タスクの完了記録であり、`delta-archive`（差分確定）とは別物として扱う。
- Active Delta がある間は、current の対象を In Scope に合わせ、Out of Scope の実装タスクを追加しない。
- Delta ID が未提示の要件実装タスクは、先に `delta-request` の作成を促す。
- editorial fast lane の変更は delta task として current に載せない。

## 実装アイテムと Delta の対応ルール
- current の実装アイテム 1 件は `delta-request` 1 件の seed として扱う（原則 1:1）。
- seed は複数保持してよいが、実行中の Active Delta は原則 1 件とする。
- 実装アイテムには対応 Delta ID を明記する（未発行時は seed ラベルを付ける）。
- 実装アイテムの完了条件は「対応 Delta ID の `delta-archive` が PASS」で定義する。
- `Verify Profile` が docs-light / design-light / ops-light の delta に、汎用の unit / E2E タスクを自動追加しない。

## 生成フロー（厳守）
- 全体と機能が分かれているか確認する。
  - 分かれている場合: 全体は future に置き、着手中の delta を current に置く。
  - 全体のみの場合: 着手する部分を current に置く。
- 不足情報は提案案を示し、ユーザーの同意/修正を確認してから生成する。

## current のルール
- チェックリスト形式で高い粒度で記載する（`- [ ]` / `- [x]`）。
- 実行中の Delta ID は原則 1 件だけにする。
- seed は未着手候補として current または future に置いてよいが、Active Delta と混在させない。
- 実装アイテムには Delta ID（または seed）を付ける。
- verify / sync の項目は request の `Verify Profile` と `Canonical Sync Mode` に合わせる。
- concept / spec / architecture の確認が必要な場合だけ current に入れる。
- 各項目は対象を具体化する（対象ファイル、機能、範囲を明記）。

## future のルール
- 大雑把な将来計画を記載する（concept 未実現機能など）。
- チェックのないリスト形式で記載する。

## archive のルール
- 実施済みアイテムの記録。
- 「planをアーカイブにして」と言われたら current の完了項目を移動する。
- monthly archive への圧縮や archive index の更新は `delta-plan-shrinker` を使う。

## plan.md テンプレート（固定）
```markdown
# plan.md（必ず書く：最新版）

# current
- [ ] 例: [DR-20260301-login] delta apply を実施する
- [ ] 例: [DR-20260301-login] request の Verify Profile に従って delta verify を実施する
- [ ] 例: [DR-20260301-login] delta archive と canonical sync を確認する
- [ ] 例: [SEED-search] 次の delta request 候補を整理する

# future
- 例: xxxx 機能
- 例: XXXをmmmしたい

# archive
- [x] 例: ccc
- [x] 例: dddd
```

## 整合性チェック
- current はチェックリスト形式になっているか確認する。
- 実装アイテムごとに Delta ID（または seed）が付いているか確認する。
- current に実行中の Delta ID が 2 件以上同居していないか確認する。
- 実装アイテムの完了条件が `delta-archive PASS` になっているか確認する。
- verify 項目が request の Verify Profile と矛盾していないか確認する。
- future はチェックなしのリストになっているか確認する。
- archive は完了項目（`[x]`）のみか確認する。
