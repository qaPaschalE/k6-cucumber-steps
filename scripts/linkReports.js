const fs = require("fs");
const path = require("path");
const { minify } = require("html-minifier-terser");

const reportsDir = path.resolve("reports");

function findCucumberReportPath() {
  const files = fs.readdirSync(reportsDir);
  return files.find((f) => f.includes("cucumber") && f.endsWith(".html"));
}

function extractCucumberBody(filepath) {
  const html = fs.readFileSync(filepath, "utf-8");

  // Remove <script> tags to avoid JS conflicts
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, "");

  const match = withoutScripts.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match
    ? match[1]
    : "<p>⚠️ Failed to extract body of Cucumber report.</p>";
}

function extractK6ReportBody(file) {
  const html = fs.readFileSync(file, "utf-8");
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match ? match[1] : "";
}

function buildCombinedHtml({ title, k6Bodies, cucumberBody }) {
  const tabs = k6Bodies
    .map(
      (_, i) => `
    <input type="radio" name="tabs" id="tabk6${i}" ${i === 0 ? "checked" : ""}>
    <label for="tabk6${i}">K6 Report ${i + 1}</label>
    <div class="tab">
      ${k6Bodies[i]}
    </div>
  `
    )
    .join("\n");

  const cucumberTab = `
    <input type="radio" name="tabs" id="tabcucumber">
    <label for="tabcucumber">Cucumber Report</label>
    <div class="tab">
      <div style="max-height:80vh; overflow:auto; padding:1rem;">
        ${cucumberBody}
      </div>
    </div>
  `;

  const fullTabs = cucumberBody ? cucumberTab + tabs : tabs;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <link rel="stylesheet" href="https://unpkg.com/purecss@2.0.3/build/pure-min.css" crossorigin="anonymous">
  <style>
    body { margin:1rem; font-family:sans-serif; }
    .tabs { display:flex; flex-wrap:wrap; }
    .tabs label { order:1; padding:1rem; cursor:pointer; background:#ddd; margin-right:0.2rem; border-radius:5px 5px 0 0; }
    .tabs .tab { order:99; flex-grow:1; width:100%; display:none; padding:1rem; background:#fff; }
    .tabs input[type="radio"] { display:none; }
    .tabs input[type="radio"]:checked + label { background:#fff; font-weight:bold; }
    .tabs input[type="radio"]:checked + label + .tab { display:block; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="tabs">
    ${fullTabs}
  </div>
</body>
</html>`;
}

async function linkReports() {
  if (!fs.existsSync(reportsDir)) {
    console.warn("⚠️ No reports directory found.");
    return;
  }

  const cucumberFile = findCucumberReportPath();
  const cucumberBody = cucumberFile
    ? extractCucumberBody(path.join(reportsDir, cucumberFile))
    : null;

  const k6Files = fs
    .readdirSync(reportsDir)
    .filter((f) => /^k6-report.*\.html$/.test(f));
  if (k6Files.length === 0) {
    console.warn("⚠️ No K6 reports found.");
    return;
  }

  const k6Bodies = k6Files.map((f) =>
    extractK6ReportBody(path.join(reportsDir, f))
  );

  const combinedHtml = buildCombinedHtml({
    title: "Combined K6 + Cucumber Report",
    k6Bodies,
    cucumberBody,
  });

  const finalHtml = await minify(combinedHtml, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
  });

  const outPath = path.join(reportsDir, "combined-report.html");
  fs.writeFileSync(outPath, finalHtml, "utf-8");

  console.log(`✅ Combined and minified report saved to: ${outPath}`);
}

module.exports = { linkReports };
