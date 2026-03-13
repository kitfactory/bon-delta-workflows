---
name: delta-apply
description: 「delta apply」「差分を適用して」「requestに従って変更して」などの依頼で使用。delta-request で定義された 1 到達点を最小差分で実装し、非対象への変更を防ぐ。
---

# Delta Apply

## 目的
- 承認済み delta-request を最小差分で実装する。
- 変更を request の境界内に閉じる。

## 前提
- 入力として `delta-request` があること。
- request に `Delta ID` / `In Scope` / `Out of Scope` / `Acceptance Criteria` / `Candidate Files/Artifacts` / `Verify Profile` / `Canonical Sync Mode` が定義されていること。

## 厳守ルール（逸脱禁止）
- Out of Scope の変更はしない。
- request にない改善（ついでリファクタ、命名刷新、最適化）をしない。
- 同一目的の観測は apply 内で行ってよいが、別目的の調査を混ぜない。
- 変更は最小行数、最小ファイル数を優先する。
- 仕様変更が必要なら apply を止め、request の更新を要求する。
- request で示された `Candidate Files/Artifacts` 以外は編集しない。
- `Verify Profile` と `Canonical Sync Mode` を apply 側で変更しない。
- Out of Scope 変更が 1 件でも発生したら `BLOCKED` として停止する。
- 長大なファイル、長大な関数、責務過多のモジュールを残さない。通常のソースコードは 500 行超でレビュー対象、800 行超は原則分割、1000 行超は例外扱いとする。
- `delta` 記録は最終的に成立した変更を中心に書き、中間失敗の羅列にしない。
- `Delta Type = REVIEW` の場合、apply は点検証跡の収集だけを行い、広範囲修正を混ぜない。
- `Canonical Sync Mode = direct canonical update` の場合のみ、In Scope の正本を apply 中に直接更新してよい。

## 実行フロー
1. request の AC を実装タスクへ対応付ける。
2. `Candidate Files/Artifacts` を確認し、変更対象の最小集合を確定する。
3. 同一目的の観測が必要な場合は apply 内で実施する。
4. 差分を適用する。
5. `Canonical Sync Mode = direct canonical update` の場合は、In Scope の正本を同期する。
6. 長大コードや責務混在が出ていないか確認し、必要なら分割する。
7. 変更内容を AC 単位で説明可能な状態にする。
8. verify に渡すための変更サマリを作る。

## 出力テンプレート（固定）
```markdown
# delta-apply

## Delta ID
- （requestと同一）

## Delta Type
- （requestと同一）

## 実行ステータス
- APPLIED / BLOCKED

## 確認済み Candidate Files/Artifacts
- path/to/file1
- path/to/file2

## 変更ファイル/成果物
- path/to/file1
- path/to/file2

## 適用内容（AC対応）
- AC-01:
  - 変更:
  - 根拠:
- AC-02:
  - 変更:
  - 根拠:

## 非対象維持の確認
- Out of Scope への変更なし: Yes/No
- もし No の場合の理由:

## Canonical Sync
- mode:
- action:
- status: DONE / NOT STARTED / NOT REQUIRED

## コード分割健全性
- 500行超のファイルあり: Yes/No
- 800行超のファイルあり: Yes/No
- 1000行超のファイルあり: Yes/No
- 長大な関数なし: Yes/No
- 責務過多のモジュールなし: Yes/No

## verify 依頼メモ
- request profile:
  - static check:
  - targeted unit:
  - targeted integration / E2E:
  - delta-project-validator:
- 検証してほしい観点:
- review evidence:
```

## 品質ゲート（出力前チェック）
- 変更ファイル/成果物が Candidate Files/Artifacts と In Scope から逸脱していない。
- すべての変更が AC に紐づく。
- AC に紐づかない変更が 0 件である。
- Canonical Sync の実行有無が request の mode と一致している。
- 500 行超のファイルはレビュー理由が書かれている。
- 800 行超のファイルを残す場合は分割理由または例外理由が明示されている。
- 1000 行超のファイルを残す場合は生成コード等の例外理由が明示されている。
- REVIEW delta では変更より証跡収集が中心になっている。
- 追加タスクが必要なら `BLOCKED` または未適用を明示している。
