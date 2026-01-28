// src/runners/k6.runner.ts
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { FeatureFile, Scenario, Step, ScenarioMetadata } from "../types";
import { FeatureParser } from "../generators/feature.parser";
import { K6ScriptGenerator } from "../generators/k6-script.generator";

const execAsync = promisify(exec);

export class K6Runner {
  async runFromFeatures(
    featuresPath: string,
    outputScriptPath?: string,
    options: {
      tags?: string;
      group?: string;
      language?: "js" | "ts";
      additionalK6Options?: string[];
    } = {},
  ): Promise<void> {
    console.log("Loading and parsing feature files...");

    const parser = new FeatureParser();
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
    const generator = new K6ScriptGenerator();
    const config = {
      language: options.language || "ts",
      featuresDir: featuresPath,
      outputDir: path.dirname(outputScriptPath || "./generated"),
      includeHtmlReporter: true,
      author: "Enyimiri Chetachi Paschal (qaPaschalE)",
      version: require("../../package.json").version,
    };

    const k6Script = generator.generateK6File(allScenarios, metadata, config);

    // Write the generated script
    const finalOutputPath =
      outputScriptPath || `./generated/test.generated.${config.language}`;
    const outputDir = path.dirname(finalOutputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(finalOutputPath, k6Script);
    console.log(`Generated k6 script: ${finalOutputPath}`);

    // Run the k6 test
    await this.runK6Test(finalOutputPath, options.additionalK6Options);
  }

  async runK6Test(
    scriptPath: string,
    additionalOptions?: string[],
  ): Promise<void> {
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
    } catch (error) {
      if (error instanceof Error) {
        console.error(`K6 test failed: ${error.message}`);
        if ((error as any).stderr) {
          console.error((error as any).stderr);
        }
        throw error;
      } else {
        console.error(`K6 test failed with unknown error:`, error);
        throw new Error("K6 test execution failed");
      }
    }
  }

  async runGeneratedScript(
    scriptPath: string,
    options?: string[],
  ): Promise<void> {
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Generated script does not exist: ${scriptPath}`);
    }

    await this.runK6Test(scriptPath, options);
  }

  private filterFeaturesByTags(
    features: FeatureFile[],
    tagFilters: string[],
  ): FeatureFile[] {
    return features
      .map((feature) => ({
        ...feature,
        scenarios: feature.scenarios.filter((scenario) =>
          tagFilters.some((filter) => scenario.tags.includes(filter)),
        ),
      }))
      .filter((feature) => feature.scenarios.length > 0); // Remove features with no matching scenarios
  }

  private filterFeaturesByGroup(
    features: FeatureFile[],
    group: string,
  ): FeatureFile[] {
    return features
      .map((feature) => ({
        ...feature,
        scenarios: feature.scenarios.filter((scenario) =>
          scenario.tags.some(
            (tag) => tag.startsWith("group:") && tag.includes(group),
          ),
        ),
      }))
      .filter((feature) => feature.scenarios.length > 0); // Remove features with no matching scenarios
  }

  async runWithFilters(
    featuresPath: string,
    filters: {
      tags?: string;
      group?: string;
      vus?: number;
      duration?: string;
    },
  ): Promise<void> {
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
