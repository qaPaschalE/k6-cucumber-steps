# k6-cucumber-steps 🥒🧪

[![npm version](https://img.shields.io/npm/v/k6-cucumber-steps.svg)](https://www.npmjs.com/package/k6-cucumber-steps)
[![npm downloads](https://img.shields.io/npm/dt/k6-cucumber-steps.svg)](https://www.npmjs.com/package/k6-cucumber-steps)
[![License](https://img.shields.io/npm/l/k6-cucumber-steps.svg)](./LICENSE)
[![Cucumber](https://img.shields.io/badge/built%20with-Cucumber-3178c6.svg)](https://cucumber.io/)
[![Node.js](https://img.shields.io/badge/node-%3E=18-green.svg)](https://nodejs.org/)

Run [k6](https://k6.io/) performance/load tests using [Cucumber](https://cucumber.io/) BDD syntax with ease.

---

## ✨ Features

- ✅ Cucumber + Gherkin for writing k6 tests
- ✅ Support for JSON body parsing and escaping
- ✅ Faker support (`{{faker.name.firstName}}`)
- ✅ `.env` + `K6.env`-style variable resolution (`{{API_KEY}}`)
- ✅ Support for headers, query params, stages
- ✅ Clean-up of temporary k6 files after execution
- ✅ Built-in support for **distributed load testing** with stages
- ✅ TypeScript-first 🧡

---

## 📦 Install

```bash
npm install k6-cucumber-steps
```

````

---

## 🚀 Usage

### CLI

```bash
npx k6-cucumber-steps run --feature ./features/example.feature
```

### Programmatic

```ts
import { runK6Feature } from "k6-cucumber-steps";

await runK6Feature("./features/example.feature");
```

---

## 📂 Project Structure

```
k6-cucumber-steps/
├── src/
│   ├── core/          # Main runner and executor
│   ├── steps/         # Step definitions
│   ├── utils/         # Body resolver, faker, env utils
│   └── templates/     # k6 template file
├── features/          # Your .feature files
├── payloads/          # Optional: external JSON payloads
├── index.ts           # CLI/programmatic entry
```

---

## 🧪 Gherkin Examples

### ✅ Basic GET Request

```gherkin
Feature: Load test a public API

  Scenario: Simple GET call
    Given the base URL is "https://jsonplaceholder.typicode.com"
    And the endpoint is "/posts/1"
    And the request method is "GET"
    When I run the k6 script with the following configurations:
      | virtual_users | duration |
      | 10            | 5        |
```

---

### 📤 POST with JSON Body and Faker

```gherkin
Feature: Create user via API

  Scenario: Send POST request
    Given the base URL is "https://api.example.com"
    And the endpoint is "/users"
    And the request method is "POST"
    And the request body is:
      """
      {
        "email": "{{faker.internet.email}}",
        "password": "Test@123"
      }
      """
    And the request headers are:
      | Header         | Value             |
      | Content-Type   | application/json  |
      | Authorization  | Bearer {{TOKEN}}  |
    When I run the k6 script with the following configurations:
      | virtual_users | duration |
      | 50            | 10       |
```

---

### 🧪 With Custom Headers and Query Params

```gherkin
Feature: Test query and headers

  Scenario: GET with headers and query params
    Given the base URL is "https://api.example.com"
    And the endpoint is "/products"
    And the request method is "GET"
    And the query params are:
      | key   | value    |
      | q     | gadgets  |
    And the request headers are:
      | Header       | Value            |
      | x-api-key    | {{API_KEY}}      |
      | Accept       | application/json |
    When I run the k6 script with the following configurations:
      | virtual_users | duration |
      | 25            | 15       |
```

---

### 📊 Distributed Execution with Stages

```gherkin
Feature: Spike test with k6 stages

  Scenario: Gradual load increase
    Given the base URL is "https://api.example.com"
    And the endpoint is "/orders"
    And the request method is "GET"
    When I run the k6 script with the following configurations:
      | stages                     |
      | [{ "duration": "30s", "target": 20 }, { "duration": "1m", "target": 50 }] |
```

---

## 🔐 Environment Variables

Use `{{VAR_NAME}}` syntax anywhere and define them in your `.env` file or system envs.

```env
API_KEY=abc123xyz
TOKEN=eyJhbGciOiJIUzI1...
```

---

## 🧼 Temporary Files Clean-up

All generated k6 scripts and artifacts are cleaned automatically after test execution.

---

## 👨‍💻 Development

```bash
npm install
npm run build
npm link   # optional: test globally
```

---

## 📤 Publish

1. Bump version in `package.json`
2. Run:

```bash
npm publish --access public
```

Ensure `.npmignore` includes:

```
features/
payloads/
*.test.ts
tsconfig.json
```

---

## 📄 License

MIT © [Your Name or Org]

```

```
````
