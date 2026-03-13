---
name: delta-spec-editor
description: 「仕様書を作る/直す」「spec.mdを作成/修正」「仕様書(spec.md相当)を作って/直して」などの依頼で使用。spec.md を、delta の canonical sync ルールに従って整合的に作成・更新する。
---

# Delta Spec Editor

## 基本方針
- 出力言語は `AGENTS.md` とロケールに合わせる（ja は日本語、en は英語）。
- 出力は仕様書本文のみとし、前後説明やレビュー文を同一出力に混ぜない。
- 本ファイルは優先ルールのみ保持し、詳細テンプレートは `references/` を参照する。
- I/F 詳細や API 使用の詳細は書かず、要件レベルを維持する。

## 役割境界（Deltaとの分離）
- 本スキルの責務は `spec.md`（および機能別仕様）の正本整備に限定する。
- ユーザー要件の差分定義、適用、検証、確定は `delta-request` / `delta-apply` / `delta-verify` / `delta-archive` の責務とする。
- Delta ID が提示された場合は `Candidate Files/Artifacts` と `Canonical Sync Mode` に従って更新可否を判断する。
- `Canonical Sync Mode = post-archive sync` の場合、本スキルは archive PASS 後の正本同期だけを行う。
- `Canonical Sync Mode = direct canonical update` の場合、本スキルは apply 中の正本更新に使ってよい。
- Active Delta がある間は In Scope に関連する要件、章のみ更新し、Out of Scope の要件、章は編集しない。
- `OPS` delta では、`spec.md` のプロダクト内容変更を行わない。明示的に In Scope で必要な参照整備だけを扱う。

## 実行モード
1. Canonical Mode（Delta ID なし）: concept から全体仕様、機能別仕様を整備する。
2. Post-Archive Sync Mode（Delta ID あり + `post-archive sync`）: archive PASS 後に In Scope のみ同期する。
3. Direct Canonical Update Mode（Delta ID あり + `direct canonical update`）: apply 中に In Scope のみ更新する。

## 生成フロー（厳守）
1. concept.md の有無を確認し、必要なら要約を依頼する。
2. Delta ID がある場合は `Candidate Files/Artifacts` と `Canonical Sync Mode` を確認する。
3. `references/spec-template.md` の規模判定で出力単位（全体 / 機能別）を決める。
4. 不足情報を提案し、同意後に本文を生成する。
5. レビュー依頼がある場合のみ、本文出力の次メッセージでレビューする。

## 参照ファイル
- 詳細テンプレート/IDルール/整合チェック: `references/spec-template.md`

## 品質ゲート
- REQ / Given-When-Done / ERR / MSG の対応が崩れていない。
- concept の UC / Feature が仕様で網羅されている。
- Delta 適用時は更新章が In Scope に限定され、Out of Scope が不変である。
- `OPS` delta で product content を書き換えていない。
