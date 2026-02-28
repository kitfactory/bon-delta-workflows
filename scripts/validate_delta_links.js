#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DR_ID_RE = /\bDR-\d{8}-[A-Za-z0-9][A-Za-z0-9._-]*\b/g;
const CHECKBOX_RE = /^\s*-\s*\[([ xX])\]\s*(.+)$/;
const HEADING_CURRENT_RE = /^#\s*current\b/i;
const HEADING_ARCHIVE_RE = /^#\s*archive\b/i;
const HEADING_FUTURE_RE = /^#\s*future\b/i;

function usage() {
  console.log(
    [
      'Usage: node scripts/validate_delta_links.js [--dir <projectDir>] [--strict] [--quiet]',
      '',
      'Checks consistency among:',
      '- docs/plan.md current/archive items',
      '- docs/delta/DR-*.md files',
      '- delta-archive PASS status'
    ].join('\n')
  );
}

function fail(message) {
  fs.writeSync(2, `[delta-validate][ERROR] ${message}\n`);
}

function warn(message) {
  fs.writeSync(2, `[delta-validate][WARN] ${message}\n`);
}

function info(message, quiet) {
  if (!quiet) fs.writeSync(1, `[delta-validate] ${message}\n`);
}

function parseArgs(argv) {
  const options = {
    dir: process.cwd(),
    strict: false,
    quiet: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--dir': {
        const next = argv[i + 1];
        if (!next) {
          throw new Error('Missing value for --dir');
        }
        options.dir = path.resolve(options.dir, next);
        i += 1;
        break;
      }
      case '--strict':
        options.strict = true;
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

  return options;
}

function extractDeltaIds(text) {
  const matches = text.match(DR_ID_RE) || [];
  return [...new Set(matches)];
}

function isDeltaArchivePass(content) {
  const hasArchiveLabel = /(^|\n)\s*#\s*delta-archive\b/i.test(content) || /\bdelta-archive\b/i.test(content);
  const hasPassMarker =
    /(verify結果|verify\s*result)\s*[:：]\s*PASS/i.test(content) ||
    /overall\s*[:：]\s*PASS/i.test(content) ||
    /archive(可否| status| result)?\s*[:：]\s*(PASS|可|YES|TRUE)/i.test(content);
  return hasArchiveLabel && hasPassMarker;
}

function parsePlan(planContent) {
  const lines = planContent.split(/\r?\n/);
  let section = '';
  const items = [];

  for (let idx = 0; idx < lines.length; idx += 1) {
    const line = lines[idx];
    const trimmed = line.trim();
    if (HEADING_CURRENT_RE.test(trimmed)) {
      section = 'current';
      continue;
    }
    if (HEADING_ARCHIVE_RE.test(trimmed)) {
      section = 'archive';
      continue;
    }
    if (HEADING_FUTURE_RE.test(trimmed)) {
      section = 'future';
      continue;
    }

    if (section !== 'current' && section !== 'archive') continue;
    const match = line.match(CHECKBOX_RE);
    if (!match) continue;

    const checked = match[1].toLowerCase() === 'x';
    const text = match[2].trim();
    const deltaIds = extractDeltaIds(text);
    items.push({
      section,
      checked,
      text,
      deltaIds,
      lineNo: idx + 1
    });
  }

  const currentOpen = new Set();
  const currentAll = new Set();
  const archiveChecked = new Set();
  const referenced = new Set();

  for (const item of items) {
    for (const id of item.deltaIds) {
      referenced.add(id);
      if (item.section === 'current') {
        currentAll.add(id);
        if (!item.checked) currentOpen.add(id);
      }
      if (item.section === 'archive' && item.checked) {
        archiveChecked.add(id);
      }
    }
  }

  return {
    items,
    currentOpen,
    currentAll,
    archiveChecked,
    referenced
  };
}

function loadDeltaFiles(deltaDir) {
  const result = new Map();
  if (!fs.existsSync(deltaDir)) return result;

  for (const entry of fs.readdirSync(deltaDir)) {
    if (!entry.endsWith('.md')) continue;
    const id = entry.slice(0, -3);
    if (id === 'TEMPLATE') continue;
    if (!/^DR-\d{8}-[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)) continue;

    const fullPath = path.join(deltaDir, entry);
    const content = fs.readFileSync(fullPath, 'utf8');
    result.set(id, {
      path: fullPath,
      isPass: isDeltaArchivePass(content)
    });
  }

  return result;
}

function runValidation(options) {
  const projectDir = options.dir;
  const planPath = path.join(projectDir, 'docs', 'plan.md');
  const deltaDir = path.join(projectDir, 'docs', 'delta');

  const errors = [];
  const warnings = [];

  if (!fs.existsSync(planPath)) {
    errors.push(`Missing ${planPath}`);
    return { errors, warnings };
  }

  const planContent = fs.readFileSync(planPath, 'utf8');
  const plan = parsePlan(planContent);
  const deltaFiles = loadDeltaFiles(deltaDir);

  if (plan.referenced.size > 0 && !fs.existsSync(deltaDir)) {
    errors.push(`Plan references Delta IDs but missing directory: ${deltaDir}`);
  }

  for (const id of plan.referenced) {
    if (!deltaFiles.has(id)) {
      errors.push(`Plan references ${id} but docs/delta/${id}.md is missing`);
    }
  }

  for (const id of plan.archiveChecked) {
    const delta = deltaFiles.get(id);
    if (!delta) continue;
    if (!delta.isPass) {
      errors.push(`Archived plan item references ${id}, but delta archive is not PASS`);
    }
  }

  for (const id of plan.currentOpen) {
    const delta = deltaFiles.get(id);
    if (!delta) continue;
    if (delta.isPass) {
      errors.push(`Current open item references ${id}, but delta archive is already PASS (move to plan archive)`);
    }
  }

  for (const [id, delta] of deltaFiles) {
    if (delta.isPass && !plan.archiveChecked.has(id)) {
      errors.push(`docs/delta/${id}.md is PASS, but plan archive has no checked item for ${id}`);
    }
    if (!delta.isPass && !plan.currentAll.has(id)) {
      warnings.push(`docs/delta/${id}.md exists (not PASS) but is not referenced in plan current`);
    }
    if (!plan.referenced.has(id)) {
      warnings.push(`docs/delta/${id}.md is not referenced in plan.md`);
    }
  }

  if (plan.currentOpen.size > 1) {
    warnings.push(`Multiple open Delta IDs in plan current (${plan.currentOpen.size}). Keep one Active Delta when executing.`);
  }

  return { errors, warnings, plan, deltaFiles };
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    fail(error.message);
    usage();
    process.exit(1);
  }

  const result = runValidation(options);
  const { errors = [], warnings = [] } = result;

  for (const message of errors) fail(message);
  for (const message of warnings) warn(message);

  if (errors.length > 0) {
    process.exit(1);
  }
  if (options.strict && warnings.length > 0) {
    fail('Warnings found in --strict mode');
    process.exit(1);
  }

  info(
    `OK: errors=${errors.length}, warnings=${warnings.length}, project=${options.dir}`,
    options.quiet
  );
}

if (require.main === module) {
  main();
}
