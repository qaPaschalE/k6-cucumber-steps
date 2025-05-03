const { setWorldConstructor } = require("@cucumber/cucumber");

class CustomWorld {
  constructor({ parameters }) {
    this.options = {};
    this.configurations = {};
    this.endpoints = [];
    this.authType = "";
    this.postBody = {};
    this.overwrite =
      parameters?.overwrite ||
      process.env.K6_CUCUMBER_OVERWRITE === "true" ||
      false;
  }
}

setWorldConstructor(CustomWorld);
