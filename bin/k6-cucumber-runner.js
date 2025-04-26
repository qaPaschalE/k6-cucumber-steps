#!/usr/bin/env node

const path = require("path");
const { runCucumber } = require("@cucumber/cucumber/api");
require("dotenv").config();

const argv = require("yargs")
  .usage("Usage: $0 run --feature <path> [options]")
  .option("feature", {
    alias: "f",
    describe: "Path to the feature file",
    type: "string",
    demandOption: true,
  })
  .help().argv;

const featureFilePath = path.resolve(process.cwd(), argv.feature);

async function main() {
  try {
    console.log(`Running tests for feature file: ${featureFilePath}`);

    const result = await runCucumber({
      argv: [
        "node",
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
      ],
      cwd: process.cwd(),
      featurePaths: [featureFilePath],
      format: ["summary"],
    });

    if (!result.success) {
      console.error("K6 Cucumber tests failed.");
      process.exit(1);
    }

    console.log("K6 Cucumber tests finished successfully.");
  } catch (error) {
    console.error("An error occurred during K6 Cucumber execution:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("An unexpected error occurred:", err);
  process.exit(1);
});
