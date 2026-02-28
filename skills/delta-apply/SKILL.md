---
name: delta-apply
description: 「delta apply」「差分を適用して」「requestに従って変更して」などの依頼で使用。delta-requestで定義された最小差分のみを実装し、非対象への変更を防ぐ。
---

# Delta Apply

## 目的
- 承認済み delta-request を最小差分で実装する。
- 変更を request の境界内に閉じる。

## 前提
- 入力として `delta-request` があること。
- request に Delta ID / In Scope / Out of Scope / AC が定義されていること。

## 厳守ルール（逸脱禁止）
- Out of Scope の変更はしない。
- request にない改善（ついでリファクタ、命名刷新、最適化）をしない。
- 変更は最小行数・最小ファイル数を優先する。
- 仕様変更が必要なら apply を止め、request の更新を要求する。
- request で示されていないファイルは編集しない。
- Out of Scope 変更が 1 件でも発生したら `BLOCKED` として停止する。

## 実行フロー
1. request の AC を実装タスクへ対応付ける。
2. 変更ファイルを最小集合で確定する。
3. 差分を適用する。
4. 変更内容を AC 単位で説明可能な状態にする。
5. verify に渡すための変更サマリを作る。

## 出力テンプレート（固定）
```markdown
# delta-apply

## Delta ID
- （requestと同一）

## 実行ステータス
- APPLIED / BLOCKED

## 変更ファイル
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

## verify 依頼メモ
- 検証してほしい観点:
```

## 品質ゲート（出力前チェック）
- 変更ファイルが In Scope から逸脱していない。
- すべての変更が AC に紐づく。
- AC に紐づかない変更が 0 件である。
- 追加タスクが必要なら「未適用」と明示している。
- BLOCKED の場合、追加編集せず request 更新待ちにしている。
