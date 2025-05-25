const fs = require("fs");
const path = require("path");

const reportsDir = path.resolve("reports");

/**
 * Adds internal cross-links between reports.
 */
function addLinksToReport(targetFile, otherFiles) {
  const content = fs.readFileSync(targetFile, "utf-8");

  // Inject the Cucumber Report tab before the Request Metrics tab
  const cucumberTab = `
    <input type="radio" name="tabs" id="tabcucumber">
    <label for="tabcucumber"><i class="fas fa-file-alt"></i> &nbsp; Cucumber Report</label>
    <div class="tab">
      <iframe src="cucumber-report.html" style="width:100%; height:600px; border:none;"></iframe>
    </div>
  `;

  const modifiedContent = content
    .replace(
      /<input type="radio" name="tabs" id="tabone"/,
      `${cucumberTab}\n<input type="radio" name="tabs" id="tabone"`
    )
    // Remove standalone links to cucumber-report.html or k6-report.html
    .replace(
      /<div style="padding:10px;margin-top:20px;text-align:center">[\s\S]*?View (Cucumber|k6).*?<\/div>/,
      ""
    );

  fs.writeFileSync(targetFile, modifiedContent, "utf-8");
}

/**
 * Auto-link all HTML reports in the reports directory.
 */
function linkReports() {
  if (!fs.existsSync(reportsDir)) {
    console.warn("⚠️ No reports directory found.");
    return;
  }

  const htmlFiles = fs
    .readdirSync(reportsDir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.join(reportsDir, f));

  if (htmlFiles.length < 2) {
    console.warn("⚠️ Not enough HTML files to link.");
    return;
  }

  for (const file of htmlFiles) {
    const others = htmlFiles.filter((f) => f !== file);
    addLinksToReport(file, others);
  }
}

module.exports = { linkReports };
