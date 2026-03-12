# bon-delta-workflows

`bon-delta-workflows` は、AI支援開発のための Proactive Delta Context を実現する bootstrap tool and skill collection です。

このパッケージは `bon-agents-md` をリネームし、AGENTS.md 生成中心から delta-based workflow 中心へ再定義した後継です。

次のような用途を想定しています。

- AI 作業の立ち上がりを速くしたい
- concept / spec / architecture / plan を揃えたい
- スコープの暴走や文書の陳腐化を減らしたい
- 長時間動く AI 作業にレビューの節目を入れたい

---

## 何が生成されるか

`bon` を 1 回実行すると、次を生成します。

- エディタ向けガイド
  - Codex / OpenCode: `AGENTS.md`
  - Claude Code: `CLAUDE.md`
  - Cursor: `.cursorrules`
  - Copilot: `copilot-instructions.md`
- `docs/` 配下の正本ドキュメント
  - `docs/OVERVIEW.md`
  - `docs/concept.md`
  - `docs/spec.md`
  - `docs/architecture.md`
  - `docs/plan.md`
  - `docs/delta/TEMPLATE.md`
  - `docs/delta/REVIEW_CHECKLIST.md`
- skills（任意）
  - `delta-bootstrap` を含む
  - `delta-project-validator` を含む
  - `delta-plan-shrinker` を含む

現在は、validator script を生成先プロジェクトへ直接コピーしません。validator の実体は skill 側にあります。

重要なのは、ガイド本体を薄く保ち、プロジェクト固有の正本を `docs/` に集めることです。

---

## 哲学

`bon-delta-workflows` の根本思想は単純です。

**AI の作業は、小さく閉じた変更と、正本に結びついたレビュー可能な記録がある時に最も安定する。**

そのため、次の原則で構成しています。

1. Delta-first
   - すべての要件は
     `delta request -> delta apply -> delta verify -> delta archive`
     で処理する
2. Canonical docs first
   - `docs/OVERVIEW.md` を運用入口にする
   - `concept / spec / architecture / plan` を正本にする
3. Minimal diffs
   - delta は必要最小限の差分だけを扱う
   - ついでリファクタや将来拡張は混ぜない
4. 節目レビュー
   - 大機能が終わったら `review delta` を回す
   - 1つの plan item が複数 delta に分かれたら早めに review する
5. 読める状態を保つ
   - `plan.md` は薄く保つ
   - archive 詳細は monthly archive へ逃がす
   - 長大コードはレビューし、必要なら分割する

これは単なる prompt テンプレートではなく、Proactive Delta Context に基づく AI 支援開発の運用モデルです。

参照:

- [`docs/philosophy.py`](docs/philosophy.py)

---

## インストール

```bash
npm install -g bon-delta-workflows
```

要件:

- Node.js 16+

open skills ecosystem から入れる場合:

```bash
npx skills add kitfactory/bon-delta-workflows --agent codex --skill delta-bootstrap
```

このコマンドは skill を入れるだけで、現在の project はまだ変更しません。初期化はその後に agent へ依頼します。

---

## 基本的な使い方

```bash
bon
bon --dir path/to/project
bon --force
bon --lang ts
bon --agent claudecode
bon --agent cursor
bon --agent opencode
bon --skills none
bon --skills workspace
bon --skills user
bon --help
bon --version
```

オプション:

- `--dir`: 出力先ディレクトリ
- `--force`: 既存ガイドを上書き
- `--lang`: `python | js | ts | rust`
- `--agent`: `codex | claudecode | cursor | copilot | opencode`
- `--skills`: `none | workspace | user`

`--skills` の意味:

- `none`: guide + docs だけ生成する
- `workspace`: skill を対象プロジェクトへ入れる
- `user`: skill をエージェントの user-level skill ディレクトリへ入れる

---

## どう使うか

### 1. ガイドと docs を生成する

```bash
bon --agent codex --skills workspace --lang python
```

推奨デフォルト:

- `--agent codex`
- `--skills workspace`

例:

```bash
# 現在のプロジェクトに docs + workspace skill を入れる
bon --agent codex --skills workspace

# docs だけ生成し、skill は入れない
bon --agent codex --skills none

# skill は CODEX_HOME/skills に入れ、project docs も生成する
bon --agent codex --skills user

# Claude Code の project 設定
bon --agent claudecode --skills workspace

# OpenCode の project 設定
bon --agent opencode --skills workspace
```

skill scope の使い分け例:

```bash
# skill をこのプロジェクト内だけで使う
bon --agent codex --skills workspace

# skill を Codex 全体で再利用する
bon --agent codex --skills user
```

### 1b. `skills add` で入れる

標準の skills ecosystem を使いたい場合は、bootstrap skill を入れます。

```bash
npx skills add kitfactory/bon-delta-workflows --agent codex --skill delta-bootstrap
```

その後、agent に次のように依頼します。

- `この repo を bon 標準で初期化して`
- `AGENTS.md がないので bon bootstrap files を作って`
- `既存ファイルを壊さずに AGENTS.md と docs/OVERVIEW.md を作って`

### 2. 入口を開く

まず読むのは次です。

- `AGENTS.md` またはエディタ向けガイド
- `docs/OVERVIEW.md`

`OVERVIEW.md` には次がまとまっています。

- 現在スコープ
- 正本リンク
- レビュー運用
- plan slim のルール
- delta の運用ルール

### 3. 小さな plan item を 1 件書く

起点は `docs/plan.md` です。

plan item は小さく保ってください。  
通常は 1 item が 1 delta seed になります。

### 4. delta を作る

`docs/delta/TEMPLATE.md` をコピーして次のようなファイルを作ります。

