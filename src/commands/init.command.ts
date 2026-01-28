// src/commands/init.command.ts
import { ProjectGenerator } from "../generators/project.generator";
import { ProjectConfig } from "../types";
import fs from "fs";
import path from "path";

export class InitCommand {
  async execute(
    outputPath: string,
    language: "js" | "ts" = "ts",
  ): Promise<void> {
    const config: ProjectConfig = {
      language,
      featuresDir: "features",
      outputDir: "generated",
      includeHtmlReporter: true,
      author: "Enyimiri Chetachi Paschal (qaPaschalE)",
      version: require("../../package.json").version, // Get from your main package.json
    };

    console.log(`Initializing k6-cucumber-steps project...`);
    console.log(`Language: ${language}`);
    console.log(`Output directory: ${outputPath}`);

    const generator = new ProjectGenerator();
    generator.generateProjectStructure(config, outputPath);

    console.log(
      `✅ Project structure generated successfully in: ${outputPath}`,
    );
    console.log(`📋 Next steps:`);
    console.log(`   cd ${outputPath}`);
    console.log(`   npm install`);
    console.log(`   npx k6-cucumber-steps generate -l ${language}`);
    console.log(`   npm test`);
  }
}
