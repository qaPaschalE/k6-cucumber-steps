// src/commands/init.command.ts
import { ProjectGenerator } from "../generators/project.generator";
import { ProjectConfig } from "../types";
import fs from "fs";
import path from "path";
// src/commands/init.command.ts
export class InitCommand {
  private projectGenerator = new ProjectGenerator();

  async execute(
    outputPath: string,
    language: "js" | "ts" = "ts",
    prefix?: string,
    ci?: string,
  ): Promise<void> {
    const config: ProjectConfig = {
      language,
      featuresDir: "features",
      outputDir: "generated",
      includeHtmlReporter: true,
      author: "Enyimiri Chetachi Paschal (qaPaschalE)",
      version: require("../../package.json").version,
    };

    console.log(`Initializing k6-cucumber-steps project...`);
    console.log(`Language: ${language}`);
    console.log(`Output directory: ${path.resolve(outputPath)}`);

    const generator = new ProjectGenerator();
    generator.generateProjectStructure(config, outputPath, prefix, ci);

    console.log(`✅ Project structure generated successfully in: ${path.resolve(outputPath)}`);
    console.log(`📋 Next steps:`);
    if (outputPath === "." || path.resolve(outputPath) === process.cwd()) {
      console.log(`   npm install`);
      console.log(`   npx k6-cucumber-steps generate -l ${language}`);
      console.log(`   npm test`);
    } else {
      console.log(`   cd ${outputPath}`);
      console.log(`   npm install`);
      console.log(`   npx k6-cucumber-steps generate -l ${language}`);
      console.log(`   npm test`);
    }
  }
}