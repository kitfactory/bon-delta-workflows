#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.join(__dirname, '..', 'assets', 'templates');

function fail(message) {
  console.error(`[delta-bootstrap] ${message}`);
  process.exit(1);
}

function readTemplateAsset(fileName) {
  return fs.readFileSync(path.join(TEMPLATE_DIR, fileName), 'utf8').replace(/\r\n/g, '\n').trimEnd();
}

function replaceTokens(template, replacements) {
  return Object.entries(replacements).reduce((result, [token, value]) => {
    return result.replace(new RegExp(`\\{\\{${token}\\}\\}`, 'g'), value);
  }, template);
}

function normalizeLocale(value) {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('en')) return 'en';
  return null;
}

function detectLocale(env = process.env) {
  return normalizeLocale(env.LANG) || normalizeLocale(env.LC_ALL) || 'en';
}

function normalizeLanguage(value) {
  if (!value) return 'python';
  const normalized = value.toLowerCase();
  if (normalized === 'javascript') return 'js';
  if (normalized === 'typescript') return 'ts';
  return normalized;
}

function normalizeAgent(value) {
  if (!value) return 'codex';
  const normalized = value.toLowerCase();
  return normalized === 'claude-code' ? 'claudecode' : normalized;
}

function targetFileName(agent) {
  switch (agent) {
    case 'claudecode':
      return 'CLAUDE.md';
    case 'cursor':
      return '.cursorrules';
    case 'copilot':
      return 'copilot-instructions.md';
    default:
      return 'AGENTS.md';
  }
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
        ? ['- Python: `uv` + `.venv` 仮想環境、`pytest`、Lint/Format（`ruff`/`black` など）を推奨。', `- ${commonEnvNote}`].join('\n')
        : ['- Python: recommend `uv` + `.venv`, `pytest`, lint/format (`ruff`/`black`).', `- ${commonEnvNote}`].join('\n');
    case 'js':
      return locale === 'ja'
        ? ['- JavaScript: Node.js + `pnpm`/`npm`、テスト（Vitest/Jest）、Lint/Format（ESLint/Prettier）。', `- ${commonEnvNote}`].join('\n')
        : ['- JavaScript: Node.js + `pnpm`/`npm`, testing (Vitest/Jest), lint/format (ESLint/Prettier).', `- ${commonEnvNote}`].join('\n');
    case 'ts':
      return locale === 'ja'
        ? ['- TypeScript: JS と同様 + `tsc --noEmit` で型チェック。抽象インターフェース経由の DI を推奨。', `- ${commonEnvNote}`].join('\n')
        : ['- TypeScript: as JS + `tsc --noEmit` for type checking; favor DI through abstract interfaces.', `- ${commonEnvNote}`].join('\n');
    case 'rust':
      return locale === 'ja'
        ? ['- Rust: `cargo` ワークスペース推奨、`cargo fmt` / `cargo clippy` / `cargo test`、feature flag と実機テスト導線を含める。', `- ${commonEnvNote}`].join('\n')
        : ['- Rust: recommend `cargo` workspace, `cargo fmt` / `cargo clippy` / `cargo test`; include feature-flag guidance and real-device testing.', `- ${commonEnvNote}`].join('\n');
    default:
      return commonEnvNote;
  }
}

