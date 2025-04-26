#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
require("dotenv").config();

// Use yargs for better argument parsing
const argv = require("yargs")
  .usage("Usage: $0 run --feature <path> [options]")
  .option("feature", {
    alias: "f",
    describe: "Path to the feature file",
    type: "string",
    demandOption: true,
  })
  .option("tags", {
    alias: "t",
    describe:
      "Cucumber tags to filter scenarios (e.g., '@smoke and not @integration')",
    type: "string",
  })
  .option("reporter", {
    alias: "r",
    describe: "Generate HTML and JSON reports in the reports directory",
    type: "boolean",
    default: false,
  })
  .help().argv;

const featureFilePath = path.resolve(process.cwd(), argv.feature);
const cucumberCommand = "npx"; // Changed to "npx"
const cucumberArgs = [
  "cucumber-js", // Now cucumber-js is an argument to npx
  featureFilePath,
  "--require-module",
  "@babel/register",
  "--require",
  path.resolve(
    process.cwd(),
    "node_modules",
    "k6-cucumber-steps",
    "step_definitions"
  ),
  "--format",
  "summary",
];

if (argv.tags) {
  cucumberArgs.push("--tags", argv.tags);
}

if (argv.reporter) {
  const reportsDir = path.resolve(process.cwd(), "reports");
  // Ensure reports directory will be created by cucumber-js if needed
  cucumberArgs.push("--format", `json:${reportsDir}/load-results.json`);
  cucumberArgs.push("--format", `html:${reportsDir}/load-results.html`);
}

async function main() {
  const fullCommand = `${cucumberCommand} ${cucumberArgs.join(" ")}`;
  console.log(`Running Cucumber using command: ${fullCommand}`);

  const cucumberProcess = spawn(cucumberCommand, cucumberArgs, {
    cwd: process.cwd(),
    stdio: "inherit", // Forward stdout and stderr to the console
  });

  cucumberProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`Cucumber process exited with code ${code}`);
      process.exit(code);
    } else {
      console.log(
        "Cucumber tests finished successfully. Check k6 output for performance results (if any steps ran k6)."
      );
    }
  });
}

main().catch((err) => {
  console.error("An unexpected error occurred:", err.message);
  process.exit(1);
});
