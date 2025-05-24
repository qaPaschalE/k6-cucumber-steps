const fs = require("fs");
const path = require("path");
const reporter = require("cucumber-html-reporter");

function generateHtmlReports() {
  const jsonReport = path.resolve("reports/load-results.json");

  if (!fs.existsSync(jsonReport)) {
    console.warn(
      "⚠️ Cucumber JSON report not found. Skipping HTML report generation."
    );
    return;
  }

  reporter.generate({
    theme: "bootstrap",
    jsonFile: jsonReport,
    output: path.resolve("reports/load-results.html"),
    reportSuiteAsScenarios: true,
    launchReport: false,
    metadata: {
      Environment: process.env.NODE_ENV || "local",
      "Base URL": process.env.API_BASE_URL || process.env.BASE_URL || "n/a",
    },
    brandTitle: "📊 Cucumber Test Report",
    customData: {
      title: "Execution Details",
      data: [
        { label: "Executed at", value: new Date().toLocaleString() },
        { label: "Project", value: "k6-cucumber-steps" },
      ],
    },
    pageFooter: `<div><strong><a href="k6-report.html" target="_blank">View K6 Report</a></strong></div>`,
  });
}

module.exports = generateHtmlReports;
