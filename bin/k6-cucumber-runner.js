#!/usr/bin/env node

const path = require("path");
const { spawn } = require("child_process");
require("dotenv").config();
const argv = require("yargs")
  .usage("Usage: $0 run --feature <path> [options]")
  .option("feature", {
    alias: "f",
    describe: "Path to the feature file",
    type: "string",
    demandOption: true,
  })
  .option("tags", { alias: "t", describe: "Cucumber tags", type: "string" })
  .option("reporter", {
    alias: "r",
    describe: "Generate reports",
    type: "boolean",
    default: false,
  })
  .help().argv;

const featureFilePath = path.resolve(process.cwd(), argv.feature);
const cucumberCommand = "npx";
const cucumberArgs = [
  "cucumber-js",
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

if (argv.tags) cucumberArgs.push("--tags", argv.tags);
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
  const fullCommand = `${cucumberCommand} ${cucumberArgs.join(" ")}`;
  console.log(`Running Cucumber using command: ${fullCommand}`);

  const cucumberProcess = spawn(cucumberCommand, cucumberArgs, {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  cucumberProcess.on("close", (code) => {
    process.exit(code);
  });
}

main().catch((err) => console.error(err));
