# bon-delta-workflows アーキテクチャ

本設計は、`bon` CLI が AI ガイド（`AGENTS.md` 等）と `docs/OVERVIEW.md` を生成するまでのレイヤー構造と責務分担を示す。単一責務・DI 可能な抽象境界を重視し、ゴッドクラス化を避ける。

運用の入口は `docs/OVERVIEW.md` とし、ガイド（AGENTS.md 等）は詳細を抱えずに `docs/OVERVIEW.md` を参照する。

## 目標と制約
- npm グローバル CLI (`bon`) として動作し、Node.js 16+ を前提。
- 対応 AI エージェント: codex / claudecode / cursor / copilot / opencode（未指定は codex）。
- 対応言語: Python / JavaScript / TypeScript / Rust（未指定は Python）。
- ロケール判定: ユーザー指定 > `LANG`/`LC_ALL` > OS 推定。WSL では Windows 側言語を優先。判定不可は英語。
- `.env.sample` は生成しない。AGENTS.md に環境変数・`.env` の設定例と利用箇所を明示する。
- AGENTS.md が日本語の場合は concept/spec/architecture/plan を日本語で作成し、ソースコードのコメントは日本語と英語を併記するルールをテンプレートに含める。
- AGENTS.md 自体にはプロジェクト固有情報を直接持たせず、**`docs/OVERVIEW.md` を唯一の入口**としてプロジェクトを把握するよう誘導する共通テンプレートとする。
- `docs/OVERVIEW.md` が無い場合は作成する（既存は原則上書きしない）。
- 出力ファイル名はエージェントに合わせる: codex と opencode は `AGENTS.md`、claudecode は `CLAUDE.md`、cursor は `.cursorrules`、copilot は `copilot-instructions.md`。
- skill 配置は `--skills none|workspace|user` で切り替える。`workspace` はプロジェクト配下、`user` はユーザー領域へ配置する。
- `docs/OVERVIEW.md` を入口として運用する。必要なら `docs/` 配下に concept/spec/architecture/plan を整備し、`docs/plan.md` のチェックリストを活用するよう案内する。

## レイヤー構成

### 1) CLI インターフェース層
- 入力: process.argv
- 責務: オプション解析（`--dir`, `--force`, `--lang`, `--agent`, `--skills`, `--help`, `--version`）。パース結果をアプリケーション層へ渡す。
- 実装指針: 小さなパーサ関数に分割。help/version は早期 return。エラーはユーザー向けメッセージで終了コード 1。

### 2) コンテキスト判定層（抽象化ポイント）
- 入力: CLI オプション、環境変数 (`LANG`, `LC_ALL`)、OS/WSL 情報。
- 責務:
  - ロケール決定（日本語/英語）。
  - 言語決定（Python/JS/TS/Rust）。
  - エージェント決定（codex/claudecode/cursor/copilot/opencode）。
  - skill 配置スコープ決定（none/workspace/user）。
- 抽象境界: `LocaleDetector`, `LanguageSelector`, `AgentSelector`, `SkillScopeSelector` といったインターフェースを用意し、テストでモック可能にする。WSL 判定や Windows 言語取得は専用ユーティリティに分離。

### 3) テンプレート選択/構成層
- 入力: 言語、エージェント、ロケール。
- 責務: 言語別（Python/JS/TS/Rust）× ロケール別（日/英）× エージェント別テンプレートスニペットの組み立て。共通パート（要件定義、仕様記法、設計指針、テスト方針、環境変数指示）を注入。
- 追加要件: 日本語ロケールではドキュメント/コメント運用ルール（concept 機能表・フェーズ整理、spec の章立てと番号付け、コメント日英併記）を必ず含める。
- 抽象境界: `TemplateProvider`（データ）、`TemplateRenderer`（文字列化）。データとレンダリングを分離し、ユニットテストで差し替え可能にする。

### 4) 出力層（ファイル I/O）
- 入力: 生成文字列、`--dir`、`--force`、`--skills`。
- 責務: ディレクトリ作成、既存ファイルの存在確認（エージェントに応じたファイル名）、`--force` に応じた上書き、ファイル書き出し。あわせて `docs/OVERVIEW.md` を **未存在時のみ**生成し、`--skills` に応じて skill を未配置/プロジェクト配下/ユーザー領域へ配置する。
- 抽象境界: `FileWriter` として fs への依存を隔離し、テストでモック/スタブを差し替えられるようにする。

### 5) ロギング/エラーハンドリング
- 責務: ユーザー向けに簡潔なログを出す。失敗時は原因を明示し終了コードを 1 にする。
- デバッグ補助: テスト難航時に段階的メッセージを追加できるよう、ログユーティリティを薄く用意する（標準出力/標準エラーのどちらに出すかを明確化）。

## 主要インターフェース例（I/F の明確化）

