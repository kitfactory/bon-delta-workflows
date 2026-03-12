# docs/OVERVIEW.md（入口 / 運用の正本）

この文書は **プロジェクト運用の正本**です。`AGENTS.md` は最小ルールのみで、詳細はここに集約します。
ユーザー要件の変更実行は **delta-first（request → apply → verify → archive）** で運用します。
運用文書間で矛盾がある場合、実行中の Delta ID（In Scope / Out of Scope / AC）を優先します。
文書スキル（concept/spec/architecture）は正本整備に限定し、delta の作成/実行は行いません。
Delta ID が未提示の要件実装は開始せず、先に delta request を作成します。
plan.md の実装アイテム1件は delta request 1件の seed として扱います（原則 1:1）。
実装アイテムが大きい場合は複数 delta に分割して進めます（1:N）。
delta 記録は Markdown（docs/delta/*.md）を正本とし、JSON/YAML の副管理を要求しません。
delta-archive が PASS のときのみ、正本へ最小差分で同期します。
大機能が一段落したら `review delta` を起票し、`docs/delta/REVIEW_CHECKLIST.md` を使って点検します。
ユーザーは `review deltaを回して` といつでも言ってよく、Codex は 1つの plan item が 3 delta 以上になった時や REVIEW 以外の delta が 5件続いた時に review delta を提案してよいです。
通常のソースコードは 500 行超でレビュー対象、800 行超は原則分割、1000 行超は例外扱いとします。
`docs/plan.md` は current / review timing / future / archive summary / archive index だけを置き、archive の詳細は monthly archive に分離します。
ユーザーは `planをシュリンクして` といつでも言ってよく、その場合は `delta-plan-shrinker` skill を使います。Codex は plan の archive 領域が 100行を超えたら slim 化してよいです。
plan.md の archive は計画タスクの完了記録であり、delta archive（差分確定）とは別です。

---

## 現在地（必ず更新）
- 現在フェーズ: P0
- 今回スコープ（1〜5行）:
  - ...
- 非ゴール（やらないこと）:
  - ...
- 重要リンク:
  - concept: `./concept.md`
  - spec: `./spec.md`
  - architecture: `./architecture.md`
  - plan: `./plan.md`

---

## レビューゲート（必ず止まる）
共通原則：**自己レビュー → 完成と判断できたらユーザー確認 → 合意で次へ**

---

## 更新の安全ルール（判断用）
### 合意不要
- 誤字修正、リンク更新、意味を変えない追記
- plan のチェック更新
- 小さな明確化（既存方針に沿う）

### 提案→合意→適用（必須）
- 大量削除、章構成変更、移動/リネーム
- Spec ID / Error ID の変更
- API/データモデルの形を変える設計変更
- セキュリティ/重大バグ修正で挙動が変わるもの


