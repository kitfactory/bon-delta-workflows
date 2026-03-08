# plan.md（必ず書く：最新版）

このファイルは **入口だけ** を置く。`current` は Active work を 1〜5 件までに絞り、archive の詳細は monthly archive に分離する。
ユーザーは `planをシュリンクして` といつでも指示してよい。Codex は `archive summary > 5項目`、`plan.md > 120行`、または archive が current/future より明らかに長い場合に slim 化してよい。

# current
- [ ] 次の active delta を起票する（current は 1〜5 件だけ維持）
- [ ] 大機能が一段落したら `review delta` を起票してから archive する
- [ ] 同一 plan item が 3 delta 以上に分かれたら `review delta` を検討する
- [ ] REVIEW 以外の delta が 5 件続いたら `review delta` を検討する

# review timing
- 手動: ユーザーが `review deltaを回して` と言った時
- 手動: ユーザーが `設計レビューして` と言った時
- 自動: 大機能が一段落した時
- 自動: 同一 plan item が 3 delta 以上に分かれた時
- 自動: REVIEW 以外の delta が 5 件続いた時

# future
- 言語追加やテンプレート差分拡張（エディタ固有の指針やライブラリ選定の詳細化）
- 実ファイル生成を伴うテストやスナップショット検証の強化
- DX 改善（エラーメッセージの国際化、ロギング強化、CI での自動検証）

# archive
- [x] 2026-03: `bon` CLI のテンプレート出力、skill copy、path resolution、テスト整備を完了
- [x] 2026-03: delta 長時間稼働ルール、review delta、code-size checker、plan slim 化を整備

# archive index
- `./plan_archive_2026_03.md`