```ts
// コンテキスト判定
interface LocaleDetector {
  detect(env: NodeJS.ProcessEnv, platform: NodeJS.Platform, release: string): 'ja' | 'en';
}
interface LanguageSelector {
  normalize(langInput: string | undefined): 'python' | 'js' | 'ts' | 'rust';
}
interface AgentSelector {
  normalize(agentInput: string | undefined): 'codex' | 'claudecode' | 'cursor' | 'copilot' | 'opencode';
}
interface SkillScopeSelector {
  normalize(scopeInput: string | undefined): 'none' | 'workspace' | 'user';
}

// テンプレート
interface TemplateProvider {
  getSections(language: string, locale: 'ja' | 'en', agent: string): TemplateSections;
}
interface TemplateRenderer {
  render(sections: TemplateSections): string;
}

// 出力
interface FileWriter {
  ensureDir(path: string): void;
  exists(path: string): boolean;
  write(path: string, content: string, options: { force: boolean }): void;
}

type TemplateSections = {
  intro: string;
  docDiscipline: string | null; // 日本語ロケール時は必須
  requirements: string;
  specs: string;
  design: string;
  testing: string;
  languageGuidance: string;
  editorGuidance: string;
  workflow: string;
};
```

> 注意（必ず遵守）: ゴッド API/データを作らない。API は役割ごとに最小粒度で分割し、引数も最小限にする。データ型も必要最小限の属性のみに絞り、汎用マップ（なんでも入るオブジェクト）や万能メソッド化を避けること。

## 主要データ型と属性
- CLI/引数: `dir: string`, `force: boolean`, `lang: 'python' | 'js' | 'ts' | 'rust'`, `agent: 'codex' | 'claudecode' | 'cursor' | 'copilot' | 'opencode'`, `skills: 'none' | 'workspace' | 'user'`, `locale: 'ja' | 'en'`, `fileName: string`
- 環境: `env: NodeJS.ProcessEnv`, `platform: NodeJS.Platform`, `release: string`（WSL 判定用）、`windowsLocale?: string | null`
- テンプレート入力/出力: `TemplateSections`（上記 I/F 例参照）
- ファイル I/O: `targetDir: string`, `targetPath: string`, `content: string`, `options: { force: boolean }`
- ロケール/エージェント/言語判定: 正規化済みの `language`/`agent`/`skills`/`locale` を返し、サポート外はエラーとする

## AGENTS.md に含める内容（生成テンプレートの骨子）
- 要件定義: 想定ユーザー、困りごと、ユースケース、機能一覧、使用ライブラリ、全体設計。
- 仕様/要求仕様: 英語は Given/When/Then、日本語は 前提/条件/振る舞い。
- 設計: レイヤー構造・単一責務・抽象クラス/DI 指針。ゴッドクラス/雑多ヘルパー禁止。シンプルなインターフェースを提示。
- テスト方針: 機能・レイヤー単位で完了。モックは補助、本番経路（実通信/実接続）が通ったら完了。必要な環境変数・接続情報・`.env` の配置場所と設定例を記載（`.env.sample` は生成しない）。難航時はステップごとにデバッグログを追加するよう指示。
- ドキュメント参照: AGENTS.md から **`docs/OVERVIEW.md` を参照**し、そこからプロジェクト固有の背景・設計詳細（concept/spec/architecture/plan）に辿れるよう案内する。

## 言語別テンプレート指針
- Python: `uv` + `.venv` 仮想環境、`pytest`、Lint/Format（`ruff`/`black` など）。必要な環境変数例を示し、`.env` の利用箇所を明記する。
- JavaScript: Node.js + `pnpm`/`npm`、テスト（Vitest/Jest）、Lint/Format（ESLint/Prettier）。`.env` で注入する必要キーと利用箇所を指示する（サンプルファイルは生成しない）。
- TypeScript: JavaScript と同様に加え、`tsc --noEmit` による型チェックと型境界設計を促す。抽象インターフェース経由の DI を強調する。
- Rust: `cargo` ワークスペース推奨、`cargo fmt` / `cargo clippy` / `cargo test`。feature flag 設計と実機テストの導線を含める。

## コンポーネントと依存関係
- `bin/bon.js`（エントリーポイント） → CLI パーサ → コンテキスト判定（ロケール/言語/エージェント/skill scope） → テンプレート構成/レンダリング → ファイル出力。
- 依存は単方向（上位レイヤーが下位の抽象インターフェースに依存）。実装はインジェクション可能にし、ユニットテストでモックを差し替える。

## フェーズ別適用
- フェーズ1 (MVP): CLI/ロケール判定とテンプレート骨子（要件定義〜作業の進め方）、ファイル出力/上書き制御を実装する。
- フェーズ2 (運用強化): テンプレートにドキュメント/コメント運用ルールを追加し、言語・エージェント別ガイダンスを充実させる。
- フェーズ3 (拡張): 言語追加やテンプレート差分、テスト強化（実ファイル生成確認など）を拡張ポイントとして順次取り込む。

## テスト戦略
- 単体テスト: CLI パーサ、ロケール/言語/エージェント/skill scope 判定、テンプレート組み立て、ファイル出力のエラーパス（上書き禁止など）。
- 結合テスト: 言語/エージェント/ロケール/skill scope の組合せで AGENTS.md が期待どおりになるか確認。
- 実系テスト: 実ファイル書き出し、`.env` 指示文面の確認、`--force` の挙動、ヘルプ/バージョン出力。
- モックのみでは完了としない。実ファイル生成・実ロケール判定（可能な範囲）を通すことを完了条件に含める。

## 今後の拡張ポイント
- 言語追加時は TemplateProvider にスニペットを追加し、ロケール/エディタのメタ情報を組み合わせる。
- エージェント固有の指針（コマンド、制約、得意分野）を拡張可能なスキーマで管理する。
- WSL/Windows 言語推定の精度向上（レジストリ・PowerShell 呼び出しなど）はユーティリティ層に隔離し、失敗時は英語フォールバックを堅持する。

