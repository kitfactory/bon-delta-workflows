---
name: delta-concept-editor
description: 「concept.mdを作成」「conceptを作る/直す/修正」「concept文書を評価/レビュー」など、concept.md の作成・更新・評価を行う。プロダクト概念を整合させつつ、delta の canonical sync ルールに従って更新する。
---

# Delta Concept Editor

## 基本方針
- 出力言語は `AGENTS.md` とロケールに合わせる（ja は日本語、en は英語）。
- 出力は concept.md 本文のみとし、前後説明やレビュー文を同一出力に混ぜない。
- 本ファイルは優先ルールのみ保持し、詳細テンプレートは `references/` を参照する。

## 役割境界（Deltaとの分離）
- 本スキルの責務は `concept.md` の正本整備（全体整理/更新）に限定する。
- ユーザー要件の差分定義、適用、検証、確定は `delta-request` / `delta-apply` / `delta-verify` / `delta-archive` の責務とする。
- Delta ID が提示された場合は `Candidate Files/Artifacts` と `Canonical Sync Mode` に従って更新可否を判断する。
- `Canonical Sync Mode = post-archive sync` の場合、本スキルは archive PASS 後の正本同期だけを行う。
- `Canonical Sync Mode = direct canonical update` の場合、本スキルは apply 中の正本更新に使ってよい。
- Active Delta がある間は In Scope に関係する章のみ更新し、Out of Scope の章は編集しない。
- `OPS` delta では、`concept.md` のプロダクト内容変更を行わない。明示的に In Scope で必要な参照整備だけを扱う。

## 実行モード
1. Canonical Mode（Delta ID なし）: concept 全体の整備を行う。
2. Post-Archive Sync Mode（Delta ID あり + `post-archive sync`）: archive PASS 後に In Scope のみ同期する。
3. Direct Canonical Update Mode（Delta ID あり + `direct canonical update`）: apply 中に In Scope のみ更新する。

## 生成フロー（厳守）
1. 不足情報を確認する（重要度順、最大5件）。
2. Delta ID がある場合は `Candidate Files/Artifacts` と `Canonical Sync Mode` を確認する。
3. 必須4観点（権限/保存方針/公開範囲/例外）を提案し、同意を得る。
4. `references/concept-template.md` に従って本文を作成する。
5. レビュー依頼がある場合のみ、本文出力の次メッセージでレビューする。

## 参照ファイル
- 詳細テンプレート/章ルール/整合チェック: `references/concept-template.md`
- 粒度合わせのサンプル: `references/sample-concept.md`

## 品質ゲート
- 11セクションが存在し、主要ID（F/UC/G）が整合している。
- Pain -> UC -> Features -> Layering -> Data の往復整合が成立する。
- Delta 適用時は更新章が In Scope に限定され、Out of Scope が不変である。
- `OPS` delta で product content を書き換えていない。
