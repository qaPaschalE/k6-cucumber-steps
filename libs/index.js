// lib/index.js (example with JavaScript)
const path = require("path");

/**
 * Registers the k6-cucumber-steps step definitions with the Cucumber runner.
 * @param projectRootDir The absolute path to the root directory of the user's project.
 */
function registerSteps(projectRootDir) {
  // Construct the path to your package's step definitions
  const packageStepsPath = path.resolve(__dirname, "../step_definitions");

  return [packageStepsPath];
}

module.exports = {
  registerSteps,
  buildK6Script: require("./helpers/buildK6Script"),
  generateHeaders: require("./helpers/generateHeaders"),
  resolveBody: require("./helpers/resolveBody"),
  k6Runner: require("./utils/k6Runner"),
};
