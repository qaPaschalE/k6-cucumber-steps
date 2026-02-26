# k6-cucumber-steps 🥒🧪

<table align="center" style="margin-bottom:30px;"><tr><td align="center" width="9999" heigth="9999" >
 <img src="assets/paschal logo (2).png" alt="paschal Logo" style="margin-top:25px;" align="center"/>
</td></tr></table>

[![npm version](https://img.shields.io/npm/v/k6-cucumber-steps.svg)](https://www.npmjs.com/package/k6-cucumber-steps)
[![npm downloads](https://img.shields.io/npm/dt/k6-cucumber-steps.svg)](https://www.npmjs.com/package/k6-cucumber-steps)
[![license](https://img.shields.io/npm/l/k6-cucumber-steps)](https://github.com/qaPaschalE/k6-cucumber-steps/blob/main/LICENSE)
[![Cucumber](https://img.shields.io/badge/built%20with-Cucumber-3178c6.svg)](https://cucumber.io/)
[![Node.js](https://img.shields.io/badge/node-%3E=18-green.svg)](https://nodejs.org/)
[![Sponsor](https://img.shields.io/github/sponsors/qaPaschalE?style=social)](https://github.com/sponsors/qaPaschalE)
[![Build Status](https://github.com/qaPaschalE/k6-cucumber-steps/actions/workflows/k6-load-test.yml/badge.svg)](https://github.com/aPaschalE/k6-cucumber-steps/actions/workflows/k6-load-test.yml)

Run [k6](https://k6.io/) performance/load tests using [Cucumber](https://cucumber.io/) BDD syntax with ease.

---

## 📚 Step Definitions Documentation

All step definitions are fully documented and available in multiple formats:

### 1. TypeDoc API Documentation
Interactive HTML documentation with search and navigation:

**Online:** [View TypeDoc Documentation](https://qapaschale.github.io/k6-cucumber-steps/docs/)

**Locally:**
```bash
# Generate documentation
npm run docs

# View in browser
npm run docs:serve
```

### 2. Step Metadata (JSON)
When you initialize a project, a `steps/metadata.json` file is generated containing:
- All available step patterns
- Function names and parameters
- Categories (HTTP, Browser, Assertions, etc.)
- Descriptions for each step

### 3. TypeScript Type Definitions
The `src/steps.d.ts` file provides:
- Full TypeScript type definitions
- JSDoc comments with examples
- IntelliSense support in IDEs

### 4. README Reference
See the [Step Definitions Reference](#step-definitions-reference) section below for common usage examples.

---

## ✨ Features

- ✅ Cucumber + Gherkin for writing k6 tests
  to generate JSON and HTML reports.
- ✅ Flexible configuration through Cucumber data tables.
- ✅ Support for JSON body parsing and escaping
- ✅ **Environment Variable Support**: Dynamic request body generation using `{{VARIABLE_NAME}}` placeholders
- ✅ **Enhanced Auth Storage**: Store tokens with aliases for cross-scenario reuse
- ✅ `.env` + `K6.env`-style variable resolution (`{{API_KEY}}`)
- ✅ Support for headers, query params, stages
- ✅ Supports multiple authentication types: API key, Bearer token, Basic Auth, and No Auth.
- ✅ **Extended HTTP Methods**: GET, POST, PUT, PATCH with body support
- ✅ **Response Time Assertions**: Validate API performance with millisecond/second thresholds
- ✅ **Property Validation**: Deep nested property checks, boolean assertions, empty checks
- ✅ **Alias System**: Store and compare response values across scenarios
- ✅ Clean-up of temporary k6 files after execution
- ✅ Built-in support for **distributed load testing** with stages
- ✅ TypeScript-first 🧡

## ✨ Key Enhancements

- 🚀 **One-Command Setup**: Use `init` to scaffold a full k6 project with sample features and steps.
- 📂 **Centralized Reporting**: Automatically generates HTML and JSON reports in a dedicated `reports/` folder.
- 🔑 **Dynamic Auth Storage**: Store tokens from one scenario and reuse them in another via `globalThis` memory.
- 🛠 **JS & TS Support**: Generate your project in pure JavaScript or TypeScript.
- 📊 **Metric Segmentation**: Scenarios are wrapped in k6 `group()` blocks for cleaner reporting.

## 🆕 What's New in v2.0.8

### ⚠️ Breaking Change: Step Definition Prefix

All step definitions now use the **`k6` prefix** to avoid conflicts with other step libraries and make it clear these are k6-specific steps.

**Before:**
```gherkin
Given the base URL is "{{API_BASE_URL}}"
When I make a GET request to "/users/1"
```

**After:**
```gherkin
Given the k6 base URL is "{{API_BASE_URL}}"
When I k6 make a GET request to "/users/1"
```

### 🌍 Environment Variable Support

Replace placeholders in your tests using `{{VARIABLE_NAME}}` syntax. Values are resolved from:
- `__ENV` (k6 environment variables)
- `K6_*` prefixed variables
- Global context variables

```gherkin
Background:
  Given the k6 base URL is "{{API_BASE_URL}}"

Scenario: Login with environment credentials
  When I k6 authenticate with the following url and request body as "user":
    | endpoint | userName            | password            |
    | /login   | {{TEST_USER_USERNAME}} | {{TEST_USER_PASSWORD}} |
```

### 🔐 Enhanced Alias System

Store response data with custom aliases and reuse across scenarios:

```gherkin
Scenario: Store and reuse values
  When I k6 make a POST request to "/login"
  And I k6 store response "data.accessToken" as "authToken"
  Then the k6 alias "authToken" should not be empty

Scenario: Compare against stored values
  Then the k6 response property "userName" should be alias "expectedUsername"
  And the k6 response property "message" should contain alias "expectedMessage"
```

### 📝 New Assertion Steps

| Step | Description | Example |
|------|-------------|---------|
| `theResponsePropertyShouldNotBeEmpty` | Validate property has a value | `Then the k6 response property "data.token" should not be empty` |
| `theResponsePropertyShouldBeTrue/False` | Boolean assertions | `Then the k6 response property "success" should be true` |
| `theResponsePropertyShouldHaveProperty` | Check nested properties | `Then the k6 response property "data" should have property "user"` |
| `theResponseTimeShouldBeLessThan...` | Performance assertions | `Then the k6 response time should be less than "500" milliseconds` |
| `theAliasShouldNotBeEmpty` | Validate stored aliases | `Then the k6 alias "authToken" should not be empty` |
| `theAliasShouldBeEqualTo` | Compare alias to value | `Then the k6 alias "username" should be equal to "test_user"` |

### 🌐 Extended HTTP Support

- **PUT requests**: `When I k6 make a PUT request to "/users/1"`
- **PUT with body**: `When I k6 make a PUT request to "/users/1" with body:`
- **PATCH requests**: `When I k6 make a PATCH request to "/api/settings"`
- **PATCH with body**: `When I k6 make a PATCH request to "/api/settings" with body:`

### 🖨️ Debug Helpers

```gherkin
And I k6 print alias "authToken"      # Print a specific alias
And I k6 print all aliases            # Print all stored aliases
```

### 🧹 Utility Steps

```gherkin
Given I k6 clear auth token           # Remove Authorization header
```

## ✨ New: Hybrid Performance Testing

You can now combine **Protocol-level (HTTP)** load testing and **Browser-level (Web Vitals)** testing in a single Gherkin suite.

- **API Testing**: High-concurrency stress testing at the protocol layer.
- **Browser Testing**: Real browser rendering metrics (LCP, CLS, FID) using k6 browser (Chromium).

---

---

## 🚀 Quick Start (Scaffolding a New Project)

### 🧪 Usage Examples

#### Initialize in current directory:
```bash
npx k6-cucumber-steps init
# or
npx k6-cucumber-steps init .
```

→ Creates `features/`, `steps/`, `generated/`, etc. **in your current folder**

#### Initialize in a new subdirectory:
```bash
# Initialize in current dir with TypeScript (default)
npx k6-cucumber-steps init

# Initialize in current dir with JavaScript
npx k6-cucumber-steps init -l js

# Initialize in subdirectory with JS
npx k6-cucumber-steps init my-project -l js
```

→ Creates `my-project/` with full structure

---

## 🛠️ Project Structure

The `init` command creates a clean, industry-standard directory structure:

```text
.
├── data/                 # User credentials and seed data
├── features/             # Gherkin .feature files
├── steps/                # Step definitions (logic)
├── generated/            # Compiled k6 scripts (auto-generated)
├── reports/              # HTML & JSON test results
└── package.json          # Test scripts and dependencies

```

---

## 🛠️ CLI Reference

#### Options

The `npx k6-cucumber-steps` command accepts the following options:

### `init`

Scaffolds a new project.

- `--lang <js|ts>`: Choose the project language (default: `ts`).
- `--force`: Overwrite existing files in the current directory.
- `.command("init")`
  `description`: "Initialize a new k6-cucumber project
- `.argument "[path]"`: "Output directory path", "./k6-test-project"
- `-f, --feature <path>`: "Path to feature files", "./features"
- `-t, --tags <string>`: Cucumber tags to filter scenarios (e.g., `@smoke and not @regression`).

### `generate`

Parses your `.feature` files and creates the k6-compatible execution scripts in the `generated/` folder.

- `.command("generate")`
- `.description`: ("Generate k6 scripts from feature files")
- `--lang <js|ts>`: Choose the project language (default: `ts`).

### `run` (Direct Execution)

For projects where you prefer to run single features directly.

- `-f, --feature <path>`: Path to specific feature.

---

## 🧼 Clean-up & Maintenance

- **`npm run clean`**: Wipes the `reports/` and `generated/` folders.
- **`npm run report`**: Opens the latest HTML report in your default browser.

---

## 🔐 Environment Variables Support

The generated project includes `dotenv-cli` for easy environment variable management.

### Using .env file

1. Create a `.env` file in your project root:
```bash
API_BASE_URL=https://api.example.com
AUTH_BASE_URL=https://auth.example.com
TEST_USER_USERNAME=myuser
TEST_USER_PASSWORD=mypassword
POST_TITLE=My Test Post
CLIENT_ID=my-client-id
CLIENT_SECRET=my-secret
```

2. Run tests with environment variables:
```bash
# Using dotenv-cli to load .env file
npx dotenv-cli -- k6 run generated/test.generated.ts

# Or add to your package.json scripts:
"test:env": "dotenv-cli -- k6 run generated/test.generated.ts"
```

### Using K6_ prefixed variables

You can also use `K6_` prefixed environment variables directly:
```bash
K6_API_BASE_URL=https://api.example.com k6 run generated/test.generated.ts
```

### In your feature files

Use `{{VARIABLE_NAME}}` syntax to reference environment variables:
```gherkin
Background:
  Given the k6 base URL is "{{API_BASE_URL}}"

Scenario: Login with environment credentials
  When I k6 authenticate with the following url and request body as "user":
    | endpoint | userName            | password            |
    | /login   | {{TEST_USER_USERNAME}} | {{TEST_USER_PASSWORD}} |
```

---

## 🔑 Advanced Authentication Flow

We now support **Dynamic Handshake Authentication**. You can log in once in an initial scenario, store the token, and all subsequent scenarios will automatically be authenticated.

### Step 1: Login and Capture

```gherkin
Scenario: Authenticate and Store Token
  When I authenticate with the following url and request body as "standard_user":
    | endpoint | username      | password    |
    | /login   | paschal_qa    | pass123     |
  And I store "data.token" in "data/standard_user.json"

```

### Step 2: Reuse Token

```gherkin
Background:
  And I am authenticated as a "standard_user" # Lookups token from memory

```

## 🚀 Usage

### Browser Testing (@browser)

Simply tag your scenario with `@browser`. The generator will automatically launch a Chromium instance, manage the page lifecycle, and inject the `page` object into your steps.

```gherkin
@browser
Scenario: Verify Homepage UI and Web Vitals
  Given the base URL is "https://test.k6.io"
  When I navigate to the "/" page
  Then I see the text on the page "Collection of simple web-pages"

```

### Dynamic Auth & Storage

Log in via API and reuse the token across any scenario (including Browser scenarios).

```gherkin
Scenario: Login and Save Session
  When I authenticate with the following url and request body as "admin":
    | endpoint | username | password |
    | /login   | admin    | p@ss123  |
  And I store "token" in "data/admin.json"

```

<a name="step-definitions-reference"></a>
## 🧼 Step Definitions Reference

| Step Example                          | Layer   | Description                  |
| ------------------------------------- | ------- | ---------------------------- |
| `When I k6 make a GET request to "/api"` | API     | Standard HTTP request.       |
| `When I k6 make a POST request to "/api"` | API    | Create resource with stored body |
| `When I k6 make a PUT request to "/api"` | API     | Update resource with stored body |
| `When I k6 make a PATCH request to "/api"` | API   | Partial update with stored body |
| `When I k6 navigate to the "/home" page` | Browser | Opens URL in Chromium.       |
| `And I k6 click the button ".submit"`    | Browser | Interacts with DOM elements. |
| `And I k6 store "path" in "file.json"`   | Both    | Dynamic data persistence.    |
| `And I k6 store response "data.token" as "authToken"` | API | Store response with alias |
| `Then the k6 response property "id" should be "123"` | API | Validate property value |
| `Then the k6 response property "success" should be true` | API | Boolean assertion |
| `Then the k6 response time should be less than "500" milliseconds` | API | Performance check |
| `Then the k6 alias "authToken" should not be empty` | API | Validate stored alias |

---

## 📊 Automated Reporting

Every test run now produces a rich HTML dashboard. Your scenarios are grouped naturally, making it easy to identify which specific Gherkin scenario is causing performance bottlenecks.

**Find your reports at:**

- `reports/summary.html`: Interactive dashboard.
- `reports/results.json`: Full k6 metric data.
- `reports/tokens_debug.json`: View captured tokens during the run.

---

## Step Definitions

### Authentication Steps

```gherkin
When I k6 authenticate with the following url and request body as "standard_user":
| endpoint | username      | password    |
    | /login   | paschal_qa    | pass123     |
And I k6 am authenticated as a "standard_user" # Lookups token from memory
```

### Environment Variable Steps

```gherkin
Background:
  Given the k6 base URL is "{{API_BASE_URL}}"  # Resolves from __ENV or .env

Scenario: Use environment variables in request body
  Given I k6 have the following post data:
    """
    {
      "username": "{{TEST_USER_USERNAME}}",
      "password": "{{TEST_USER_PASSWORD}}"
    }
    """
```

### Payload JSON File Steps

Load request body from a JSON file with support for both environment variables and aliases.

```gherkin
Scenario: Use payload.json file with env vars and aliases
  # First, store a token as an alias
  When I k6 authenticate with the following url and request body as "user":
    | endpoint | username | password |
    | /login   | testuser | pass123  |
  And I k6 store response "accessToken" as "authToken"
  
  # Load payload from file (supports {{VARIABLE_NAME}} and {{alias:NAME}})
  Given I k6 use payload json from file "payload.json"
  When I k6 make a POST request to "/api/users"
  
  # Or combine loading and request in one step
  When I k6 make a POST request to "/api/users" with payload from "data/create-user.json"
```

**File Resolution Order:**
1. `data/{fileName}` if exists
2. `{fileName}` in project root if exists  
3. `payload.json` in project root as fallback

**Template Syntax:**
- `{{VARIABLE_NAME}}` - Replaced with environment variable value
- `{{alias:NAME}}` - Replaced with stored alias value

**Example payload.json:**
```json
{
  "title": "{{POST_TITLE}}",
  "author": "{{alias:username}}",
  "token": "{{alias:authToken}}",
  "body": "Content with {{VARIABLE_NAME}} support"
}
```

### Alias & Storage Steps

```gherkin
Scenario: Store and reuse values
  When I k6 make a POST request to "/login"
  And I k6 store response "data.accessToken" as "authToken"
  Then the k6 alias "authToken" should not be empty

  # Compare response against stored alias
  Then the k6 response property "userName" should be alias "expectedUsername"

  # Debug: print stored values
  And I k6 print alias "authToken"
  And I k6 print all aliases
```

### Response Assertion Steps

```gherkin
# Property validation
Then the k6 response property "data.id" should be "123"
Then the k6 response property "data.token" should not be empty
Then the k6 response property "success" should be true
Then the k6 response property "deleted" should be false
Then the k6 response property "user" should have property "email"
Then the k6 response property "message" should contain "success"

# Performance assertions
Then the k6 response time should be less than "500" milliseconds
Then the k6 response time should be less than "2" seconds

# Alias comparisons
Then the k6 alias "authToken" should not be empty
Then the k6 alias "username" should be equal to "test_user"
Then the k6 response property "token" should be alias "expectedToken"
```

### HTTP Request Steps

```gherkin
# GET requests
When I k6 make a GET request to "/users/1"
When I k6 make a GET request to "/users/1" with headers:
  | Authorization | Content-Type     |
  | Bearer abc123 | application/json |

# POST requests
When I k6 make a POST request to "/users"

# PUT requests
When I k6 make a PUT request to "/users/1"
When I k6 make a PUT request to "/users/1" with body:

# PATCH requests
When I k6 make a PATCH request to "/settings"
When I k6 make a PATCH request to "/settings" with body:
```

### Sample Features

```gherkin
@smoke @vus:10 @duration:1m
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


```

### Assertion Steps

```gherkin
Then the response status should be 200
Then the response should contain "name"
Then the response status should be <expectedStatus>

```

<!-- ## Test Results

Below is an example of the Cucumber report generated after running the tests:
<img src="assets/k6-cucumber-report.png" alt="Cucumber report generated after running the tests" width="60%" />
<img src="assets/k6-cucumber-report2.png" alt="Cucumber report generated after running the tests" width="60%" /> -->

<!-- ### Explanation of the Report

- **All Scenarios**: Total number of scenarios executed.
- **Passed Scenarios**: Number of scenarios that passed.
- **Failed Scenarios**: Number of scenarios that failed.
- **Metadata**: Information about the test environment (e.g., browser, platform).
- **Feature Overview**: Summary of the feature being tested.
- **Scenario Details**: Detailed steps and their execution status. -->

<!-- ## 🧼 Temporary Files Clean-up

All generated k6 scripts and artifacts are cleaned automatically after test execution.

--- -->

## 💖 Support

If you find this package useful, consider [sponsoring me on GitHub](https://github.com/sponsors/qaPaschalE). Your support helps me maintain and improve this project!

## 📄 License

MIT License - [@qaPaschalE](https://github.com/qaPaschalE)

- This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
