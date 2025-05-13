module.exports = {
  default: {
    require: ["./step_definitions/**/*.js"],
    format: [
      "summary",
      "json:./src/examples/reports/load-report.json",
      "html:./src/examples/reports/report.html",
    ],
    paths: ["./src/examples/features/*.feature"],
    tags: "@load",
    worldParameters: {
      payloadPath: "src/examples/payloads",
    },
    overwrite: true,
    reporter: true,
  },
};
