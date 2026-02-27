#!/usr/bin/env node
// scripts/generate-metadata.js
// Generates metadata.json in the dist folder after build

const fs = require('fs');
const path = require('path');

const metadata = [
  {
    "step": "the k6 base URL is {string}",
    "functionName": "k6TheBaseUrlIs",
    "description": "Sets the base URL for API requests",
    "category": "HTTP",
    "parameters": ["url: string"]
  },
  {
    "step": "I k6 authenticate with the following url and request body as {string}",
    "functionName": "k6IAuthenticateWithTheFollowingUrlAndRequestBodyAs",
    "description": "Authenticates with the API using the provided credentials",
    "category": "Authentication",
    "parameters": ["context: string", "dataTable: any"]
  },
  {
    "step": "I k6 authenticate with the following url and request body as {string} with {string}",
    "functionName": "k6IAuthenticateWithTheFollowingUrlAndRequestBodyAsWith",
    "description": "Authenticates with the API using the provided credentials and format (json/form)",
    "category": "Authentication",
    "parameters": ["context: string", "format: string", "dataTable: any"]
  },
  {
    "step": "I k6 store {string} in {string}",
    "functionName": "k6IStoreIn",
    "description": "Stores a response value to a file",
    "category": "Storage",
    "parameters": ["jsonPath: string", "fileName: string"]
  },
  {
    "step": "I k6 write {string} to {string}",
    "functionName": "k6IWriteTo",
    "description": "Writes an alias value to a JSON file (creates file if not exists)",
    "category": "Storage",
    "parameters": ["aliasName: string", "fileName: string"]
  },
  {
    "step": "I k6 write {string} to {string} as {string}",
    "functionName": "k6IWriteToAs",
    "description": "Writes an alias value to a JSON file with custom key name",
    "category": "Storage",
    "parameters": ["aliasName: string", "fileName: string", "customKey: string"]
  },
  {
    "step": "I k6 store response {string} as {string}",
    "functionName": "k6IStoreResponseAs",
    "description": "Stores a response property with a custom alias",
    "category": "Storage",
    "parameters": ["propertyPath: string", "alias: string"]
  },
  {
    "step": "I k6 am authenticated as a {string}",
    "functionName": "k6IAmAuthenticatedAsA",
    "description": "Applies stored authentication token to request headers",
    "category": "Authentication",
    "parameters": ["userType: string"]
  },
  {
    "step": "I k6 clear auth token",
    "functionName": "k6IClearAuthToken",
    "description": "Removes the Authorization header",
    "category": "Authentication",
    "parameters": []
  },
  {
    "step": "I k6 set the default headers:",
    "functionName": "k6ISetTheDefaultHeaders",
    "description": "Sets default headers for requests",
    "category": "HTTP",
    "parameters": ["dataTable: any"]
  },
  {
    "step": "I k6 make a GET request to {string}",
    "functionName": "k6IMakeAGetRequestTo",
    "description": "Makes a GET request to the specified endpoint",
    "category": "HTTP",
    "parameters": ["endpoint: string"]
  },
  {
    "step": "I k6 make a GET request to {string} with headers:",
    "functionName": "k6IMakeAGetRequestToWithHeaders",
    "description": "Makes a GET request with custom headers",
    "category": "HTTP",
    "parameters": ["endpoint: string", "headersTable: any"]
  },
  {
    "step": "I k6 make a POST request to {string}",
    "functionName": "k6IMakeAPostRequestTo",
    "description": "Makes a POST request using stored post data",
    "category": "HTTP",
    "parameters": ["endpoint: string"]
  },
  {
    "step": "I k6 make a POST request to {string} with body:",
    "functionName": "k6IMakeAPostRequestToWithBody",
    "description": "Makes a POST request with the provided body",
    "category": "HTTP",
    "parameters": ["endpoint: string", "bodyData: any"]
  },
  {
    "step": "I k6 make a PUT request to {string}",
    "functionName": "k6IMakeAPutRequestTo",
    "description": "Makes a PUT request using stored post data",
    "category": "HTTP",
    "parameters": ["endpoint: string"]
  },
  {
    "step": "I k6 make a PUT request to {string} with body:",
    "functionName": "k6IMakeAPutRequestToWithBody",
    "description": "Makes a PUT request with the provided body",
    "category": "HTTP",
    "parameters": ["endpoint: string", "bodyData: any"]
  },
  {
    "step": "I k6 make a PATCH request to {string}",
    "functionName": "k6IMakeAPatchRequestTo",
    "description": "Makes a PATCH request using stored post data",
    "category": "HTTP",
    "parameters": ["endpoint: string"]
  },
  {
    "step": "I k6 make a PATCH request to {string} with body:",
    "functionName": "k6IMakeAPatchRequestToWithBody",
    "description": "Makes a PATCH request with the provided body",
    "category": "HTTP",
    "parameters": ["endpoint: string", "bodyData: any"]
  },
  {
    "step": "I k6 have the following post data:",
    "functionName": "k6IHaveTheFollowingPostData",
    "description": "Stores POST data for subsequent requests (supports {{VARIABLE_NAME}} placeholders)",
    "category": "HTTP",
    "parameters": ["data: string"]
  },
  {
    "step": "I k6 use payload json from file {string}",
    "functionName": "k6IUsePayloadJsonFromFile",
    "description": "Loads request body from a JSON file (supports {{VARIABLE_NAME}} and {{alias:NAME}})",
    "category": "HTTP",
    "parameters": ["fileName: string"]
  },
  {
    "step": "I k6 make a POST request to {string} with payload from {string}",
    "functionName": "k6IMakeAPostRequestToWithPayloadFile",
    "description": "Makes a POST request using a payload.json file (supports {{VARIABLE_NAME}} and {{alias:NAME}})",
    "category": "HTTP",
    "parameters": ["endpoint: string", "fileName: string"]
  },
  {
    "step": "I k6 make a DELETE request to {string}",
    "functionName": "k6IMakeADeleteRequestTo",
    "description": "Makes a DELETE request to the specified endpoint (supports {{VARIABLE_NAME}})",
    "category": "HTTP",
    "parameters": ["endpoint: string"]
  },
  {
    "step": "I k6 make a DELETE request to {string} with headers:",
    "functionName": "k6IMakeADeleteRequestToWithHeaders",
    "description": "Makes a DELETE request with custom headers (supports {{VARIABLE_NAME}})",
    "category": "HTTP",
    "parameters": ["endpoint: string", "headersTable: any"]
  },
  {
    "step": "I k6 make a DELETE request to {string} with payload from {string}",
    "functionName": "k6IMakeADeleteRequestToWithPayloadFile",
    "description": "Makes a DELETE request using a payload.json file (supports {{VARIABLE_NAME}} and {{alias:NAME}})",
    "category": "HTTP",
    "parameters": ["endpoint: string", "fileName: string"]
  },
  {
    "step": "the k6 response status should be {string}",
    "functionName": "k6TheResponseStatusShouldBe",
    "description": "Asserts the response status code",
    "category": "Assertions",
    "parameters": ["expectedStatus: string"]
  },
  {
    "step": "the k6 response should contain {string}",
    "functionName": "k6TheResponseShouldContain",
    "description": "Asserts the response contains a specific field",
    "category": "Assertions",
    "parameters": ["field: string"]
  },
  {
    "step": "the k6 response property {string} should be {string}",
    "functionName": "k6TheResponsePropertyShouldBe",
    "description": "Asserts a response property equals a specific value",
    "category": "Assertions",
    "parameters": ["propertyPath: string", "expectedValue: string"]
  },
  {
    "step": "the k6 response property {string} should not be empty",
    "functionName": "k6TheResponsePropertyShouldNotBeEmpty",
    "description": "Asserts a response property has a value",
    "category": "Assertions",
    "parameters": ["propertyPath: string"]
  },
  {
    "step": "the k6 response property {string} should be true",
    "functionName": "k6TheResponsePropertyShouldBeTrue",
    "description": "Asserts a response property is true",
    "category": "Assertions",
    "parameters": ["propertyPath: string"]
  },
  {
    "step": "the k6 response property {string} should be false",
    "functionName": "k6TheResponsePropertyShouldBeFalse",
    "description": "Asserts a response property is false",
    "category": "Assertions",
    "parameters": ["propertyPath: string"]
  },
  {
    "step": "the k6 response property {string} should have property {string}",
    "functionName": "k6TheResponsePropertyShouldHaveProperty",
    "description": "Asserts a nested property exists in the response",
    "category": "Assertions",
    "parameters": ["parentPath: string", "childProperty: string"]
  },
  {
    "step": "the k6 response property {string} should contain {string}",
    "functionName": "k6TheResponsePropertyShouldContain",
    "description": "Asserts a response property contains a substring",
    "category": "Assertions",
    "parameters": ["propertyPath: string", "expectedText: string"]
  },
  {
    "step": "the k6 response time should be less than {string} milliseconds",
    "functionName": "k6TheResponseTimeShouldBeLessThanMilliseconds",
    "description": "Asserts the response time is below a threshold in milliseconds",
    "category": "Performance",
    "parameters": ["milliseconds: string"]
  },
  {
    "step": "the k6 response time should be less than {string} seconds",
    "functionName": "k6TheResponseTimeShouldBeLessThanSeconds",
    "description": "Asserts the response time is below a threshold in seconds",
    "category": "Performance",
    "parameters": ["seconds: string"]
  },
  {
    "step": "the k6 alias {string} should not be empty",
    "functionName": "k6TheAliasShouldNotBeEmpty",
    "description": "Asserts a stored alias has a value",
    "category": "Assertions",
    "parameters": ["alias: string"]
  },
  {
    "step": "the k6 alias {string} should be equal to {string}",
    "functionName": "k6TheAliasShouldBeEqualTo",
    "description": "Asserts a stored alias equals a specific value",
    "category": "Assertions",
    "parameters": ["alias: string", "expectedValue: string"]
  },
  {
    "step": "the k6 response property {string} should be alias {string}",
    "functionName": "k6TheResponsePropertyShouldBeAlias",
    "description": "Asserts a response property matches a stored alias",
    "category": "Assertions",
    "parameters": ["propertyPath: string", "alias: string"]
  },
  {
    "step": "the k6 response property {string} should contain alias {string}",
    "functionName": "k6TheResponsePropertyShouldContainAlias",
    "description": "Asserts a response property contains a stored alias value",
    "category": "Assertions",
    "parameters": ["propertyPath: string", "alias: string"]
  },
  {
    "step": "the k6 response property {string} should not be alias {string}",
    "functionName": "k6TheResponsePropertyShouldNotBeAlias",
    "description": "Asserts a response property does not match a stored alias",
    "category": "Assertions",
    "parameters": ["propertyPath: string", "alias: string"]
  },
  {
    "step": "I k6 print alias {string}",
    "functionName": "k6IPrintAlias",
    "description": "Prints a stored alias value to console",
    "category": "Debug",
    "parameters": ["alias: string"]
  },
  {
    "step": "I k6 print all aliases",
    "functionName": "k6IPrintAllAliases",
    "description": "Prints all stored aliases to console",
    "category": "Debug",
    "parameters": []
  },
  {
    "step": "I k6 navigate to the {string} page",
    "functionName": "k6INavigateToThePage",
    "description": "Navigates to a page URL",
    "category": "Browser",
    "parameters": ["page: any", "url: string"]
  },
  {
    "step": "the k6 page title should be {string}",
    "functionName": "k6ThePageTitleShouldBe",
    "description": "Asserts the page title",
    "category": "Browser",
    "parameters": ["page: any", "expectedTitle: string"]
  },
  {
    "step": "the k6 current URL should contain {string}",
    "functionName": "k6TheCurrentUrlShouldContain",
    "description": "Asserts the current URL contains a fragment",
    "category": "Browser",
    "parameters": ["page: any", "expectedFragment: string"]
  },
  {
    "step": "I k6 click",
    "functionName": "k6IClick",
    "description": "Clicks the currently focused element",
    "category": "Browser",
    "parameters": ["page: any"]
  },
  {
    "step": "I k6 click on the element {string}",
    "functionName": "k6IClickOnTheElement",
    "description": "Clicks an element by selector",
    "category": "Browser",
    "parameters": ["page: any", "selector: string", "nth?: string"]
  },
  {
    "step": "I k6 click on exact text {string}",
    "functionName": "k6IClickOnExactText",
    "description": "Clicks an element by exact text match",
    "category": "Browser",
    "parameters": ["page: any", "text: string"]
  },
  {
    "step": "I k6 click the button {string}",
    "functionName": "k6IClickTheButton",
    "description": "Clicks a button by selector",
    "category": "Browser",
    "parameters": ["page: any", "selector: string"]
  },
  {
    "step": "I k6 fill the field {string} with {string}",
    "functionName": "k6IFillTheFieldWith",
    "description": "Fills a field with a value",
    "category": "Browser",
    "parameters": ["page: any", "selector: string", "value: string"]
  },
  {
    "step": "I k6 fill {string}",
    "functionName": "k6IFill",
    "description": "Fills the currently focused element",
    "category": "Browser",
    "parameters": ["page: any", "value: string"]
  },
  {
    "step": "I k6 fill the {string} field element by selector {string} with {string}",
    "functionName": "k6IFillNthFieldBySelector",
    "description": "Fills the Nth field matching a selector",
    "category": "Browser",
    "parameters": ["page: any", "n: string", "selector: string", "value: string"]
  },
  {
    "step": "I k6 select {string} from the dropdown {string}",
    "functionName": "k6ISelectFromTheDropdown",
    "description": "Selects an option from a dropdown",
    "category": "Browser",
    "parameters": ["page: any", "option: string", "selector: string"]
  },
  {
    "step": "I k6 wait {string} seconds",
    "functionName": "k6IWaitSeconds",
    "description": "Waits for a specified number of seconds",
    "category": "Browser",
    "parameters": ["page: any", "seconds: string"]
  },
  {
    "step": "I k6 wait {string} milliseconds",
    "functionName": "k6IWaitMilliseconds",
    "description": "Waits for a specified number of milliseconds",
    "category": "Browser",
    "parameters": ["page: any", "milliseconds: string"]
  },
  {
    "step": "I k6 wait for the element to be visible {string}",
    "functionName": "k6IWaitForTheElementToBeVisible",
    "description": "Waits for an element to be visible",
    "category": "Browser",
    "parameters": ["page: any", "selector: string"]
  },
  {
    "step": "I k6 get element by selector {string}",
    "functionName": "k6IGetElementBySelector",
    "description": "Locates an element by selector",
    "category": "Browser",
    "parameters": ["page: any", "selector: string"]
  },
  {
    "step": "I k6 find element by Id {string}",
    "functionName": "k6IFindElementById",
    "description": "Finds an element by ID",
    "category": "Browser",
    "parameters": ["page: any", "id: string"]
  },
  {
    "step": "I k6 find element by label {string}",
    "functionName": "k6IFindElementByLabel",
    "description": "Finds an element by label text",
    "category": "Browser",
    "parameters": ["page: any", "labelText: string"]
  },
  {
    "step": "I k6 find element by name {string}",
    "functionName": "k6IFindElementByName",
    "description": "Finds an element by name attribute",
    "category": "Browser",
    "parameters": ["page: any", "name: string"]
  },
  {
    "step": "I k6 find element by textarea {string}",
    "functionName": "k6IFindElementByTextarea",
    "description": "Finds a textarea by placeholder or label",
    "category": "Browser",
    "parameters": ["page: any", "placeholderOrLabel: string"]
  },
  {
    "step": "I k6 find element by value {string}",
    "functionName": "k6IFindElementByValue",
    "description": "Finds an element by value attribute",
    "category": "Browser",
    "parameters": ["page: any", "valueText: string"]
  },
  {
    "step": "I k6 find element by role {string}",
    "functionName": "k6IFindElementByRole",
    "description": "Finds an element by ARIA role",
    "category": "Browser",
    "parameters": ["page: any", "roleName: string", "nameOrOptions?: string|object"]
  },
  {
    "step": "I k6 find element by role {string} {string}",
    "functionName": "k6IFindElementByRole",
    "description": "Finds an element by ARIA role and name",
    "category": "Browser",
    "parameters": ["page: any", "roleName: string", "name: string"]
  },
  {
    "step": "I k6 find input element by placeholder text {string}",
    "functionName": "k6IFindInputElementByPlaceholderText",
    "description": "Finds an input by placeholder text",
    "category": "Browser",
    "parameters": ["page: any", "placeholder: string"]
  },
  {
    "step": "I k6 find element by text {string}",
    "functionName": "k6IFindElementByText",
    "description": "Finds an element containing text",
    "category": "Browser",
    "parameters": ["page: any", "text: string"]
  },
  {
    "step": "I k6 find elements by text {string}",
    "functionName": "k6IFindElementsByText",
    "description": "Finds multiple elements containing text",
    "category": "Browser",
    "parameters": ["page: any", "text: string"]
  },
  {
    "step": "I k6 find button by text {string}",
    "functionName": "k6IFindButtonByText",
    "description": "Finds a button by text",
    "category": "Browser",
    "parameters": ["page: any", "buttonText: string"]
  },
  {
    "step": "I k6 find buttons by text {string}",
    "functionName": "k6IFindButtonsByText",
    "description": "Finds multiple buttons by text",
    "category": "Browser",
    "parameters": ["page: any", "buttonText: string"]
  },
  {
    "step": "I k6 should see the text {string}",
    "functionName": "k6IShouldSeeTheText",
    "description": "Asserts text is visible on the page",
    "category": "Browser",
    "parameters": ["page: any", "expectedText: string"]
  },
  {
    "step": "I k6 should see the element {string}",
    "functionName": "k6IShouldSeeTheElement",
    "description": "Asserts an element is visible",
    "category": "Browser",
    "parameters": ["page: any", "selector: string"]
  },
  {
    "step": "I k6 should not see the text {string}",
    "functionName": "k6IShouldNotSeeTheText",
    "description": "Asserts text is not visible on the page",
    "category": "Browser",
    "parameters": ["page: any", "text: string"]
  }
];

const distPath = path.join(__dirname, '..', 'dist');
const outputPath = path.join(distPath, 'metadata.json');

// Ensure dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('Error: dist/ directory does not exist. Run `npm run build` first.');
  process.exit(1);
}

// Write metadata.json
fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
console.log(`✅ Generated metadata.json with ${metadata.length} step definitions`);
console.log(`   Output: ${outputPath}`);
