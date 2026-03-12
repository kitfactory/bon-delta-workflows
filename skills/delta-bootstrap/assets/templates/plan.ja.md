# plan.md（必ず書く：最新版）

このファイルは入口だけを置く。`current` は 1〜5 件、archive の詳細は monthly archive に分離する。
ユーザーは `planをシュリンクして` といつでも指示してよく、その場合は `delta-plan-shrinker` skill を使う。Codex は plan の archive 領域が 100行を超えたら slim 化してよい。

# current
- [ ] 次の active delta を起票する
- [ ] 同一 plan item が 3 delta 以上になったら review delta を検討する
- [ ] REVIEW 以外の delta が 5 件続いたら review delta を検討する

# review timing
- 手動: `review deltaを回して`
- 手動: `設計レビューして`
- 自動: 大機能が一段落した時
- 自動: 同一 plan item が 3 delta 以上になった時
- 自動: REVIEW 以外の delta が 5 件続いた時

# future
- 将来計画を粗く列挙する

# archive
- [x] 直近の重要完了だけを書く

# archive index
- `./plan_archive_YYYY_MM.md`


