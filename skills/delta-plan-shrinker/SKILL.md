---
name: delta-plan-shrinker
description: 「planをシュリンクして」「archiveを整理して」「plan archiveを圧縮して」などの依頼で使用。delta-based workflow の plan.md を薄く保ち、archive 詳細を monthly archive に寄せる。
---

# Delta Plan Shrinker

## 目的
- `docs/plan.md` を入口として読みやすく保つ。
- archive 詳細を `docs/plan_archive_YYYY_MM.md` に分離する。
- `current / review timing / future / archive / archive index` の構造を維持する。

## 発火条件
- 手動:
  - `planをシュリンクして`
  - `archiveを整理して`
  - `plan archiveを圧縮して`
- 自動提案:
  - plan の `archive` 領域が 100 行超
  - archive が current + future より明らかに長い

## ルール
- `current` は active work 1〜5 件を維持する。
- `review timing` を削らない。
- `future` は粗い計画だけ残す。
- `archive` には直近の重要完了だけを残す。
- archive 本文は monthly archive へ逃がす。
- `archive index` は最新の monthly archive へのリンクを残す。

## 出力
- 更新後の `docs/plan.md`
- 必要なら新規または更新された `docs/plan_archive_YYYY_MM.md`
- 何を monthly archive へ移したかの短い要約

