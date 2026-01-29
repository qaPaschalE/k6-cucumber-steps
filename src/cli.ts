#!/usr/bin/env node
// src/cli.ts
import { program } from "commander";
import { InitCommand } from "./commands/init.command";
import { FeatureParser } from "./generators/feature.parser";
import { K6ScriptGenerator } from "./generators/k6-script.generator";
import { ProjectConfig } from "./types";
import fs from "fs";

// Package info
const packageJson = require("../package.json");

program
  .name("k6-cucumber-steps")
  .description("Generate k6 test scripts from Cucumber feature files")
  .version(packageJson.version);

program
  .command("init")
  .description("Initialize a new k6-cucumber project")
  .option("-l, --lang <language>", "Programming language (js or ts)", "ts")
  .argument("[path]", "Output directory path", ".")
  .action(async (path, options) => {
    const initCmd = new InitCommand();
    await initCmd.execute(path, options.lang as "js" | "ts");
  });

program
  .command("generate")
  .description("Generate k6 scripts from feature files")
  .option("-f, --features <path>", "Path to feature files", "./features")
  .option(
    "-o, --output <path>",
    "Output path for generated scripts",
    "./generated",
  )
  .option("-l, --lang <language>", "Output language (js or ts)", "ts")
  .option("--tags <tags>", "Filter scenarios by tags")
  .action(async (options) => {
    await generateK6Scripts(options);
  });

async function generateK6Scripts(options: any) {
  console.log("Generating k6 scripts from feature files...");

  const parser = new FeatureParser();
  const features = await parser.loadAndParseFeatures(options.features);

  // Filter by tags if provided
  if (options.tags) {
    const tagFilters = options.tags.split(",");
    features.forEach((feature) => {
      feature.scenarios = feature.scenarios.filter((scenario: any) =>
        tagFilters.some((filter: any) => scenario.tags.includes(filter)),
      );
    });
  }

  // Flatten all scenarios
  const allScenarios = features.flatMap((f) => f.scenarios);
  const metadata = parser.loadScenarioMetadata(allScenarios);

  const generator = new K6ScriptGenerator();
  const config: ProjectConfig = {
    language: options.lang as "js" | "ts",
    featuresDir: options.features,
    outputDir: options.output,
    includeHtmlReporter: true,
    author: "Enyimiri Chetachi Paschal (qaPaschalE)",
    version: packageJson.version,
  };

  const k6Script = generator.generateK6File(allScenarios, metadata, config);

  // Ensure output directory exists
  if (!fs.existsSync(options.output)) {
    fs.mkdirSync(options.output, { recursive: true });
  }

  const outputFile = `${options.output}/test.generated.${options.lang}`;
  fs.writeFileSync(outputFile, k6Script);

  console.log(`✅ Generated k6 script: ${outputFile}`);
  console.log(`📋 Scenarios processed: ${allScenarios.length}`);
}

program.parse();
