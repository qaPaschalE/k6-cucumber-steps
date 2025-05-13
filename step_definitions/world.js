const { setWorldConstructor } = require("@cucumber/cucumber");

class CustomWorld {
  constructor({ parameters, pickle }) {
    this.options = {};
    this.configurations = {};
    this.endpoints = [];
    this.authType = "";
    this.postBody = {};
    this.aliases = {};
    this.lastRequest = null;
    this.lastResponse = null;

    this.overwrite =
      parameters?.overwrite ||
      process.env.K6_CUCUMBER_OVERWRITE === "true" ||
      false;

    // ✅ Store scenario example values from <placeholders>
    this.parameters = {};

    if (parameters) {
      this.parameters = { ...parameters };
    }

    if (pickle?.steps?.length) {
      const matches = pickle.steps.flatMap((step) => {
        return [...(step.text?.matchAll(/<([^>]+)>/g) || [])];
      });
      matches.forEach((match) => {
        const key = match[1];
        if (parameters?.[key]) {
          this.parameters[key] = parameters[key];
        }
      });
    }
  }
}

setWorldConstructor(CustomWorld);
