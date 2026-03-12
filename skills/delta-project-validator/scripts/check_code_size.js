#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_EXTENSIONS = ['.js', '.cjs', '.mjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.py', '.rs'];
const DEFAULT_EXCLUDE_DIRS = [
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  '.turbo',
  '.venv',
  'venv',
  'target',
  '__pycache__',
  '.pytest_cache',
  '.mypy_cache'
];

function usage() {
  console.log(
    [
      'Usage: node scripts/check_code_size.js [--dir <projectDir>] [--review-lines <n>] [--split-lines <n>] [--exception-lines <n>] [--strict-review] [--extensions <.js,.ts,...>] [--quiet]',
      '',
      'Checks source file line counts with these defaults:',
      '- review threshold: > 500 lines',
      '- split threshold: > 800 lines',
      '- exception threshold: > 1000 lines',
      '- default extensions: .js,.cjs,.mjs,.jsx,.ts,.tsx,.mts,.cts,.py,.rs'
    ].join('\n')
  );
}

function error(message) {
  fs.writeSync(2, `[code-size][ERROR] ${message}\n`);
}

function warn(message) {
  fs.writeSync(2, `[code-size][WARN] ${message}\n`);
}

function info(message, quiet) {
  if (!quiet) fs.writeSync(1, `[code-size] ${message}\n`);
}

function parseNumber(value, optionName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid value for ${optionName}: ${value}`);
  }
  return parsed;
}

function normalizeExtensions(value) {
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .map((item) => (item.startsWith('.') ? item : `.${item}`));
}

function parseArgs(argv) {
  const options = {
    dir: process.cwd(),
    reviewLines: 500,
    splitLines: 800,
    exceptionLines: 1000,
    strictReview: false,
    quiet: false,
    extensions: new Set(DEFAULT_EXTENSIONS),
    excludeDirs: new Set(DEFAULT_EXCLUDE_DIRS)
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--dir': {
        const next = argv[i + 1];
        if (!next) throw new Error('Missing value for --dir');
        options.dir = path.resolve(options.dir, next);
        i += 1;
        break;
      }
      case '--review-lines': {
        const next = argv[i + 1];
        if (!next) throw new Error('Missing value for --review-lines');
        options.reviewLines = parseNumber(next, '--review-lines');
        i += 1;
        break;
      }
      case '--split-lines': {
        const next = argv[i + 1];
        if (!next) throw new Error('Missing value for --split-lines');
        options.splitLines = parseNumber(next, '--split-lines');
        i += 1;
        break;
      }
      case '--exception-lines': {
        const next = argv[i + 1];
        if (!next) throw new Error('Missing value for --exception-lines');
        options.exceptionLines = parseNumber(next, '--exception-lines');
        i += 1;
        break;
      }
      case '--extensions': {
        const next = argv[i + 1];
        if (!next) throw new Error('Missing value for --extensions');
        options.extensions = new Set(normalizeExtensions(next));
        i += 1;
        break;
      }
      case '--strict-review':
        options.strictReview = true;
        break;
      case '--quiet':
        options.quiet = true;
        break;
      case '--help':
      case '-h':
        usage();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (options.reviewLines >= options.splitLines) {
    throw new Error('--review-lines must be smaller than --split-lines');
  }
  if (options.splitLines >= options.exceptionLines) {
    throw new Error('--split-lines must be smaller than --exception-lines');
  }
  if (options.extensions.size === 0) {
    throw new Error('At least one extension is required');
  }

  return options;
}

function shouldExcludeDir(dirName, options) {
  return options.excludeDirs.has(dirName);
}

function shouldCheckFile(fileName, options) {
  return options.extensions.has(path.extname(fileName).toLowerCase());
}

function collectFiles(rootDir, options, bucket = []) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      if (shouldExcludeDir(entry.name, options)) continue;
      collectFiles(fullPath, options, bucket);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!shouldCheckFile(entry.name, options)) continue;
    bucket.push(fullPath);
  }

  return bucket;
}

function countTextLines(text) {
  if (text.length === 0) return 0;
  const normalized = text.replace(/\r\n/g, '\n');
  if (normalized.endsWith('\n')) {
    return normalized.slice(0, -1).split('\n').length;
  }
  return normalized.split('\n').length;
}

function countFileLines(filePath) {
  return countTextLines(fs.readFileSync(filePath, 'utf8'));
}

function classifyLineCount(lineCount, options) {
  if (lineCount > options.exceptionLines) return 'exception';
  if (lineCount > options.splitLines) return 'split';
  if (lineCount > options.reviewLines) return 'review';
  return 'ok';
}

function toRelative(projectDir, filePath) {
  return path.relative(projectDir, filePath).split(path.sep).join('/');
}

function runCheck(options) {
  const projectDir = options.dir;
  const results = [];
  const files = collectFiles(projectDir, options);

  for (const filePath of files) {
    const lineCount = countFileLines(filePath);
    const status = classifyLineCount(lineCount, options);
    results.push({
      filePath,
      relativePath: toRelative(projectDir, filePath),
      lineCount,
      status
    });
  }

  results.sort((left, right) => {
    if (right.lineCount !== left.lineCount) return right.lineCount - left.lineCount;
    return left.relativePath.localeCompare(right.relativePath);
  });

  const reviewFiles = results.filter((item) => item.status === 'review');
  const splitFiles = results.filter((item) => item.status === 'split');
  const exceptionFiles = results.filter((item) => item.status === 'exception');

  return {
    projectDir,
    results,
    reviewFiles,
    splitFiles,
    exceptionFiles
  };
}

function formatMessage(item, options) {
  if (item.status === 'review') {
    return `${item.relativePath}: ${item.lineCount} lines exceeds review threshold (> ${options.reviewLines})`;
  }
  if (item.status === 'split') {
    return `${item.relativePath}: ${item.lineCount} lines exceeds split threshold (> ${options.splitLines})`;
  }
  return `${item.relativePath}: ${item.lineCount} lines exceeds exception threshold (> ${options.exceptionLines})`;
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (err) {
    error(err.message);
    usage();
    process.exit(1);
  }

  if (!fs.existsSync(options.dir)) {
    error(`Missing directory: ${options.dir}`);
    process.exit(1);
  }

  const result = runCheck(options);

  for (const item of result.reviewFiles) warn(formatMessage(item, options));
  for (const item of result.splitFiles) error(formatMessage(item, options));
  for (const item of result.exceptionFiles) error(formatMessage(item, options));

  info(
    `checked=${result.results.length}, review=${result.reviewFiles.length}, split=${result.splitFiles.length}, exception=${result.exceptionFiles.length}, project=${options.dir}`,
    options.quiet
  );

  const hasErrors =
    result.splitFiles.length > 0 ||
    result.exceptionFiles.length > 0 ||
    (options.strictReview && result.reviewFiles.length > 0);

  if (hasErrors) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
