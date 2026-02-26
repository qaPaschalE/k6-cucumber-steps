// src/generators/samples/steps-metadata.generator.ts
import fs from "fs";
import path from "path";

export interface StepMetadata {
  pattern: string;
  functionName: string;
  description: string;
  category: string;
  parameters: string[];
}

export class StepsMetadataGenerator {
  generate(outputPath: string): void {
    const metadata = this.getStepsMetadata();
    
    fs.writeFileSync(
      path.join(outputPath, "steps", "metadata.json"),
      JSON.stringify(metadata, null, 2),
    );
  }

  private getStepsMetadata(): StepMetadata[] {
    return [
      // Base URL Steps
      {
        pattern: "the k6 base URL is {string}",
        functionName: "k6TheBaseUrlIs",
        description: "Sets the base URL for API requests",
        category: "HTTP",
        parameters: ["url: string"]
      },
      
      // Authentication Steps
      {
        pattern: "I k6 authenticate with the following url and request body as {string}",
        functionName: "k6IAuthenticateWithTheFollowingUrlAndRequestBodyAs",
        description: "Authenticates with the API using the provided credentials",
        category: "Authentication",
        parameters: ["context: string", "dataTable: any"]
      },
      {
        pattern: "I k6 authenticate with the following url and request body as {string} with {string}",
        functionName: "k6IAuthenticateWithTheFollowingUrlAndRequestBodyAsWith",
        description: "Authenticates with the API using the provided credentials and format (json/form)",
        category: "Authentication",
        parameters: ["context: string", "format: string", "dataTable: any"]
      },
      {
        pattern: "I k6 am authenticated as a {string}",
        functionName: "k6IAmAuthenticatedAsA",
        description: "Applies stored authentication token to request headers",
        category: "Authentication",
        parameters: ["userType: string"]
      },
      {
        pattern: "I k6 clear auth token",
        functionName: "k6IClearAuthToken",
        description: "Removes the Authorization header",
        category: "Authentication",
        parameters: []
      },
      
      // Storage Steps
      {
        pattern: "I k6 store {string} in {string}",
        functionName: "k6IStoreIn",
        description: "Stores a response value to a file",
        category: "Storage",
        parameters: ["jsonPath: string", "fileName: string"]
      },
      {
        pattern: "I k6 store response {string} as {string}",
        functionName: "k6IStoreResponseAs",
        description: "Stores a response property with a custom alias",
        category: "Storage",
        parameters: ["propertyPath: string", "alias: string"]
      },
      {
        pattern: "I k6 store response {string} as {string}",
        functionName: "k6IStoreResponseDataAs",
        description: "Alias for k6IStoreResponseAs",
        category: "Storage",
        parameters: ["propertyPath: string", "alias: string"]
      },
      {
        pattern: "I k6 print alias {string}",
        functionName: "k6IPrintAlias",
        description: "Prints a stored alias value to console",
        category: "Debug",
        parameters: ["alias: string"]
      },
      {
        pattern: "I k6 print all aliases",
        functionName: "k6IPrintAllAliases",
        description: "Prints all stored aliases to console",
        category: "Debug",
        parameters: []
      },
      
      // Headers Steps
      {
        pattern: "I k6 set the default headers:",
        functionName: "k6ISetTheDefaultHeaders",
        description: "Sets default headers for requests",
        category: "HTTP",
        parameters: ["dataTable: any"]
      },
      
      // HTTP Request Steps
      {
        pattern: "I k6 make a GET request to {string}",
        functionName: "k6IMakeAGetRequestTo",
        description: "Makes a GET request to the specified endpoint",
        category: "HTTP",
        parameters: ["endpoint: string"]
      },
      {
        pattern: "I k6 make a GET request to {string} with headers:",
        functionName: "k6IMakeAGetRequestToWithHeaders",
        description: "Makes a GET request with custom headers",
        category: "HTTP",
        parameters: ["endpoint: string", "headersTable: any"]
      },
      {
        pattern: "I k6 make a POST request to {string}",
        functionName: "k6IMakeAPostRequestTo",
        description: "Makes a POST request using stored post data",
        category: "HTTP",
        parameters: ["endpoint: string"]
      },
      {
        pattern: "I k6 make a POST request to {string} with body:",
        functionName: "k6IMakeAPostRequestToWithBody",
        description: "Makes a POST request with the provided body",
        category: "HTTP",
        parameters: ["endpoint: string", "bodyData: any"]
      },
      {
        pattern: "I k6 make a PUT request to {string}",
        functionName: "k6IMakeAPutRequestTo",
        description: "Makes a PUT request using stored post data",
        category: "HTTP",
        parameters: ["endpoint: string"]
      },
      {
        pattern: "I k6 make a PUT request to {string} with body:",
        functionName: "k6IMakeAPutRequestToWithBody",
        description: "Makes a PUT request with the provided body",
        category: "HTTP",
        parameters: ["endpoint: string", "bodyData: any"]
      },
      {
        pattern: "I k6 make a PATCH request to {string}",
        functionName: "k6IMakeAPatchRequestTo",
        description: "Makes a PATCH request using stored post data",
        category: "HTTP",
        parameters: ["endpoint: string"]
      },
      {
        pattern: "I k6 make a PATCH request to {string} with body:",
        functionName: "k6IMakeAPatchRequestToWithBody",
        description: "Makes a PATCH request with the provided body",
        category: "HTTP",
        parameters: ["endpoint: string", "bodyData: any"]
      },
      {
        pattern: "I k6 have the following post data:",
        functionName: "k6IHaveTheFollowingPostData",
        description: "Stores POST data for subsequent requests (supports {{VARIABLE_NAME}} placeholders)",
        category: "HTTP",
        parameters: ["data: string"]
      },
      
      // Response Assertion Steps
      {
        pattern: "the k6 response status should be {string}",
        functionName: "k6TheResponseStatusShouldBe",
        description: "Asserts the response status code",
        category: "Assertions",
        parameters: ["expectedStatus: string"]
      },
      {
        pattern: "the k6 response should contain {string}",
        functionName: "k6TheResponseShouldContain",
        description: "Asserts the response contains a specific field",
        category: "Assertions",
        parameters: ["field: string"]
      },
      {
        pattern: "the k6 response property {string} should be {string}",
        functionName: "k6TheResponsePropertyShouldBe",
        description: "Asserts a response property equals a specific value",
        category: "Assertions",
        parameters: ["propertyPath: string", "expectedValue: string"]
      },
      {
        pattern: "the k6 response property {string} should not be empty",
        functionName: "k6TheResponsePropertyShouldNotBeEmpty",
        description: "Asserts a response property has a value",
        category: "Assertions",
        parameters: ["propertyPath: string"]
      },
      {
        pattern: "the k6 response property {string} should be true",
        functionName: "k6TheResponsePropertyShouldBeTrue",
        description: "Asserts a response property is true",
        category: "Assertions",
        parameters: ["propertyPath: string"]
      },
      {
        pattern: "the k6 response property {string} should be false",
        functionName: "k6TheResponsePropertyShouldBeFalse",
        description: "Asserts a response property is false",
        category: "Assertions",
        parameters: ["propertyPath: string"]
      },
      {
        pattern: "the k6 response property {string} should have property {string}",
        functionName: "k6TheResponsePropertyShouldHaveProperty",
        description: "Asserts a nested property exists in the response",
        category: "Assertions",
        parameters: ["parentPath: string", "childProperty: string"]
      },
      {
        pattern: "the k6 response property {string} should contain {string}",
        functionName: "k6TheResponsePropertyShouldContain",
        description: "Asserts a response property contains a substring",
        category: "Assertions",
        parameters: ["propertyPath: string", "expectedText: string"]
      },
      {
        pattern: "the k6 response time should be less than {string} milliseconds",
        functionName: "k6TheResponseTimeShouldBeLessThanMilliseconds",
        description: "Asserts the response time is below a threshold in milliseconds",
        category: "Performance",
        parameters: ["milliseconds: string"]
      },
      {
        pattern: "the k6 response time should be less than {string} seconds",
        functionName: "k6TheResponseTimeShouldBeLessThanSeconds",
        description: "Asserts the response time is below a threshold in seconds",
        category: "Performance",
        parameters: ["seconds: string"]
      },
      
      // Alias Assertion Steps
      {
        pattern: "the k6 alias {string} should not be empty",
        functionName: "k6TheAliasShouldNotBeEmpty",
        description: "Asserts a stored alias has a value",
        category: "Assertions",
        parameters: ["alias: string"]
      },
      {
        pattern: "the k6 alias {string} should be equal to {string}",
        functionName: "k6TheAliasShouldBeEqualTo",
        description: "Asserts a stored alias equals a specific value",
        category: "Assertions",
        parameters: ["alias: string", "expectedValue: string"]
      },
      {
        pattern: "the k6 response property {string} should be alias {string}",
        functionName: "k6TheResponsePropertyShouldBeAlias",
        description: "Asserts a response property matches a stored alias",
        category: "Assertions",
        parameters: ["propertyPath: string", "alias: string"]
      },
      {
        pattern: "the k6 response property {string} should contain alias {string}",
        functionName: "k6TheResponsePropertyShouldContainAlias",
        description: "Asserts a response property contains a stored alias value",
        category: "Assertions",
        parameters: ["propertyPath: string", "alias: string"]
      },
      {
        pattern: "the k6 response property {string} should not be alias {string}",
        functionName: "k6TheResponsePropertyShouldNotBeAlias",
        description: "Asserts a response property does not match a stored alias",
        category: "Assertions",
        parameters: ["propertyPath: string", "alias: string"]
      },
      
      // Browser Navigation Steps
      {
        pattern: "I k6 navigate to the {string} page",
        functionName: "k6INavigateToThePage",
        description: "Navigates to a page URL",
        category: "Browser",
        parameters: ["page: any", "url: string"]
      },
      {
        pattern: "the k6 page title should be {string}",
        functionName: "k6ThePageTitleShouldBe",
        description: "Asserts the page title",
        category: "Browser",
        parameters: ["page: any", "expectedTitle: string"]
      },
      {
        pattern: "the k6 current URL should contain {string}",
        functionName: "k6TheCurrentUrlShouldContain",
        description: "Asserts the current URL contains a fragment",
        category: "Browser",
        parameters: ["page: any", "expectedFragment: string"]
      },
      
      // Browser Interaction Steps
      {
        pattern: "I k6 click",
        functionName: "k6IClick",
        description: "Clicks the currently focused element",
        category: "Browser",
        parameters: ["page: any"]
      },
      {
        pattern: "I k6 click on the element {string}",
        functionName: "k6IClickOnTheElement",
        description: "Clicks an element by selector",
        category: "Browser",
        parameters: ["page: any", "selector: string", "nth?: string"]
      },
      {
        pattern: "I k6 click on the element {string} {string}",
        functionName: "k6IClickOnTheElement",
        description: "Clicks the Nth element by selector",
        category: "Browser",
        parameters: ["page: any", "selector: string", "nth: string"]
      },
      {
        pattern: "I k6 click on exact text {string}",
        functionName: "k6IClickOnExactText",
        description: "Clicks an element by exact text match",
        category: "Browser",
        parameters: ["page: any", "text: string"]
      },
      {
        pattern: "I k6 click the button {string}",
        functionName: "k6IClickTheButton",
        description: "Clicks a button by selector",
        category: "Browser",
        parameters: ["page: any", "selector: string"]
      },
      {
        pattern: "I k6 fill the field {string} with {string}",
        functionName: "k6IFillTheFieldWith",
        description: "Fills a field with a value",
        category: "Browser",
        parameters: ["page: any", "selector: string", "value: string"]
      },
      {
        pattern: "I k6 fill the field {string} with {string} {string}",
        functionName: "k6IFillTheFieldWith",
        description: "Fills the Nth field with a value",
        category: "Browser",
        parameters: ["page: any", "selector: string", "value: string", "nth: string"]
      },
      {
        pattern: "I k6 fill {string}",
        functionName: "k6IFill",
        description: "Fills the currently focused element",
        category: "Browser",
        parameters: ["page: any", "value: string"]
      },
      {
        pattern: "I k6 fill the {string} field element by selector {string} with {string}",
        functionName: "k6IFillNthFieldBySelector",
        description: "Fills the Nth field matching a selector",
        category: "Browser",
        parameters: ["page: any", "n: string", "selector: string", "value: string"]
      },
      {
        pattern: "I k6 select {string} from the dropdown {string}",
        functionName: "k6ISelectFromTheDropdown",
        description: "Selects an option from a dropdown",
        category: "Browser",
        parameters: ["page: any", "option: string", "selector: string"]
      },
      
      // Browser Wait Steps
      {
        pattern: "I k6 wait {string} seconds",
        functionName: "k6IWaitSeconds",
        description: "Waits for a specified number of seconds",
        category: "Browser",
        parameters: ["page: any", "seconds: string"]
      },
      {
        pattern: "I k6 wait {string} milliseconds",
        functionName: "k6IWaitMilliseconds",
        description: "Waits for a specified number of milliseconds",
        category: "Browser",
        parameters: ["page: any", "milliseconds: string"]
      },
      {
        pattern: "I k6 wait for the element to be visible {string}",
        functionName: "k6IWaitForTheElementToBeVisible",
        description: "Waits for an element to be visible",
        category: "Browser",
        parameters: ["page: any", "selector: string"]
      },
      
      // Browser Find Steps
      {
        pattern: "I k6 get element by selector {string}",
        functionName: "k6IGetElementBySelector",
        description: "Locates an element by selector",
        category: "Browser",
        parameters: ["page: any", "selector: string"]
      },
      {
        pattern: "I k6 find element by Id {string}",
        functionName: "k6IFindElementById",
        description: "Finds an element by ID",
        category: "Browser",
        parameters: ["page: any", "id: string"]
      },
      {
        pattern: "I k6 find element by label {string}",
        functionName: "k6IFindElementByLabel",
        description: "Finds an element by label text",
        category: "Browser",
        parameters: ["page: any", "labelText: string"]
      },
      {
        pattern: "I k6 find element by name {string}",
        functionName: "k6IFindElementByName",
        description: "Finds an element by name attribute",
        category: "Browser",
        parameters: ["page: any", "name: string"]
      },
      {
        pattern: "I k6 find element by textarea {string}",
        functionName: "k6IFindElementByTextarea",
        description: "Finds a textarea by placeholder or label",
        category: "Browser",
        parameters: ["page: any", "placeholderOrLabel: string"]
      },
      {
        pattern: "I k6 find element by value {string}",
        functionName: "k6IFindElementByValue",
        description: "Finds an element by value attribute",
        category: "Browser",
        parameters: ["page: any", "valueText: string"]
      },
      {
        pattern: "I k6 find element by role {string}",
        functionName: "k6IFindElementByRole",
        description: "Finds an element by ARIA role",
        category: "Browser",
        parameters: ["page: any", "roleName: string", "nameOrOptions?: string|object"]
      },
      {
        pattern: "I k6 find element by role {string} {string}",
        functionName: "k6IFindElementByRole",
        description: "Finds an element by ARIA role and name",
        category: "Browser",
        parameters: ["page: any", "roleName: string", "name: string"]
      },
      {
        pattern: "I k6 find input element by placeholder text {string}",
        functionName: "k6IFindInputElementByPlaceholderText",
        description: "Finds an input by placeholder text",
        category: "Browser",
        parameters: ["page: any", "placeholder: string"]
      },
      {
        pattern: "I k6 find element by text {string}",
        functionName: "k6IFindElementByText",
        description: "Finds an element containing text",
        category: "Browser",
        parameters: ["page: any", "text: string"]
      },
      {
        pattern: "I k6 find elements by text {string}",
        functionName: "k6IFindElementsByText",
        description: "Finds multiple elements containing text",
        category: "Browser",
        parameters: ["page: any", "text: string"]
      },
      {
        pattern: "I k6 find button by text {string}",
        functionName: "k6IFindButtonByText",
        description: "Finds a button by text",
        category: "Browser",
        parameters: ["page: any", "buttonText: string"]
      },
      {
        pattern: "I k6 find buttons by text {string}",
        functionName: "k6IFindButtonsByText",
        description: "Finds multiple buttons by text",
        category: "Browser",
        parameters: ["page: any", "buttonText: string"]
      },
      
      // Browser Assertion Steps
      {
        pattern: "I k6 should see the text {string}",
        functionName: "k6IShouldSeeTheText",
        description: "Asserts text is visible on the page",
        category: "Browser",
        parameters: ["page: any", "expectedText: string"]
      },
      {
        pattern: "I k6 should see the element {string}",
        functionName: "k6IShouldSeeTheElement",
        description: "Asserts an element is visible",
        category: "Browser",
        parameters: ["page: any", "selector: string"]
      },
      {
        pattern: "I k6 should not see the text {string}",
        functionName: "k6IShouldNotSeeTheText",
        description: "Asserts text is not visible on the page",
        category: "Browser",
        parameters: ["page: any", "text: string"]
      }
    ];
  }
}
