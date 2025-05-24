@rate-limit
Feature: Rate Limit Enforcement for /login and /bsp

  Background: Login and set alias for token
    Given I login via POST to "/api/v3/client/api/login" with payload from "login.json"
    Then I store the value at "data.token" as alias "auth_token"

  @within-limit
  Scenario: API allows up to 5 requests in 10 seconds (under limit)
    When I set a k6 script for POST testing
    When I set to run the k6 script with the following configurations:
      | virtual_users | duration | http_req_failed | http_req_duration |
      |             1 |       10 | rate<0.05       | p(95)<2000        |
    When I use JSON payload from "okra.json" for POST to "/api/v3/client/bsp"
    When I set the authentication type to "auth_token"
    Then I see the API should handle the POST request successfully

  @exceed-limit
  Scenario: API blocks more than 5 requests in 10 seconds (exceeds limit)
    When I set a k6 script for POST testing
    When I set to run the k6 script with the following configurations:
      | virtual_users | duration | http_req_failed | http_req_duration |
      |             6 |       10 | rate>=0.50      | p(95)<3000        |
    When I use JSON payload from "okra.json" for POST to "/api/v3/client/bsp"
    When I set the authentication type to "auth_token"
    Then I see the API should handle the POST request successfully
