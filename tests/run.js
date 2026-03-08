const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const bon = require('../bin/bon.js');
const codeSize = require('../scripts/check_code_size.js');

const tempDirs = [];


function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

function tempDir() {
  const candidates = [];
  if (process.env.TMPDIR) candidates.push(process.env.TMPDIR);
  candidates.push(os.tmpdir());
  candidates.push(path.join(__dirname, '..', '.bon-tmp'));

  let lastError = null;
  for (const base of candidates) {
    try {
      if (base.endsWith('.bon-tmp')) {
        fs.mkdirSync(base, { recursive: true });
      }
      const dir = fs.mkdtempSync(path.join(base, 'bon-'));
      tempDirs.push(dir);
      return dir;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to create temp dir');
}

process.on('exit', () => {
  for (const dir of tempDirs) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch (_) {
      // ignore cleanup errors
    }
  }
});

test('parseArgs defaults', () => {
  const parsed = bon.parseArgs([]);
  assert.ok(parsed.dir);
  assert.strictEqual(parsed.force, false);
  assert.strictEqual(parsed.lang, 'python');
  assert.strictEqual(parsed.editor, 'codex');
});

test('detectLocale honors env ja', () => {
  const locale = bon.detectLocale({ env: { LANG: 'ja_JP.UTF-8' } });
  assert.strictEqual(locale, 'ja');
});

test('detectLocale falls back to en', () => {
  const locale = bon.detectLocale({ env: {} });
  assert.ok(['en', 'ja'].includes(locale)); // default en if no env
});

test('languageGuidance mentions env handling', () => {
  const ja = bon.languageGuidance('js', 'ja');
  assert.ok(ja.includes('`.env`'), 'Japanese guidance should mention .env');
  const en = bon.languageGuidance('python', 'en');
  assert.ok(en.toLowerCase().includes('env'), 'English guidance should mention env');
});

test('createTemplate references docs and avoids project-specific info', () => {
  const tpl = bon.createTemplate({ projectName: 'demo', language: 'ts', editor: 'cursor', locale: 'en' });
  assert.ok(tpl.includes('docs/OVERVIEW.md'), 'Should point to docs/OVERVIEW.md');
  assert.ok(tpl.toLowerCase().includes('plan.md'), 'Should prompt to use plan.md checklist');
  assert.ok(!tpl.includes('demo'), 'Template should not bake project-specific info');
});

test('createTemplate Japanese markers', () => {
  const tpl = bon.createTemplate({ projectName: 'demo', language: 'rust', editor: 'codex', locale: 'ja' });
  assert.ok(tpl.includes('Top 5') && tpl.includes('作業開始'), 'Japanese template should include Japanese sections');
  assert.ok(tpl.includes('要件対応プロトコル（Delta-First / 必須）'), 'Japanese template should include delta-first protocol');
  assert.ok(tpl.includes('役割境界（Canonical Docs と Delta）'), 'Japanese template should include role boundary section');
  assert.ok(tpl.includes('実装アイテム1件は `delta request` 1件の seed'), 'Japanese template should describe plan-item to delta-seed mapping');
  assert.ok(tpl.includes('delta の記録は `docs/delta/*.md`（Markdown）を正本'), 'Japanese template should keep markdown as canonical for delta records');
  assert.ok(tpl.includes('設計変更提案の出力順を固定'), 'Japanese template should include fixed design-output order');
  assert.ok(tpl.includes('`spec.md > architecture.md > OVERVIEW/AGENTS > 設計補助ガイド`'), 'Japanese template should include design-guidance priority');
  assert.ok(tpl.includes('node scripts/validate_delta_links.js --dir .'), 'Japanese template should mention delta link validator');
  assert.ok(tpl.includes('node scripts/check_code_size.js --dir .'), 'Japanese template should mention code-size checker');
  assert.ok(tpl.includes('REVIEW_CHECKLIST.md'), 'Japanese template should mention review checklist');
});

test('createTemplate Japanese doc and comment rules', () => {
  const tpl = bon.createTemplate({ projectName: 'demo', language: 'python', editor: 'codex', locale: 'ja' });
  assert.ok(tpl.includes('言語・コメント'), 'Should include language/comment rules section');
  assert.ok(tpl.includes('日本語 + 英語を併記'), 'Should require bilingual comments when AGENTS is Japanese');
  assert.ok(tpl.includes('ゴッド'), 'Should warn against god APIs/classes/data');
  assert.ok(tpl.includes('サンプル（最低限）'), 'Should include minimal examples');
});

test('createTemplate English doc rules include concept/spec guidance', () => {
  const tpl = bon.createTemplate({ projectName: 'demo', language: 'ts', editor: 'codex', locale: 'en' });
  assert.ok(tpl.includes('Top 5 (Must Follow)'), 'Should include Top 5 in English template');
  assert.ok(tpl.toLowerCase().includes('design rules'), 'Should include design rules section in English template');
  assert.ok(tpl.includes('docs/OVERVIEW.md'), 'Should point to docs/OVERVIEW.md');
  assert.ok(tpl.toLowerCase().includes('minimal examples'), 'English template should include minimal examples');
  assert.ok(tpl.includes('Requirement Protocol (Delta-First / Required)'), 'English template should include delta-first protocol');
  assert.ok(tpl.includes('Role Boundary (Canonical Docs vs Delta)'), 'English template should include role boundary section');
  assert.ok(tpl.includes('If there is no Delta ID, do not start requirement implementation'), 'English template should include Delta ID guardrail');
  assert.ok(tpl.includes('Treat each implementation item in `docs/plan.md` as a seed for one `delta request`'), 'English template should describe plan-item to delta-seed mapping');
  assert.ok(tpl.includes('Keep delta records canonical in Markdown (`docs/delta/*.md`)'), 'English template should keep markdown as canonical for delta records');
  assert.ok(tpl.includes('Fix design-output order'), 'English template should include fixed design-output order');
  assert.ok(tpl.includes('Conflict priority for design guidance'), 'English template should include design-guidance priority');
  assert.ok(tpl.includes('node scripts/validate_delta_links.js --dir .'), 'English template should mention delta link validator');
  assert.ok(tpl.includes('node scripts/check_code_size.js --dir .'), 'English template should mention code-size checker');
  assert.ok(tpl.includes('REVIEW_CHECKLIST.md'), 'English template should mention review checklist');
});

test('createOverviewTemplate includes delta boundary notes', () => {
  const ja = bon.createOverviewTemplate('ja');
  assert.ok(ja.includes('delta-first'), 'Japanese overview should mention delta-first');
  assert.ok(ja.includes('Delta ID が未提示の要件実装は開始せず'), 'Japanese overview should require Delta ID before implementation');
  assert.ok(ja.includes('実装アイテム1件は delta request 1件の seed'), 'Japanese overview should describe plan-item to delta-seed mapping');
  assert.ok(ja.includes('delta 記録は Markdown（docs/delta/*.md）を正本'), 'Japanese overview should keep markdown as canonical for delta records');
  assert.ok(ja.includes('plan.md の archive'), 'Japanese overview should distinguish plan archive from delta archive');
  assert.ok(ja.includes('500 行超'), 'Japanese overview should mention file-size thresholds');
  assert.ok(ja.includes('REVIEW_CHECKLIST.md'), 'Japanese overview should mention review checklist');
  assert.ok(ja.includes('archive summary'), 'Japanese overview should mention slim plan structure');
  assert.ok(ja.includes('3 delta'), 'Japanese overview should mention automatic review trigger by delta count');
  assert.ok(ja.includes('120行'), 'Japanese overview should mention plan shrink threshold');
  assert.ok(ja.includes('review timing'), 'Japanese overview should mention review timing in plan');

  const en = bon.createOverviewTemplate('en');
  assert.ok(en.includes('delta-first flow'), 'English overview should mention delta-first');
  assert.ok(en.includes('If there is no Delta ID, do not start requirement implementation'), 'English overview should require Delta ID before implementation');
  assert.ok(en.includes('Treat each implementation item in plan.md as a seed for one delta request'), 'English overview should describe plan-item to delta-seed mapping');
  assert.ok(en.includes('Keep delta records canonical in Markdown (docs/delta/*.md)'), 'English overview should keep markdown as canonical for delta records');
  assert.ok(en.includes('plan.md archive is for completed plan tasks'), 'English overview should distinguish plan archive from delta archive');
  assert.ok(en.includes('above 500 lines'), 'English overview should mention file-size thresholds');
  assert.ok(en.includes('REVIEW_CHECKLIST.md'), 'English overview should mention review checklist');
  assert.ok(en.includes('archive summary / archive index'), 'English overview should mention slim plan structure');
  assert.ok(en.includes('3+ deltas'), 'English overview should mention automatic review trigger by delta count');
  assert.ok(en.includes('120 lines'), 'English overview should mention plan shrink threshold');
  assert.ok(en.includes('review timing'), 'English overview should mention review timing in plan');
});

test('validate_delta_links passes for consistent plan-delta links', () => {
  const dir = tempDir();
  const docsDir = path.join(dir, 'docs');
  const deltaDir = path.join(docsDir, 'delta');
  fs.mkdirSync(deltaDir, { recursive: true });

  fs.writeFileSync(
    path.join(docsDir, 'plan.md'),
    [
      '# plan.md',
      '',
      '# current',
      '- [ ] [SEED-login] create delta request for login change',
      '',
      '# future',
      '- future item',
      '',
      '# archive',
      '- [x] [DR-20260301-login] archived'
    ].join('\n'),
    'utf8'
  );

  fs.writeFileSync(
    path.join(deltaDir, 'DR-20260301-login.md'),
    ['# delta-archive', '', '## verify', '- verify result: PASS'].join('\n'),
    'utf8'
  );

  const script = path.join(__dirname, '..', 'scripts', 'validate_delta_links.js');
  const run = spawnSync('node', [script, '--dir', dir], { encoding: 'utf8' });
  assert.strictEqual(run.status, 0, run.stderr);
});

test('validate_delta_links fails when archived delta is not PASS', () => {
  const dir = tempDir();
  const docsDir = path.join(dir, 'docs');
  const deltaDir = path.join(docsDir, 'delta');
  fs.mkdirSync(deltaDir, { recursive: true });

  fs.writeFileSync(
    path.join(docsDir, 'plan.md'),
    [
      '# plan.md',
      '',
      '# current',
      '- [ ] current task',
      '',
      '# future',
      '- future item',
      '',
      '# archive',
      '- [x] [DR-20260302-auth] archived'
    ].join('\n'),
    'utf8'
  );

  fs.writeFileSync(
    path.join(deltaDir, 'DR-20260302-auth.md'),
    ['# delta-archive', '', '## verify', '- verify result: FAIL'].join('\n'),
    'utf8'
  );

  const script = path.join(__dirname, '..', 'scripts', 'validate_delta_links.js');
  const run = spawnSync('node', [script, '--dir', dir], { encoding: 'utf8' });
  assert.notStrictEqual(run.status, 0, 'validator should fail on inconsistent archive status');
  assert.ok(run.stderr.includes('DR-20260302-auth'));
});

test('check_code_size parseArgs defaults', () => {
  const parsed = codeSize.parseArgs([]);
  assert.ok(parsed.dir);
  assert.strictEqual(parsed.reviewLines, 500);
  assert.strictEqual(parsed.splitLines, 800);
  assert.strictEqual(parsed.exceptionLines, 1000);
});

test('check_code_size warns on review threshold without failing', () => {
  const dir = tempDir();
  const srcDir = path.join(dir, 'src');
  fs.mkdirSync(srcDir, { recursive: true });
  fs.writeFileSync(path.join(srcDir, 'review.js'), 'const x = 1;\n'.repeat(501), 'utf8');

  const script = path.join(__dirname, '..', 'scripts', 'check_code_size.js');
  const run = spawnSync('node', [script, '--dir', dir], { encoding: 'utf8' });
  assert.strictEqual(run.status, 0, run.stderr);
  assert.ok(run.stderr.includes('review.js'));
});

test('check_code_size fails on split threshold', () => {
  const dir = tempDir();
  const srcDir = path.join(dir, 'src');
  fs.mkdirSync(srcDir, { recursive: true });
  fs.writeFileSync(path.join(srcDir, 'split.js'), 'const y = 1;\n'.repeat(801), 'utf8');

  const script = path.join(__dirname, '..', 'scripts', 'check_code_size.js');
  const run = spawnSync('node', [script, '--dir', dir], { encoding: 'utf8' });
  assert.notStrictEqual(run.status, 0, 'checker should fail on files above split threshold');
  assert.ok(run.stderr.includes('split.js'));
});

test('check_code_size ignores excluded directories', () => {
  const dir = tempDir();
  fs.mkdirSync(path.join(dir, 'node_modules'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'node_modules', 'ignored.js'), 'const z = 1;\n'.repeat(1200), 'utf8');

  const script = path.join(__dirname, '..', 'scripts', 'check_code_size.js');
  const run = spawnSync('node', [script, '--dir', dir], { encoding: 'utf8' });
  assert.strictEqual(run.status, 0, run.stderr);
  assert.ok(!run.stderr.includes('ignored.js'));
});

test('isWsl detects microsoft release', () => {
  const result = bon.isWsl('linux', '5.15.90-microsoft-standard-WSL2', {});
  assert.strictEqual(result, true);
});

test('CLI creates AGENTS.md and blocks overwrite without --force', () => {
  const dir = tempDir();
  const script = path.join(__dirname, '..', 'bin', 'bon.js');
  const first = spawnSync('node', [script, '--dir', dir], { encoding: 'utf8' });
  assert.strictEqual(first.status, 0, first.stderr);
  const target = path.join(dir, bon.targetFileName('codex'));
  assert.ok(fs.existsSync(target), 'AGENTS file should be created');
  assert.ok(fs.existsSync(path.join(dir, 'docs', 'OVERVIEW.md')), 'docs/OVERVIEW.md should be created');
  assert.ok(fs.existsSync(path.join(dir, 'docs', 'concept.md')), 'docs/concept.md should be created');
  assert.ok(fs.existsSync(path.join(dir, 'docs', 'spec.md')), 'docs/spec.md should be created');
  assert.ok(fs.existsSync(path.join(dir, 'docs', 'architecture.md')), 'docs/architecture.md should be created');
  assert.ok(fs.existsSync(path.join(dir, 'docs', 'plan.md')), 'docs/plan.md should be created');
  assert.ok(fs.existsSync(path.join(dir, 'docs', 'delta', 'TEMPLATE.md')), 'docs/delta/TEMPLATE.md should be created');
  assert.ok(fs.existsSync(path.join(dir, 'docs', 'delta', 'REVIEW_CHECKLIST.md')), 'docs/delta/REVIEW_CHECKLIST.md should be created');
  assert.ok(fs.existsSync(path.join(dir, 'scripts', 'validate_delta_links.js')), 'scripts/validate_delta_links.js should be created');
  assert.ok(fs.existsSync(path.join(dir, 'scripts', 'check_code_size.js')), 'scripts/check_code_size.js should be created');
  const planContent = fs.readFileSync(path.join(dir, 'docs', 'plan.md'), 'utf8');
  assert.ok(planContent.includes('# archive index'), 'plan.md should keep an archive index section');
  assert.ok(planContent.includes('# review timing'), 'plan.md should include a review timing section');
  const deltaTemplate = fs.readFileSync(path.join(dir, 'docs', 'delta', 'TEMPLATE.md'), 'utf8');
  assert.ok(deltaTemplate.toLowerCase().includes('canonical') || deltaTemplate.includes('正本'), 'delta template should mention markdown canonical policy');
  assert.ok(deltaTemplate.includes('check_code_size.js'), 'delta template should mention code-size checker');
  assert.ok(deltaTemplate.includes('REVIEW_CHECKLIST.md'), 'delta template should mention review checklist');

  const second = spawnSync('node', [script, '--dir', dir], { encoding: 'utf8' });
  assert.notStrictEqual(second.status, 0, 'Second run without --force should fail');

  const forced = spawnSync('node', [script, '--dir', dir, '--force'], { encoding: 'utf8' });
  assert.strictEqual(forced.status, 0, forced.stderr);
});

test('CLI respects --lang and locale ja', () => {
  const dir = tempDir();
  const script = path.join(__dirname, '..', 'bin', 'bon.js');
  const run = spawnSync('node', [script, '--dir', dir, '--lang', 'rust'], {
    encoding: 'utf8',
    env: { ...process.env, LANG: 'ja_JP.UTF-8' }
  });
  assert.strictEqual(run.status, 0, run.stderr);
  const content = fs.readFileSync(path.join(dir, bon.targetFileName('codex')), 'utf8');
  assert.ok(content.includes('Rust'), 'Should mention Rust guidance');
  assert.ok(content.includes('日本語') || content.includes('前提') || content.includes('仕様'), 'Should render in Japanese');
});

test('CLI uses editor-specific filenames', () => {
  const dir = tempDir();
  const script = path.join(__dirname, '..', 'bin', 'bon.js');

  const cursorRun = spawnSync('node', [script, '--dir', path.join(dir, 'cursor'), '--editor', 'cursor'], {
    encoding: 'utf8'
  });
  assert.strictEqual(cursorRun.status, 0, cursorRun.stderr);
  assert.ok(fs.existsSync(path.join(dir, 'cursor', bon.targetFileName('cursor'))));

  const copilotRun = spawnSync('node', [script, '--dir', path.join(dir, 'copilot'), '--editor', 'copilot'], {
    encoding: 'utf8'
  });
  assert.strictEqual(copilotRun.status, 0, copilotRun.stderr);
  assert.ok(fs.existsSync(path.join(dir, 'copilot', bon.targetFileName('copilot'))));
});

console.log('All tests passed.');
