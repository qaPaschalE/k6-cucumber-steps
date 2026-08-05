@smoke @vus:5
Feature: Outline Quoting Test

  Scenario Outline: Validate status codes
    When I k6 make a GET request to "/users/<userId>"
    Then the k6 response status should be <expectedStatus>

    Examples:
      | userId | expectedStatus |
      | 1      | 200            |
      | 5      | 200            |
      | 999    | 404            |
