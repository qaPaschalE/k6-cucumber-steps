// src/generators/project.generator.ts
import fs from "fs";
import path from "path";
import { ProjectConfig } from "../types";
import { SampleFeaturesGenerator } from "./samples/sample-features.generator";
import { SampleStepsGenerator } from "./samples/sample-steps.generator";

export class ProjectGenerator {
  generateProjectStructure(config: ProjectConfig, outputPath: string, prefix: string = "", ci?: string): void {
    // Create main directories
    this.createDirectory(path.join(outputPath, "features"));
    this.createDirectory(path.join(outputPath, "steps"));
    this.createDirectory(path.join(outputPath, "generated"));
    this.createDirectory(path.join(outputPath, "data"));
    this.createDirectory(path.join(outputPath, "reports"));
    fs.mkdirSync(path.join(outputPath, "data"), { recursive: true });
    // Generate package.json
    this.generatePackageJson(outputPath, config);

    // Generate README
    this.generateReadme(outputPath, config);

    // Generate sample feature files
    const featuresGenerator = new SampleFeaturesGenerator();
    featuresGenerator.generate(outputPath);

    // Generate global types for k6 + browser extensions
    this.generateGlobalTypes(outputPath);

    // Generate sample step definitions
    const stepsGenerator = new SampleStepsGenerator();
    stepsGenerator.generate(outputPath, config, prefix);
    
    // Generate index.ts for steps
    this.generateStepsIndex(outputPath, config);

    // Generate .env.example file
    this.generateEnvExample(outputPath);

    // Generate gitignore
    this.generateGitignore(outputPath);

    // Generate config file
    this.generateConfigFile(outputPath, config);

    // Generate hooks file
    this.generateHooksFile(outputPath, config);

    // Generate CI/CD pipeline if requested
    if (ci) {
      this.generateCiPipeline(outputPath, ci);
    }

    // Generate tsconfig if TypeScript
    if (config.language === "ts") {
      this.generateTsConfig(outputPath);
    }
  }

  private createDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private generateStepsIndex(outputPath: string, config: ProjectConfig): void {
    const isTS = config.language === "ts";
    const extension = isTS ? ".ts" : ".js";
    const content = `// Re-export built-in steps
export * from './sample.steps';
export * from './hooks';

// Add and export your custom steps below
// export * from './my-custom-steps';
`;
    fs.writeFileSync(path.join(outputPath, "steps", `index${extension}`), content);
  }

  private generateHooksFile(outputPath: string, config: ProjectConfig): void {
    const isTS = config.language === "ts";
    const extension = isTS ? ".ts" : ".js";
    const anyType = isTS ? ": any" : "";
    
    const content = `// hooks${extension}
// Export functions to hook into the k6 lifecycle and scenario execution.

export function beforeAll() {
  // Runs once before all scenarios (inside k6 setup)
  // Return data here to pass to afterAll
  return { startTime: new Date().toISOString() };
}

export function before(scenarioMetadata${anyType}) {
  // Runs before each scenario
  // console.log("Starting scenario: " + scenarioMetadata.scenarioName);
}

export function after(scenarioMetadata${anyType}) {
  // Runs after each scenario
  // console.log("Finished scenario: " + scenarioMetadata.scenarioName);
}

export function afterAll(data${anyType}) {
  // Runs once after all scenarios have finished (inside k6 teardown)
  // console.log("Test started at: " + data.startTime);
}
`;
    fs.writeFileSync(path.join(outputPath, "steps", `hooks${extension}`), content);
  }

  private generateConfigFile(outputPath: string, config: ProjectConfig): void {
    const configContent = {
      features: config.featuresDir || "./features",
      output: config.outputDir || "./generated",
      lang: config.language || "ts",
      tags: "",
      excludeTags: ""
    };
    fs.writeFileSync(path.join(outputPath, "k6-cucumber.json"), JSON.stringify(configContent, null, 2));
  }

  private generateCiPipeline(outputPath: string, provider: string): void {
    const providerLower = provider.toLowerCase();
    
    if (providerLower === 'github') {
      const githubDir = path.join(outputPath, ".github", "workflows");
      this.createDirectory(githubDir);
      const githubContent = `name: k6-cucumber Load Test

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  load-test:
    name: Run k6 load test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Generate k6 scripts
        run: npm run generate

      - name: Run k6 test
        run: npm run test
`;
      fs.writeFileSync(path.join(githubDir, "k6.yml"), githubContent);
      console.log("✅ Generated GitHub Actions workflow at .github/workflows/k6.yml");
    } else if (providerLower === 'gitlab') {
      const gitlabContent = `stages:
  - test

load_test:
  stage: test
  image: node:20
  before_script:
    - npm ci
    - apt-get update && apt-get install -y gnupg2
    - gpg -k
    - gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
    - echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list
    - apt-get update
    - apt-get install -y k6
  script:
    - npm run generate
    - npm run test
`;
      fs.writeFileSync(path.join(outputPath, ".gitlab-ci.yml"), gitlabContent);
      console.log("✅ Generated GitLab CI configuration at .gitlab-ci.yml");
    } else {
      console.warn(`⚠️  Warning: CI provider '${provider}' is not supported yet. Try 'github' or 'gitlab'.`);
    }
  }

  private generateGlobalTypes(outputPath: string): void {
    const content = `// Auto-generated by k6-cucumber-steps
export {};

declare global {
  var savedTokens: Record<string, any>;
  var storedAliases: Record<string, any>;
  var lastResponse: any;
  var exportedTokens: Record<string, any>;
  var baseUrl: string;
  var lastPostData: string;
}
`;
    fs.writeFileSync(path.join(outputPath, "global.types.d.ts"), content);
  }

