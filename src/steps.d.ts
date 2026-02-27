/**
 * k6-cucumber-steps Step Definitions
 * 
 * This file contains type declarations for all available step definitions.
 * Use these steps in your Gherkin feature files with the `k6` prefix.
 * 
 * @packageDocumentation
 */

// ==================== HTTP / API STEPS ====================

/**
 * Sets the base URL for all API requests.
 * 
 * Supports environment variable replacement using `{{VARIABLE_NAME}}` syntax.
 * Values are resolved from:
 * - `globalThis[VARIABLE_NAME]`
 * - `__ENV[VARIABLE_NAME]` (k6 environment)
 * - `__ENV[K6_VARIABLE_NAME]` (prefixed k6 environment)
 * 
 * @category HTTP
 * 
 * @example
 * ```gherkin
 * Given the k6 base URL is "https://jsonplaceholder.typicode.com"
 * Given the k6 base URL is "{{API_BASE_URL}}"
 * ```
 * 
 * @param url - The base URL to use for API requests
 */
export function k6TheBaseUrlIs(url: string): void;

/**
 * Authenticates with the API using credentials from a data table.
 * Supports both JSON (default) and form-urlencoded formats.
 * 
 * @category Authentication
 * 
 * @example
 * ```gherkin
 * When I k6 authenticate with the following url and request body as "standard_user":
 *   | endpoint | username      | password    |
 *   | /login   | test_user     | pass123     |
 * 
 * When I k6 authenticate with the following url and request body as "admin" with "form":
 *   | endpoint | client_id     | client_secret | grant_type         |
 *   | /token   | my-app        | secret123     | client_credentials |
 * ```
 * 
 * @param context - User context identifier (e.g., "standard_user", "admin")
 * @param formatOrTable - Either the format ("json" | "form") or the data table
 * @param maybeTable - Optional data table if format is specified
 */
export function k6IAuthenticateWithTheFollowingUrlAndRequestBodyAsWith(
  context: string,
  formatOrTable: any,
  maybeTable: any
): void;

/**
 * Authenticates with the API using credentials from a data table (JSON format).
 * 
 * @category Authentication
 * 
 * @example
 * ```gherkin
 * When I k6 authenticate with the following url and request body as "user":
 *   | endpoint | username      | password    |
 *   | /login   | test_user     | pass123     |
 * ```
 * 
 * @param context - User context identifier
 * @param dataTable - Authentication credentials data table
 */
export function k6IAuthenticateWithTheFollowingUrlAndRequestBodyAs(
  context: string,
  dataTable: any
): void;

/**
 * Stores a response value to a file for persistence across scenarios.
 * 
 * Extracts a value from the last response using JSON path notation and stores it
 * both to a file and in memory with an alias.
 * 
 * @category Storage
 * 
 * @example
 * ```gherkin
 * And I k6 store "accessToken" in "data/user.json"
 * And I k6 store "data.token" in "data/admin.json"
 * ```
 * 
 * @param jsonPath - JSON path to extract from response (e.g., "accessToken", "data.token")
 * @param fileName - File path to store the value (e.g., "data/user.json")
 */
export function k6IStoreIn(jsonPath: string, fileName: string): void;

/**
 * Applies a stored authentication token to the default request headers.
 * 
 * Retrieves a token from storage and sets the Authorization header to `Bearer <token>`.
 * 
 * @category Authentication
 * 
 * @example
 * ```gherkin
 * Background:
 *   Given I k6 am authenticated as a "standard_user"
 * ```
 * 
 * @param userType - User type identifier (e.g., "standard_user", "admin")
 */
export function k6IAmAuthenticatedAsA(userType: string): void;

/**
 * Removes the Authorization header from default headers.
 * 
 * @category Authentication
 * 
 * @example
 * ```gherkin
 * Given I k6 clear auth token
 * ```
 */
export function k6IClearAuthToken(): void;

/**
 * Sets default headers for all subsequent HTTP requests.
 * 
 * @category HTTP
 * 
 * @example
 * ```gherkin
 * And I k6 set the default headers:
 *   | Content-Type     | Accept           |
 *   | application/json | application/json |
 * ```
 * 
 * @param dataTable - Headers data table
 */
