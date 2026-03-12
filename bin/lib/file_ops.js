const fs = require('fs');
const os = require('os');
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

function resolveCodexHome(env = process.env) {
  if (env.CODEX_HOME) return env.CODEX_HOME;
  return path.join(os.homedir(), '.codex');
}

function resolveWorkspaceSkillTargetDir(targetDir, agent) {
  switch (agent) {
    case 'codex':
      return path.join(targetDir, '.codex', 'skills');
    case 'claudecode':
      return path.join(targetDir, '.claude', 'skills');
    case 'cursor':
      return path.join(targetDir, '.cursor', 'skills');
    case 'copilot':
      return path.join(targetDir, '.github', 'copilot', 'skills');
    case 'opencode':
      return path.join(targetDir, '.opencode', 'skills');
    default:
      return path.join(targetDir, 'skills');
  }
}

function resolveUserSkillTargetDir(agent, env = process.env) {
  switch (agent) {
    case 'codex':
      return path.join(resolveCodexHome(env), 'skills');
    case 'claudecode':
      return path.join(os.homedir(), '.claude', 'skills');
    case 'cursor':
      return path.join(os.homedir(), '.cursor', 'skills');
    case 'copilot':
      return path.join(os.homedir(), '.github', 'copilot', 'skills');
    case 'opencode':
      return path.join(os.homedir(), '.config', 'opencode', 'skills');
    default:
      return path.join(os.homedir(), '.bon', 'skills', agent);
  }
}

function resolveSkillTargetDir(targetDir, agent, scope = 'workspace', env = process.env) {
  if (scope === 'user') {
    return resolveUserSkillTargetDir(agent, env);
  }
  return resolveWorkspaceSkillTargetDir(targetDir, agent);
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

function copySkills(targetDir, agent, scope, force, fail) {
  const sourceDir = resolveSkillSourceDir();
  if (!fs.existsSync(sourceDir)) return null;

  const targetSkillDir = resolveSkillTargetDir(targetDir, agent, scope);
  try {
    const result = copyDirRecursive(sourceDir, targetSkillDir, { force });
    return { targetSkillDir, ...result };
  } catch (error) {
    failOrThrow(fail, 'E_IO_COPY', `Failed to copy skills: ${error.message}`);
  }

  return null;
}

module.exports = {
  ensureOverviewFile,
  ensureDocsSkeleton,
  resolveCodexHome,
  resolveSkillTargetDir,
  resolveUserSkillTargetDir,
  copySkills
};
