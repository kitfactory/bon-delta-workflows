const { readTemplateAsset, replaceTokens } = require('./shared_templates');

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
    case 'opencode':
      return 'OpenCode';
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

  const normalizedLocale = locale === 'ja' ? 'ja' : 'en';
  const guideTemplate = readTemplateAsset(`guide.${normalizedLocale}.md`);

  const heading = (() => {
    switch (editor) {
      case 'claudecode':
        return normalizedLocale === 'ja'
          ? '# CLAUDE (共通テンプレート / Lean)'
          : '# CLAUDE (Shared Template / Lean)';
      case 'cursor':
        return '# Cursor Rules (Lean)';
      case 'copilot':
        return '# Copilot Instructions (Lean)';
      default:
        return normalizedLocale === 'ja'
          ? '# AGENTS (共通テンプレート / Lean)'
          : '# AGENTS (Shared Template / Lean)';
    }
  })();

  const languageSection =
    normalizedLocale === 'ja'
      ? `## 言語別指針 (${langDisplayName(language)})\n${languageGuidance(language, normalizedLocale)}`
      : `## Language Guidance (${langDisplayName(language)})\n${languageGuidance(language, normalizedLocale)}`;

  const editorSection =
    normalizedLocale === 'ja'
      ? `## 対応エージェント\n- ターゲット: ${editorDisplayName(editor)}\n- 他のエージェント指定時は CLI オプション \`--agent\` を使用\n- skills の配置先は \`--skills none|workspace|user\` で切り替える`
      : `## Target Agent\n- Target: ${editorDisplayName(editor)}\n- Use \`--agent\` to choose another agent\n- Use \`--skills none|workspace|user\` to control skill installation scope`;

  const placementSection = (() => {
    if (editor === 'cursor') {
      return normalizedLocale === 'ja'
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
      return normalizedLocale === 'ja'
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

  return replaceTokens(guideTemplate, {
    HEADING: heading,
    LANGUAGE_SECTION: languageSection,
    EDITOR_SECTION: editorSection,
    PLACEMENT_SECTION: placementSection ? `\n${placementSection}` : ''
  });
}

module.exports = {
  languageGuidance,
  createLeanTemplate
};