```text
docs/delta/DR-YYYYMMDD-short-name.md
```

書く項目:

- `Delta Type`
- purpose
- In Scope
- Out of Scope
- Acceptance Criteria
- review gate の要否

### 5. delta の範囲だけ実装する

AC に紐づく変更だけを行います。

混ぜないもの:

- 無関係なリファクタ
- 広範囲の設計刷新
- 将来拡張

### 6. verify する

`delta-project-validator` skill を使います。

必要なテストも併せて実行します。

重要:

- 生成先プロジェクトに `project/scripts/*.js` は作りません
- validator の補助 script は skill の所有物です
- repo 直下の `scripts/*.js` は `bon-delta-workflows` 自身を保守するためのものです

### 7. archive する

verify が PASS なら:

- delta を archive する
- 必要なら plan 側の完了記録を移す
- canonical docs を最小差分で同期する

---

## Delta Type

生成される体系では、次の delta type を使います。

- `FEATURE`
- `REPAIR`
- `DESIGN`
- `REVIEW`
- `DOCS-SYNC`
- `OPS`

### REVIEW delta

長時間運用では `REVIEW` が重要です。

使う場面:

- 大機能が一段落した
- 1つの plan item が 3 delta 以上に広がった
- review なしで non-review delta が 5 件続いた
- architecture / docs / data hygiene を見直したい
- 今すぐ設計レビューを入れたい

手動トリガー例:

- `review deltaを回して`
- `設計レビューして`

`REVIEW` delta では次を使います。

- `docs/delta/REVIEW_CHECKLIST.md`

点検観点:

- layer integrity
- docs sync
- data size / record hygiene
- code split health
- verify coverage

問題が見つかっても、review delta 自体に大修正は混ぜません。  
必要な follow-up delta seed を残します。

---

## Plan Slim

`docs/plan.md` は意図的に薄く保ちます。

置くもの:

- `current`
- `review timing`
- `future`
- `archive`
- `archive index`

履歴詳細は monthly archive に分けます。例:

- `docs/plan_archive_2026_03.md`

手動トリガー例:

- `planをシュリンクして`
- `archiveを整理して`

手動で slim 化する場合は `delta-plan-shrinker` skill を使います。

Codex 側が自発的に slim 化してよい条件:

- archive 領域が 100 行を超えた
- archive が current + future より明らかに長い

---

## 検証

`delta-project-validator` skill を使います。

見るもの:

- `docs/plan.md`
- `docs/delta/DR-*.md`
- archive の PASS 整合

既定値:

- 500 行超: レビュー対象
- 800 行超: 分割対象
- 1000 行超: 例外扱いのみ

これはソースコード拡張子に対して適用され、Markdown 文書には適用されません。

---

## 実務上の回し方

現実的には、次のサイクルで回すのが自然です。

1. plan item を 1 件追加
2. delta を 1 件作る
3. 最小差分で実装する
4. テストと validator で verify
5. archive する
6. 節目で `REVIEW` delta を回す
7. noisy になったら plan を slim 化する

これが意図している標準運用です。

---

## 生成される構成

### ガイド

- Codex / OpenCode: `AGENTS.md`
- Claude Code: `CLAUDE.md`
- Cursor: `.cursorrules`
- Copilot: `copilot-instructions.md`

### canonical docs

- `docs/OVERVIEW.md`
- `docs/concept.md`
- `docs/spec.md`
- `docs/architecture.md`
- `docs/plan.md`
- `docs/delta/TEMPLATE.md`
- `docs/delta/REVIEW_CHECKLIST.md`

### skills

`--skills workspace` の場合:

- codex: `./.codex/skills`
- claudecode: `./.claude/skills`
- cursor: `./.cursor/skills`
- copilot: `./.github/copilot/skills`
- opencode: `./.opencode/skills`

`--skills user` の場合:

- codex: `${CODEX_HOME}/skills` または `~/.codex/skills`
- claudecode: `~/.claude/skills`
- opencode: `~/.config/opencode/skills`

`user` scope の注記:

- Codex: 実際の Codex skill 構成 `${CODEX_HOME}/skills/<skill-name>/SKILL.md` に沿う
- Claude Code: `~/.claude/skills/<skill-name>/SKILL.md` に沿う
- OpenCode: `~/.config/opencode/skills/<skill-name>/SKILL.md` に沿う
- Cursor: 未対応
- Copilot: 未対応
- `--agent cursor --skills user` と `--agent copilot --skills user` はエラー終了する

`--skills none` の場合、skill の配置は行われず、`delta-project-validator` や `delta-plan-shrinker` も入りません。

主に使う skill:

- `delta-project-validator`
- `delta-plan-shrinker`

所有関係:

- project docs / guide は bootstrap 出力
- `skills/<skill-name>/` 配下は skill の所有物
- validator 補助は `delta-project-validator` の所有物
- plan archive 圧縮ロジックは `delta-plan-shrinker` の所有物

---

## ロケール

ロケール判定元:

- `LANG`
- `LC_ALL`
- OS locale

WSL では Windows 側を優先します。

日本語ロケールでは、日本語寄りの docs を生成します。

---

## 開発

テスト:

```bash
npm test
```

このリポジトリ自身の validator:

```bash
node scripts/validate_delta_links.js --dir .
node scripts/check_code_size.js --dir .
```

これらの repo-level scripts は、このリポジトリ自身を保守するためのものであり、生成先プロジェクト用ではありません。

---

## この形が機能する理由

このプロジェクトは、意図的に次を優先しています。

- clever さより明確さ
- 完全放任の AI よりレビュー可能な節目
- 散らばったメモより正本
- prompt の増殖より運用の一貫性

AI を長く動かしても逸脱しにくくしたいなら、この形に意味があります。




