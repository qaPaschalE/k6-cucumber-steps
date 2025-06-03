module.exports = {
  default: {
    require: ["./step_definitions/**/*.js"],
    format: [
      "summary",
      "json:./reports/load-report.json",
      "html:./reports/cucumber-report.html",
    ],
    paths: ["./features/bsp.feature"],
    tags: "@rate-limit",
    worldParameters: {
      payloadPath: "payloads",
    },
    overwrite: true,
    reporter: true,
  },
};
