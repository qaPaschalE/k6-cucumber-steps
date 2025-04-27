#!/usr/bin/env node

console.log("-----------------------------------------");
console.log("🚀 Starting k6-cucumber-steps execution...");
console.log("-----------------------------------------");

const path = require("path");
const { spawn } = require("child_process");
require("dotenv").config();
const argv = require("yargs")
  .usage("Usage: $0 run [options]") // Removed the --feature requirement from usage
  .option("feature", {
    alias: "f",
    describe: "Path to the feature file",
    type: "string",
  }) // Keep the option but don't demand it
  .option("tags", { alias: "t", describe: "Cucumber tags", type: "string" })
  .option("reporter", {
    alias: "r",
    describe: "Generate reports",
    type: "boolean",
    default: false,
  })
  .help().argv;

const cucumberCommand = "npx";
const cucumberArgs = [
  "cucumber-js",
  "--require-module",
  "@babel/register",
  "--require",
  path.resolve(
    process.cwd(),
    "node_modules",
    "k6-cucumber-steps",
    "step_definitions"
  ),
  "--require",
  path.resolve(process.cwd(), "step_definitions"), // Keep the user's local step definitions as well
  "--format",
  "summary",
  "--format",
  "cucumber-console-formatter", // Add this line
];

// Explicitly add tags, defaulting to '@loadTest' if no TAGS env variable is set
const tagsFromEnv = process.env.TAGS || "@loadTest";
cucumberArgs.push("--tags", tagsFromEnv);

if (argv.feature) {
  cucumberArgs.push(path.resolve(process.cwd(), argv.feature));
}

if (argv.reporter) {
  const reportsDir = path.resolve(process.cwd(), "reports");
  cucumberArgs.push(
    "--format",
    `json:${reportsDir}/load-results.json`,
    "--format",
    `html:${reportsDir}/load-results.html`
  );
}

async function main() {
  const cucumberProcess = spawn(cucumberCommand, cucumberArgs, {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  cucumberProcess.on("close", (code) => {
    process.exit(code);
  });
}

main().catch((err) => console.error(err));
