// src/generators/samples/sample-features.generator.ts
import fs from "fs";
import path from "path";

export class SampleFeaturesGenerator {
  generate(outputPath: string): void {
    this.generateSampleFeature(outputPath);
    this.generateBrowserSampleFeature(outputPath);
    this.generateAuthSampleFeature(outputPath);
  }

  private generateSampleFeature(outputPath: string): void {
    const sampleFeature = `@smoke @vus:10 @duration:1m
Feature: Comprehensive API Testing with Environment Variables

  Background:
    Given the base URL is "{{API_BASE_URL}}"

  @group:user-api @threshold:http_req_duration=p(95)<1000
  Scenario: Get user and validate response
    When I make a GET request to "/users/1"
    Then the response status should be "200"
    And the response should contain "name"
    And the response property "email" should not be empty

  @group:property-validation
  Scenario: Validate response properties and types
    When I make a GET request to "/users/1"
    Then the response status should be "200"
    And the response property "id" should be "1"
    And the response property "name" should contain "Leanne"
    And the response property "company" should have property "name"
    And the response time should be less than "500" milliseconds

  @group:post-api
  Scenario: Create a post with environment variables
    Given I have the following post data:
      """
      {
        "title": "{{POST_TITLE}}",
        "body": "Testing with environment variables",
        "userId": 1
      }
      """
    When I make a POST request to "/posts"
    Then the response status should be "201"
    And the response property "title" should be "{{POST_TITLE}}"
    And I store response "data" as "createdPost"
    And I print alias "createdPost"

  @group:alias-validation
  Scenario: Validate using stored aliases
    Given I have the following post data:
      """
      {
        "title": "Alias Test",
        "body": "Testing alias comparison",
        "userId": 1
      }
      """
    When I make a POST request to "/posts"
    Then the response status should be "201"
    And I store response "data.id" as "postId"
    And the alias "postId" should not be empty
    And I print all aliases

  @group:load-test @stages:0s-0,20s-10,30s-10,10s-0
  Scenario Outline: Validate multiple user endpoints
    When I make a GET request to "/users/<userId>"
    Then the response status should be <expectedStatus>
    And the response time should be less than "1" seconds

    Examples:
      | userId | expectedStatus |
      | 1      | "200"          |
      | 5      | "200"          |
      | 999    | "404"          |
`;

    fs.writeFileSync(
      path.join(outputPath, "features", "sample.feature"),
      sampleFeature,
    );
  }

  private generateBrowserSampleFeature(outputPath: string): void {
    const content = `@iterations:1 @browser
Feature: Comprehensive UI Automation on DemoQA

  Background:
    Given the base URL is "https://demoqa.com"

  Scenario: Fill and submit the practice form successfully
    When I navigate to the "/automation-practice-form" page
    And I fill the field "#firstName" with "Paschal"
    And I fill the field "#lastName" with "Enyimiri"
    And I fill the field "#userEmail" with "paschal.cheps@example.com"
    And I get element by selector "label[for='gender-radio-1']"
    And I click
    And I click on exact text "Male"
    And I fill the field "#userNumber" with "0801234567"
    And I wait "1" seconds
    And I click on exact text "Music"
    And I click on the element "#state"
    And I click on exact text "NCR"
    And I fill the field "#currentAddress" with "this is a load test on the ui"
    And I wait "1" seconds
    And I click on the element "#city"
    And I click on exact text "Delhi"
    And I click on the element "#submit"
    Then I should see the text "Thanks for submitting the form"

  Scenario: Multiple locator strategies
    When I navigate to the "/automation-practice-form" page
    # By ID
    And I find element by Id "firstName"
    # By placeholder
    And I find input element by placeholder text "First Name"
    # By label
    And I find element by label "First Name"
    # By role
    And I find element by role "textbox" "First Name"
    Then I should see the text "Student Registration Form"

  Scenario: Wait and validate dynamic content
    When I navigate to the "/automation-practice-form" page
    And I wait "2" seconds
    And I should see the element "#firstName"
    And I should see the text "Practice Form"
    And the page title should be "DEMOQA"
    And the current URL should contain "automation-practice-form"

  Scenario: Interact with repeated elements
    When I navigate to the "/elements" page
    And I fill the field "#input-field" with "First" "1"
    And I fill the field "#input-field" with "Second" "2"
    And I click on the element "button[type='submit']" "2"
    And I click on the element "button"
`;

    fs.writeFileSync(
      path.join(outputPath, "features", "browserSample.feature"),
      content,
    );
  }

  private generateAuthSampleFeature(outputPath: string): void {
    const content = `@vus:2
Feature: Authentication Examples with Environment Variables

  Background:
    Given the base URL is "{{AUTH_BASE_URL}}"

  Scenario: Authenticate via Standard Login and store token
    When I authenticate with the following url and request body as "standard_user":
      | endpoint               | userName            | password            |
      | /Account/v1/Authorized | {{TEST_USER_USERNAME}} | {{TEST_USER_PASSWORD}} |
    Then the response status should be "200"
    And the response property "accessToken" should not be empty
    And I store "accessToken" in "data/standard_user.json"
    And I store response "accessToken" as "authToken"
    And the alias "authToken" should not be empty

  Scenario: Reuse stored token for authenticated request
    Given I am authenticated as a "standard_user"
    When I make a GET request to "/Account/v1/User/{{TEST_USER_USERNAME}}"
    Then the response status should be "200"
    And the response property "userName" should be "{{TEST_USER_USERNAME}}"

  Scenario: Authenticate via Client Credentials (OAuth2)
    When I authenticate with the following url and request body as "service_account" with "form":
      | endpoint     | client_id         | client_secret     | grant_type         |
      | /oauth/token | {{CLIENT_ID}} | {{CLIENT_SECRET}} | client_credentials |
    Then the response status should be "200"
    And the response property "access_token" should not be empty
    And I store "access_token" in "data/service_account.json"
    And I print alias "service_account"

  Scenario: Validate boolean response properties
    When I authenticate with the following url and request body as "test_user":
      | endpoint               | userName            | password            |
      | /Account/v1/Authorized | {{TEST_USER_USERNAME}} | {{TEST_USER_PASSWORD}} |
    Then the response property "isActive" should be true
    And the response property "isLocked" should be false

  Scenario: Clear auth and verify
    Given I clear auth token
    When I make a GET request to "/Account/v1/User/{{TEST_USER_USERNAME}}"
    Then the response status should be "401"

  Scenario: Compare response with stored aliases
    When I authenticate with the following url and request body as "user1":
      | endpoint               | userName            | password            |
      | /Account/v1/Authorized | {{TEST_USER_USERNAME}} | {{TEST_USER_PASSWORD}} |
    And I store response "userName" as "expectedUsername"
    Then the response property "userName" should be alias "expectedUsername"
`;

    fs.writeFileSync(
      path.join(outputPath, "features", "authSample.feature"),
      content,
    );
  }
}
