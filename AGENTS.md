# AGENTS.md

このファイルは最小ルールのみを保持します。詳細な運用ルールは `docs/OVERVIEW.md` を参照してください。

## 最小ルール
- `1 delta = 1到達点` を原則とする。
- 同一目的の観測、微修正、最小 verify は同じ delta に含める。
- Active Delta は原則 1 件とし、seed は複数あっても同時進行しない。
- naming、role、worldbuilding、責務境界の変更は implementation 前に `DESIGN delta` で凍結する。
- 誤字、リンク修正、意味不変の明確化は editorial fast lane とし、delta / verify を省略してよい。
- 意味変更、受入条件変更、workflow ルール変更は delta を使う。
- verify は `delta-request` に定義された `Verify Profile` に従い、フル verify を既定にしない。
- `OPS delta` は運用文書、テンプレート、`skills/delta-*` を対象とし、`concept/spec/architecture` のプロダクト内容変更には使わない。
