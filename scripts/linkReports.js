const fs = require("fs");
const path = require("path");

const cucumberHtmlPath = path.resolve("reports", "cucumber-report.html");
const k6HtmlPath = path.resolve("reports", "k6-report.html");

function addLink(filePath, linkText, linkHref) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Report file not found: ${filePath}`);
    return;
  }

  const html = fs.readFileSync(filePath, "utf-8");

  const linkHtml = `<div style="margin:10px;padding:10px;background:#eef;border:1px solid #ccc;">
    🔗 <strong><a href="${linkHref}" target="_blank">${linkText}</a></strong>
  </div>`;

  const modified = html.replace(
    /<body[^>]*>/i,
    (match) => match + "\n" + linkHtml
  );

  fs.writeFileSync(filePath, modified, "utf-8");
  console.log(`🔗 Linked reports in: ${path.basename(filePath)}`);
}

function linkReports() {
  addLink(cucumberHtmlPath, "View K6 Load Report", "k6-report.html");
  addLink(k6HtmlPath, "View Cucumber Report", "cucumber-report.html");
}

module.exports = { linkReports };
