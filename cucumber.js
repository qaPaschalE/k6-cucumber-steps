/**
 * @module cucumber
 * @description
 * This module configures the Cucumber.js test runner for load testing with k6.
 * It specifies the paths to feature files, step definitions, and the output format.
 * It also sets the timeout for each test and allows for filtering tests by tags.
 */
const reporter = require("cucumber-html-reporter");
module.exports = {
  default: {
    require: ["step_definitions/world.js", "step_definitions/*.js"],
    paths: ["src/features/*.k6.feature"],
    format: ["progress", "json:reports/load-results.json"],
    timeout: 60000,
    tags: process.env.TAGS || "@load",
  },
};

// // Generate an HTML report after tests complete
// reporter.generate({
//   theme: "bootstrap",
//   jsonFile: "reports/load-results.json",
//   output: "reports/report.html",
//   reportSuiteAsScenarios: true,
//   scenarioTimestamp: true,
// });
