module.exports = {
  default: {
    require: ["./step_definitions/**/*.js"],
    format: [
      "summary",
      "json:./src/examples/reports/load-report.json",
      "html:./src/examples/reports/report.html",
    ],
    paths: ["./src/examples/features/loadTestTemplate.feature"],
    tags: process.env.TAGS,
    overwrite: true,
    reporter: true,
  },
};