  private generatePackageJson(outputPath: string, config: ProjectConfig): void {
    const pkgPath = path.join(outputPath, "package.json");
    let pkg: any = {};

    // Load existing package.json if it exists
    if (fs.existsSync(pkgPath)) {
      try {
        pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        console.log("📦 Detected existing package.json — merging...");
      } catch (e) {
        console.warn("⚠️ Invalid package.json. Creating new one.");
        pkg = {};
      }
    }

    // Ensure scripts object exists
    pkg.scripts = pkg.scripts || {};

    // Add/merge our scripts (do NOT replace entire scripts object)
    const lang = config.language === "ts" ? "ts" : "js";
    const newScripts = {
      test: `k6 run generated/test.generated.${lang}`,
      "test:env": "npx dotenv-cli -- k6 run generated/test.generated.ts",
      "test:ui": `K6_BROWSER_ENABLED=true k6 run generated/test.generated.${lang}`,
      "test:ui:env":
        "K6_BROWSER_ENABLED=true npx dotenv-cli -- k6 run generated/test.generated.ts",
      "test:ui:headed": `K6_BROWSER_HEADLESS=false K6_BROWSER_ENABLED=true k6 run generated/test.generated.${lang}`,
      "test:ui:headed:env":
        "K6_BROWSER_HEADLESS=false K6_BROWSER_ENABLED=true npx dotenv-cli -- k6 run generated/test.generated.ts",
      "test:api": `K6_BROWSER_ENABLED=false k6 run generated/test.generated.${lang}`,
      "test:api:env":
        "K6_BROWSER_ENABLED=false npx dotenv-cli -- k6 run generated/test.generated.ts",
      generate: `k6-cucumber-steps generate -l ${lang}`,
      "generate:ui": `k6-cucumber-steps generate -l ${lang} --tags browser`,
      "generate:api": `k6-cucumber-steps generate -l ${lang} --exclude-tags browser`,
    };

    // Merge: only add/overwrite our scripts, keep others
    Object.assign(pkg.scripts, newScripts);

    // Ensure dependencies objects exist
    pkg.devDependencies = pkg.devDependencies || {};
    pkg.dependencies = pkg.dependencies || {};

    // Add TypeScript if needed
    if (config.language === "ts" && !pkg.devDependencies["typescript"]) {
      pkg.devDependencies["typescript"] = "^5.0.0";
    }

    // Add dotenv-cli for environment variable support
    pkg.devDependencies["dotenv-cli"] = "^11.0.0";

    // Update @types/k6 to latest stable
    pkg.devDependencies["@types/k6"] = "^1.6.0";
    pkg.devDependencies["@types/node"] = "^20.19.34";
    // Set top-level fields (only if not already set)
    pkg.name = pkg.name || "k6-cucumber-test-project";
    pkg.version = pkg.version || "1.0.0";
    pkg.description =
      pkg.description || "k6 test project with Cucumber integration";
    pkg.main =
      pkg.main || (config.language === "ts" ? "src/test.ts" : "test.js");
    pkg.author = pkg.author || config.author;
    pkg.license = pkg.license || "MIT";

    // Write back
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  private generateReadme(outputPath: string, config: ProjectConfig): void {
    const readmeContent = `# K6 Cucumber Test Project

Generated with k6-cucumber-steps by ${config.author}

## Setup

\`\`\`bash
npm install
\`\`\`

## Running Tests

### Generate k6 scripts from features:
\`\`\`bash
# Generate all tests
npm run generate

# Generate only UI/browser tests (tagged @browser)
npm run generate:ui

# Generate only API tests (non-browser)
npm run generate:api
\`\`\`

### Run tests:
\`\`\`bash
# Run all tests
npm test

# Run only UI/browser tests
npm run test:ui

# Run only API tests
npm run test:api
\`\`\`

## Project Structure
- \`features/\` - Gherkin feature files
  - \`sample.feature\` - API testing examples
  - \`authSample.feature\` - Authentication workflows
  - \`browserSample.feature\` - Browser automation examples
- \`steps/\` - Step definition implementations
- \`generated/\` - Generated k6 scripts
- \`data/\` - Runtime token storage (auto-generated)
- \`reports/\` - HTML and JSON test reports

## Safe Initialization
This project was initialized with \`k6-cucumber-steps init\`.
Existing project files and dependencies were preserved.
`;

    fs.writeFileSync(path.join(outputPath, "README.md"), readmeContent);
  }

  private generateGitignore(outputPath: string): void {
    const gitignoreContent = `node_modules/

*.html
dist/
build/
reports/
data/*.json
.nyc_output/
coverage/
.env
`;

    fs.writeFileSync(path.join(outputPath, ".gitignore"), gitignoreContent);
  }

  private generateTsConfig(outputPath: string): void {
    const tsconfig = {
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        types: ["k6", "node"],
        allowImportingTsExtensions: true,
        noEmit: true,
      },
      include: ["src/**/*", "steps/**/*", "**/*.ts", "**/*.d.ts"],
      exclude: ["node_modules"],
    };

    fs.writeFileSync(
      path.join(outputPath, "tsconfig.json"),
      JSON.stringify(tsconfig, null, 2),
    );
  }

  private generateEnvExample(outputPath: string): void {
    const envExampleContent = `# Base URLs
API_BASE_URL=https://jsonplaceholder.typicode.com
AUTH_BASE_URL=https://demoqa.com

# Test User Credentials
TEST_USER_USERNAME=your_test_username
TEST_USER_PASSWORD=your_test_password

# Post Data
POST_TITLE=My Test Post

# OAuth2 Client Credentials (if applicable)
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
`;

    fs.writeFileSync(path.join(outputPath, ".env.example"), envExampleContent);
  }
}
