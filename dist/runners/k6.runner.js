"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.K6Runner = void 0;
// src/runners/k6.runner.ts
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const feature_parser_1 = require("../generators/feature.parser");
const k6_script_generator_1 = require("../generators/k6-script.generator");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class K6Runner {
    async runFromFeatures(featuresPath, outputScriptPath, options = {}) {
        console.log("Loading and parsing feature files...");
        const parser = new feature_parser_1.FeatureParser();
        let features = await parser.loadAndParseFeatures(featuresPath);
        // Apply tag filtering if specified
        if (options.tags) {
            const tagFilters = options.tags.split(",");
            features = this.filterFeaturesByTags(features, tagFilters);
        }
        // Apply group filtering if specified
        if (options.group) {
            features = this.filterFeaturesByGroup(features, options.group);
        }
        console.log(`Found ${features.length} feature files`);
        // Get all scenarios from filtered features
        const allScenarios = features.flatMap((f) => f.scenarios);
        console.log(`Processing ${allScenarios.length} scenarios`);
        // Load metadata from scenarios
        const metadata = parser.loadScenarioMetadata(allScenarios);
        // Generate k6 script
        const generator = new k6_script_generator_1.K6ScriptGenerator();
        const config = {
            language: options.language || "ts",
            featuresDir: featuresPath,
            outputDir: path_1.default.dirname(outputScriptPath || "./generated"),
            includeHtmlReporter: true,
            author: "Enyimiri Chetachi Paschal (qaPaschalE)",
            version: require("../../package.json").version,
        };
        const k6Script = generator.generateK6File(allScenarios, metadata, config);
        // Write the generated script
        const finalOutputPath = outputScriptPath || `./generated/test.generated.${config.language}`;
        const outputDir = path_1.default.dirname(finalOutputPath);
        if (!fs_1.default.existsSync(outputDir)) {
            fs_1.default.mkdirSync(outputDir, { recursive: true });
        }
        fs_1.default.writeFileSync(finalOutputPath, k6Script);
        console.log(`Generated k6 script: ${finalOutputPath}`);
        // Run the k6 test
        await this.runK6Test(finalOutputPath, options.additionalK6Options);
    }
    async runK6Test(scriptPath, additionalOptions) {
        console.log("Running k6 test...");
        const options = ["run", scriptPath];
        if (additionalOptions) {
            options.push(...additionalOptions);
        }
        const k6Command = `k6 ${options.join(" ")}`;
        console.log(`Executing: ${k6Command}`);
        try {
            const { stdout, stderr } = await execAsync(k6Command);
            if (stdout) {
                console.log(stdout);
            }
            if (stderr) {
                console.error(stderr);
            }
            console.log("K6 test completed successfully");
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`K6 test failed: ${error.message}`);
                if (error.stderr) {
                    console.error(error.stderr);
                }
                throw error;
            }
            else {
                console.error(`K6 test failed with unknown error:`, error);
                throw new Error("K6 test execution failed");
            }
        }
    }
    async runGeneratedScript(scriptPath, options) {
        if (!fs_1.default.existsSync(scriptPath)) {
            throw new Error(`Generated script does not exist: ${scriptPath}`);
        }
        await this.runK6Test(scriptPath, options);
    }
    filterFeaturesByTags(features, tagFilters) {
        return features
            .map((feature) => ({
            ...feature,
            scenarios: feature.scenarios.filter((scenario) => tagFilters.some((filter) => scenario.tags.includes(filter))),
        }))
            .filter((feature) => feature.scenarios.length > 0); // Remove features with no matching scenarios
    }
    filterFeaturesByGroup(features, group) {
        return features
            .map((feature) => ({
            ...feature,
            scenarios: feature.scenarios.filter((scenario) => scenario.tags.some((tag) => tag.startsWith("group:") && tag.includes(group))),
        }))
            .filter((feature) => feature.scenarios.length > 0); // Remove features with no matching scenarios
    }
    async runWithFilters(featuresPath, filters) {
        const additionalOptions = [];
        if (filters.vus) {
            additionalOptions.push(`--vus ${filters.vus}`);
        }
        if (filters.duration) {
            additionalOptions.push(`--duration ${filters.duration}`);
        }
        await this.runFromFeatures(featuresPath, undefined, {
            tags: filters.tags,
            group: filters.group,
            additionalK6Options: additionalOptions,
        });
    }
}
exports.K6Runner = K6Runner;
//# sourceMappingURL=k6.runner.js.map