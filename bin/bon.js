#!/usr/bin/env node

/**
 * bon CLI / bon CLI
 * Creates an AGENTS.md file in the specified directory with a ready-to-edit template.
 * 指定ディレクトリに編集可能な AGENTS.md テンプレートを生成する。
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const pkg = require('../package.json');

const SUPPORTED_LANGS = new Set(['python', 'js', 'javascript', 'ts', 'typescript', 'rust']);
const SUPPORTED_EDITORS = new Set(['codex', 'cursor', 'claudecode', 'copilot']);
const args = process.argv.slice(2);

function printHelp() {
  const help = [
    `bon v${pkg.version}`,
    '',
    'Usage: bon [options]',
    '',
    'Options:',
    '  -d, --dir <path>       Target directory (default: current directory)',
    '  -f, --force            Overwrite an existing guide file',
    '  --lang <python|js|ts|rust>',
    '                         Programming language (default: python)',
    '  --editor <codex|cursor|claudecode|copilot>',
    '                         Target AI editor (default: codex)',
    '  -h, --help             Show this help',
    '  -v, --version          Show version'
  ].join('\n');

  console.log(help);
}

function fail(errorIdOrMessage, message) {
  if (message === undefined) {
    console.error(`[bon] ${errorIdOrMessage}`);
    process.exit(1);
  }

  console.error(`[bon][${errorIdOrMessage}] ${message}`);
  process.exit(1);
}

function normalizeLanguage(value) {
  if (!value) return 'python';
  const normalized = value.toLowerCase();
  if (!SUPPORTED_LANGS.has(normalized)) {
    fail('E_LANG_UNSUPPORTED', `Unsupported language: ${value}. Use one of python|js|ts|rust.`);
  }

  if (normalized === 'javascript') return 'js';
  if (normalized === 'typescript') return 'ts';
  return normalized;
}

function normalizeEditor(value) {
  if (!value) return 'codex';
  const normalized = value.toLowerCase();
  if (!SUPPORTED_EDITORS.has(normalized)) {
    fail('E_EDITOR_UNSUPPORTED', `Unsupported editor: ${value}. Use one of codex|cursor|claudecode|copilot.`);
  }
  return normalized;
}

function targetFileName(editor) {
  switch (editor) {
    case 'cursor':
      return '.cursorrules';
    case 'copilot':
      return 'copilot-instructions.md';
    default:
      return 'AGENTS.md';
  }
}

function parseArgs(argv) {
  const options = {
    dir: process.cwd(),
    force: false,
    lang: 'python',
    editor: 'codex'
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    switch (arg) {
      case '-d':
      case '--dir': {
        const next = argv[i + 1];
        if (!next) {
          fail('E_ARG_MISSING', 'Missing value for --dir');
        }
        options.dir = path.resolve(options.dir, next);
        i += 1;
        break;
      }
      case '-f':
      case '--force':
        options.force = true;
        break;
      case '--lang': {
        const next = argv[i + 1];
        if (!next) fail('E_ARG_MISSING', 'Missing value for --lang');
        options.lang = normalizeLanguage(next);
        i += 1;
        break;
      }
      case '--editor': {
        const next = argv[i + 1];
        if (!next) fail('E_ARG_MISSING', 'Missing value for --editor');
        options.editor = normalizeEditor(next);
        i += 1;
        break;
      }
      case '-h':
      case '--help':
        printHelp();
        process.exit(0);
        break;
      case '-v':
      case '--version':
        console.log(`bon v${pkg.version}`);
        process.exit(0);
        break;
      default:
        fail(`Unknown option: ${arg}\nUse --help to see available options.`);
    }
  }

  return options;
}

function isWsl(platform = os.platform(), release = os.release(), env = process.env) {
  if (platform !== 'linux') return false;
  const lowerRelease = release.toLowerCase();
  if (lowerRelease.includes('microsoft')) return true;
  return Boolean(env.WSL_DISTRO_NAME || env.WSL_INTEROP);
}

function readWindowsLocale() {
  // Best-effort: try PowerShell first, then cmd. Fail quietly if unavailable.
  // ベストエフォートで PowerShell → cmd を試し、失敗時は静かにスキップする。
  try {
    const ps = spawnSync('powershell.exe', ['-NoLogo', '-NoProfile', '-Command', '[culture]::CurrentUICulture.Name'], {
      encoding: 'utf8',
      timeout: 1500
    });
    if (ps.status === 0 && ps.stdout) {
      return ps.stdout.trim();
    }
  } catch (error) {
    // ignore / 失敗時は無視する
  }

  try {
    const cmd = spawnSync('cmd.exe', ['/c', 'echo', '%LANG%'], { encoding: 'utf8', timeout: 1500 });
    if (cmd.status === 0 && cmd.stdout) {
      return cmd.stdout.trim();
    }
  } catch (error) {
    // ignore / 失敗時は無視する
  }

  return null;
}

function normalizeLocaleTag(tag) {
  if (!tag) return null;
  const lower = tag.toLowerCase();
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('en')) return 'en';
  return null;
}

function detectLocale(options = {}) {
  const env = options.env || process.env;
  const platform = options.platform || os.platform();
  const release = options.release || os.release();
  const windowsLocaleReader = options.windowsLocaleReader || readWindowsLocale;

  const fromEnv =
    normalizeLocaleTag(env.LANG) ||
    normalizeLocaleTag(env.LC_ALL);

  if (isWsl(platform, release, env)) {
    const winLocale = normalizeLocaleTag(windowsLocaleReader());
    if (winLocale) return winLocale;
  }

  if (fromEnv) return fromEnv;

  const osLocale = normalizeLocaleTag(Intl.DateTimeFormat().resolvedOptions().locale);
  if (osLocale) return osLocale;

  return 'en';
}

function langDisplayName(lang) {
  switch (lang) {
    case 'python':
      return 'Python';
    case 'js':
      return 'JavaScript';
    case 'ts':
      return 'TypeScript';
    case 'rust':
      return 'Rust';
    default:
      return lang;
  }
}

function editorDisplayName(editor) {
  switch (editor) {
    case 'codex':
      return 'Codex';
    case 'cursor':
      return 'Cursor';
    case 'claudecode':
      return 'Claude Code';
    case 'copilot':
      return 'GitHub Copilot';
    default:
      return editor;
  }
}

function languageGuidance(lang, locale) {
  const commonEnvNote =
    locale === 'ja'
      ? '環境変数/`.env` の必要キーと利用箇所を明示し、`.env.sample` は生成しないでください。'
      : 'Call out required env vars/`.env` keys and where they are used; do not generate `.env.sample`.';

  switch (lang) {
    case 'python':
      return locale === 'ja'
        ? [
            '- Python: `uv` + `.venv` 仮想環境、`pytest`、Lint/Format（`ruff`/`black` など）を推奨。',
            `- ${commonEnvNote}`
          ].join('\n')
        : [
            '- Python: recommend `uv` + `.venv`, `pytest`, lint/format (`ruff`/`black`).',
            `- ${commonEnvNote}`
          ].join('\n');
    case 'js':
      return locale === 'ja'
        ? [
            '- JavaScript: Node.js + `pnpm`/`npm`、テスト（Vitest/Jest）、Lint/Format（ESLint/Prettier）。',
            `- ${commonEnvNote}`
          ].join('\n')
        : [
            '- JavaScript: Node.js + `pnpm`/`npm`, testing (Vitest/Jest), lint/format (ESLint/Prettier).',
            `- ${commonEnvNote}`
          ].join('\n');
    case 'ts':
      return locale === 'ja'
        ? [
            '- TypeScript: JS と同様 + `tsc --noEmit` で型チェック。抽象インターフェース経由の DI を推奨。',
            `- ${commonEnvNote}`
          ].join('\n')
        : [
            '- TypeScript: as JS + `tsc --noEmit` for type checking; favor DI through abstract interfaces.',
            `- ${commonEnvNote}`
          ].join('\n');
    case 'rust':
      return locale === 'ja'
        ? [
            '- Rust: `cargo` ワークスペース推奨、`cargo fmt` / `cargo clippy` / `cargo test`、feature flag と実機テスト導線を含める。',
            `- ${commonEnvNote}`
          ].join('\n')
        : [
            '- Rust: recommend `cargo` workspace, `cargo fmt` / `cargo clippy` / `cargo test`; include feature-flag guidance and real-device testing.',
            `- ${commonEnvNote}`
          ].join('\n');
    default:
      return commonEnvNote;
  }
}

function createLeanTemplate({ projectName, language, editor, locale }) {
  void projectName;

  const displayLang = langDisplayName(language);
  const displayEditor = editorDisplayName(editor);

  const heading = (() => {
    switch (editor) {
      case 'cursor':
        return '# Cursor Rules (Lean)';
      case 'copilot':
        return '# Copilot Instructions (Lean)';
      default:
        return locale === 'ja' ? '# AGENTS (共通テンプレート / Lean)' : '# AGENTS (Shared Template / Lean)';
    }
  })();

  const intro =
    locale === 'ja'
      ? [
          'この AGENTS.md は **運用の最小ルール**を記載します。',
          '詳細（レビューゲートのチェックリスト、Phase Close、spec/plan 分割ルール、DoD、エラー一覧など）は **`docs/OVERVIEW.md`** を正とします。',
          'ただし、**ユーザー要件の実行手順は delta フロー（request → apply → verify → archive）を最優先**とします。',
          '機密情報は記載しないでください。'
        ].join('\n')
      : [
          'This `AGENTS.md` contains **minimal operating rules**.',
          'For details (review gate checklist, Phase Close, spec/plan split rules, DoD, error/message list, etc.), treat **`docs/OVERVIEW.md`** as canonical.',
          'However, for user-requirement execution, **delta flow (request → apply → verify → archive) is the highest-priority procedure**.',
          'Do not place secrets in this file.'
        ].join('\n');

  const top5 =
    locale === 'ja'
      ? [
          '## Top 5（必ず守る）',
          '1. **ユーザー要件は必ず delta 4ステップで処理**：`delta request → delta apply → delta verify → delta archive`。',
          '2. **矛盾時は delta を優先**：AGENTS.md / OVERVIEW / 既存メモと矛盾したら、当該 Delta ID の定義（In Scope / Out of Scope / AC）を優先する。',
          '3. **入口は `docs/OVERVIEW.md`**（全体像・現在地・リンク集）。作業前後で必ず確認/更新する。',
          '4. **`docs/plan.md` は current / future / archive で管理**（current はチェックリスト、future は粗い計画、archive は完了）。',
          '5. **レビューゲートで必ず停止**：自己レビュー → 完成と判断できたらユーザー確認 → 合意で次へ。'
        ].join('\n')
      : [
          '## Top 5 (Must Follow)',
          '1. **Process every user requirement via delta 4 steps**: `delta request → delta apply → delta verify → delta archive`.',
          '2. **Delta takes precedence on conflicts**: if AGENTS/OVERVIEW/notes conflict, follow the active Delta ID definition (In Scope / Out of Scope / AC).',
          '3. **Single entrypoint is `docs/OVERVIEW.md`** (status, scope, links). Check/update it before and after work.',
          '4. **`docs/plan.md` uses current / future / archive** (current = checklist, future = rough plan, archive = done).',
          '5. **Stop at review gates**: self-review → ask user to confirm when “done” → proceed only with agreement.'
        ].join('\n');

  const deltaWorkflow =
    locale === 'ja'
      ? [
          '## 要件対応プロトコル（Delta-First / 必須）',
          '### Step 1: `delta request`（定義）',
          '- ユーザー要件から **最小差分** を定義する（In Scope / Out of Scope / 受入条件）。',
          '- この時点で「今回やらないこと」を明文化し、巻き込みを防ぐ。',
          '',
          '### Step 2: `delta apply`（適用）',
          '- request で定義した差分だけを実装する。',
          '- request にない“ついで修正”は実施しない。',
          '',
          '### Step 3: `delta verify`（検証）',
          '- 受入条件を満たすかを検証する。',
          '- Out of Scope への変更があれば FAIL とし、後工程へ流さない。',
          '- `node scripts/validate_delta_links.js --dir .` で plan↔delta↔archive の整合を確認する。',
          '',
          '### Step 4: `delta archive`（確定）',
          '- verify が PASS の差分だけを履歴化してクローズする。',
          '- archive で新規要件を追加しない。',
          '',
          '### 逸脱防止ルール',
          '- すべての変更は AC に紐づける。紐づかない変更は削除または次の delta に分離する。',
          '- スコープ変更が必要になったら、現在の delta を止めて request を更新してから再開する。'
        ].join('\n')
      : [
          '## Requirement Protocol (Delta-First / Required)',
          '### Step 1: `delta request` (Define)',
          '- Define the **minimal delta** from the user requirement (In Scope / Out of Scope / Acceptance Criteria).',
          '- Explicitly list what will NOT be changed to prevent scope creep.',
          '',
          '### Step 2: `delta apply` (Implement)',
          '- Implement only what was defined in request.',
          '- Do not include opportunistic side-fixes that are outside request.',
          '',
          '### Step 3: `delta verify` (Validate)',
          '- Validate against acceptance criteria.',
          '- If any Out-of-Scope change exists, mark FAIL and stop.',
          '- Run `node scripts/validate_delta_links.js --dir .` to validate plan↔delta↔archive links.',
          '',
          '### Step 4: `delta archive` (Finalize)',
          '- Archive only verified PASS deltas and close the change.',
          '- Do not add new requirements in archive.',
          '',
          '### Deviation Guardrails',
          '- Every code/doc change must map to acceptance criteria; otherwise remove or split into the next delta.',
          '- If scope must change, pause and update request first, then continue.'
        ].join('\n');

  const roleBoundary =
    locale === 'ja'
      ? [
          '## 役割境界（Canonical Docs と Delta）',
          '- `concept/spec/architecture` 系スキルは **全体文書の正本整備**を担当する。',
          '- ユーザー要件への対応は **delta 4ステップ**（request/apply/verify/archive）で実行する。',
          '- `spec-editor` / `architecture-editor` / `concept-editor` は delta を作成・実行しない。',
          '- Delta ID が無い要件実装は開始せず、先に `delta request` を作成する。',
          '- `docs/plan.md` の実装アイテム1件は `delta request` 1件の seed として扱う（原則 1:1）。',
          '- 実装アイテムが大きい場合は複数 delta へ分割してよい（1:N）。',
          '- delta の記録は `docs/delta/*.md`（Markdown）を正本とし、JSON/YAML の副管理を要求しない。',
          '- `delta-archive` が PASS のときのみ、正本へ最小差分で同期する。',
          '- Active Delta がある間、正本更新は In Scope に限定し、Out of Scope は変更しない。',
          '- `docs/plan.md` の archive は計画タスクの完了記録であり、`delta archive`（差分確定）とは別物として扱う。'
        ].join('\n')
      : [
          '## Role Boundary (Canonical Docs vs Delta)',
          '- `concept/spec/architecture` skills are for **canonical document maintenance**.',
          '- User-requirement execution must run through **delta 4 steps** (request/apply/verify/archive).',
          '- `spec-editor` / `architecture-editor` / `concept-editor` do not create or execute delta.',
          '- If there is no Delta ID, do not start requirement implementation; create `delta request` first.',
          '- Treat each implementation item in `docs/plan.md` as a seed for one `delta request` (default 1:1).',
          '- If an item is too large, split it into multiple deltas (1:N allowed).',
          '- Keep delta records canonical in Markdown (`docs/delta/*.md`); do not require JSON/YAML sidecars.',
          '- Sync canonical docs only after `delta-archive` PASS, with minimal diffs.',
          '- While an Active Delta exists, limit canonical updates to In Scope; do not change Out of Scope.',
          '- `docs/plan.md` archive records completed plan tasks; it is not the same as `delta archive` (delta finalization).'
        ].join('\n');

  const designDirectives =
    locale === 'ja'
      ? [
          '## 設計指示（必須 / 短縮版）',
          '- **ユーザー向けI/Fは単純に**：引数・型の種類を最小化し、内部都合の型/状態を漏らさない。',
          '- **データモデルは共通属性で集約**：似た概念のオブジェクトを乱立させず、共通属性を抽出してコアに寄せる。',
          '- **拡張は合成で**：差分は `details/meta` 等の入れ子で表現してI/Fを安定化（ただしゴッドデータ禁止）。',
          '- **`details/meta` のゴミ箱化禁止**：キー集合/構造は spec で定義し、「不明キー何でもOK」を許さない。肥大化したらコアへ昇格。',
          '- **ゴッドAPI/ゴッドクラス禁止**：最小I/F・最小データで責務分割する。',
          '- **依存方向の逆流禁止**：レイヤー責務と依存方向は architecture に明記し、それに従う（外→内固定）。',
          '- **設計変更提案の出力順を固定**：変更分類→価値フロー→最小案→レイヤー配置→境界契約→状態遷移→エラー設計→観測性→テスト→境界チェック→変更前チェック→実装タスク分解。',
          '- **設計指示の衝突優先**：`spec.md > architecture.md > OVERVIEW/AGENTS > 設計補助ガイド`。'
        ].join('\n')
      : [
          '## Design Rules (Required / Short)',
          '- **Keep user-facing I/F simple**: minimize argument count and type variety; do not leak internal types/states.',
          '- **Unify data models by shared attributes**: avoid fragmented objects; extract shared core attributes.',
          '- **Extend via composition**: express diffs with nested `details/meta` while keeping I/F stable (no god data).',
          '- **No `details/meta` dumping**: define keys/shape in spec; forbid “any key OK”; promote shared fields into core over time.',
          '- **No god APIs/classes**: split responsibilities; keep I/F minimal.',
          '- **No dependency inversion**: document dependency direction in architecture and keep outer -> inner flow.',
          '- **Fix design-output order**: classification -> value flow -> minimum change -> layer map -> contracts -> state transitions -> errors -> observability -> tests -> boundary checks -> pre-change checks -> task breakdown.',
          '- **Conflict priority for design guidance**: `spec.md > architecture.md > OVERVIEW/AGENTS > design-assist-guide`.'
        ].join('\n');

  const routine =
    locale === 'ja'
      ? [
          '## 作業開始 60 秒ルーチン（初動固定）',
          '1) `docs/OVERVIEW.md`：現在フェーズ / 今回スコープ / 参照リンクを確認',
          '2) `docs/concept.md`：対象 Spec ID と範囲を確認',
          '3) `docs/spec.md`：該当章へ移動（必要なら分割する）',
          '4) `docs/plan.md`：current チェックリストと詳細リンクを確認',
          '5) （任意）フェーズ運用時のみ `docs/phases/<PHASE>/` を確認'
        ].join('\n')
      : [
          '## 60-second Start Routine',
          '1) `docs/OVERVIEW.md`: confirm current phase/scope/links',
          '2) `docs/concept.md`: confirm target Spec IDs and scope',
          '3) `docs/spec.md`: jump to the relevant section (split when needed)',
          '4) `docs/plan.md`: confirm the current checklist and links',
          '5) (Optional) If using phases, check `docs/phases/<PHASE>/`'
        ].join('\n');

  const safeUpdates =
    locale === 'ja'
      ? [
          '## 更新の安全ルール（強すぎない版）',
          '### そのまま適用してよい変更（合意不要）',
          '- 誤字修正、リンク更新、追記（既存の意味を変えない）',
          '- plan のチェック更新（チェックボックスの進捗）',
          '- 既存方針に沿った小さな明確化（文章の補足）',
          '',
          '### “提案→合意→適用” が必要な変更（事故防止）',
          '- 大量削除、章構成の変更、ファイルの移動/リネーム',
          '- Spec ID / Error ID の変更、互換性に影響する仕様変更',
          '- API / データモデルの形を変える設計変更',
          '- セキュリティ対応・重大バグ修正で挙動が変わるもの（提案は簡潔でよいが必須）'
        ].join('\n')
      : [
          '## Safe Updates (Practical)',
          '### OK without agreement',
          '- Typos, link updates, additive notes (no meaning change)',
          '- Plan checkbox progress updates',
          '- Small clarifications aligned with existing policy',
          '',
          '### Require “propose → agree → apply”',
          '- Large deletions, restructuring, moves/renames',
          '- Spec ID / Error ID changes or compatibility-affecting spec changes',
          '- API / data-shape changes',
          '- Security fixes or major bug fixes that change behavior (proposal must be explicit)'
        ].join('\n');

  const languageAndComments =
    locale === 'ja'
      ? [
          '## 言語・コメント',
          '- AGENTS.md が日本語の場合、`docs/**` は日本語で作成する',
          '- ソースコードのコメントは **日本語 + 英語を併記**'
        ].join('\n')
      : [
          '## Language & Comments',
          '- Write `docs/**` in English (this guide is English)',
          '- Write source-code comments in English (bilingual comments are optional if your team needs them)'
        ].join('\n');

  const languageSection =
    locale === 'ja'
      ? `## 言語別指針 (${displayLang})\n${languageGuidance(language, locale)}`
      : `## Language Guidance (${displayLang})\n${languageGuidance(language, locale)}`;

  const editorSection =
    locale === 'ja'
      ? `## 対応エディタ\n- ターゲット: ${displayEditor}\n- 他のエディタ指定時は CLI オプション \`--editor\` を使用`
      : `## Target Editor\n- Target: ${displayEditor}\n- Use \`--editor\` to choose another editor`;

  const placementSection = (() => {
    if (editor === 'cursor') {
      return locale === 'ja'
        ? [
            '## 配置（推奨）',
            '- このファイルはリポジトリ直下に置く（例: `./.cursorrules`）'
          ].join('\n')
        : [
            '## Placement (Recommended)',
            '- Keep this file at the repository root (e.g., `./.cursorrules`)'
          ].join('\n');
    }

    if (editor === 'copilot') {
      return locale === 'ja'
        ? [
            '## 配置（推奨）',
            '- まずは生成された場所（例: `./copilot-instructions.md`）で運用する',
            '- もし運用で必要なら `.github/` 配下へ移動する（例: `./.github/copilot-instructions.md`）'
          ].join('\n')
        : [
            '## Placement (Recommended)',
            '- Start with the generated location (e.g., `./copilot-instructions.md`)',
            '- If needed for your workflow, move it under `.github/` (e.g., `./.github/copilot-instructions.md`)'
          ].join('\n');
    }

    return '';
  })();

  const examples =
    locale === 'ja'
      ? [
          '## サンプル（最低限）',
          '- 成功例: `bon --dir ./project --lang ts --editor codex`',
          '- 失敗例: `bon --editor unknown` → `[bon][E_EDITOR_UNSUPPORTED] Unsupported editor: unknown`'
        ].join('\n')
      : [
          '## Minimal Examples',
          '- Success: `bon --dir ./project --lang ts --editor codex`',
          '- Failure: `bon --editor unknown` → `[bon][E_EDITOR_UNSUPPORTED] Unsupported editor: unknown`'
        ].join('\n');

  const details =
    locale === 'ja'
      ? ['## 詳細は OVERVIEW を正とする', '`docs/OVERVIEW.md` を参照する。'].join('\n')
      : ['## Canonical Details Live in OVERVIEW', 'See `docs/OVERVIEW.md`.'].join('\n');

  const sections = [
    heading,
    '',
    intro,
    '',
    top5,
    '',
    deltaWorkflow,
    '',
    roleBoundary,
    '',
    designDirectives,
    '',
    routine,
    '',
    safeUpdates,
    '',
    languageAndComments,
    '',
    languageSection,
    '',
    editorSection
  ];

  if (placementSection) {
    sections.push('', placementSection);
  }

  sections.push('', examples, '', details);
  return sections.join('\n');
}

function createOverviewTemplate(locale) {
  if (locale === 'ja') {
    return [
      '# docs/OVERVIEW.md（入口 / 運用の正本）',
      '',
      'この文書は **プロジェクト運用の正本**です。`AGENTS.md` は最小ルールのみで、詳細はここに集約します。',
      'ユーザー要件の変更実行は **delta-first（request → apply → verify → archive）** で運用します。',
      '運用文書間で矛盾がある場合、実行中の Delta ID（In Scope / Out of Scope / AC）を優先します。',
      '文書スキル（concept/spec/architecture）は正本整備に限定し、delta の作成/実行は行いません。',
      'Delta ID が未提示の要件実装は開始せず、先に delta request を作成します。',
      'plan.md の実装アイテム1件は delta request 1件の seed として扱います（原則 1:1）。',
      '実装アイテムが大きい場合は複数 delta に分割して進めます（1:N）。',
      'delta 記録は Markdown（docs/delta/*.md）を正本とし、JSON/YAML の副管理を要求しません。',
      'delta-archive が PASS のときのみ、正本へ最小差分で同期します。',
      'plan.md の archive は計画タスクの完了記録であり、delta archive（差分確定）とは別です。',
      '',
      '---',
      '',
      '## 現在地（必ず更新）',
      '- 現在フェーズ: P0',
      '- 今回スコープ（1〜5行）:',
      '  - ...',
      '- 非ゴール（やらないこと）:',
      '  - ...',
      '- 重要リンク:',
      '  - concept: `./concept.md`',
      '  - spec: `./spec.md`',
      '  - architecture: `./architecture.md`',
      '  - plan: `./plan.md`',
      '',
      '---',
      '',
      '## レビューゲート（必ず止まる）',
      '共通原則：**自己レビュー → 完成と判断できたらユーザー確認 → 合意で次へ**',
      '',
      '---',
      '',
      '## 更新の安全ルール（判断用）',
      '### 合意不要',
      '- 誤字修正、リンク更新、意味を変えない追記',
      '- plan のチェック更新',
      '- 小さな明確化（既存方針に沿う）',
      '',
      '### 提案→合意→適用（必須）',
      '- 大量削除、章構成変更、移動/リネーム',
      '- Spec ID / Error ID の変更',
      '- API/データモデルの形を変える設計変更',
      '- セキュリティ/重大バグ修正で挙動が変わるもの'
    ].join('\n');
  }

  return [
    '# docs/OVERVIEW.md (Entry / Canonical Operations)',
    '',
    'This document is the **canonical source for project operations**. Keep `AGENTS.md` minimal and put details here.',
    'Execute user requirements in **delta-first flow (request → apply → verify → archive)**.',
    'If documents conflict, prioritize the active Delta ID definition (In Scope / Out of Scope / AC).',
    'Document skills (concept/spec/architecture) are for canonical maintenance only; they do not create/execute delta.',
    'If there is no Delta ID, do not start requirement implementation; create delta request first.',
    'Treat each implementation item in plan.md as a seed for one delta request (default 1:1).',
    'If an implementation item is too large, split it into multiple deltas (1:N).',
    'Keep delta records canonical in Markdown (docs/delta/*.md); do not require JSON/YAML sidecars.',
    'Sync canonical docs only after delta-archive PASS, using minimal diffs.',
    'plan.md archive is for completed plan tasks and is not the same as delta archive (delta finalization).',
    '',
    '---',
    '',
    '## Current Status (Always Update)',
    '- Current phase: P0',
    '- Current scope (1–5 lines):',
    '  - ...',
    '- Non-goals:',
    '  - ...',
    '- Key links:',
    '  - concept: `./concept.md`',
    '  - spec: `./spec.md`',
    '  - architecture: `./architecture.md`',
    '  - plan: `./plan.md`',
    '',
    '---',
    '',
    '## Review Gates (Stop Here)',
    'Principle: **self-review → ask user to confirm when “done” → proceed only with agreement**',
    '',
    '---',
    '',
    '## Safe Update Policy',
    '### No agreement needed',
    '- Typos, link updates, additive notes (no meaning change)',
    '- Updating plan checkboxes',
    '- Small clarifications aligned with existing policy',
    '',
    '### “Propose → Agree → Apply” required',
    '- Large deletions, restructuring, moves/renames',
    '- Spec ID / Error ID changes',
    '- API / data-shape changes',
    '- Security fixes or major bug fixes that change behavior'
  ].join('\n');
}

function ensureOverviewFile(targetDir, locale) {
  const docsDir = path.join(targetDir, 'docs');
  const overviewPath = path.join(docsDir, 'OVERVIEW.md');

  try {
    fs.mkdirSync(docsDir, { recursive: true });
  } catch (error) {
    fail('E_IO_DIR_CREATE', `Could not create docs directory: ${error.message}`);
  }

  if (fs.existsSync(overviewPath)) {
    return;
  }

  const content = createOverviewTemplate(locale);
  try {
    fs.writeFileSync(overviewPath, content, 'utf8');
  } catch (error) {
    fail('E_IO_WRITE', `Failed to write docs/OVERVIEW.md: ${error.message}`);
  }
}

function createDocStub(relativePath, locale) {
  const title = path.basename(relativePath);
  if (locale === 'ja') {
    switch (relativePath) {
      case 'docs/concept.md':
        return ['# コンセプト', '', '入口は `docs/OVERVIEW.md`。ここには機能一覧（Spec ID）とフェーズをまとめる。'].join('\n');
      case 'docs/spec.md':
        return ['# 仕様', '', '入口は `docs/OVERVIEW.md`。Given/When/Then（前提/条件/振る舞い）で番号付きに整理する。'].join('\n');
      case 'docs/architecture.md':
        return ['# アーキテクチャ', '', '入口は `docs/OVERVIEW.md`。レイヤー責務・依存方向・主要I/Fを明文化する。'].join('\n');
      case 'docs/plan.md':
        return [
          '# plan.md（必ず書く：最新版）',
          '',
          '# current',
          '- [ ] いまやるチェックリストをここに置く',
          '',
          '# future',
          '- 将来計画を粗く列挙する',
          '',
          '# archive',
          '- [x] 完了項目を記録する'
        ].join('\n');
      case 'docs/delta/TEMPLATE.md':
        return [
          '# delta 記録テンプレート',
          '',
          '正本は Markdown（`docs/delta/*.md`）で管理し、JSON/YAML の副管理を要求しない。',
          '',
          '## Delta ID',
          '- DR-YYYYMMDD-<short-name>',
          '',
          '## Step 1: delta-request',
          '- In Scope:',
          '- Out of Scope:',
          '- Acceptance Criteria:',
          '',
          '## Step 2: delta-apply',
          '- changed files:',
          '- applied AC:',
          '- status: APPLIED / BLOCKED',
          '',
          '## Step 3: delta-verify',
          '- AC result table:',
          '- scope deviation:',
          '- overall: PASS / FAIL',
          '',
          '## Step 4: delta-archive',
          '- verify result: PASS',
          '- archive status: archived',
          '- unresolved items:',
          '',
          '## Canonical Sync',
          '- synced docs:',
          '  - concept:',
          '  - spec:',
          '  - architecture:',
          '  - plan:',
          '',
          '## Validation Command',
          '- `node scripts/validate_delta_links.js --dir .`'
        ].join('\n');
      default:
        return `# ${title}\n`;
    }
  }

  switch (relativePath) {
    case 'docs/concept.md':
      return ['# Concept', '', 'Entry point is `docs/OVERVIEW.md`. Keep a feature list (Spec IDs) and phases here.'].join('\n');
    case 'docs/spec.md':
      return ['# Specification', '', 'Entry point is `docs/OVERVIEW.md`. Use numbered Given/When/Then specs.'].join('\n');
    case 'docs/architecture.md':
      return ['# Architecture', '', 'Entry point is `docs/OVERVIEW.md`. Define layers, dependency direction, and key interfaces.'].join('\n');
    case 'docs/plan.md':
      return [
        '# plan.md (Current/Future/Archive)',
        '',
        '# current',
        '- [ ] Keep the current checklist here',
        '',
        '# future',
        '- Rough future plan items',
        '',
        '# archive',
        '- [x] Completed items'
      ].join('\n');
    case 'docs/delta/TEMPLATE.md':
      return [
        '# delta record template',
        '',
        'Use Markdown (`docs/delta/*.md`) as canonical. Do not require JSON/YAML sidecars.',
        '',
        '## Delta ID',
        '- DR-YYYYMMDD-<short-name>',
        '',
        '## Step 1: delta-request',
        '- In Scope:',
        '- Out of Scope:',
        '- Acceptance Criteria:',
        '',
        '## Step 2: delta-apply',
        '- changed files:',
        '- applied AC:',
        '- status: APPLIED / BLOCKED',
        '',
        '## Step 3: delta-verify',
        '- AC result table:',
        '- scope deviation:',
        '- overall: PASS / FAIL',
        '',
        '## Step 4: delta-archive',
        '- verify result: PASS',
        '- archive status: archived',
        '- unresolved items:',
        '',
        '## Canonical Sync',
        '- synced docs:',
        '  - concept:',
        '  - spec:',
        '  - architecture:',
        '  - plan:',
        '',
        '## Validation Command',
        '- `node scripts/validate_delta_links.js --dir .`'
      ].join('\n');
    default:
      return `# ${title}\n`;
  }
}

function ensureDocFile(targetDir, relativePath, locale) {
  const fullPath = path.join(targetDir, relativePath);
  if (fs.existsSync(fullPath)) return;

  const dirPath = path.dirname(fullPath);
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (error) {
    fail('E_IO_DIR_CREATE', `Could not create directory: ${error.message}`);
  }

  try {
    fs.writeFileSync(fullPath, createDocStub(relativePath, locale) + '\n', 'utf8');
  } catch (error) {
    fail('E_IO_WRITE', `Failed to write ${relativePath}: ${error.message}`);
  }
}

function ensureDocsSkeleton(targetDir, locale) {
  ensureDocFile(targetDir, 'docs/concept.md', locale);
  ensureDocFile(targetDir, 'docs/spec.md', locale);
  ensureDocFile(targetDir, 'docs/architecture.md', locale);
  ensureDocFile(targetDir, 'docs/plan.md', locale);
  ensureDocFile(targetDir, 'docs/delta/TEMPLATE.md', locale);
}

function resolveSkillSourceDir() {
  return path.join(__dirname, '..', 'skills');
}

function resolveSkillTargetDir(targetDir, editor) {
  switch (editor) {
    case 'codex':
    case 'claudecode':
      return path.join(targetDir, '.codex', 'skills');
    case 'cursor':
      return path.join(targetDir, '.cursor', 'skills');
    case 'copilot':
      return path.join(targetDir, '.github', 'copilot', 'skills');
    default:
      return path.join(targetDir, 'skills');
  }
}

function copyDirRecursive(srcDir, destDir, options = {}) {
  const { force = false } = options;
  const result = { copied: 0, skipped: 0 };

  fs.mkdirSync(destDir, { recursive: true });

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      const nested = copyDirRecursive(srcPath, destPath, options);
      result.copied += nested.copied;
      result.skipped += nested.skipped;
      continue;
    }

    if (fs.existsSync(destPath) && !force) {
      result.skipped += 1;
      continue;
    }

    fs.copyFileSync(srcPath, destPath);
    result.copied += 1;
  }

  return result;
}

function copySkills(targetDir, editor, force) {
  const sourceDir = resolveSkillSourceDir();
  if (!fs.existsSync(sourceDir)) return null;

  const targetSkillDir = resolveSkillTargetDir(targetDir, editor);
  try {
    const result = copyDirRecursive(sourceDir, targetSkillDir, { force });
    return { targetSkillDir, ...result };
  } catch (error) {
    fail('E_IO_COPY', `Failed to copy skills: ${error.message}`);
  }

  return null;
}

function copyValidationScript(targetDir, force) {
  const sourcePath = path.join(__dirname, '..', 'scripts', 'validate_delta_links.js');
  if (!fs.existsSync(sourcePath)) return null;

  const targetPath = path.join(targetDir, 'scripts', 'validate_delta_links.js');
  try {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    if (fs.existsSync(targetPath) && !force) {
      return { targetPath, copied: false };
    }
    fs.copyFileSync(sourcePath, targetPath);
    try {
      fs.chmodSync(targetPath, 0o755);
    } catch (_) {
      // best effort
    }
    return { targetPath, copied: true };
  } catch (error) {
    fail('E_IO_COPY', `Failed to copy validation script: ${error.message}`);
  }

  return null;
}

function createTemplate({ projectName, language, editor, locale }) {
  // Legacy template (kept for backward compatibility).
  // The CLI uses `createLeanTemplate` instead.
  const displayLang = langDisplayName(language);
  const displayEditor = editorDisplayName(editor);
  const docsReference =
    locale === 'ja'
      ? 'プロジェクト固有の情報は `docs/`（concept/spec/architecture など）で管理してください。この AGENTS.md 自体には固有情報を書きません。'
      : 'Keep project-specific details in `docs/` (concept/spec/architecture, etc.); do not embed them here.';

  const heading =
    locale === 'ja'
      ? '# AGENTS (共通テンプレート)'
      : '# AGENTS (Shared Template)';

  const intro =
    locale === 'ja'
      ? [
          docsReference,
          '該当ドキュメントが無い場合は `docs/concept.md`, `docs/spec.md`, `docs/architecture.md` を作成してください。',
          '作業前に必ずドキュメントを参照し、機密情報は記載しないでください。'
        ].join('\n')
      : [
          docsReference,
          'If missing, create `docs/concept.md`, `docs/spec.md`, `docs/architecture.md`.',
          'Always read the docs first and avoid placing secrets in this file.'
        ].join('\n');

  const docDiscipline =
    locale === 'ja'
      ? [
          '## ドキュメント/コメント作成ルール',
          '- AGENTS.md が日本語の場合、`docs/concept.md` / `docs/spec.md` / `docs/architecture.md` / `docs/plan.md` は必ず日本語で作成する。',
          '- AGENTS.md が日本語の場合、ソースコードのコメントは日本語と英語を併記する。',
          '- concept: 機能一覧を表にまとめ、各機能の詳細と依存関係、MVP とフェーズ分けを明確にする（フェーズ単位で spec/architecture/plan を用意）。機能行には Spec ID を付与し、spec 側で同じ ID を引用できるようにする。concept 作成時点で必ずユーザーと合意し、更新時も確認を徹底する。',
          '- spec: concept の機能グループごとに章を分け、各仕様に番号を振って 前提/条件/振る舞い（Given/When/Then）形式で記載する。仕様タイトルは「4.1. --dir を指定した場合、ディレクトリを再帰的に作成する」のように、何をしたときにどう振る舞うかを明記し、対応する Spec ID を併記する。入力バリデーションやエラー時の振る舞いも番号付きで整理し、エラー/メッセージは専用の一覧表で管理する。',
          '- architecture: レイヤー責務と依存方向を示し、主要インターフェース（I/F）を関数シグネチャ等で明文化する。API は最小粒度・最小引数、データ属性は必要最小限にし、ゴッド API/データを禁止する。非機能は AI 生成で過剰に固定しないが、ログ/エラー方針（例: `[bon][E1] ...`）は明示する。',
          '- サンプル/スニペット: AGENTS.md に最低限の例を含める（正常系と失敗例を 1 行ずつ。例: 成功 `bon --dir ./project --lang ts --editor cursor` → `.cursorrules`、失敗 `bon --editor unknown` → `[bon][E2] Unsupported editor: ...`）。サンプルのメッセージには必ず Error ID を入れ、実装が返す文言と完全一致させる。'
        ].join('\n')
      : [
          '## Documentation / Comment Rules',
          '- If AGENTS.md is in English, you may still keep docs in English, but keep the same structure as Japanese: `docs/concept.md`, `docs/spec.md`, `docs/architecture.md`, `docs/plan.md` should follow the guidance below.',
          '- concept: Provide a table of features with detailed descriptions, dependencies, and MVP vs phase breakdowns (spec/architecture/plan per phase). Add a Spec ID column so specs can reference the same IDs. Secure user agreement at concept creation time and on updates.',
          '- spec: Split chapters by feature groups; number each spec and write in Given/When/Then. The spec title should state the action and behavior, e.g., "4.1. When --dir is set, create directories recursively," and include the corresponding Spec ID. Document input validation and error behaviors with numbered specs, and manage errors/messages in a dedicated list/table.',
          '- architecture: Clarify layer responsibilities and dependencies, and spell out key interfaces (I/F) with function signatures or similar detail. Keep APIs minimal (smallest responsibility, minimal arguments) and data models lean (only required attributes); avoid god APIs/data. Do not over-constrain non-functional metrics up front, but do fix logging/error conventions (e.g., `[bon][E1] ...`).',
          '- Samples/Snippets: Include minimal examples in AGENTS.md (one success and one failure). Example success: `bon --dir ./project --lang ts --editor cursor` → `.cursorrules`; example failure: `bon --editor unknown` → `[bon][E2] Unsupported editor: ...`; list main template section headings. Always include Error IDs in messages and keep them exactly matching the implementation.'
        ].join('\n');

  const requirements =
    locale === 'ja'
      ? [
          '## 要件定義',
          '- 想定ユーザーと困りごとを明確化',
          '- 必要なユースケース/機能一覧',
          '- 使用するライブラリ',
          '- ソフトウェア全体設計の概要'
        ].join('\n')
      : [
          '## Requirements',
          '- Clarify target users and their pain points',
          '- Enumerate required use cases/features',
          '- List chosen libraries',
          '- Summarize the overall software architecture'
        ].join('\n');

  const specSection =
    locale === 'ja'
      ? [
          '## 仕様記述',
          '- 仕様/要求仕様は 前提/条件/振る舞い で記載する'
        ].join('\n')
      : [
          '## Specifications',
          '- Write specs in Given/When/Then form'
        ].join('\n');

  const design =
    locale === 'ja'
      ? [
          '## 設計',
          '- レイヤー構造と単一責務を徹底する',
          '- 抽象クラスで境界を定義し、DI しやすくする',
          '- ゴッドクラスや雑多なヘルパーは作らず、シンプルなインターフェースを提供する'
        ].join('\n')
      : [
          '## Design',
          '- Keep layered architecture and single responsibility',
          '- Define boundaries with abstract classes for easy DI',
          '- Avoid god objects and grab-bag helpers; expose simple interfaces'
        ].join('\n');

  const testing =
    locale === 'ja'
      ? [
          '## テスト方針',
          '- 機能/レイヤー単位でテストを完成させる',
          '- モックは補助。本番経路（実通信・実接続）が通ったときに完了扱い',
          '- 必要な環境変数・接続情報・`.env` の配置場所と設定例をここに記載（`.env.sample` は生成しない）',
          '- テストが難航したらステップごとにデバッグメッセージを追加する'
        ].join('\n')
      : [
          '## Testing',
          '- Finish tests per feature/layer',
          '- Mocks are auxiliary; completion requires real calls/real connections',
          '- List required env vars, connection info, and `.env` placement/examples here (do not generate `.env.sample`)',
          '- Add step-wise debug logging when tests get stuck'
        ].join('\n');

  const languageSection =
    locale === 'ja'
      ? `## 言語別指針 (${displayLang})\n${languageGuidance(language, locale)}`
      : `## Language Guidance (${displayLang})\n${languageGuidance(language, locale)}`;

  const editorSection =
    locale === 'ja'
      ? `## 対応エディタ\n- ターゲット: ${displayEditor}\n- 他のエディタ指定時は CLI オプション \`--editor\` を使用`
      : `## Target Editor\n- Target: ${displayEditor}\n- Use \`--editor\` to choose another editor`;

  const workSection =
    locale === 'ja'
      ? [
          '## 作業の進め方',
          '- まず `docs/concept.md`, `docs/spec.md`, `docs/architecture.md` を読む（無ければ作成する）',
          '- `docs/plan.md` にチェックリストを置き、項目をチェックしながら進める',
          '- 上記を踏まえて要件定義→仕様→設計→実装→テストの順に進める',
          '- 機密情報を記載しない。必要なら環境変数経由で扱う'
        ].join('\n')
      : [
          '## How to Work',
          '- Read `docs/concept.md`, `docs/spec.md`, `docs/architecture.md` (create them if missing)',
          '- Keep a checklist in `docs/plan.md` and tick items as you go',
          '- Proceed Requirements → Specs → Design → Implementation → Tests',
          '- Do not place secrets here; use env vars instead'
        ].join('\n');

  const sections = [heading, intro];
  if (docDiscipline) {
    sections.push('', docDiscipline);
  }
  sections.push('', requirements, '', specSection, '', design, '', testing, '', languageSection, '', editorSection, '', workSection);

  return sections.join('\n');
}

function main() {
  const { dir, force, lang, editor } = parseArgs(args);
  const locale = detectLocale();
  const targetDir = path.resolve(dir);
  const fileName = targetFileName(editor);
  const targetPath = path.join(targetDir, fileName);

  try {
    fs.mkdirSync(targetDir, { recursive: true });
  } catch (error) {
    fail('E_IO_DIR_CREATE', `Could not create directory: ${error.message}`);
  }

  if (fs.existsSync(targetPath) && !force) {
    fail('E_FILE_EXISTS', `${fileName} already exists at ${targetPath}. Use --force to overwrite.`);
  }

  ensureOverviewFile(targetDir, locale);
  ensureDocsSkeleton(targetDir, locale);
  const skillCopyResult = copySkills(targetDir, editor, force);
  const validationScriptResult = copyValidationScript(targetDir, force);

  const template = createLeanTemplate({
    projectName: path.basename(targetDir) || 'project',
    language: lang,
    editor,
    locale
  });

  try {
    fs.writeFileSync(targetPath, template, 'utf8');
  } catch (error) {
    fail('E_IO_WRITE', `Failed to write ${fileName}: ${error.message}`);
  }

  console.log(`[bon] ${fileName} created at ${targetPath}`);
  const overviewPath = path.join(targetDir, 'docs', 'OVERVIEW.md');
  if (fs.existsSync(overviewPath)) {
    console.log(`[bon] docs/OVERVIEW.md ready at ${overviewPath}`);
  }
  if (skillCopyResult) {
    console.log(`[bon] skills copied to ${skillCopyResult.targetSkillDir} (copied: ${skillCopyResult.copied}, skipped: ${skillCopyResult.skipped})`);
  }
  if (validationScriptResult) {
    console.log(
      `[bon] validation script ${validationScriptResult.copied ? 'copied' : 'kept'} at ${validationScriptResult.targetPath}`
    );
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  detectLocale,
  createTemplate: createLeanTemplate,
  createOverviewTemplate,
  isWsl,
  normalizeLanguage,
  normalizeEditor,
  targetFileName,
  languageGuidance,
  ensureOverviewFile,
  readWindowsLocale,
  resolveSkillTargetDir
};