export function k6ISetTheDefaultHeaders(dataTable: any[]): void;

/**
 * Makes a GET request to the specified endpoint.
 * 
 * @category HTTP
 * 
 * @example
 * ```gherkin
 * When I k6 make a GET request to "/users/1"
 * ```
 * 
 * @param endpoint - API endpoint (supports {{VARIABLE_NAME}} placeholders)
 */
export function k6IMakeAGetRequestTo(endpoint: string): void;

/**
 * Makes a GET request with custom headers.
 * 
 * @category HTTP
 * 
 * @example
 * ```gherkin
 * When I k6 make a GET request to "/users/1" with headers:
 *   | Authorization | Content-Type     |
 *   | Bearer abc123 | application/json |
 * ```
 * 
 * @param endpoint - API endpoint
 * @param headersTable - Headers data table
 */
export function k6IMakeAGetRequestToWithHeaders(endpoint: string, headersTable: any[]): void;

/**
 * Makes a POST request using previously stored post data.
 * 
 * @category HTTP
 * 
 * @example
 * ```gherkin
 * When I k6 make a POST request to "/posts"
 * ```
 * 
 * @param endpoint - API endpoint (supports {{VARIABLE_NAME}} placeholders)
 */
export function k6IMakeAPostRequestTo(endpoint: string): void;

/**
 * Makes a POST request with the provided body data.
 * 
 * @category HTTP
 * 
 * @example
 * ```gherkin
 * When I k6 make a POST request to "/posts" with body:
 *   | title | body              | userId |
 *   | Test  | Test body content | 1      |
 * ```
 * 
 * @param endpoint - API endpoint
 * @param bodyData - Request body data table or string
 */
export function k6IMakeAPostRequestToWithBody(endpoint: string, bodyData: any): void;

/**
 * Makes a PUT request using previously stored post data.
 * 
 * @category HTTP
 * 
 * @example
 * ```gherkin
 * When I k6 make a PUT request to "/users/1"
 * ```
 * 
 * @param endpoint - API endpoint
 */
export function k6IMakeAPutRequestTo(endpoint: string): void;

/**
 * Makes a PUT request with the provided body data.
 * 
 * @category HTTP
 * 
 * @param endpoint - API endpoint
 * @param bodyData - Request body data
 */
export function k6IMakeAPutRequestToWithBody(endpoint: string, bodyData: any): void;

/**
 * Makes a PATCH request using previously stored post data.
 * 
 * @category HTTP
 * 
 * @param endpoint - API endpoint
 */
export function k6IMakeAPatchRequestTo(endpoint: string): void;

/**
 * Makes a PATCH request with the provided body data.
 * 
 * @category HTTP
 * 
 * @param endpoint - API endpoint
 * @param bodyData - Request body data
 */
export function k6IMakeAPatchRequestToWithBody(endpoint: string, bodyData: any): void;

/**
 * Makes a DELETE request to the specified endpoint.
 * 
 * Supports `{{VARIABLE_NAME}}` for environment variables in the endpoint.
 * 
 * @category HTTP
 * 
 * @example
 * ```gherkin
 * When I k6 make a DELETE request to "/api/users/1"
 * When I k6 make a DELETE request to "/api/users/{{USER_ID}}"
 * ```
 * 
 * @param endpoint - API endpoint (supports {{VARIABLE_NAME}} placeholders)
 */
export function k6IMakeADeleteRequestTo(endpoint: string): void;

/**
 * Makes a DELETE request with custom headers.
 * 
 * Supports `{{VARIABLE_NAME}}` for environment variables.
 * 
 * @category HTTP
 * 
 * @example
 * ```gherkin
 * When I k6 make a DELETE request to "/api/users/1" with headers:
 *   | Authorization | Content-Type     |
 *   | Bearer {{authToken}} | application/json |
 * ```
 * 
 * @param endpoint - API endpoint (supports {{VARIABLE_NAME}} placeholders)
 * @param headersTable - Headers data table
 */
export function k6IMakeADeleteRequestToWithHeaders(endpoint: string, headersTable: any[]): void;

