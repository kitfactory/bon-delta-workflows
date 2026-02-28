# bon-agents-md ⚡️

`bon-agents-md` は、AI アシスタント向けのガイド（AGENTS.md など）を  
**ワンコマンドで生成するためのツール**です。

- 各エディタ（Codex CLI / Cursor / Claude Code / Copilot）ごとのガイドを自動生成
- concept / spec / architecture / plan を **Spec ID でひとつながり**に管理
- プロジェクト固有の情報は `docs/` に分離して、AI の誤読・誤生成を抑制

「まず AI に渡す設計ガイドをサッと用意したい」「仕様のブレや手戻りを減らしたい」
ときの**スターターキット**として使えます。

---

## なにが嬉しいの？（メリット）✨

### 1. AGENTS ガイドを数秒で用意できる
- `bon` コマンドを 1 回実行するだけで、エディタごとに最適化されたガイドを生成  
  - Codex / Claude Code: `AGENTS.md`  
  - Cursor: `.cursorrules`  
  - Copilot: `copilot-instructions.md`
- 「まずこのファイルを AI に読ませればいい」という状態をすぐ作れます。

### 2. concept/spec/architecture/plan が一貫した「型」になる
- `docs/OVERVIEW.md` を生成し（無ければ作成）、運用の入口とリンク集を用意
- `docs/concept.md` / `docs/spec.md` / `docs/architecture.md` / `docs/plan.md` は無ければ最小テンプレを作成し、プロジェクト固有内容はあなたが管理
- すべて **Spec ID** で連携されるので、
  - 機能 → 仕様 → 実装レイヤー → 開発計画  
  がトレースしやすくなります。
- plan は current / future / archive で管理します。
- 人間どうしの合意ポイントも明示されるため、レビューや相談がしやすくなります。

### 3. AI に渡しても「暴走しにくい」設計ノウハウをビルトイン
- Spec は Given / When / Then 形式で、見出しに Spec ID を併記  
  → 「どの条件でどう動くか」を AI にも人にも誤解させにくい
- Architecture はレイヤー責務と主要 I/F を明示し、  
  **ゴッド API / ゴッドデータ** を避ける指針を含めます。
- エラーは Error ID（例: `[bon][E_EDITOR_UNSUPPORTED] ...`）付きで固定し、  
  ログ・メッセージの表現が AI に壊されにくくなります。

### 4. サンプルが短くハッキリしていて、期待値を合わせやすい
- 成功パターン / 失敗パターンを 1 行ずつ用意し、Error ID も付けてあります。
- 「こういう入力のときに、こういうログ・エラーが出る」が一目で分かるため、  
  AI にとっても人にとっても**挙動のイメージが揃えやすい**構成です。

### 5. .env の扱いも安全寄りのデフォルト
- `.env.sample` は自動生成しません。
- 必要な環境変数と利用箇所だけを AGENTS ガイド側で指示するスタイルにすることで、  
  「とりあえず秘密を書いちゃった」事故を減らします。

---

## インストール

```bash
npm install -g bon-agents-md
```

- 要件: Node.js 16+

---

## 使い方

```bash
bon                     # ロケール自動判定でガイド + docs/OVERVIEW.md（無ければ作成）を生成
bon --dir path/to       # 出力先ディレクトリを指定（無ければ作成）
bon --force             # 既存ガイドファイルを上書き
bon --lang ts           # python|js|ts|rust から言語ガイダンスを選択（既定: python）
bon --editor cursor     # codex|cursor|claudecode|copilot からエディタを選択（既定: codex）
bon --help              # ヘルプ表示
bon --version           # バージョン表示
```

---

## 最初の10分（推奨導線）

1. ガイドとドキュメントを生成:

```bash
bon --editor codex --lang python
```

2. `AGENTS.md`（またはエディタ向けガイド）と `docs/OVERVIEW.md` を開く。  
3. `docs/plan.md` の current に、小さな実装アイテムを1件書く。  
4. `docs/delta/TEMPLATE.md` から delta 記録を1件作成（Delta ID / In Scope / Out of Scope / AC）。  
5. AC に紐づく変更だけを実装する。  
6. 検証を実行:

```bash
node scripts/validate_delta_links.js --dir .
```

7. PASS なら delta を archive し、正本ドキュメントへ最小差分で同期する。  

---

## 1要件を完了させる最小ハッピーパス
例: 「APIクライアントにタイムアウトを追加する」

1. `delta request`:
   - `docs/delta/DR-YYYYMMDD-timeout.md` を作成
   - In Scope（timeout追加）/ Out of Scope（retry再設計）/ 測定可能な AC を定義
