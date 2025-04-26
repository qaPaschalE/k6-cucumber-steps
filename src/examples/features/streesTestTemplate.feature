Feature: Run stress tests with dynamic GET and POST body from environment variables and JSON files

  Scenario Outline: I run the k6 script for stress testing with dynamic POST body from environment variables and JSON files
    Given I have a k6 script for POST testing
    When I run the k6 script with the following configurations:
      | virtual_users   | duration   | http_req_failed   | http_req_duration   | error_rate   |
      | <virtual_users> | <duration> | <http_req_failed> | <http_req_duration> | <error_rate> |
    And the following endpoint(s) is/are used:
      """
      /api/v1/resource1
      https://api.external.com/resource2
      """
    And the following POST body is used:
      """
      {
        "username": "{{username}}",
        "email": "{{email}}",
        "address": "<address.json>"
      }
      """
    Then the API should handle the POST request successfully

    Examples:

  Scenario Outline: I run the k6 script for GET testing with dynamic endpoints
    Given I have a k6 script for GET testing
    When I run the k6 script with the following configurations:
      | virtual_users   | duration   | http_req_failed   | http_req_duration   | error_rate   |
      | <virtual_users> | <duration> | <http_req_failed> | <http_req_duration> | <error_rate> |
    And the following endpoint(s) is/are used:
      """
      /api/v1/resource1
      https://api.external.com/resource2
      """
    Then the API should handle the GET request successfully

    Examples:
      | virtual_users | duration | http_req_failed |
      |            10 |        5 | rate<0.10       |
      |            50 |       10 | rate<0.05       |
      |           100 |       15 | rate<0.10       |
      |           200 |       20 | rate<0.05       |

  Scenario Outline: I run the k6 script for PUT requests
    Given I have a k6 script for PUT testing
    When I run the k6 script with the following configurations:
      | virtual_users   | duration   | http_req_failed   | http_req_duration   |
      | <virtual_users> | <duration> | <http_req_failed> | <http_req_duration> |
    And the following endpoint(s) is/are used:
      """
      /api/v1/update-profile
      """
    When the following PUT body is used for "<endpoint>"
      """
      {
        "id": "{{userId}}",
        "status": "updated"
      }
      """
    And the authentication type is "bearer_token"
    Then the API should handle the PUT request successfully

    Examples:
      | virtual_users | duration | http_req_failed | http_req_duration |
      |            20 |       10 | rate<0.05       | p(95)<1000        |
