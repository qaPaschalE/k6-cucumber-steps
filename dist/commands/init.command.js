"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitCommand = void 0;
// src/commands/init.command.ts
const project_generator_1 = require("../generators/project.generator");
class InitCommand {
    async execute(outputPath, language = "ts") {
        const config = {
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
        const generator = new project_generator_1.ProjectGenerator();
        generator.generateProjectStructure(config, outputPath);
        console.log(`✅ Project structure generated successfully in: ${outputPath}`);
        console.log(`📋 Next steps:`);
        console.log(`   cd ${outputPath}`);
        console.log(`   npm install`);
        console.log(`   npx k6-cucumber-steps generate -l ${language}`);
        console.log(`   npm test`);
    }
}
exports.InitCommand = InitCommand;
//# sourceMappingURL=init.command.js.map