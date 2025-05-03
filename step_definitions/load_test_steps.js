// load_test_steps.js

const { Given, When, Then } = require("@cucumber/cucumber");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const resolveBody = require("../lib/helpers/resolveBody.js");
const buildK6Script = require("../lib/helpers/buildK6Script.js");
const generateHeaders = require("../lib/helpers/generateHeaders.js");
const { generateK6Script, runK6Script } = require("../lib/utils/k6Runner.js");
require("dotenv").config();

// Validate thresholds (e.g., "rate<0.01")
const validateThreshold = (threshold) => {
  const regex = /^[\w{}()<>:]+[<>=]\d+(\.\d+)?$/;
  if (!regex.test(threshold)) {
    throw new Error(`Invalid threshold format: ${threshold}`);
  }
};

/**
 * @param {string} method - HTTP method (e.g., GET, POST).
 * @example
 * Given I set a k6 script for GET testing
 * Given I set a k6 script for POST testing
 */
Given("I set a k6 script for {word} testing", function (method) {
  this.config = { method: method.toUpperCase() };
});

/**
 * @param {DataTable} dataTable - Table with configurations.
 * @example
 * When I set to run the k6 script with the following configurations:
 * | virtual_users | duration | http_req_failed | http_req_duration | error_rate | stages                                                              |
 * | 10            | 5        | rate<0.05       | p(95)<200         |            |                                                                     |
 * | 50            | 10       |                 |                   | rate<0.01  | [{"target": 10, "duration": "10s"}, {"target": 50, "duration": "30s"}] |
 */
When(
  "I set to run the k6 script with the following configurations:",
  function (dataTable) {
    const row = dataTable.hashes()[0];

    // Validate thresholds only if they are not placeholders
    const validateIfNotPlaceholder = (value) => {
      if (value && !/^<.*>$/.test(value)) {
        validateThreshold(value);
      }
    };

    validateIfNotPlaceholder(row.http_req_failed);
    validateIfNotPlaceholder(row.http_req_duration);
    validateIfNotPlaceholder(row.error_rate);

    if (row.stages) {
      // User provided a stages definition (JSON array)
      try {
        this.config.options = {
          stages: JSON.parse(row.stages),
          thresholds: {
            http_req_failed: [row.http_req_failed],
            http_req_duration: [row.http_req_duration],
          },
        };
      } catch (err) {
        throw new Error("Invalid stages JSON format.");
      }
    } else {
      // Default to VUs and duration
      this.config.options = {
        vus: parseInt(row.virtual_users),
        duration: `${row.duration}s`,
        thresholds: {
          http_req_failed: [row.http_req_failed],
          http_req_duration: [row.http_req_duration],
        },
      };
    }

    if (row.error_rate && !/^<.*>$/.test(row.error_rate)) {
      this.config.options.thresholds.error_rate = [row.error_rate];
    }
  }
);

/**
 * @param {DataTable} dataTable - Table with header and value for request headers.
 * @example
 * When I set the request headers:
 * | Header        | Value                     |
 * | Content-Type  | application/json          |
 * | Authorization | Bearer your_auth_token    |
 */
When("I set the request headers:", function (dataTable) {
  const headers = {};
  dataTable.hashes().forEach(({ Header, Value }) => {
    headers[Header] = Value;
  });

  this.config.headers = {
    ...this.config.headers, // preserve auth headers if set
    ...headers,
  };
});

/**
 * @param {string} docString - Multiline string containing the endpoints.
 * @example
 * When I set the following endpoints used:
 * """
 * /api/users
 * /api/products
 * """
 */
When("I set the following endpoints used:", function (docString) {
  this.config.endpoints = docString
    .trim()
    .split("\n")
    .map((line) => line.trim());
});

/**
 * @param {string} method - HTTP method (e.g., POST, PUT).
 * @param {string} endpoint - The endpoint for the body.
 * @param {string} docString - Multiline string containing the request body (can use placeholders).
 * @example
 * When I set the following POST body is used for "/api/users"
 * """
 * {
 * "username": "{{username}}",
 * "email": "{{faker.internet.email}}"
 * }
 * """
 */
When(
  "I set the following {word} body is used for {string}",
  function (method, endpoint, docString) {
    this.config.method = method.toUpperCase();
    this.config.body = resolveBody(docString, process.env);
    this.config.endpoint = endpoint;
  }
);

/**
 * @param {string} authType - Authentication type (api_key, bearer_token, basic, none).
 * @example
 * When I set the authentication type to "bearer_token"
 * When I set the authentication type to "api_key"
 * When I set the authentication type to "basic"
 * When I set the authentication type to "none"
 */
When("I set the authentication type to {string}", function (authType) {
  this.config.headers = generateHeaders(authType, process.env);
});

/**
 * @param {string} method - HTTP method of the request.
 * @example
 * Then I see the API should handle the GET request successfully
 * Then I see the API should handle the POST request successfully
 */
Then(
  "I see the API should handle the {word} request successfully",
  { timeout: 60000 },
  async function (method) {
    if (!this.config || !this.config.method) {
      throw new Error("Configuration is missing or incomplete.");
    }
    const expectedMethod = method.toUpperCase();
    const actualMethod = this.config.method.toUpperCase();
    if (actualMethod !== expectedMethod) {
      throw new Error(
        `Mismatched HTTP method: expected "${expectedMethod}", got "${actualMethod}"`
      );
    }
    try {
      // Generate the k6 script content
      const scriptContent = buildK6Script(this.config);

      // Generate the temporary k6 script file with overwrite option
      const scriptPath = await generateK6Script(
        scriptContent,
        "load",
        this.overwrite
      );

      // Run the k6 script with overwrite option
      const stdout = await runK6Script(scriptPath, this.overwrite);

      console.log(stdout);
    } catch (error) {
      console.error("k6 execution failed:", error.message);
      console.error("k6 stderr:", error.stderr); // Log stderr for debugging
      throw new Error("k6 test execution failed");
    }
  }
);
