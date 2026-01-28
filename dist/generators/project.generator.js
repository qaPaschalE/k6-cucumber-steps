"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectGenerator = void 0;
// src/generators/project.generator.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ProjectGenerator {
    generateProjectStructure(config, outputPath) {
        // Create main directories
        this.createDirectory(path_1.default.join(outputPath, "features"));
        this.createDirectory(path_1.default.join(outputPath, "steps"));
        this.createDirectory(path_1.default.join(outputPath, "generated"));
        this.createDirectory(path_1.default.join(outputPath, "data"));
        this.createDirectory(path_1.default.join(outputPath, "reports"));
        fs_1.default.mkdirSync(path_1.default.join(outputPath, "data"), { recursive: true });
        // Generate package.json
        this.generatePackageJson(outputPath, config);
        // Generate README
        this.generateReadme(outputPath, config);
        // Generate sample feature file
        this.generateSampleFeature(outputPath);
        this.generateBrowserSampleFeature(outputPath);
        this.generateAuthSampleFeature(outputPath);
        // Generate sample step definitions
        this.generateSampleSteps(outputPath, config);
        // Generate gitignore
        this.generateGitignore(outputPath);
        // Generate tsconfig if TypeScript
        if (config.language === "ts") {
            this.generateTsConfig(outputPath);
        }
    }
    createDirectory(dirPath) {
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
        }
    }
    generatePackageJson(outputPath, config) {
        const packageJson = {
            name: "k6-cucumber-test-project",
            version: "1.0.0",
            description: "Generated k6 test project with Cucumber integration",
            main: config.language === "ts" ? "src/test.ts" : "test.js",
            scripts: {
                test: `k6 run generated/${config.language === "ts" ? "test.generated.ts" : "test.generated.js"}`,
                dev: `k6 run --out json=results.json generated/${config.language === "ts" ? "test.generated.ts" : "test.generated.js"}`,
            },
            devDependencies: {
                "@types/k6": "^0.48.0",
            },
            dependencies: {
            // Add any runtime dependencies here
            },
            author: config.author,
            license: "MIT",
        };
        fs_1.default.writeFileSync(path_1.default.join(outputPath, "package.json"), JSON.stringify(packageJson, null, 2));
    }
    generateReadme(outputPath, config) {
        const readmeContent = `# K6 Cucumber Test Project

Generated with k6-cucumber-steps by ${config.author}

## Setup

\`\`\`bash
npm install
\`\`\`

## Running Tests

### Generate k6 script from features:
\`\`\`bash
npx k6-cucumber-steps generate -l ${config.language === "ts" ? "ts" : "js"}
\`\`\`

### Run tests:
\`\`\`bash
npm test
\`\`\`

## Project Structure
- \`features/\` - Gherkin feature files
- \`steps/\` - Step definition implementations
- \`generated/\` - Generated k6 scripts
`;
        fs_1.default.writeFileSync(path_1.default.join(outputPath, "README.md"), readmeContent);
    }
    generateAuthSampleFeature(outputPath) {
        const content = `@vus:2
Feature: Authentication Examples
  # This demonstrates dynamic auth with DataTables using k6's public test suite

  Background:
    Given the base URL is "http://coop.apps.symfonycasts.com"

  Scenario: Authenticate via Standard Login
    # Using k6's public login endpoint
    Given the base URL is "https://demoqa.com"
    When I authenticate with the following url and request body as "standard_user":
      | endpoint               | userName | password   |
      | /Account/v1/Authorized | k6tester | 1Password@ |
    And I store "data" in "data/standard_user.json"

  Scenario: Authenticate via Client Credentials (OAuth2 Simulation)
    # Added "as form" at the end to trigger urlencoding
    When I authenticate with the following url and request body as "service_account" as "form":
      | endpoint | client_id         | client_secret                    | grant_type         |
      | /token   | k6-cucumber-steps | 40d595cb79978e9c2cccc61e4fa972fd | client_credentials |
    And I store "access_token" in "data/service_account.json"

  # Scenario: Authenticate with API Key and Environment
#   When I authenticate with the following url and request body as "dev_user":
#     | endpoint | apiKey   | environment | version |
#     | /token   | key-4455 | staging     | v2      |
#   And I store "auth.key" in "data/dev_user.json"
`;
        fs_1.default.writeFileSync(path_1.default.join(outputPath, "features", "authSample.feature"), content);
    }
    generateSampleFeature(outputPath) {
        const sampleFeature = `@smoke @vus:10 @duration:1m
Feature: Comprehensive API Testing

  Background:
    Given the base URL is "https://jsonplaceholder.typicode.com"
    And I set the default headers:
      | Content-Type     | Accept           |
      | application/json | application/json |

  @group:user-api @threshold:http_req_duration=p(95)<500
  Scenario: Get specific user details
    When I make a GET request to "/users/1"
    Then the response status should be 200
    And the response should contain "name"

  @group:load-test @stages:0s-0,20s-10,30s-10,10s-0
  Scenario Outline: Validate multiple user endpoints
    When I make a GET request to "/users/<userId>"
    Then the response status should be <expectedStatus>

    Examples:
      | userId | expectedStatus |
      | 1      | 200            |
      | 5      | 200            |
      | 999    | 404            |

  @group:post-api
  Scenario: Create a post with bulk data
    Given I have the following post data:
      """
      {
        "title": "Performance Test",
        "body": "Testing DataTables and DocStrings",
        "userId": 1
      }
      """
    When I make a POST request to "/posts"
    Then the response status should be 201
`;
        fs_1.default.writeFileSync(path_1.default.join(outputPath, "features", "sample.feature"), sampleFeature);
    }
    generateBrowserSampleFeature(outputPath) {
        const content = `@browser
Feature: Browser Performance Example
  # Scenarios with @browser tag run in a real Chromium instance

  Scenario: Verify UI Elements
    Given the base URL is "https://test.k6.io"
    When I navigate to the "/" page
    Then I see the text on the page "Collection of simple web-pages"
`;
        fs_1.default.writeFileSync(path_1.default.join(outputPath, "features", "browserSample.feature"), content);
    }
    // src/generators/project.generator.ts
    generateSampleSteps(outputPath, config) {
        const isTS = config.language === "ts";
        const stepExtension = isTS ? ".ts" : ".js";
        // Type helpers
        const headerType = isTS ? ": Record<string, string>" : "";
        const anyType = isTS ? ": any[]" : "";
        const stringType = isTS ? ": string" : "";
        const mixedType = isTS ? ": string | number" : "";
        const sampleSteps = `import http from "k6/http";
import { check, sleep, group } from "k6";

let baseUrl = "";
let defaultHeaders${headerType} = {
  'Content-Type': 'application/json'
};

/**
 * Given the base URL is "..."
 */
export function theBaseUrlIs(url${stringType}) {
  baseUrl = url;
}

/**
 * When I authenticate with the following url and request body as {string} (as {string})
 * This handles both:
 * 1. ...as "user":
 * 2. ...as "user" as "form":
 */
export function iAuthenticateWithTheFollowingUrlAndRequestBodyAs(
  context${stringType}, 
  formatOrTable${anyType}, 
  maybeTable${anyType}
) {
  let format = 'json';
  let dataTable;

  // Argument shifting logic
  if (maybeTable === undefined) {
    format = 'json';
    dataTable = formatOrTable;
  } else {
    format = formatOrTable;
    dataTable = maybeTable;
  }

  if (!dataTable || !dataTable[0]) return;

  const row = dataTable[0];
  const { endpoint, ...payload } = row;
  const url = \`\${baseUrl}\${endpoint}\`;
  
  let body;
  let params = { headers: {} };

  /** * FORM FORMAT LOGIC
   * k6 behavior: If the body is an object and Content-Type is x-www-form-urlencoded,
   * k6 serializes the object into a query string (key=value&key2=value2).
   */
  if (format === 'form') {
    params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    /** * IMPORTANT: For k6 to auto-encode, the body MUST be a plain object.
     * We ensure payload is clean of any non-serializable properties.
     */
    body = Object.assign({}, payload); 
  } else {
    params.headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  const response = http.post(url, body, params);


  const success = check(response, { 
    [\`Auth successful (\${format})\`]: (r) => r.status === 200 || r.status === 201 
  });
  
  if (success) {
  try {
        const parsed = response.json();
        globalThis.lastResponse = parsed;
        console.log(\`✅ \${context} Response Captured. Keys: \${Object.keys(parsed).join(', ')}\`);
        } catch (e) {
        console.error(\`❌ Failed to parse JSON response for \${context}: \${response.body}\`);
        globalThis.lastResponse = null;
    }
     
  } else {
    console.error(\`❌ Auth failed for \${context}. Status: \${response.status}\`);
    globalThis.lastResponse = null;
  }
}
/**
 * When I authenticate with the following url and request body as {string} (as {string})
 * This handles both:
 * 1. ...as "user":
 * 2. ...as "user" as "form":
 */
export function iAuthenticateWithTheFollowingUrlAndRequestBodyAsAs(
  context${stringType}, 
  formatOrTable${anyType}, 
  maybeTable${anyType}
) {
  let format = 'json';
  let dataTable;

  // Argument shifting logic
  if (maybeTable === undefined) {
    format = 'json';
    dataTable = formatOrTable;
  } else {
    format = formatOrTable;
    dataTable = maybeTable;
  }

  if (!dataTable || !dataTable[0]) return;

  const row = dataTable[0];
  const { endpoint, ...payload } = row;
  const url = \`\${baseUrl}\${endpoint}\`;
  
  let body;
  let params = { headers: {} };

  /** * FORM FORMAT LOGIC
   * k6 behavior: If the body is an object and Content-Type is x-www-form-urlencoded,
   * k6 serializes the object into a query string (key=value&key2=value2).
   */
  if (format === 'form') {
    params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    /** * IMPORTANT: For k6 to auto-encode, the body MUST be a plain object.
     * We ensure payload is clean of any non-serializable properties.
     */
    body = Object.assign({}, payload); 
  } else {
    params.headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  const response = http.post(url, body, params);


  const success = check(response, { 
    [\`Auth successful (\${format})\`]: (r) => r.status === 200 || r.status === 201 
  });
  
  if (success) {
  try {
        const parsed = response.json();
        globalThis.lastResponse = parsed;
        console.log(\`✅ \${context} Response Captured. Keys: \${Object.keys(parsed).join(', ')}\`);
        } catch (e) {
        console.error(\`❌ Failed to parse JSON response for \${context}: \${response.body}\`);
        globalThis.lastResponse = null;
    }
     
  } else {
    console.error(\`❌ Auth failed for \${context}. Status: \${response.status}\`);
    globalThis.lastResponse = null;
  }
}
/**
 * And I store "data.token" in "data/standard_user.json"
 */
export function iStoreIn(jsonPath${stringType}, fileName${stringType}) {
  const responseData = globalThis.lastResponse;

  if (!responseData) return;
    const value = jsonPath.split('.').reduce((acc, key) => acc && acc[key], responseData);
  

  // Debug: See what the server actually sent back
  console.log(\`DEBUG: Response for \${fileName}: \`, JSON.stringify(responseData));

  

  // Check for undefined/null specifically so 0 or "" aren't ignored
  if (value !== undefined && value !== null) {
    globalThis.savedTokens = globalThis.savedTokens || {};
    
    // Store in the requested file path
    globalThis.savedTokens[fileName] = value;
    
    // ALSO store as a clean alias (e.g., 'service_account' instead of 'data/service_account.json')
    const alias = fileName.split('/').pop().replace('.json', '');
    globalThis.savedTokens[alias] = value;

console.log(\`✅ Value staged for file write: \${fileName}\`);  } else {
    console.error(\`❌ Could not find path "\${jsonPath}" in the response. JSON keys found: \${Object.keys(responseData).join(', ')}\`);
  }
}
/**
 * Background Auth: Applies the previously stored token to headers
 */
export function iAmAuthenticatedAsA(userType${stringType}) {
  const memoryKey = \`data/\${userType}.json\`;
  const token = globalThis.savedTokens && globalThis.savedTokens[memoryKey];
  
  if (token) {
    defaultHeaders['Authorization'] = \`Bearer \${token}\`;
    console.log(\`Using memory-stored token for \${userType}\`);
  } else {
    // Fallback: try to read the INITIAL file created during project init
    try {
      const userData = JSON.parse(open(\`../data/\${userType}.json\`));
      if (userData.token) {
        defaultHeaders['Authorization'] = \`Bearer \${userData.token}\`;
      }
    } catch (e) {
      console.warn(\`No token found for \${userType} in memory or file.\`);
    }
  }
}

/**
 * And I set the default headers:
 */
export function iSetTheDefaultHeaders(data${anyType}) {
  if (data && data.length > 0) {
    Object.assign(defaultHeaders, data[0]);
  }
}

/**
 * When I make a GET request to "..."
 */
export function iMakeAGetRequestTo(endpoint${stringType}) {
  const url = \`\${baseUrl}\${endpoint}\`;
  const response = http.get(url, { headers: defaultHeaders });
  
  check(response, {
    'status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'has valid headers': (r) => r.request.headers['Authorization'] !== undefined
  });
}

/**
 * Then the response status should be ...
 */
export function theResponseStatusShouldBe(expectedStatus${mixedType}) {
  const status = typeof expectedStatus === 'string' ? parseInt(expectedStatus) : expectedStatus;
}

export function theResponseShouldContain(field${stringType}) {
  console.log(\`Verified: Response contains \${field}\`);
}

/**
 * Given I have the following post data:
 */
export function iHaveTheFollowingPostData(content${stringType}) {
  return JSON.parse(content);
}

/**
 * When I make a POST request to "..."
 */
export function iMakeAPostRequestTo(endpoint${stringType}) {
  const url = \`\${baseUrl}\${endpoint}\`;
  const payload = JSON.stringify({ title: 'k6 test' });
  const response = http.post(url, payload, { headers: defaultHeaders });
  
  check(response, {
    'POST status is 201': (r) => r.status === 201
  });
}
  /** --- Browser Steps (@browser) --- **/

export async function iNavigateToThePage(page, url${stringType}) {
  // If URL is relative, prepend baseUrl
  const fullUrl = url.startsWith('http') ? url : \`\${baseUrl}\${url}\`;
  await page.goto(fullUrl);
}

export async function iClickTheButton(page, selector${stringType}) {
  await page.locator(selector).click();
}

export async function iSeeTheTextOnThePage(page, text${stringType}) {
  const content = await page.content();
  check(page, {
    [\`Text "\${text}" is visible\`]: () => content.includes(text)
  });
}
`;
        fs_1.default.writeFileSync(path_1.default.join(outputPath, "steps", `sample.steps${stepExtension}`), sampleSteps);
    }
    generateGitignore(outputPath) {
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
        fs_1.default.writeFileSync(path_1.default.join(outputPath, ".gitignore"), gitignoreContent);
    }
    generateTsConfig(outputPath) {
        const tsconfig = {
            compilerOptions: {
                target: "ES2020",
                module: "commonjs",
                strict: true,
                esModuleInterop: true,
                skipLibCheck: true,
                forceConsistentCasingInFileNames: true,
                types: ["k6"],
            },
            include: ["src/**/*", "steps/**/*"],
            exclude: ["node_modules"],
        };
        fs_1.default.writeFileSync(path_1.default.join(outputPath, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));
    }
}
exports.ProjectGenerator = ProjectGenerator;
//# sourceMappingURL=project.generator.js.map