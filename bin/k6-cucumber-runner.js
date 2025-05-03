#!/usr/bin/env node

console.log("-----------------------------------------");
console.log("🚀 Starting k6-cucumber-steps execution...");
console.log("-----------------------------------------");

const path = require("path");
const { spawn } = require("child_process");
require("dotenv").config();
const argv = require("yargs")
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
    describe: "Generate HTML and JSON reports in the `reports` directory",
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
  path.resolve(process.cwd(), "step_definitions"), // Include user's local step definitions
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
    require("fs").mkdirSync(reportsDir, { recursive: true }); // Ensure reports directory exists
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

/**
 * Main function to execute the Cucumber process.
 */
async function main() {
  try {
    const cucumberProcess = spawn(cucumberCommand, cucumberArgs, {
      cwd: process.cwd(),
      stdio: "inherit", // Inherit stdout/stderr for real-time logging
      env: {
        ...process.env,
        K6_CUCUMBER_OVERWRITE: argv.overwrite, // Pass overwrite flag to environment
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
  } catch (error) {
    console.error("An unexpected error occurred:", error.message);
    process.exit(1);
  }
}

main().catch((err) => console.error(err));
