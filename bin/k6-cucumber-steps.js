#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const yargs = require("yargs");
require("dotenv").config();

// 🚀 Welcome Message
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

console.log(`🔍 Looking for config file: ${configFileName}`);
console.log(`📁 Resolved config file path: ${configFilePath}`);

let configOptions = {};
if (fs.existsSync(configFilePath)) {
  console.log("✅ Config file found, including in cucumber arguments...");
  cucumberArgs.push("--config", configFileName);

  try {
    const loadedConfig = require(configFilePath);
    configOptions = loadedConfig.default || loadedConfig;
  } catch (err) {
    console.warn("⚠️  Failed to load options from config file.");
  }
} else {
  console.warn("⚠️  Config file not found, skipping...");
}

// Tags
const tags = argv.tags || process.env.TAGS || configOptions.tags;
if (tags) {
  cucumberArgs.push("--tags", tags);
}

// Feature file(s)
const feature = argv.feature || process.env.FEATURE_PATH;
if (feature) {
  cucumberArgs.push(path.resolve(process.cwd(), feature));
} else if (configOptions.paths && configOptions.paths.length > 0) {
  cucumberArgs.push(...configOptions.paths);
}

// Reporting
const reportsDir = path.join(process.cwd(), "reports");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

const shouldGenerateReports = argv.reporter || configOptions.reporter || false;

const shouldOverwrite =
  argv.overwrite ||
  process.env.K6_CUCUMBER_OVERWRITE === "true" ||
  configOptions.overwrite === true;

// Build base names from feature file(s)
let baseNames = [];

if (feature) {
  baseNames = [path.basename(feature, path.extname(feature))];
} else if (configOptions.paths && configOptions.paths.length > 0) {
  baseNames = configOptions.paths.map((p) => path.basename(p, path.extname(p)));
} else {
  baseNames = ["load-results"];
}

// Generate report paths
const reportPaths = baseNames.map((base) => {
  const jsonName = shouldOverwrite
    ? `${base}.json`
    : `${base}-${timestamp}.json`;
  const htmlName = shouldOverwrite
    ? `${base}.html`
    : `${base}-${timestamp}.html`;

  return {
    json: path.join(reportsDir, jsonName),
    html: path.join(reportsDir, htmlName),
  };
});

// Inject report formats into cucumber arguments
if (shouldGenerateReports) {
  fs.mkdirSync(reportsDir, { recursive: true });

  cucumberArgs.push("--format", "summary");

  reportPaths.forEach(({ json, html }) => {
    cucumberArgs.push("--format", `json:${json}`);
    cucumberArgs.push("--format", `html:${html}`);
  });
}

console.log("📝 Reporter Enabled:", shouldGenerateReports);
console.log("📝 Overwrite Enabled:", shouldOverwrite);

console.log("\n▶️ Final arguments passed to cucumber-js:");
console.log(["npx", ...cucumberArgs].join(" ") + "\n");

const cucumberProcess = spawn("npx", cucumberArgs, {
  stdio: "inherit",
  env: {
    ...process.env,
    K6_CUCUMBER_OVERWRITE: shouldOverwrite ? "true" : "false",
    TAGS: tags,
    FEATURE_PATH: feature,
    REPORT_JSON_PATH: reportPaths[0]?.json,
    REPORT_HTML_PATH: reportPaths[0]?.html,
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
