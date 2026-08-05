Feature: Test Feature

  Background:
    Given the k6 base URL is "https://api.example.com"

  @smoke @vus:10 @duration:30s @group:api
  Scenario: Simple GET
    When I k6 make a GET request to "/users/1"
    Then the k6 response status should be "200"

  @smoke
  Scenario: POST with body
    Given I k6 have the following post data:
      """
      {
        "name": "Test User"
      }
      """
    When I k6 make a POST request to "/users"
    Then the k6 response status should be "201"