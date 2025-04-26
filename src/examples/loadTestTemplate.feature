Feature: Run load tests with dynamic GET and POST body from environment variables and JSON files

  Scenario Outline: I run the k6 script for load testing with dynamic POST body from environment variables and JSON files
    Given I have a k6 script for POST testing
    When I run the k6 script with the following configurations:
      | virtual_users   | duration   | http_req_failed   | http_req_duration   | error_rate   |
      | <virtual_users> | <duration> | <http_req_failed> | <http_req_duration> | <error_rate> |
    When the following endpoint(s) is/are used:
      """
      /api/v1/resource1
      https://api.external.com/resource2
      """
    When the following POST body is used for "<endpoint>"
      """
      {
        "username": "{{username}}",
        "email": "{{email}}",
        "address": "<address.json>"
      }
      """
    When the authentication type is "api_key"
    Then the API should handle the POST request successfully

    Examples:
      | virtual_users | duration | http_req_failed | http_req_duration | error_rate |
      |            10 |        5 | rate<0.05       | p(95)<1000        | rate<0.05  |
      |            50 |       10 | rate<0.05       | p(95)<1000        | rate<0.05  |
      |           100 |       15 | rate<0.05       | p(95)<1500        |            |
      |           200 |       20 | rate<0.05       | p(95)<1500        | rate<0.05  |

  Scenario Outline: I run the k6 script for load testing with dynamic GET requests
    Given I have a k6 script for GET testing
    When I run the k6 script with the following configurations:
      | virtual_users   | duration   | http_req_failed   | http_req_duration   | error_rate   |
      | <virtual_users> | <duration> | <http_req_failed> | <http_req_duration> | <error_rate> |
    And the following endpoint(s) is/are used:
      """
      /api/v1/resource1
      https://api.external.com/resource2
      """
    When the authentication type is "bearer_token"
    Then the API should handle the GET request successfully

    Examples:
      | virtual_users | duration | http_req_failed | http_req_duration | error_rate |
      |            10 |        5 | rate<0.05       | p(95)<1000        | rate<0.05  |
      |            50 |       10 | rate<0.05       | p(95)<1000        | rate<0.05  |
      |           100 |       15 | rate<0.05       | p(95)<1500        |            |
      |           200 |       20 | rate<0.05       | p(95)<1500        | rate<0.05  |
