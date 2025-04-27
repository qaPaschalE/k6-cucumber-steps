// cucumber.js

module.exports = {
  require: ["./step_definitions/**/*.js"],
  format: [
    "summary",
    "json:reports/load-report.json",
    "html:reports/report.html",
  ],
  // Specify the path to your features folder here
  paths: ["./features"],
  tags: "@loadTest", // Default tag for load tests
};
