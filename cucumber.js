// cucumber.js

module.exports = {
  require: ["./step_definitions/**/*.js"],
  format: [
    "summary",
    "json:src/examples/reports/load-report.json",
    "html:src/examples/reports/report.html",
  ],
  // Specify the path to your features folder here
  paths: ["./src/examples/features/loadTestTemplate.feature"],
  tags: "@loadTest", // Default tag for load tests
  overwrite: false, // Default to not overwrite the report file
};
