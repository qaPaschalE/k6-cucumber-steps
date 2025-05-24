module.exports = {
  default: {
    // require: ["./step_definitions/**/*.js"],
    format: [
      "summary",
      "json:./src/examples/reports/load-report.json",
      "html:./src/examples/reports/report.html",
    ],
    paths: ["./features/bsp.feature"],
    tags: "@rate-limit",
    worldParameters: {
      payloadPath: "src/examples/payloads",
    },
    overwrite: true,
    reporter: true,
  },
};
