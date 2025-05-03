// Import necessary modules
const buildK6Script = require("./libs/helpers/buildK6Script");
const generateHeaders = require("./libs/helpers/generateHeaders");
const resolveBody = require("./libs/helpers/resolveBody");
const {
  generateK6Script: generateTempK6Script,
  runK6Script,
} = require("./libs/utils/k6Runner");

// Export the main functionalities of the package
module.exports = {
  // Helper functions
  buildK6Script,
  generateHeaders,
  resolveBody,

  // k6 script generation and execution utilities
  generateK6Script: generateTempK6Script,
  runK6Script,

  // Step definitions (optional, if users need direct access)
  stepDefinitions: require("./step_definitions/load_test_steps"),
};
export * from "./step_definitions/load_test_steps.js";
