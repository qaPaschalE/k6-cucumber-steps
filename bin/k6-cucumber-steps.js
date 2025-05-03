#!/usr/bin/env node

console.log("-----------------------------------------");
console.log("🚀 Starting k6-cucumber-steps execution...");
console.log("-----------------------------------------");

const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
require("dotenv").config();
const yargs = require("yargs");

// Parse CLI arguments
const argv = yargs
  .usage("Usage: $0 run [options]")
  .option("feature", {
    alias: "f",
    describe: "Path to the feature file",
    type: "string",
  })
  .option("tags", {
    alias: "t",
    describe: "Cucumber tags to filter scenarios (e.g., @smoke)",
    type: "string",
  })
  .option("reporter", {
    alias: "r",
    describe: "Generate HTML and JSON reports in the reports directory",
    type: "boolean",
    default: false,
  })
  .option("overwrite", {
    alias: "o",
    describe: "Overwrite existing reports instead of appending them",
    type: "boolean",
    default: false,
  })
  .help().argv;

// Base Cucumber command and arguments
const cucumberArgs = [
  "cucumber-js",
  "--require-module",
  "@babel/register",
  "--require",
  path.resolve(__dirname, "../step_definitions"),
  "--format",
  "summary",
  "--format",
  "progress", // Progress bar format
];

// Add tags from CLI or environment variables
if (argv.tags) {
  cucumberArgs.push("--tags", argv.tags);
} else if (process.env.TAGS) {
  cucumberArgs.push("--tags", process.env.TAGS);
}

// Add feature file if provided
if (argv.feature) {
  cucumberArgs.push(path.resolve(process.cwd(), argv.feature));
}

// Add reporting options if enabled
if (argv.reporter) {
  const reportsDir = path.resolve(process.cwd(), "reports");
  try {
    fs.mkdirSync(reportsDir, { recursive: true }); // Ensure reports directory exists
  } catch (err) {
    console.error(`Failed to create reports directory: ${err.message}`);
    process.exit(1);
  }
  cucumberArgs.push(
    "--format",
    `json:${path.join(reportsDir, "load-results.json")}`,
    "--format",
    `html:${path.join(reportsDir, "load-results.html")}`
  );
}

// Execute the Cucumber process
const cucumberProcess = spawn("npx", cucumberArgs, {
  stdio: "inherit",
  env: {
    ...process.env,
    K6_CUCUMBER_OVERWRITE: argv.overwrite ? "true" : "false",
  },
});

cucumberProcess.on("close", (code) => {
  if (code === 0) {
    console.log("-----------------------------------------");
    console.log("✅ k6-cucumber-steps execution completed successfully.");
    console.log("-----------------------------------------");
  } else {
    console.error("-----------------------------------------");
    console.error("❌ k6-cucumber-steps execution failed.");
    console.error("-----------------------------------------");
  }
  process.exit(code);
});
