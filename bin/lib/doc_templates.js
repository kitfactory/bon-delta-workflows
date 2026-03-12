const path = require('path');
const { readTemplateAsset, docTemplateFileName } = require('./shared_templates');

function createOverviewTemplate(locale) {
  return readTemplateAsset(`OVERVIEW.${locale === 'ja' ? 'ja' : 'en'}.md`);
}

function createDocStub(relativePath, locale) {
  const templateName = docTemplateFileName(relativePath, locale);
  if (templateName) {
    return readTemplateAsset(templateName);
  }

  return `# ${path.basename(relativePath)}\n`;
}

module.exports = {
  createOverviewTemplate,
  createDocStub
};
