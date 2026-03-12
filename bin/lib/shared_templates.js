const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.join(
  __dirname,
  '..',
  '..',
  'skills',
  'delta-bootstrap',
  'assets',
  'templates'
);

function readTemplateAsset(fileName) {
  const fullPath = path.join(TEMPLATE_DIR, fileName);
  return fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n').trimEnd();
}

function replaceTokens(template, replacements) {
  return Object.entries(replacements).reduce((result, [token, value]) => {
    return result.replace(new RegExp(`\\{\\{${token}\\}\\}`, 'g'), value);
  }, template);
}

function docTemplateFileName(relativePath, locale) {
  const normalizedLocale = locale === 'ja' ? 'ja' : 'en';
  switch (relativePath) {
    case 'docs/OVERVIEW.md':
      return `OVERVIEW.${normalizedLocale}.md`;
    case 'docs/concept.md':
      return `concept.${normalizedLocale}.md`;
    case 'docs/spec.md':
      return `spec.${normalizedLocale}.md`;
    case 'docs/architecture.md':
      return `architecture.${normalizedLocale}.md`;
    case 'docs/plan.md':
      return `plan.${normalizedLocale}.md`;
    case 'docs/delta/TEMPLATE.md':
      return `delta-template.${normalizedLocale}.md`;
    case 'docs/delta/REVIEW_CHECKLIST.md':
      return `review-checklist.${normalizedLocale}.md`;
    default:
      return null;
  }
}

module.exports = {
  readTemplateAsset,
  replaceTokens,
  docTemplateFileName
};