function renderGuideTemplate({ language, editor, locale }) {
  const guideTemplate = readTemplateAsset(`guide.${locale}.md`);
  const heading = (() => {
    switch (editor) {
      case 'claudecode':
        return locale === 'ja' ? '# CLAUDE (共通テンプレート / Lean)' : '# CLAUDE (Shared Template / Lean)';
      case 'cursor':
        return '# Cursor Rules (Lean)';
      case 'copilot':
        return '# Copilot Instructions (Lean)';
      default:
        return locale === 'ja' ? '# AGENTS (共通テンプレート / Lean)' : '# AGENTS (Shared Template / Lean)';
    }
  })();

  const languageSection =
    locale === 'ja'
      ? `## 言語別指針 (${langDisplayName(language)})\n${languageGuidance(language, locale)}`
      : `## Language Guidance (${langDisplayName(language)})\n${languageGuidance(language, locale)}`;

  const editorSection =
    locale === 'ja'
      ? `## 対応エージェント\n- ターゲット: ${editorDisplayName(editor)}\n- 他のエージェント指定時は CLI オプション \`--agent\` を使用\n- skills の配置先は \`--skills none|workspace|user\` で切り替える`
      : `## Target Agent\n- Target: ${editorDisplayName(editor)}\n- Use \`--agent\` to choose another agent\n- Use \`--skills none|workspace|user\` to control skill installation scope`;

  const placementSection = (() => {
    if (editor === 'cursor') {
      return locale === 'ja'
        ? ['## 配置（推奨）', '- このファイルはリポジトリ直下に置く（例: `./.cursorrules`）'].join('\n')
        : ['## Placement (Recommended)', '- Keep this file at the repository root (e.g., `./.cursorrules`)'].join('\n');
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

  return replaceTokens(guideTemplate, {
    HEADING: heading,
    LANGUAGE_SECTION: languageSection,
    EDITOR_SECTION: editorSection,
    PLACEMENT_SECTION: placementSection ? `\n${placementSection}` : ''
  });
}

function docTemplateFileName(relativePath, locale) {
  switch (relativePath) {
    case 'docs/OVERVIEW.md':
      return `OVERVIEW.${locale}.md`;
    case 'docs/concept.md':
      return `concept.${locale}.md`;
    case 'docs/spec.md':
      return `spec.${locale}.md`;
    case 'docs/architecture.md':
      return `architecture.${locale}.md`;
    case 'docs/plan.md':
      return `plan.${locale}.md`;
    case 'docs/delta/TEMPLATE.md':
      return `delta-template.${locale}.md`;
    case 'docs/delta/REVIEW_CHECKLIST.md':
      return `review-checklist.${locale}.md`;
    default:
      return null;
  }
}

function readDocTemplate(relativePath, locale) {
  const fileName = docTemplateFileName(relativePath, locale);
  if (!fileName) {
    return `# ${path.basename(relativePath)}`;
  }
  return readTemplateAsset(fileName);
}

function parseArgs(argv) {
  const options = {
    dir: process.cwd(),
    agent: 'codex',
    locale: detectLocale(),
    language: 'python',
    force: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    switch (arg) {
      case '--dir':
        options.dir = path.resolve(options.dir, next);
        i += 1;
        break;
      case '--agent':
        options.agent = normalizeAgent(next);
        i += 1;
        break;
      case '--locale':
        options.locale = normalizeLocale(next) || options.locale;
        i += 1;
        break;
      case '--lang':
      case '--language':
        options.language = normalizeLanguage(next);
        i += 1;
        break;
      case '--mode':
        i += 1;
        break;
      case '--force':
        options.force = true;
        break;
      default:
        fail(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function writeIfNeeded(filePath, content, options, summary) {
  if (fs.existsSync(filePath) && !options.force) {
    summary.skipped.push(filePath);
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${content}\n`, 'utf8');
  summary.created.push(filePath);
}

function bootstrapRepository(options) {
  const targetDir = path.resolve(options.dir);
  const summary = { created: [], skipped: [] };

  fs.mkdirSync(targetDir, { recursive: true });

  writeIfNeeded(
    path.join(targetDir, targetFileName(options.agent)),
    renderGuideTemplate({
      language: options.language,
      editor: options.agent,
      locale: options.locale
    }),
    options,
    summary
  );

  const docs = [
    'docs/OVERVIEW.md',
    'docs/concept.md',
    'docs/spec.md',
    'docs/architecture.md',
    'docs/plan.md',
    'docs/delta/TEMPLATE.md',
    'docs/delta/REVIEW_CHECKLIST.md'
  ];

  for (const relativePath of docs) {
    writeIfNeeded(path.join(targetDir, relativePath), readDocTemplate(relativePath, options.locale), options, summary);
  }

  return summary;
}

if (require.main === module) {
  const options = parseArgs(process.argv.slice(2));
  const summary = bootstrapRepository(options);
  console.log(`[delta-bootstrap] created: ${summary.created.length}`);
  console.log(`[delta-bootstrap] skipped: ${summary.skipped.length}`);
}

module.exports = {
  bootstrapRepository,
  detectLocale,
  normalizeAgent,
  normalizeLanguage,
  targetFileName
};


