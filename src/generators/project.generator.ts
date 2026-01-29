// src/generators/project.generator.ts
import fs from "fs";
import path from "path";
import { ProjectConfig } from "../types";

export class ProjectGenerator {
  generateProjectStructure(config: ProjectConfig, outputPath: string): void {
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

    // Generate sample feature file
    this.generateSampleFeature(outputPath);
    this.generateBrowserSampleFeature(outputPath);
    this.generateAuthSampleFeature(outputPath);
    // Generate global types for k6 + browser extensions
    this.generateGlobalTypes(outputPath);
    // Generate sample step definitions
    this.generateSampleSteps(outputPath, config);
    // Generate gitignore
    this.generateGitignore(outputPath);

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
  private generateGlobalTypes(outputPath: string): void {
    const content = `// Auto-generated global types for k6-cucumber-steps
declare global {
  var savedTokens: Record<string, any>;
  var lastResponse: any;
  var exportedTokens: Record<string, any>;
}

export {};
`;
    fs.writeFileSync(path.join(outputPath, "global.types.d.ts"), content);
  }
  private generatePackageJson(outputPath: string, config: ProjectConfig): void {
    const packageJson = {
      name: "k6-cucumber-test-project",
      version: "1.0.0",
      description: "Generated k6 test project with Cucumber integration",
      main: config.language === "ts" ? "src/test.ts" : "test.js",
      scripts: {
        test: `k6 run generated/${config.language === "ts" ? "test.generated.ts" : "test.generated.js"}`,
        testBrowserHeaded: `K6_BROWSER_HEADLESS=false K6_BROWSER_ENABLED=true k6 run generated/${config.language === "ts" ? "test.generated.ts" : "test.generated.js"}`,
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

    fs.writeFileSync(
      path.join(outputPath, "package.json"),
      JSON.stringify(packageJson, null, 2),
    );
  }

  private generateReadme(outputPath: string, config: ProjectConfig): void {
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
- \`Features/\` - Gherkin feature files
      - \`steps/\` - Step definition implementations
- \`generated/\` - Generated k6 scripts
`;

    fs.writeFileSync(path.join(outputPath, "README.md"), readmeContent);
  }
  private generateAuthSampleFeature(outputPath: string): void {
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
    fs.writeFileSync(
      path.join(outputPath, "features", "authSample.feature"),
      content,
    );
  }
  private generateSampleFeature(outputPath: string): void {
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

    fs.writeFileSync(
      path.join(outputPath, "features", "sample.feature"),
      sampleFeature,
    );
  }
  private generateBrowserSampleFeature(outputPath: string): void {
    const content = `@iterations:1
Feature: Comprehensive UI Automation on DemoQA

  Background:
    Given the base URL is "https://demoqa.com"

  @browser
  Scenario: Fill and submit the practice form successfully
    When I navigate to the "/automation-practice-form" page
    And I fill the field "#firstName" with "Paschal"
    And I fill the field "#lastName" with "Enyimiri"
    And I fill the field "#userEmail" with "paschal.cheps@example.com"
    And I click on exact text "Male"
    And I fill the field "#userNumber" with "0801234567"
    And I wait "1" seconds
    And I click on exact text "Music"
    And I click on the element "#state"
    And I click on exact text "NCR"
    And I fill the field "#currentAddress" with "this is a load test on the ui"
    And I wait "1" seconds
    And I click on the element "#city"
    And I click on exact text "Delhi"
    And I click on the element "#submit"
    Then I should see the text "Thanks for submitting the form"

  Scenario: Interact using multiple locator strategies
    When I navigate to the "/automation-practice-form" page
    # By ID
    And I find element by Id "firstName"
    # By placeholder
    And I find input element by placeholder text "First Name"
    # By label/name (accessible)
    And I find element by name "First Name"
    # By role + name
    And I find element by role "textbox" "First Name"
    # By button text
    And I find button by text "Submit"
    # By value attribute
    And I find element by value "Submit"
    # Assertion
    And I should see the text "Student Registration Form"

  Scenario: Wait and validate dynamic content reliably
    When I navigate to the "/automation-practice-form" page
    And I wait "1" seconds
    And I should see the element "#firstName"
    And I should see the text "Practice Form"
    And I should not see the text "Dropped!"

  Scenario: Validate page metadata after navigation
    When I navigate to the "/automation-practice-form" page
    And the current URL should contain "automation-practice-form"
    And the page title should be "DEMOQA"


  Scenario: Find and interact using value / role
    Given the base URL is "https://demoqa.com"
    When I navigate to the "/automation-practice-form" page

    # Find by value attribute
    And I find element by value "Submit"
    And I click

    # Find by role (button with text)
    And I find element by role "button" "Submit"
    And I click

    # Find by role (heading)
    And I find element by role "heading" "Practice Form"
    And I should see the text "Practice Form"

    # Find by role (textbox)
    And I find element by role "textbox" "First Name"
    And I fill "Paschal"


  Scenario: Wait and find elements
    Given the base URL is "https://demoqa.com"
    When I navigate to the "/automation-practice-form" page
    And I wait "2" seconds
    And I find input element by placeholder text "First Name"
    And I find button by text "Submit"
    And I find element by Id "firstName"
    And I find elements by text "Name"

  Scenario: Interact with repeated elements
    When I navigate to the "/elements" page
    And I fill the 1st "#input-field" with "First"
    And I fill the 2nd "#input-field" with "Second"
    And I click the 2nd "button[type='submit']"
    Then I should see the 1st ".success-message"
    # For single element (default = 1st)
    And I click on the element "button"

    # For nth element
    And I click on the element "button" "2"
    And I fill the field "#email" with "test@example.com" "1"

  Scenario: Handle alert confirmation
    When I navigate to the "/alerts" page
    And I click on the element "#alertButton"
    # Add step to accept alert if needed
    Then I should see the text "You clicked a button"

  Scenario: Drag and drop
    When I navigate to the "/droppable" page
    And I find element by Id "draggable"
    And I drag to "#droppable"
    Then I should see the text "Dropped!"
`;
    fs.writeFileSync(
      path.join(outputPath, "features", "browserSample.feature"),
      content,
    );
  }

  private generateSampleSteps(outputPath: string, config: ProjectConfig): void {
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

/* ===== HTTP / API STEPS ===== */

export function theBaseUrlIs(url${stringType}) {
  baseUrl = url.trim();
}
export function iAuthenticateWithTheFollowingUrlAndRequestBodyAs(
  context${stringType}, 
  formatOrTable${anyType}, 
  maybeTable${anyType}
) {
  let format = 'json';
  let dataTable;

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

  if (format === 'form') {
    params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
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

export function iAuthenticateWithTheFollowingUrlAndRequestBodyAsAs(
  context${stringType}, 
  formatOrTable${anyType}, 
  maybeTable${anyType}
) {
  let format = 'json';
  let dataTable;

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

  if (format === 'form') {
    params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
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
 * And I store "response.path" in "data/file.json"
 * Example: And I store "access_token" in "data/user.json"
 */
export function iStoreIn(jsonPath, fileName) {
  const responseData = globalThis.lastResponse;

  if (!responseData) {
    console.error('❌ No response data to store. Did an HTTP request run?');
    return;
  }

  // Navigate JSON path (e.g., "user.token" → responseData.user.token)
  const value = jsonPath.split('.').reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : undefined;
  }, responseData);

  if (value === undefined) {
    console.error(\`❌ Path "\${jsonPath}" not found in response. Keys:\`, Object.keys(responseData));
    return;
  }

  // Stage for writing in handleSummary
  globalThis.savedTokens = globalThis.savedTokens || {};
  globalThis.savedTokens[fileName] = value;

  // Also store alias (e.g., 'user' from 'data/user.json')
// Remove path and .json extension
const alias = fileName.split(/[\\/]/).pop()?.replace(/\\.json$/, '') || fileName;
globalThis.savedTokens[alias] = value;

  console.log(\`✅ Staged token for "\${fileName}": \${typeof value === 'string' ? '***' : JSON.stringify(value)}\`);
}
  /**
 * Background: I am authenticated as a "user"
 * Applies stored token to default headers
 */
export function iAmAuthenticatedAsA(userType) {
  const token = globalThis.savedTokens?.[\`data/\${userType}.json\`] || 
                globalThis.savedTokens?.[userType];

  if (token) {
    defaultHeaders['Authorization'] = \`Bearer $\{token}\`;
    console.log(\`🔑 Using token for $\{userType}\`);
  } else {
    console.warn(\`⚠️ No token found for $\{userType}\`);
  }
}
/* ===== BROWSER STEPS ===== */

export async function iNavigateToThePage(page, url${stringType}) {
  let effectiveBase = baseUrl;
  if (typeof effectiveBase !== 'string' || effectiveBase.trim() === '') {
    console.warn('Invalid baseUrl detected:', baseUrl, '— using fallback');
    effectiveBase = 'https://test.k6.io';
  }
  const fullUrl = url.startsWith('http') ? url : \`\${effectiveBase}\${url.startsWith('/') ? '' : '/'}\${url}\`;
  console.log(\`Navigating to: \${fullUrl} (base: \${effectiveBase})\`);
  await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 60000 });
}

export async function iClickTheButton(page, selector${stringType}) {
  await page.locator(selector).click();
}

export async function iShouldSeeTheText(page${anyType}, expectedText${stringType}) {
  // Reuse your existing logic or copy from iSeeTheTextOnThePage
  let locator = page.getByRole('heading', { name: expectedText, exact: false });
  if ((await locator.count()) === 0) {
    locator = page.getByText(expectedText, { exact: false }).first();
  }

  try {
    await locator.waitFor({ state: 'visible', timeout: 30000 });
    const count = await locator.count();
    console.log(\`Found \${count} visible elements matching "\${expectedText}"\`);
    check(count >= 1, {
      [\`Text/heading containing "\${expectedText}" is visible\`]: true
    });
  } catch (e) {
    console.error(\`Text wait failed for "\${expectedText}":\`, e.message || e);
    check(false, { [\`Text/heading containing "\${expectedText}" is visible\`]: false });
  }
}

/* === Additional Browser Steps === */

export async function iClickOnTheElement(page, selector) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  await locator.click();
  console.log(\`✅ Clicked element: \${selector}\`);
}

export async function iFillTheFieldWith(page, selector, value) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  await locator.fill(value);
  console.log(\`✅ Filled field \${selector} with "\${value}"\`);
}

export async function thePageTitleShouldBe(page, expectedTitle${stringType}) {
  await page.waitForLoadState('networkidle');
  const title = await page.title();
  check(title, {
    [\`Page title is "\${expectedTitle}"\`]: (t) => t === expectedTitle
  });
}

export async function theCurrentUrlShouldContain(page, expectedFragment${stringType}) {
  const url = page.url();
  check(url, {
    [\`URL contains "\${expectedFragment}"\`]: (u) => u.includes(expectedFragment)
  });
}

export async function iShouldSeeTheElement(page, selector) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  const isVisible = await locator.isVisible();
  if (!isVisible) throw new Error(\`Element not visible: \${selector} \`);
  console.log(\`✅ Verified visibility of element: \${selector}\`);
}

export async function iShouldNotSeeTheText(page, text${stringType}) {
  const locator = page.getByText(text, { exact: false });
  const isHidden = (await locator.count()) === 0 || !(await locator.isVisible());
  check(isHidden, {
    [\`Text "\${text}" is not visible\`]: (hidden) => hidden === true
  });
}

export async function iSelectFromTheDropdown(page, option${stringType}, selector${stringType}) {
  const locator = page.locator(selector);
  await locator.selectOption(option);
  console.log(\`Selected "\${option}" from dropdown "\${selector}"\`);
}
/**
 * When I drag the element "..." to "..."
 * Example: I drag the element "#draggable" to "#droppable"
 */
export async function iDragTheElementTo(page${anyType}, sourceselector${stringType}, targetselector${stringType}) {
  try {
    const source = page.locator(sourceSelector);
    const target = page.locator(targetSelector);

    // Wait for both elements to be visible and stable
    await source.waitFor({ state: 'visible', timeout: 15000 });
    await target.waitFor({ state: 'visible', timeout: 15000 });

    // Perform the drag-and-drop
    await source.dragTo(target, {
      // Optional: force the action if element is covered / small
      force: true,
      // Optional: timeout for the whole operation
      timeout: 30000,
    });

    console.log(\`Successfully dragged "\${sourceSelector}" to "\${targetSelector}"\`);

    // Optional: small assertion that drop area changed (if it has visual feedback)
    // await expect(target).toHaveText('Dropped!'); // if you have expect imported
  } catch (error) {
    console.error(\`Drag failed from "\${sourceSelector}" to "\${targetSelector}":\`, error.message || error);
    throw error; // re-throw to fail the iteration
  }
}
  /**
 * And I drag to "#droppable"
 * This step assumes the previous step returned a source locator
 * Example usage:
 *   When I get element by selector "#draggable"
 *   And I drag to "#droppable"
 */
${isTS
        ? `export async function iDragTo(page${anyType}, targetselector${stringType}, sourceLocator?${anyType}) {`
        : `export async function iDragTo(page, targetSelector, sourceLocator) {`
      }

  try {
    // If no sourceLocator was passed (previous step didn't return it), fail early
    if (!sourceLocator) {
      throw new Error("No source locator provided. Did you use 'I get element by selector' before this step?");
    }

    const target = page.locator(targetSelector);
    await target.waitFor({ state: 'visible', timeout: 15000 });

    // Perform drag-and-drop from source → target
    await sourceLocator.dragTo(target, {
      force: true,           // helpful if element is partially covered
      timeout: 30000,
    });

    console.log(\`Dragged source element to target: \${targetSelector}\`);
  } catch (error) {
    console.error(\`Drag to "\${targetSelector}" failed:\`, error.message || error);
    throw error; // fail the iteration
  }
}
export async function iWaitForTheElementToBeVisible(page, selector${stringType}) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout: 30000 });
}
  /**
 * And I get element by selector "..."
 * (just locates it, waits for visibility, but doesn't perform action)
 */
export async function iGetElementBySelector(page${anyType}, selector${stringType}) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  console.log(\`Found element by selector: \${ selector }\`);
  return locator; // useful if you want to chain later
}

/**
 * And I find element by value "Male"
 * (uses getByLabel – good for form labels)
 */
export async function iFindElementByLabel(page${anyType}, labelText${stringType}) {
  const locator = page.getByLabel(labelText, { exact: false });
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  console.log(\`Found element by label: "\${labelText}"\`);
  return locator;
}

/**
 * And I find element by textarea "..."
 * (uses getByPlaceholder or getByRole for textarea)
 */
export async function iFindElementByTextarea(page${anyType}, placeholderOrLabel${stringType}) {
  let locator;
  // Try by placeholder first
  locator = page.getByPlaceholder(placeholderOrLabel, { exact: false });
  
  // Fallback to label or role if placeholder not found
  if ((await locator.count()) === 0) {
    locator = page.getByLabel(placeholderOrLabel, { exact: false })
               .or(page.getByRole('textbox', { name: placeholderOrLabel }));
  }

  await locator.waitFor({ state: 'visible', timeout: 15000 });
  console.log(\`Found textarea by placeholder / label: "\${placeholderOrLabel}"\`);
  return locator;
}



/**
 * And I click
 * Clicks the currently focused element (or the last interacted one).
 * Uses real mouse click instead of keyboard Enter.
 */
export async function iClick(page${anyType}) {
  try {
    // Get the currently focused element (active element)
    const focusedElement = await page.evaluateHandle(() => document.activeElement);

    if (!focusedElement || focusedElement.asElement() === null) {
      console.warn('No focused element found for click');
      return;
    }

    // Convert Handle to Locator
    const locator = page.locator(focusedElement.asElement());

    // Ensure it's visible and clickable
    await locator.waitFor({ state: 'visible', timeout: 10000 });

    // Perform real mouse click
    await locator.click({
      force: true,           // click even if slightly covered
      timeout: 10000,
    });

    console.log('Performed real mouse click on focused element');
  } catch (error) {
    console.error('Click failed on focused element:', error.message || error);
    throw error; // fail the step if needed
  }
}
function getNth(locator${anyType}, nthStr${stringType}) {
  if (!nthStr) return locator;
  const n = parseInt(nthStr, 10);
  if (isNaN(n) || n < 1) return locator;
  return locator.nth(n - 1); // k6 uses 0-based index
}

/**
 * And I wait "X" seconds
 */
export async function iWaitSeconds(page${anyType}, secondsStr${stringType}) {
  const seconds = parseFloat(secondsStr);
  if (isNaN(seconds) || seconds < 0) {
    throw new Error(\`Invalid wait time: "\${secondsStr}"\`);
  }
  await sleep(seconds); // k6's sleep takes seconds
}

/**
 * And I wait "X" milliseconds
 */
export async function iWaitMilliseconds(page${anyType}, milliseconds${stringType}) {
  const timeInMs = parseFloat(milliseconds);
  if (isNaN(timeInMs) || timeInMs < 0) {
    throw new Error(\`Invalid wait time: "\${milliseconds}" milliseconds\`);
  }
  console.log(\`Waiting for \${milliseconds} ms\`);
  
  // Correct k6 browser method
  await page.waitForTimeout(timeInMs);
}

/**
 * And I find input element by placeholder text "..."
 * Uses getByPlaceholder
 */
export async function iFindInputElementByPlaceholderText(page${anyType}, placeholder${stringType}) {
  const locator = page.getByPlaceholder(placeholder, { exact: false });
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  const count = await locator.count();
  console.log(\`Found \${count} input(s) with placeholder "\${placeholder}"\`);
  return locator;
}

/**
 * And I find element by text "..."
 * Uses getByText (substring match)
 */
export async function iFindElementByText(page${anyType}, text${stringType}) {
  const locator = page.getByText(text, { exact: false });
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  const count = await locator.count();
  console.log(\`Found \${count} element(s) containing text "\${text}"\`);
  return locator;
}

/**
 * And I find elements by text "..."
 * Similar to above, but emphasizes multiple matches
 */
export async function iFindElementsByText(page${anyType}, text${stringType}) {
  const locator = page.getByText(text, { exact: false });
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  const count = await locator.count();
  console.log(\`Found \${count} elements containing text "\${text}"\`);
  return locator;
}

/**
 * And I find button by text "..."
 * Uses getByRole('button')
 */
export async function iFindButtonByText(page${anyType}, buttonText${stringType}) {
  const locator = page.getByRole('button', { name: buttonText, exact: false });
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  const count = await locator.count();
  console.log(\`Found \${count} button(s) with text "\${buttonText}"\`);
  return locator;
}
/**
 * And I find element by value "..."
 * Finds input elements (input, textarea, select) that have the exact value attribute
 * Example: And I find element by value "Submit"
 */
export async function iFindElementByValue(page${anyType}, valueText${stringType}) {
  // Look for elements where value attribute matches exactly
const locator = page.locator(\`input[value="\${valueText}"], textarea[value="\${valueText}"]\`);
  try {
    await locator.waitFor({ state: 'visible', timeout: 20000 });
    const count = await locator.count();
    
    if (count === 0) {
      console.warn(\`No element found with value attribute "\${valueText}"\`);
      // Optional fallback: check inner text or other attributes if needed
      // locator = page.locator(\`: text("\${valueText}")\`);
    }

    console.log(\`Found \${ count } element(s) with value attribute "\${valueText}"\`);

    // Optional: log tag names of matches
    if (count > 0) {
      const tags = await locator.evaluateAll(els => els.map(el => el.tagName.toLowerCase()));
      console.log(\`Matching elements are: \${ tags.join(', ') } \`);
    }

    return locator;
  } catch (error) {
    console.error(\`Could not find element by value "\${valueText}": \`, error.message || error);
    check(false, { [\`Element with value "\${valueText}" is found\`]: false });
    throw error;
  }
}

/**
 * And I find element by role "..."
 * Finds elements using ARIA role (button, textbox, link, heading, etc.)
 * Example: And I find element by role "button"
 *          And I find element by role "heading" "Welcome"
 */
${isTS
        ? `export async function iFindElementByRole(page: any, roleName: string, nameOrOptions?: string | object) {`
        : `export async function iFindElementByRole(page, roleName, nameOrOptions) {`
      } 
  let locator;

  // If only role is given (no name)
  if (!nameOrOptions) {
    locator = page.getByRole(roleName);
  } 
  // If role + name/text is given (second argument is string)
  else if (typeof nameOrOptions === 'string') {
    locator = page.getByRole(roleName, { name: nameOrOptions, exact: false });
  } 
  // If options object is passed (advanced usage)
  else {
    locator = page.getByRole(roleName, nameOrOptions);
  }

  try {
    await locator.waitFor({ state: 'visible', timeout: 20000 });
    const count = await locator.count();
    console.log(\`Found \${ count } element(s) by role "\${roleName}"\`);

    if (typeof nameOrOptions === 'string') {
      console.log(\`  with name containing "\${nameOrOptions}"\`);
    }

    return locator;
  } catch (error) {
    console.error(\`Could not find element by role "\${roleName}": \`, error.message || error);
    check(false, { [\`Element by role "\${roleName}" is found\`]: false });
    throw error;
  }
}
/**
 * And I find buttons by text "..."
 * Same as above, but name emphasizes multiple
 */
export async function iFindButtonsByText(page${anyType}, buttonText${stringType}) {
  const locator = page.getByRole('button', { name: buttonText, exact: false });
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  const count = await locator.count();
  console.log(\`Found \${count} button(s) with text "\${buttonText}"\`);
  return locator;
}
/**
 * And I find element by name "..."
 * Finds elements using getByRole(name) or [name="..."] attribute
 * Example: And I find element by name "username"
 */
export async function iFindElementByName(page${anyType}, labelText${stringType}) {
  const locator = page.getByLabel(labelText, { exact: false });
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  console.log(\`Found input by label: "\${labelText}"\`);
  return locator;
}
/**
 * And I find element by Id "..."
 * Uses locator('#id')
 */
export async function iFindElementById(page${anyType}, id${stringType}) {
  // Ensure ID starts with # if user forgets
  const selector = id.startsWith('#') ? id : \`#\${id}\`;
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  console.log(\`Found element by ID: \${selector}\`);
  return locator;
}
/**
 * And I click "N"st element by selector "..."
 * Example: And I click "1"st element by selector ".btn"
 */
export async function iClickNthElementBySelector(page${anyType}, n${stringType}, selector${stringType}) {
  const index = parseInt(n.replace(/\D/g, '')) - 1; // "1"st → 0, "2"nd → 1, etc.
  if (isNaN(index)) throw new Error(\`Invalid nth value: \${ n } \`);

  const locator = page.locator(selector).nth(index);
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  await locator.click();
  console.log(\`Clicked the \${ n } element matching selector: \${ selector } \`);
}
/**
 * And I click on exact text "..."
 * Clicks the first element that **exactly matches** the given visible text.
 * Uses page.getByText(..., { exact: true })
 */
export async function iClickOnExactText(page${anyType}, text${stringType}) {
  // Use exact match to avoid partial matches like "Submit Form" when you want "Submit"
  const locator = page.getByText(text, { exact: true });
  
  try {
    await locator.waitFor({ state: 'visible', timeout: 20000 });
    const count = await locator.count();
    if (count === 0) {
      throw new Error(\`No element found with exact text: "\${text}"\`);
    }
    if (count > 1) {
      console.warn(\`⚠️ Multiple (\${count}) elements found with exact text "\${text}". Clicking the first.\`);
    }

    await locator.first().click(); // safest: click first even if multiple
    console.log(\`✅ Clicked element with exact text: "\${text}"\`);
  } catch (error) {
    console.error(\`Failed to click exact text "\${text}":\`, error.message || error);
    throw error;
  }
}
/**
 * And I fill the "N"rd field element by selector "..." with "..."
 * Example: And I fill the "3"rd field element by selector "input" with "08012345678"
 */
export async function iFillNthFieldBySelector(page${anyType}, n${stringType}, selector${stringType}, value${stringType}) {
  const index = parseInt(n.replace(/\D/g, '')) - 1;
  if (isNaN(index)) throw new Error(\`Invalid nth value: \${ n } \`);

  const locator = page.locator(selector).nth(index);
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  await locator.fill(value);
  console.log(\`Filled the \${ n } element matching "\${selector}" with "\${value}"\`);
}
`;

    fs.writeFileSync(
      path.join(outputPath, "steps", `sample.steps${stepExtension}`),
      sampleSteps,
    );
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
        types: ["k6"],
      },
      include: ["src/**/*", "steps/**/*", "**/*.ts"],
      exclude: ["node_modules"],
    };

    fs.writeFileSync(
      path.join(outputPath, "tsconfig.json"),
      JSON.stringify(tsconfig, null, 2),
    );
  }
}