2. `delta apply`:
   - timeout処理を実装
   - 必要な場合のみ、関連する正本（`spec/architecture/plan`）を最小差分で更新
3. `delta verify`:
   - テストと `node scripts/validate_delta_links.js --dir .` を実行
   - ACとの対応が明示され、すべて PASS であることを確認
4. `delta archive`:
   - delta 記録に verify result PASS を記録
   - plan の current から archive へ移す（plan完了記録）  
     ※ plan archive と delta archive は別の記録

---

## 生成されるファイル構成

### エディタ向けガイド

- Codex / Claude Code: `AGENTS.md`
- Cursor: `.cursorrules`
- Copilot: `copilot-instructions.md`

### プロジェクト固有ドキュメント（`docs/` 配下）

- `docs/OVERVIEW.md`（無ければ作成）
  - 入口（現在地・スコープ・重要リンク・運用ルール）
- それ以外（プロジェクト固有の正本）はあなたが用意:
  - `docs/concept.md` / `docs/spec.md` / `docs/architecture.md` / `docs/plan.md`
- Delta 運用の補助ファイルも無ければ作成:
  - `docs/delta/TEMPLATE.md`（Markdown 正本の記録テンプレート）
  - `scripts/validate_delta_links.js`（plan↔delta↔archive の整合チェック）

### プロジェクト内スキル配置
bon はスキルを**プロジェクト内**にコピーします（グローバルには入れません）:
- codex / claudecode: `./.codex/skills`
- cursor: `./.cursor/skills`
- copilot: `./.github/copilot/skills`

---

## 要件対応フロー（Delta-first）

- ユーザー要件は次の 4 ステップで処理します:
  - `delta request` -> `delta apply` -> `delta verify` -> `delta archive`
- 指示が衝突した場合は、アクティブな Delta 定義（In Scope / Out of Scope / AC）を優先します。
- `docs/plan.md` の実装アイテム 1 件を `delta request` 1 件の seed として扱います（原則 1:1、必要なら 1:N 分割）。
- delta 記録は Markdown（`docs/delta/*.md`）を正本とし、JSON/YAML の副管理は要求しません。
- `delta-archive` が PASS のものだけを、正本ドキュメント/実装へ最小差分で同期します。

整合チェック:

```bash
node scripts/validate_delta_links.js --dir .
```

---

## `validate_delta_links` が失敗したとき
1. エラーに出た Delta ID と plan セクションの不整合を確認する。  
2. 先にリンク不整合を修正する:
   - delta ファイル不足: `docs/delta/DR-*.md` を作成/改名
   - PASSなしで archive: verify を完了するか、archive から戻す
   - plan は archive 済みだが delta が未確定: 先に delta 状態を確定
3. 再実行:

```bash
node scripts/validate_delta_links.js --dir .
```

4. PASS になるまで繰り返し、その後 `delta archive` に進む。  

---

## Done条件（`delta archive` 前）
- 1つの実装アイテムが 1つの delta に対応している（または分割方針が明示されている）
- delta 記録に In Scope / Out of Scope / Acceptance Criteria がある
- すべてのコード/文書変更が AC に紐づいている
- 変更に必要なテストが PASS
- `node scripts/validate_delta_links.js --dir .` が PASS
- 正本ドキュメントは delta 範囲の最小差分でのみ更新
- 無関係なリファクタや将来拡張を混在させていない

---

## 設計品質ガードレール

- `architecture-editor` は 12 項目固定の設計補助ガイドで、設計の抜け漏れを抑えます。
- 依存方向は外→内（Adapter/Infra -> UseCase -> Domain）で固定します。
- 設計指示が衝突した場合の優先順位:
  - `spec.md > architecture.md > OVERVIEW/AGENTS > design-assist-guide`
- 過剰設計と責務混在を避ける方針を明示しています。

---

## Philosophy 参照（このリポジトリ）

- [`docs/philosophy.py`](docs/philosophy.py) に Delta-first の思想を日英でまとめています。
- 言語指定で出力できます:
  - `python3 docs/philosophy.py --lang ja`
  - `python3 docs/philosophy.py --lang en`
  - `python3 docs/philosophy.py --lang both`

---

## ロケールと記述方針

- `LANG` / `LC_ALL` / OS 設定からロケールを判定（WSL は Windows 側を優先）
- 日本語ロケールの場合:
  - ドキュメントは日本語
  - コードコメントは日英併記推奨  
  → チーム内での読みやすさと、AI にとっての理解しやすさの両立を狙います。

---

## 開発

- テスト:

```bash
npm test
```

PR やフィードバックも歓迎です。
