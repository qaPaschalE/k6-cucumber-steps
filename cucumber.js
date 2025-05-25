module.exports = {
  default: {
    // require: ["./step_definitions/**/*.js"],
    format: [
      "summary",
      "json:./reports/load-report.json",
      "html:./reports/cucumber-report.html",
    ],
    paths: ["./features/bsp.feature"],
    tags: "@load",
    worldParameters: {
      payloadPath: "src/examples/payloads",
    },
    overwrite: true,
    reporter: true,
  },
};
