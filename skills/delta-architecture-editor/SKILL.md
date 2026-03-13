---
name: delta-architecture-editor
description: 「architecture.mdを作成/直す」「設計書を書く/修正」「アーキテクチャ設計をまとめる」などの依頼で使用。architecture.md を、delta の canonical sync ルールに従って整合的に作成・更新する。
---

# Delta Architecture Editor

## 基本方針
- 出力言語は `AGENTS.md` とロケールに合わせる（ja は日本語、en は英語）。
- 出力は設計書本文のみとし、前後説明やレビュー文を同一出力に混ぜない。
- 本ファイルは優先ルールのみ保持し、詳細テンプレートは `references/` を参照する。
- concept / spec と用語、ID、例外命名を整合させる。

## 役割境界（Deltaとの分離）
- 本スキルの責務は `architecture.md` の正本整備（全体設計の整理/更新）に限定する。
- ユーザー要件の差分定義、適用、検証、確定は `delta-request` / `delta-apply` / `delta-verify` / `delta-archive` の責務とする。
- Delta ID が提示された場合は `Candidate Files/Artifacts` と `Canonical Sync Mode` に従って更新可否を判断する。
- `Canonical Sync Mode = post-archive sync` の場合、本スキルは archive PASS 後の正本同期だけを行う。
- `Canonical Sync Mode = direct canonical update` の場合、本スキルは apply 中の正本更新に使ってよい。
- Active Delta がある間は In Scope に関係する設計要素のみ更新し、Out of Scope の設計要素は編集しない。
- `OPS` delta では、`architecture.md` のプロダクト内容変更を行わない。明示的に In Scope で必要な参照整備だけを扱う。

## 実行モード
1. Canonical Mode（Delta ID なし）: architecture 全体整備を行う。
2. Post-Archive Sync Mode（Delta ID あり + `post-archive sync`）: archive PASS 後に In Scope のみ同期する。
3. Direct Canonical Update Mode（Delta ID あり + `direct canonical update`）: apply 中に In Scope のみ更新する。

## 生成フロー（厳守）
1. concept.md の有無を確認する（未提示なら作成を推奨）。
2. spec.md の有無を確認し、ERR / MSG 命名を合わせる。
3. Delta ID がある場合は `Candidate Files/Artifacts` と `Canonical Sync Mode` を確認する。
4. 設計変更要求がある場合は `references/design-assist-guide.md` の入力 / 出力順に従って設計案を作成する。
5. `references/architecture-template.md` に従って本文を生成する。
6. 依存方向は「外→内」（Adapter / Infrastructure -> UseCase -> Domain）に固定する。
7. 仕様衝突時の優先順位は `spec.md > architecture.md > OVERVIEW/AGENTS > design-assist-guide` を適用する。
8. 過剰設計（未要求の将来拡張、責務混在）を禁止し、最小責務で分割する。
9. レビュー依頼がある場合のみ、本文出力の次メッセージでレビューする。

## 参照ファイル
- 詳細テンプレート/境界契約/整合チェック: `references/architecture-template.md`
- 設計補助ガイド（入力項目/12段出力/境界チェック）: `references/design-assist-guide.md`

## 品質ゲート
- レイヤー責務、依存方向、I/F 契約、例外設計が整合する。
- spec の ERR / MSG 命名と矛盾しない。
- Delta 適用時は更新要素が In Scope に限定され、Out of Scope が不変である。
- `OPS` delta で product content を書き換えていない。
