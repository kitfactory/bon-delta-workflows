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
const {
  languageGuidance,
  createLeanTemplate,
  createOverviewTemplate
} = require('./lib/templates');
const {
  ensureOverviewFile,
  ensureDocsSkeleton,
  resolveSkillTargetDir,
  copySkills,
  copySupportScript
} = require('./lib/file_ops');

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

  const fromEnv = normalizeLocaleTag(env.LANG) || normalizeLocaleTag(env.LC_ALL);

  if (isWsl(platform, release, env)) {
    const winLocale = normalizeLocaleTag(windowsLocaleReader());
    if (winLocale) return winLocale;
  }

  if (fromEnv) return fromEnv;

  const osLocale = normalizeLocaleTag(Intl.DateTimeFormat().resolvedOptions().locale);
  if (osLocale) return osLocale;

  return 'en';
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

  ensureOverviewFile(targetDir, locale, fail);
  ensureDocsSkeleton(targetDir, locale, fail);
  const skillCopyResult = copySkills(targetDir, editor, force, fail);
  const validationScriptResult = copySupportScript(targetDir, 'validate_delta_links.js', force, fail);
  const codeSizeScriptResult = copySupportScript(targetDir, 'check_code_size.js', force, fail);

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
  if (codeSizeScriptResult) {
    console.log(
      `[bon] code-size script ${codeSizeScriptResult.copied ? 'copied' : 'kept'} at ${codeSizeScriptResult.targetPath}`
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