/**
 * Stores POST data for subsequent requests.
 * 
 * Supports `{{VARIABLE_NAME}}` placeholder replacement.
 * 
 * @category HTTP
 * 
 * @example
 * ```gherkin
 * Given I k6 have the following post data:
 *   """
 *   {
 *     "title": "{{POST_TITLE}}",
 *     "body": "Test content",
 *     "userId": 1
 *   }
 *   """
 * ```
 * 
 * @param data - Request body as a string (supports {{VARIABLE_NAME}} placeholders)
 */
export function k6IHaveTheFollowingPostData(data: string): void;

/**
 * Loads request body from a payload.json file.
 * 
 * Supports:
 * - `{{VARIABLE_NAME}}` for environment variables
 * - `{{alias:NAME}}` for stored aliases
 * 
 * File resolution order:
 * 1. `data/{fileName}` if exists
 * 2. `{fileName}` in project root if exists
 * 3. `payload.json` in project root as fallback
 * 
 * @category HTTP
 * 
 * @example
 * ```gherkin
 * Given I k6 use payload json from file "payload.json"
 * Given I k6 use payload json from file "data/create-user.json"
 * ```
 * 
 * @param fileName - Path to the JSON file (relative to project root or data/)
 */
export function k6IUsePayloadJsonFromFile(fileName: string): void;

/**
 * Makes a POST request using a payload.json file.
 * 
 * Combines loading payload and making request in one step.
 * Supports `{{VARIABLE_NAME}}` for env vars and `{{alias:NAME}}` for aliases.
 * 
 * @category HTTP
 * 
 * @example
 * ```gherkin
 * When I k6 make a POST request to "/users" with payload from "payload.json"
 * When I k6 make a POST request to "/api/users" with payload from "data/create-user.json"
 * ```
 * 
 * @param endpoint - API endpoint (supports {{VARIABLE_NAME}} placeholders)
 * @param fileName - Path to the JSON file
 */
export function k6IMakeAPostRequestToWithPayloadFile(endpoint: string, fileName: string): void;

// ==================== RESPONSE ASSERTIONS ====================

/**
 * Asserts the HTTP response status code.
 * 
 * @category Assertions
 * 
 * @example
 * ```gherkin
 * Then the k6 response status should be "200"
 * Then the k6 response status should be "404"
 * ```
 * 
 * @param expectedStatus - Expected HTTP status code
 */
export function k6TheResponseStatusShouldBe(expectedStatus: string): void;

/**
 * Asserts that the response contains a specific field.
 * 
 * @category Assertions
 * 
 * @example
 * ```gherkin
 * Then the k6 response should contain "name"
 * ```
 * 
 * @param field - Field name to check
 */
export function k6TheResponseShouldContain(field: string): void;

/**
 * Asserts a response property equals a specific value.
 * 
 * @category Assertions
 * 
 * @example
 * ```gherkin
 * Then the k6 response property "id" should be "1"
 * ```
 * 
 * @param propertyPath - JSON path to property (e.g., "id", "data.user.name")
 * @param expectedValue - Expected value
 */
export function k6TheResponsePropertyShouldBe(propertyPath: string, expectedValue: string): void;

/**
 * Asserts a response property has a non-empty value.
 * 
 * @category Assertions
 * 
 * @example
 * ```gherkin
 * Then the k6 response property "data.token" should not be empty
 * ```
 * 
 * @param propertyPath - JSON path to property
 */
export function k6TheResponsePropertyShouldNotBeEmpty(propertyPath: string): void;

/**
 * Asserts a response property is true.
 * 
 * @category Assertions
 * 
 * @example
 * ```gherkin
 * Then the k6 response property "success" should be true
 * ```
 * 
 * @param propertyPath - JSON path to boolean property
 */
export function k6TheResponsePropertyShouldBeTrue(propertyPath: string): void;

/**
 * Asserts a response property is false.
 * 
 * @category Assertions
 * 
 * @example
 * ```gherkin
 * Then the k6 response property "deleted" should be false
 * ```
 * 
 * @param propertyPath - JSON path to boolean property
 */
export function k6TheResponsePropertyShouldBeFalse(propertyPath: string): void;

/**
 * Asserts a nested property exists in the response.
 * 
 * @category Assertions
 * 
 * @example
 * ```gherkin
 * Then the k6 response property "data" should have property "user"
 * ```
 * 
 * @param parentPath - JSON path to parent object
 * @param childProperty - Child property name to check
 */
