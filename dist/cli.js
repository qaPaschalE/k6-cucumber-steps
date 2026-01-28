#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/cli.ts
const commander_1 = require("commander");
const init_command_1 = require("./commands/init.command");
const feature_parser_1 = require("./generators/feature.parser");
const k6_script_generator_1 = require("./generators/k6-script.generator");
const fs_1 = __importDefault(require("fs"));
// Package info
const packageJson = require("../package.json");
commander_1.program
    .name("k6-cucumber-steps")
    .description("Generate k6 test scripts from Cucumber feature files")
    .version(packageJson.version);
commander_1.program
    .command("init")
    .description("Initialize a new k6-cucumber project")
    .option("-l, --lang <language>", "Programming language (js or ts)", "ts")
    .argument("[path]", "Output directory path", "./k6-test-project")
    .action(async (path, options) => {
    const initCmd = new init_command_1.InitCommand();
    await initCmd.execute(path, options.lang);
});
commander_1.program
    .command("generate")
    .description("Generate k6 scripts from feature files")
    .option("-f, --features <path>", "Path to feature files", "./features")
    .option("-o, --output <path>", "Output path for generated scripts", "./generated")
    .option("-l, --lang <language>", "Output language (js or ts)", "ts")
    .option("--tags <tags>", "Filter scenarios by tags")
    .action(async (options) => {
    await generateK6Scripts(options);
});
async function generateK6Scripts(options) {
    console.log("Generating k6 scripts from feature files...");
    const parser = new feature_parser_1.FeatureParser();
    const features = await parser.loadAndParseFeatures(options.features);
    // Filter by tags if provided
    if (options.tags) {
        const tagFilters = options.tags.split(",");
        features.forEach((feature) => {
            feature.scenarios = feature.scenarios.filter((scenario) => tagFilters.some((filter) => scenario.tags.includes(filter)));
        });
    }
    // Flatten all scenarios
    const allScenarios = features.flatMap((f) => f.scenarios);
    const metadata = parser.loadScenarioMetadata(allScenarios);
    const generator = new k6_script_generator_1.K6ScriptGenerator();
    const config = {
        language: options.lang,
        featuresDir: options.features,
        outputDir: options.output,
        includeHtmlReporter: true,
        author: "Enyimiri Chetachi Paschal (qaPaschalE)",
        version: packageJson.version,
    };
    const k6Script = generator.generateK6File(allScenarios, metadata, config);
    // Ensure output directory exists
    if (!fs_1.default.existsSync(options.output)) {
        fs_1.default.mkdirSync(options.output, { recursive: true });
    }
    const outputFile = `${options.output}/test.generated.${options.lang}`;
    fs_1.default.writeFileSync(outputFile, k6Script);
    console.log(`✅ Generated k6 script: ${outputFile}`);
    console.log(`📋 Scenarios processed: ${allScenarios.length}`);
}
commander_1.program.parse();
//# sourceMappingURL=cli.js.map