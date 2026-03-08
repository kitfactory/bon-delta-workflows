const fs = require('fs');
const path = require('path');

const { createOverviewTemplate, createDocStub } = require('./templates');

function failOrThrow(fail, code, message) {
  if (typeof fail === 'function') {
    fail(code, message);
    return;
  }

  const error = new Error(message);
  error.code = code;
  throw error;
}

function ensureOverviewFile(targetDir, locale, fail) {
  const docsDir = path.join(targetDir, 'docs');
  const overviewPath = path.join(docsDir, 'OVERVIEW.md');

  try {
    fs.mkdirSync(docsDir, { recursive: true });
  } catch (error) {
    failOrThrow(fail, 'E_IO_DIR_CREATE', `Could not create docs directory: ${error.message}`);
    return;
  }

  if (fs.existsSync(overviewPath)) {
    return;
  }

  const content = createOverviewTemplate(locale);
  try {
    fs.writeFileSync(overviewPath, content, 'utf8');
  } catch (error) {
    failOrThrow(fail, 'E_IO_WRITE', `Failed to write docs/OVERVIEW.md: ${error.message}`);
  }
}

function ensureDocFile(targetDir, relativePath, locale, fail) {
  const fullPath = path.join(targetDir, relativePath);
  if (fs.existsSync(fullPath)) return;

  const dirPath = path.dirname(fullPath);
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (error) {
    failOrThrow(fail, 'E_IO_DIR_CREATE', `Could not create directory: ${error.message}`);
    return;
  }

  try {
    fs.writeFileSync(fullPath, createDocStub(relativePath, locale) + '\n', 'utf8');
  } catch (error) {
    failOrThrow(fail, 'E_IO_WRITE', `Failed to write ${relativePath}: ${error.message}`);
  }
}

function ensureDocsSkeleton(targetDir, locale, fail) {
  ensureDocFile(targetDir, 'docs/concept.md', locale, fail);
  ensureDocFile(targetDir, 'docs/spec.md', locale, fail);
  ensureDocFile(targetDir, 'docs/architecture.md', locale, fail);
  ensureDocFile(targetDir, 'docs/plan.md', locale, fail);
  ensureDocFile(targetDir, 'docs/delta/TEMPLATE.md', locale, fail);
  ensureDocFile(targetDir, 'docs/delta/REVIEW_CHECKLIST.md', locale, fail);
}

function resolveSkillSourceDir() {
  return path.join(__dirname, '..', '..', 'skills');
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

function copySkills(targetDir, editor, force, fail) {
  const sourceDir = resolveSkillSourceDir();
  if (!fs.existsSync(sourceDir)) return null;

  const targetSkillDir = resolveSkillTargetDir(targetDir, editor);
  try {
    const result = copyDirRecursive(sourceDir, targetSkillDir, { force });
    return { targetSkillDir, ...result };
  } catch (error) {
    failOrThrow(fail, 'E_IO_COPY', `Failed to copy skills: ${error.message}`);
  }

  return null;
}

function copySupportScript(targetDir, scriptName, force, fail) {
  const sourcePath = path.join(__dirname, '..', '..', 'scripts', scriptName);
  if (!fs.existsSync(sourcePath)) return null;

  const targetPath = path.join(targetDir, 'scripts', scriptName);
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
    failOrThrow(fail, 'E_IO_COPY', `Failed to copy support script (${scriptName}): ${error.message}`);
  }

  return null;
}

module.exports = {
  ensureOverviewFile,
  ensureDocsSkeleton,
  resolveSkillTargetDir,
  copySkills,
  copySupportScript
};
