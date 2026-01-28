// src/index.ts
import { InitCommand } from "./commands/init.command";
import { FeatureParser } from "./generators/feature.parser";
import { K6ScriptGenerator } from "./generators/k6-script.generator";
import { ProjectGenerator } from "./generators/project.generator";
import { K6Runner } from "./runners/k6.runner";
import { Given, When, Then, And, But } from "./step-registry";

export {
  InitCommand,
  FeatureParser,
  K6ScriptGenerator,
  ProjectGenerator,
  K6Runner,
  Given,
  When,
  Then,
  And,
  But,
};

// Export types
export * from "./types";

// Main package version
export const VERSION = require("../package.json").version;

// Default export for convenience
export default {
  InitCommand,
  FeatureParser,
  K6ScriptGenerator,
  ProjectGenerator,
  K6Runner,
  Given,
  When,
  Then,
  And,
  But,
  VERSION,
};
