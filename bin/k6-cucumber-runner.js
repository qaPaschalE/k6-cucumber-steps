#!/usr/bin/env node

const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
require("dotenv").config();
const yargs = require("yargs");

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
  .option("configFile", {
    alias: "c",
    describe: "Custom cucumber config file name (default: cucumber.js)",
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

const cucumberArgs = [
  "cucumber-js",
  "--require-module",
  "@babel/register",
  "--require",
  path.resolve(__dirname, "../step_definitions"),
  "--format",
  "summary",
  "--format",
  "progress",
];

// Handle dynamic config file name
const configFileName =
  "cucumber.js" || process.env.CUCUMBER_CONFIG_FILE || argv.configFile;
const cucumberConfigPath = path.resolve(process.cwd(), configFileName);
if (fs.existsSync(cucumberConfigPath)) {
  cucumberArgs.push("--config", cucumberConfigPath);
}

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
    fs.mkdirSync(reportsDir, { recursive: true });
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

const cucumberProcess = spawn("npx", cucumberArgs, {
  stdio: "inherit",
  env: {
    ...process.env,
    K6_CUCUMBER_OVERWRITE: argv.overwrite ? "true" : "false",
  },
});

cucumberProcess.on("close", (code) => {
  if (code === 0) {
    console.log("✅ k6-cucumber-steps execution completed successfully.");
  } else {
    console.error("❌ k6-cucumber-steps execution failed.");
  }
  process.exit(code);
});
