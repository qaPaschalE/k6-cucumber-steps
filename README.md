# k6-cucumber-steps 🥒🧪

<table align="center" style="margin-bottom:30px;"><tr><td align="center" width="9999" heigth="9999" >
 <img src="assets/paschal logo (2).png" alt="paschal Logo" style="margin-top:25px;" align="center"/>
</td></tr></table>

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

## Setup

1. **Environment Variables**: Create a `.env` file in your project root based on the provided `.env.example`:

   ```env
   BASE_URL=https://api.example.com
   API_KEY=your_api_key
   BEARER_TOKEN=your_bearer_token
   BASIC_USER=your_basic_user
   BASIC_PASS=your_basic_pass
   ```

2. **Feature Files**: Write your feature files using the provided step definitions.

## Gherkin Examples

Here’s how you can write a feature file using the provided step definitions:

### Example 1: Test GET Endpoint with No Authentication

```gherkin
Feature: API Performance Testing

  Scenario: Run load tests with dynamic GET requests
    Given I have a k6 script for GET testing
    When I run the k6 script with the following configurations:
      | virtual_users | duration | http_req_failed | http_req_duration |
      | 50            | 10       | rate<0.05       | p(95)<3000        |
    And the following endpoint(s) is/are used:
      """
      /api/profile
      https://reqres.in/api/users?page=2
      """
    And when the authentication type is "none"
    Then the API should handle the GET request successfully
```

### Example 2: Test POST Endpoint with Bearer Token Authentication

```gherkin
Feature: API Performance Testing

  Scenario: Run load tests with dynamic POST requests
    Given I have a k6 script for POST testing
    When I run the k6 script with the following configurations:
      | virtual_users | duration | http_req_failed | http_req_duration |
      | 20            | 60       | rate<0.01       | p(95)<300         |
    And the authentication type is "bearer_token"
    And the following endpoint(s) is/are used:
      """
      /api/v1/users
      """
    And the following POST body is used for "/api/v1/users"
      """
      {
        "username": "{{username}}",
        "email": "{{faker.internet.email}}"
      }
      """
    Then the API should handle the POST request successfully
```

## Step Definitions

### Authentication Steps

```gherkin
When the authentication type is "api_key"
When the authentication type is "bearer_token"
When the authentication type is "basic"
When the authentication type is "none"
```

### Request Configuration Steps

```gherkin
Given I have a k6 script for {word} testing
When I run the k6 script with the following configurations:
When the request headers are:
When the following endpoint(s) is/are used:
When the following {word} body is used for {string}
```

### Assertion Steps

```gherkin
Then the API should handle the {word} request successfully
```

## Test Results

Below is an example of the Cucumber report generated after running the tests:

![Cucumber Report](./assets/k6-cucumber-report.png)

### Explanation of the Report

- **All Scenarios**: Total number of scenarios executed.
- **Passed Scenarios**: Number of scenarios that passed.
- **Failed Scenarios**: Number of scenarios that failed.
- **Metadata**: Information about the test environment (e.g., browser, platform).
- **Feature Overview**: Summary of the feature being tested.
- **Scenario Details**: Detailed steps and their execution status.

## 🧼 Temporary Files Clean-up

All generated k6 scripts and artifacts are cleaned automatically after test execution.

---

## 📄 License

MIT License - [@qaPaschalE](https://github.com/qaPaschalE)

```


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


```