export function k6TheResponsePropertyShouldHaveProperty(parentPath: string, childProperty: string): void;

/**
 * Asserts a response property contains a substring.
 * 
 * @category Assertions
 * 
 * @example
 * ```gherkin
 * Then the k6 response property "message" should contain "success"
 * ```
 * 
 * @param propertyPath - JSON path to property
 * @param expectedText - Substring to search for
 */
export function k6TheResponsePropertyShouldContain(propertyPath: string, expectedText: string): void;

// ==================== PERFORMANCE ASSERTIONS ====================

/**
 * Asserts the response time is below a threshold in milliseconds.
 * 
 * @category Performance
 * 
 * @example
 * ```gherkin
 * Then the k6 response time should be less than "500" milliseconds
 * ```
 * 
 * @param milliseconds - Maximum allowed response time in milliseconds
 */
export function k6TheResponseTimeShouldBeLessThanMilliseconds(milliseconds: string): void;

/**
 * Asserts the response time is below a threshold in seconds.
 * 
 * @category Performance
 * 
 * @example
 * ```gherkin
 * Then the k6 response time should be less than "2" seconds
 * ```
 * 
 * @param seconds - Maximum allowed response time in seconds
 */
export function k6TheResponseTimeShouldBeLessThanSeconds(seconds: string): void;

// ==================== ALIAS ASSERTIONS ====================

/**
 * Asserts a stored alias has a non-empty value.
 * 
 * @category Assertions
 * 
 * @example
 * ```gherkin
 * Then the k6 alias "authToken" should not be empty
 * ```
 * 
 * @param alias - Alias name to check
 */
export function k6TheAliasShouldNotBeEmpty(alias: string): void;

/**
 * Asserts a stored alias equals a specific value.
 * 
 * @category Assertions
 * 
 * @example
 * ```gherkin
 * Then the k6 alias "username" should be equal to "test_user"
 * ```
 * 
 * @param alias - Alias name to check
 * @param expectedValue - Expected value
 */
export function k6TheAliasShouldBeEqualTo(alias: string, expectedValue: string): void;

/**
 * Asserts a response property matches a stored alias value.
 * 
 * @category Assertions
 * 
 * @example
 * ```gherkin
 * Then the k6 response property "userName" should be alias "expectedUsername"
 * ```
 * 
 * @param propertyPath - JSON path to property
 * @param alias - Alias name to compare against
 */
export function k6TheResponsePropertyShouldBeAlias(propertyPath: string, alias: string): void;

/**
 * Asserts a response property contains a stored alias value.
 * 
 * @category Assertions
 * 
 * @param propertyPath - JSON path to property
 * @param alias - Alias name containing substring to search for
 */
export function k6TheResponsePropertyShouldContainAlias(propertyPath: string, alias: string): void;

/**
 * Asserts a response property does not match a stored alias.
 * 
 * @category Assertions
 * 
 * @param propertyPath - JSON path to property
 * @param alias - Alias name to compare against
 */
export function k6TheResponsePropertyShouldNotBeAlias(propertyPath: string, alias: string): void;

// ==================== STORAGE STEPS ====================

/**
 * Stores a response property with a custom alias for later use.
 * 
 * @category Storage
 * 
 * @example
 * ```gherkin
 * And I k6 store response "data.accessToken" as "authToken"
 * ```
 * 
 * @param propertyPath - JSON path to extract (e.g., "data.accessToken")
 * @param alias - Custom alias name for storage
 */
export function k6IStoreResponseAs(propertyPath: string, alias: string): void;

/**
 * Alias for k6IStoreResponseAs - stores a response property with custom alias.
 * 
 * @category Storage
 * 
 * @param propertyPath - JSON path to extract
 * @param alias - Custom alias name
 */
export function k6IStoreResponseDataAs(propertyPath: string, alias: string): void;

/**
 * Prints a stored alias value to console for debugging.
 * 
 * @category Debug
 * 
 * @example
 * ```gherkin
 * And I k6 print alias "authToken"
 * ```
 * 
 * @param alias - Alias name to print
 */
export function k6IPrintAlias(alias: string): void;

/**
 * Prints all stored aliases to console for debugging.
 * 
 * @category Debug
 * 
 * @example
 * ```gherkin
 * And I k6 print all aliases
 * ```
 */
