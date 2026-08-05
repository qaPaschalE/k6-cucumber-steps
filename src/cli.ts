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
  .option("--add-prefix <string>", "Add a prefix to all generated step definitions (e.g., 'load test')")
  .option("--ci <provider>", "Generate CI/CD pipeline configuration (e.g., github, gitlab)")
  .argument("[path]", "Output directory path", ".")
  .action(async (path, options) => {
    const initCmd = new InitCommand();
    await initCmd.execute(path, options.lang as "js" | "ts", options.addPrefix, options.ci);
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
  .option("--exclude-tags <tags>", "Exclude scenarios by tags (comma-separated)")
  .option("-l, --lang <language>", "Output language (js or ts)", "ts")
  .option("--tags <tags>", "Filter scenarios by tags")
  .action(async (options) => {
    await generateK6Scripts(options);
  });


// Define options interface (at top of file)
interface GenerateOptions {
  features?: string;
  output?: string;
  lang?: "js" | "ts";
  tags?: string;
  excludeTags?: string;
}

function loadConfig(): Partial<GenerateOptions> {
  const configPath = process.cwd() + "/k6-cucumber.json";
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (e) {
      console.warn("⚠️  Warning: Failed to parse k6-cucumber.json");
    }
  }
  return {};
}

async function generateK6Scripts(cliOptions: GenerateOptions) {
  const fileConfig = loadConfig();
  const options = {
    features: cliOptions.features !== "./features" ? cliOptions.features : (fileConfig.features || cliOptions.features),
    output: cliOptions.output !== "./generated" ? cliOptions.output : (fileConfig.output || cliOptions.output),
    lang: cliOptions.lang !== "ts" ? cliOptions.lang : (fileConfig.lang || cliOptions.lang),
    tags: cliOptions.tags || fileConfig.tags,
    excludeTags: cliOptions.excludeTags || fileConfig.excludeTags,
  };

  console.log("Generating k6 scripts from feature files...");
  console.log(`📂 Searching for feature files in: ${options.features}`);

  const parser = new FeatureParser();
  const features = await parser.loadAndParseFeatures(options.features || "./features");

  console.log(`✅ Found ${features.length} feature file(s)`);
  
  // Count total scenarios before filtering
  const totalScenarios = features.reduce((sum, f) => sum + f.scenarios.length, 0);
  console.log(`📋 Total scenarios found: ${totalScenarios}`);

  // Include by tags
  if (options.tags) {
    const includeTags = options.tags.split(",").map(t => t.trim().replace(/^@/, '')).filter(t => t);
    console.log(`🏷️  Including scenarios with tags: ${includeTags.join(', ')}`);
    
    let beforeCount = totalScenarios;
    features.forEach((feature) => {
      feature.scenarios = feature.scenarios.filter((scenario: any) =>
        includeTags.some(tag => scenario.tags.includes(tag))
      );
    });
    
    const afterCount = features.reduce((sum, f) => sum + f.scenarios.length, 0);
    console.log(`   Filtered: ${beforeCount} → ${afterCount} scenarios`);
  }

  // Exclude by tags
  if (options.excludeTags) {
    const excludeTags = options.excludeTags.split(",").map(t => t.trim().replace(/^@/, '')).filter(t => t);
    console.log(`🚫 Excluding scenarios with tags: ${excludeTags.join(', ')}`);
    
    let beforeCount = features.reduce((sum, f) => sum + f.scenarios.length, 0);
    features.forEach((feature) => {
      feature.scenarios = feature.scenarios.filter((scenario: any) =>
        !excludeTags.some(tag => scenario.tags.includes(tag))
      );
    });
    
    const afterCount = features.reduce((sum, f) => sum + f.scenarios.length, 0);
    console.log(`   Filtered: ${beforeCount} → ${afterCount} scenarios`);
  }
  
  // Flatten all scenarios
  const allScenarios = features.flatMap((f) => f.scenarios);
  const metadata = parser.loadScenarioMetadata(allScenarios);

  console.log(`📝 Processing ${allScenarios.length} scenario(s) for script generation...`);

  const generator = new K6ScriptGenerator();
  const config: ProjectConfig = {
    language: options.lang as "js" | "ts",
    featuresDir: options.features || "./features",
    outputDir: options.output || "./generated",
    includeHtmlReporter: true,
    author: "Enyimiri Chetachi Paschal (qaPaschalE)",
    version: packageJson.version,
  };

  const k6Script = generator.generateK6File(allScenarios, metadata, config);

  const outputDir = options.output || "./generated";

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = `${outputDir}/test.generated.${options.lang}`;
  fs.writeFileSync(outputFile, k6Script);

  console.log(`✅ Generated k6 script: ${outputFile}`);
  console.log(`📋 Scenarios processed: ${allScenarios.length}`);
}

program.parse();
