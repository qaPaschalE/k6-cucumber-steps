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

Given("I have a k6 script for {word} testing", function (method) {
  this.config = { method: method.toUpperCase() };
});

When(
  "I run the k6 script with the following configurations:",
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
When("the request headers are:", function (dataTable) {
  const headers = {};
  dataTable.hashes().forEach(({ Header, Value }) => {
    headers[Header] = Value;
  });

  this.config.headers = {
    ...this.config.headers, // preserve auth headers if set
    ...headers,
  };
});

When("the following endpoint\\(s) is\\/are used:", function (docString) {
  this.config.endpoints = docString
    .trim()
    .split("\n")
    .map((line) => line.trim());
});

When(
  "the following {word} body is used for {string}",
  function (method, endpoint, docString) {
    this.config.method = method.toUpperCase();
    this.config.body = resolveBody(docString, process.env);
    this.config.endpoint = endpoint;
  }
);

When("the authentication type is {string}", function (authType) {
  this.config.headers = generateHeaders(authType, process.env);
});

// Then(
//   "the API should handle the {word} request successfully",
//   { timeout: 60000 }, // Increase timeout to 60 seconds
//   async function (method) {
//     // Normalize both values to uppercase for comparison
//     const expectedMethod = method.toUpperCase();
//     const actualMethod = this.config.method.toUpperCase();

//     if (actualMethod !== expectedMethod) {
//       throw new Error(
//         `Mismatched HTTP method: expected "${expectedMethod}", got "${actualMethod}"`
//       );
//     }

//     try {
//       // Generate the k6 script content
//       const scriptContent = buildK6Script(this.config);

//       // Generate the temporary k6 script file
//       const scriptPath = generateK6Script(scriptContent);

//       // Run the k6 script and capture the output
//       const stdout = await runK6Script(scriptPath);
//     } catch (error) {
//       console.error("k6 execution failed:", error.message);
//       console.error("k6 stderr:", error.stderr); // Log stderr for debugging
//       throw new Error("k6 test execution failed");
//     }
//   }
// );

Then(
  "the API should handle the {word} request successfully",
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
      const scriptPath = generateK6Script(scriptContent);
      const stdout = await runK6Script(scriptPath);
    } catch (error) {
      console.error("k6 execution failed:", error.message);
      throw new Error("k6 test execution failed");
    }
    console.log("Final configuration before k6 execution:", this.config);
  }
);