export function k6IPrintAllAliases(): void;

// ==================== BROWSER NAVIGATION ====================

/**
 * Navigates to a page URL.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * When I k6 navigate to the "/home" page
 * When I k6 navigate to the "https://example.com" page
 * ```
 * 
 * @param page - Browser page object (injected automatically)
 * @param url - URL or path to navigate to
 */
export function k6INavigateToThePage(page: any, url: string): Promise<void>;

/**
 * Asserts the page title.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * Then the k6 page title should be "DemoQA"
 * ```
 * 
 * @param page - Browser page object
 * @param expectedTitle - Expected page title
 */
export function k6ThePageTitleShouldBe(page: any, expectedTitle: string): Promise<void>;

/**
 * Asserts the current URL contains a fragment.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * Then the k6 current URL should contain "automation-practice-form"
 * ```
 * 
 * @param page - Browser page object
 * @param expectedFragment - URL fragment to search for
 */
export function k6TheCurrentUrlShouldContain(page: any, expectedFragment: string): Promise<void>;

// ==================== BROWSER INTERACTION ====================

/**
 * Clicks the currently focused element.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 click
 * ```
 * 
 * @param page - Browser page object
 */
export function k6IClick(page: any): Promise<void>;

/**
 * Clicks an element by selector.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 click on the element "#submit"
 * And I k6 click on the element "button" "2"
 * ```
 * 
 * @param page - Browser page object
 * @param selector - CSS selector
 * @param nth - Optional: 1-based index for nth element
 */
export function k6IClickOnTheElement(page: any, selector: string, nth?: string): Promise<void>;

/**
 * Clicks an element by exact text match.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 click on exact text "Submit"
 * ```
 * 
 * @param page - Browser page object
 * @param text - Exact text to match
 */
export function k6IClickOnExactText(page: any, text: string): Promise<void>;

/**
 * Clicks a button by selector.
 * 
 * @category Browser
 * 
 * @param page - Browser page object
 * @param selector - Button selector
 */
export function k6IClickTheButton(page: any, selector: string): Promise<void>;

/**
 * Fills a field with a value.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 fill the field "#firstName" with "John"
 * And I k6 fill the field "input" with "test" "2"
 * ```
 * 
 * @param page - Browser page object
 * @param selector - Input field selector
 * @param value - Value to fill
 * @param nth - Optional: 1-based index for nth element
 */
export function k6IFillTheFieldWith(page: any, selector: string, value: string, nth?: string): Promise<void>;

/**
 * Fills the currently focused element.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 fill "test content"
 * ```
 * 
 * @param page - Browser page object
 * @param value - Value to type
 */
export function k6IFill(page: any, value: string): Promise<void>;

/**
 * Fills the Nth field matching a selector.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 fill the "3"rd field element by selector "input" with "value"
 * ```
 * 
 * @param page - Browser page object
 * @param n - Ordinal number (e.g., "1st", "2nd", "3rd")
 * @param selector - CSS selector
 * @param value - Value to fill
 */
export function k6IFillNthFieldBySelector(page: any, n: string, selector: string, value: string): Promise<void>;

/**
 * Selects an option from a dropdown.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 select "Option 1" from the dropdown "#dropdown"
 * ```
 * 
 * @param page - Browser page object
 * @param option - Option value or text
 * @param selector - Select element selector
 */
export function k6ISelectFromTheDropdown(page: any, option: string, selector: string): Promise<void>;

// ==================== BROWSER WAITS ====================

/**
 * Waits for a specified number of seconds.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 wait "2" seconds
 * ```
 * 
 * @param page - Browser page object
 * @param seconds - Number of seconds to wait
 */
export function k6IWaitSeconds(page: any, seconds: string): Promise<void>;

/**
 * Waits for a specified number of milliseconds.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 wait "500" milliseconds
 * ```
 * 
 * @param page - Browser page object
 * @param milliseconds - Number of milliseconds to wait
 */
export function k6IWaitMilliseconds(page: any, milliseconds: string): Promise<void>;

/**
 * Waits for an element to be visible.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 wait for the element to be visible "#loading"
 * ```
 * 
 * @param page - Browser page object
 * @param selector - Element selector
 */
