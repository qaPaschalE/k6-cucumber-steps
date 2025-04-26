const { setWorldConstructor } = require('@cucumber/cucumber');

class CustomWorld {
  constructor() {
    this.options = {};
    this.configurations = {};
    this.endpoints = [];
    this.authType = '';
    this.postBody = {};
  }
}

setWorldConstructor(CustomWorld);
