#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const yargs = require("yargs");
require("dotenv").config();

console.log(`
  -----------------------------------------
  🚀 Starting k6-cucumber-steps execution...
  -----------------------------------------
`);

const argv = yargs
  .usage("Usage: $0 run [options]")
  .option("feature", {
    alias: "f",
    describe: "Path to the feature file",
    type: "string",
  })
  .option("tags", {
    alias: "t",
    describe: "Cucumber tags to filter scenarios",
    type: "string",
  })
  .option("reporter", {
    alias: "r",
    describe: "Enable HTML and JSON reports",
    type: "boolean",
    default: false,
  })
  .option("overwrite", {
    alias: "o",
    describe: "Overwrite existing reports",
    type: "boolean",
    default: false,
  })
  .option("configFile", {
    alias: "c",
    describe: "Custom cucumber config file",
    type: "string",
  })
  .help().argv;

const cucumberArgs = ["cucumber-js"];

const configFileName =
  argv.configFile || process.env.CUCUMBER_CONFIG_FILE || "cucumber.js";
const configFilePath = path.resolve(process.cwd(), configFileName);

let configOptions = {};
if (fs.existsSync(configFilePath)) {
  cucumberArgs.push("--config", configFileName);
  try {
    const loadedConfig = require(configFilePath);
    configOptions = loadedConfig.default || loadedConfig;
  } catch {
    console.warn("⚠️  Could not load config file");
  }
}

// Tags
const tags = argv.tags || process.env.TAGS || configOptions.tags;
if (tags) {
  cucumberArgs.push("--tags", tags);
}

// Feature path(s)
let featureFiles = [];
if (argv.feature) {
  featureFiles.push(path.resolve(argv.feature));
} else if (configOptions.paths && configOptions.paths.length > 0) {
  featureFiles.push(...configOptions.paths);
}
if (featureFiles.length > 0) {
  cucumberArgs.push(...featureFiles);
}

// Require default step definitions
const defaultStepsPath = path.resolve(
  process.cwd(),
  "node_modules",
  "k6-cucumber-steps",
  "step_definitions"
);
cucumberArgs.push("--require", defaultStepsPath);

// Also require additional custom step definitions from config, if any
if (configOptions.require && Array.isArray(configOptions.require)) {
  for (const reqPath of configOptions.require) {
    cucumberArgs.push("--require", reqPath);
  }
}

// Determine base report name
const reportsDir = path.join(process.cwd(), "reports");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

let baseReportName = "load-results";
if (featureFiles.length === 1) {
  const nameFromFeature = path.basename(featureFiles[0], ".feature");
  baseReportName = nameFromFeature || baseReportName;
} else if (featureFiles.length > 1) {
  baseReportName = "multi-feature";
}

const shouldGenerateReports = argv.reporter || configOptions.reporter || false;
const shouldOverwrite =
  argv.overwrite ||
  process.env.K6_CUCUMBER_OVERWRITE === "true" ||
  configOptions.overwrite === true;

let reportJsonPath = path.join(reportsDir, `${baseReportName}.json`);
let reportHtmlPath = path.join(reportsDir, `${baseReportName}.html`);

if (!shouldOverwrite) {
  reportJsonPath = path.join(reportsDir, `${baseReportName}-${timestamp}.json`);
  reportHtmlPath = path.join(reportsDir, `${baseReportName}-${timestamp}.html`);
}

const formatInConfig =
  Array.isArray(configOptions.format) && configOptions.format.length > 0;

if (shouldGenerateReports && !formatInConfig) {
  fs.mkdirSync(reportsDir, { recursive: true });
  cucumberArgs.push("--format", `summary`);
  cucumberArgs.push("--format", `json:${reportJsonPath}`);
  cucumberArgs.push("--format", `html:${reportHtmlPath}`);
}

console.log("\n▶️ Final arguments passed to cucumber-js:");
console.log(["npx", ...cucumberArgs].join(" ") + "\n");

const cucumberProcess = spawn("npx", cucumberArgs, {
  stdio: "inherit",
  env: {
    ...process.env,
    K6_CUCUMBER_OVERWRITE: shouldOverwrite ? "true" : "false",
    TAGS: tags,
    FEATURE_PATH: featureFiles.join(","),
    REPORT_JSON_PATH: reportJsonPath,
    REPORT_HTML_PATH: reportHtmlPath,
  },
});

cucumberProcess.on("close", (code) => {
  console.log(`\n-----------------------------------------`);
  if (code === 0) {
    console.log("✅ k6-cucumber-steps execution completed successfully.");
  } else {
    console.error("❌ k6-cucumber-steps execution failed.");
  }
  console.log(`-----------------------------------------\n`);
  process.exit(code);
});
