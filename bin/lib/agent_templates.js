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
          '4. **`docs/plan.md` は current / review timing / future / archive summary / archive index で管理**し、詳細 archive は monthly file へ分離する。',
          '5. **レビューゲートで必ず停止**：自己レビュー → 完成と判断できたらユーザー確認 → 合意で次へ。'
        ].join('\n')
      : [
          '## Top 5 (Must Follow)',
          '1. **Process every user requirement via delta 4 steps**: `delta request → delta apply → delta verify → delta archive`.',
          '2. **Delta takes precedence on conflicts**: if AGENTS/OVERVIEW/notes conflict, follow the active Delta ID definition (In Scope / Out of Scope / AC).',
          '3. **Single entrypoint is `docs/OVERVIEW.md`** (status, scope, links). Check/update it before and after work.',
          '4. **`docs/plan.md` uses current / review timing / future / archive summary / archive index**, with detailed archive moved into monthly files.',
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
          '- `node scripts/check_code_size.js --dir .` で長大コードを確認する。',
          '',
          '### Step 4: `delta archive`（確定）',
          '- verify が PASS の差分だけを履歴化してクローズする。',
          '- 大機能完了時は `Delta Type: REVIEW` を先に通し、`docs/delta/REVIEW_CHECKLIST.md` で点検する。',
          '- ユーザーは `review deltaを回して` と手動発動してよい。',
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
          '- Run `node scripts/check_code_size.js --dir .` to detect oversized code files.',
          '',
          '### Step 4: `delta archive` (Finalize)',
          '- Archive only verified PASS deltas and close the change.',
          '- When a major feature is complete, run a `Delta Type: REVIEW` first and use `docs/delta/REVIEW_CHECKLIST.md`.',
          '- The user may trigger this manually by saying `run a review delta`.',
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

module.exports = {
  languageGuidance,
  createLeanTemplate
};
