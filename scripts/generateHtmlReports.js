const fs = require("fs");
const path = require("path");
const reporter = require("cucumber-html-reporter");

function getJsonReportPath() {
  // 1. Check for cucumber.js or custom config
  const configFile = path.resolve("cucumber.js");
  if (fs.existsSync(configFile)) {
    const configText = fs.readFileSync(configFile, "utf-8");

    const match = configText.match(/json:(.*?\.json)/);
    if (match && match[1]) {
      const reportPath = match[1].trim().replace(/['"`]/g, "");
      console.log(`📝 Found report path in cucumber.js: ${reportPath}`);
      return reportPath;
    }
  }

  // 2. Check environment variable
  if (process.env.CUCUMBER_JSON) {
    console.log(
      `📝 Using report path from CUCUMBER_JSON: ${process.env.CUCUMBER_JSON}`
    );
    return process.env.CUCUMBER_JSON;
  }

  // 3. Fallback to default
  console.log("📝 Using default report path: reports/load-report.json");
  return "reports/load-report.json";
}

function generateHtmlReports() {
  const jsonReportPath = getJsonReportPath();

  if (!fs.existsSync(jsonReportPath)) {
    console.warn(`⚠️ Cucumber JSON report not found at: ${jsonReportPath}`);
    return;
  }

  const reportDir = path.dirname(jsonReportPath);

  reporter.generate({
    theme: "bootstrap",
    jsonFile: jsonReportPath,
    output: path.join(reportDir, "cucumber-report.html"),
    reportSuiteAsScenarios: true,
    launchReport: false,
    name: "k6-cucumber-steps Performance Report",
    brandTitle: "📊 Performance Test Summary",
  });
}

module.exports = { generateHtmlReports };
