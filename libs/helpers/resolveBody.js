/**
 * @module resolveBody
 * @description
 * This module resolves placeholders in a template string using environment variables,
 * Faker templates, and JSON file includes.
 * It supports the following types of placeholders:
 * 1. Environment variables: {{username}} will be replaced with the value of process.env.username.
 * 2. Faker templates: {{faker.internet.email}} will be replaced with a randomly generated email address.
 * 3. JSON file includes: <address.json> will be replaced with the contents of the address.json file.
 * */
const fs = require("fs");
const path = require("path");
const faker = require("@faker-js/faker");

module.exports = function resolveBody(template, env) {
  let result = template;

  // Replace env vars like {{username}}
  result = result.replace(/{{(\w+)}}/g, (_, key) => {
    if (!(key in env)) {
      console.warn(`Missing environment variable for placeholder: {{${key}}}`);
    }
    return env[key] || "";
  });

  // Support faker templates like {{faker.internet.email}}
  result = result.replace(/{{faker\.([\w.]+)}}/g, (_, methodPath) => {
    const parts = methodPath.split(".");
    let fn = faker;
    for (const part of parts) {
      fn = fn[part];
      if (!fn) break;
    }
    if (typeof fn !== "function") {
      throw new Error(`Invalid Faker template: {{faker.${methodPath}}}`);
    }
    return fn();
  });

  // Replace JSON file includes like <address.json>
  result = result.replace(/<([\w.]+\.json)>/g, (_, fileName) => {
    const filePath = path.join(__dirname, "../payloads", fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Payload file not found: ${fileName}`);
    }
    return JSON.stringify(JSON.parse(fs.readFileSync(filePath, "utf-8")));
  });

  try {
    return JSON.parse(result);
  } catch (error) {
    console.error("Failed to parse resolved body to JSON:", result);
    throw new Error("Invalid JSON body after resolving placeholders.");
  }
};