export function k6IWaitForTheElementToBeVisible(page: any, selector: string): Promise<void>;

// ==================== BROWSER FIND ====================

/**
 * Locates an element by selector.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 get element by selector "#firstName"
 * ```
 * 
 * @param page - Browser page object
 * @param selector - CSS selector
 */
export function k6IGetElementBySelector(page: any, selector: string): Promise<any>;

/**
 * Finds an element by ID.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 find element by Id "firstName"
 * ```
 * 
 * @param page - Browser page object
 * @param id - Element ID
 */
export function k6IFindElementById(page: any, id: string): Promise<any>;

/**
 * Finds an element by label text.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 find element by label "First Name"
 * ```
 * 
 * @param page - Browser page object
 * @param labelText - Label text
 */
export function k6IFindElementByLabel(page: any, labelText: string): Promise<any>;

/**
 * Finds an element by name attribute.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 find element by name "username"
 * ```
 * 
 * @param page - Browser page object
 * @param name - Name attribute value
 */
export function k6IFindElementByName(page: any, name: string): Promise<any>;

/**
 * Finds a textarea by placeholder or label.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 find element by textarea "Enter comments"
 * ```
 * 
 * @param page - Browser page object
 * @param placeholderOrLabel - Placeholder or label text
 */
export function k6IFindElementByTextarea(page: any, placeholderOrLabel: string): Promise<any>;

/**
 * Finds an element by value attribute.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 find element by value "Submit"
 * ```
 * 
 * @param page - Browser page object
 * @param valueText - Value attribute text
 */
export function k6IFindElementByValue(page: any, valueText: string): Promise<any>;

/**
 * Finds an element by ARIA role.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 find element by role "button"
 * And I k6 find element by role "textbox" "First Name"
 * ```
 * 
 * @param page - Browser page object
 * @param roleName - ARIA role (e.g., "button", "textbox", "heading")
 * @param nameOrOptions - Optional name or options object
 */
export function k6IFindElementByRole(page: any, roleName: string, nameOrOptions?: string | object): Promise<any>;

/**
 * Finds an input by placeholder text.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 find input element by placeholder text "Enter email"
 * ```
 * 
 * @param page - Browser page object
 * @param placeholder - Placeholder text
 */
export function k6IFindInputElementByPlaceholderText(page: any, placeholder: string): Promise<any>;

/**
 * Finds an element containing text.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 find element by text "Welcome"
 * ```
 * 
 * @param page - Browser page object
 * @param text - Text to search for
 */
export function k6IFindElementByText(page: any, text: string): Promise<any>;

/**
 * Finds multiple elements containing text.
 * 
 * @category Browser
 * 
 * @param page - Browser page object
 * @param text - Text to search for
 */
export function k6IFindElementsByText(page: any, text: string): Promise<any>;

/**
 * Finds a button by text.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * And I k6 find button by text "Submit"
 * ```
 * 
 * @param page - Browser page object
 * @param buttonText - Button text
 */
export function k6IFindButtonByText(page: any, buttonText: string): Promise<any>;

/**
 * Finds multiple buttons by text.
 * 
 * @category Browser
 * 
 * @param page - Browser page object
 * @param buttonText - Button text
 */
export function k6IFindButtonsByText(page: any, buttonText: string): Promise<any>;

// ==================== BROWSER ASSERTIONS ====================

/**
 * Asserts text is visible on the page.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * Then I k6 should see the text "Welcome"
 * ```
 * 
 * @param page - Browser page object
 * @param expectedText - Text to search for
 */
export function k6IShouldSeeTheText(page: any, expectedText: string): Promise<void>;

/**
 * Asserts an element is visible.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * Then I k6 should see the element "#success-message"
 * ```
 * 
 * @param page - Browser page object
 * @param selector - Element selector
 */
export function k6IShouldSeeTheElement(page: any, selector: string): Promise<void>;

/**
 * Asserts text is not visible on the page.
 * 
 * @category Browser
 * 
 * @example
 * ```gherkin
 * Then I k6 should not see the text "Error"
 * ```
 * 
 * @param page - Browser page object
 * @param text - Text to search for
 */
export function k6IShouldNotSeeTheText(page: any, text: string): Promise<void>;
