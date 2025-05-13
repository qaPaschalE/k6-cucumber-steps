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
const axios = require("axios");

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

When(
  "I use JSON payload from {string} for {word} to {string}",
  function (fileName, method, endpoint) {
    const allowedMethods = ["POST", "PUT", "PATCH"];
    const methodUpper = method.toUpperCase();

    if (!allowedMethods.includes(methodUpper)) {
      throw new Error(
        `Method "${method}" is not supported. Use one of: ${allowedMethods.join(
          ", "
        )}`
      );
    }

    const basePayloadPath =
      this.parameters?.payloadPath || path.resolve(__dirname, "../../payloads");
    const payloadPath = path.resolve(basePayloadPath, fileName);

    if (!fs.existsSync(payloadPath)) {
      throw new Error(`Payload file not found: ${payloadPath}`);
    }

    const rawTemplate = fs.readFileSync(payloadPath, "utf-8");
    const resolved = resolveBody(rawTemplate, {
      ...process.env,
      ...(this.aliases || {}),
    });

    this.config = {
      method: methodUpper,
      endpoint,
      body: resolved,
      headers: this.config?.headers || {},
      options: {
        vus: 1,
        iterations: 1,
      },
    };

    this.lastRequest = {
      method: methodUpper,
      endpoint,
      body: resolved,
    };
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
 * Then I store the value at "data.token" as alias "token"
 */
Then(
  "I store the value at {string} as alias {string}",
  function (jsonPath, alias) {
    if (!this.lastResponse) {
      throw new Error("No previous response available.");
    }

    const pathParts = jsonPath.split(".");
    let value = this.lastResponse;

    for (const key of pathParts) {
      value = value?.[key];
      if (value === undefined) break;
    }

    if (value === undefined) {
      throw new Error(`Could not resolve path "${jsonPath}" in the response`);
    }

    if (!this.aliases) this.aliases = {};
    this.aliases[alias] = value;

    console.log(`🧩 Stored alias "${alias}":`, value);
  }
);
When(
  "I login via POST to {string} with payload from {string}",
  async function (endpoint, fileName) {
    const basePayloadPath =
      this.parameters?.payloadPath || path.resolve(__dirname, "../../payloads");
    const payloadPath = path.resolve(basePayloadPath, fileName);

    if (!fs.existsSync(payloadPath)) {
      throw new Error(`Payload file not found: ${payloadPath}`);
    }

    const rawTemplate = fs.readFileSync(payloadPath, "utf-8");

    const resolved = resolveBody(rawTemplate, {
      ...process.env,
      ...(this.aliases || {}),
    });

    try {
      const response = await axios.post(
        `${process.env.BASE_URL}${endpoint}`,
        resolved,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      this.lastResponse = response.data; // ✅ Makes aliasing work
      console.log("🔐 Login successful, response saved to alias context.");
    } catch (err) {
      console.error("❌ Login request failed:", err.message);
      throw new Error("Login request failed");
    }
  }
);

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
      const scriptContent = buildK6Script(this.config);
      const scriptPath = await generateK6Script(
        scriptContent,
        "load",
        process.env.K6_CUCUMBER_OVERWRITE === "true"
      );
      const stdout = await runK6Script(
        scriptPath,
        process.env.K6_CUCUMBER_OVERWRITE === "true"
      );
      console.log(stdout);
    } catch (error) {
      console.error("k6 execution failed:", error.message);
      throw new Error("k6 test execution failed");
    }
  }
);
