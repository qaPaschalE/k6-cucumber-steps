#!/usr/bin/env node
//bin/k6-cucumber-steps.js
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const yargs = require("yargs");
require("dotenv").config();
const { generateHtmlReports } = require("../scripts/generateHtmlReports");
const { linkReports } = require("../scripts/linkReports");

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
const cleanReportsDir = () => {
  if (fs.existsSync(reportsDir)) {
    try {
      fs.rmSync(reportsDir, { recursive: true, force: true });
      console.log("🧹 Cleaned existing reports directory.");
    } catch (err) {
      console.error("❌ Failed to clean reports directory:", err.message);
      process.exit(1);
    }
  }

  try {
    fs.mkdirSync(reportsDir, { recursive: true });
    console.log("📁 Created fresh reports directory.");
  } catch (err) {
    console.error("❌ Failed to create reports directory:", err.message);
    process.exit(1);
  }
};

cleanReportsDir();

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

let baseReportName = "load-report";
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

let reportJsonPath = "reports/load-report.json";
let reportHtmlPath = path.join(reportsDir, `${baseReportName}.html`);

// 🆕 Respect config format path if defined
if (Array.isArray(configOptions.format)) {
  const jsonFmt = configOptions.format.find((f) => f.startsWith("json:"));
  if (jsonFmt) {
    reportJsonPath = jsonFmt.split("json:")[1];
    console.log(`📝 Using report path from config: ${reportJsonPath}`);
  }
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

function detectMostRecentK6Report() {
  const reportsDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) return null;

  const files = fs
    .readdirSync(reportsDir)
    .filter((file) => /^k6-report.*\.html$/.test(file))
    .map((file) => ({
      name: file,
      time: fs.statSync(path.join(reportsDir, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  return files.length > 0 ? path.join("reports", files[0].name) : null;
}

cucumberProcess.on("close", async (code) => {
  if (code === 0) {
    console.log("-----------------------------------------");
    console.log("✅ k6-cucumber-steps execution completed successfully.");

    generateHtmlReports(); // 🍋 Cucumber HTML

    console.log(
      "🚀 Cucumber HTML report reports/cucumber-report.html generated successfully 👍"
    );

    await linkReports(); // 🧬 Combine and link reports

    console.log(
      "📦 Combined and minified HTML report available at: reports/combined-report.html"
    );
    console.log("-----------------------------------------");
  } else {
    console.error("-----------------------------------------");
    console.error("❌ k6-cucumber-steps execution failed.");
    console.error("-----------------------------------------");
  }

  process.exit(code);
});
