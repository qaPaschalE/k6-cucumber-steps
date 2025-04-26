@load
Feature: Run Load test Appraisal Cycle

  Scenario Outline: I run the k6 script for load testing with dynamic GET requests
    Given I have a k6 script for GET testing
    When I run the k6 script with the following configurations:
      | virtual_users   | duration   | http_req_failed   | http_req_duration   | error_rate   |
      | <virtual_users> | <duration> | <http_req_failed> | <http_req_duration> | <error_rate> |
    And the following endpoint(s) is/are used:
      """
      /api/v1/performance/appraisal/cycle/list
      """
    And the authentication type is "bearer_token"
    Then the API should handle the GET request successfully

    Examples:
      | virtual_users | duration | http_req_failed | http_req_duration |
      |            10 |        5 | rate<0.05       | p(95)<3000        |
      |            50 |       10 | rate<0.05       | p(95)<3000        |
      |           100 |       15 | rate<0.05       | p(95)<3000        |
      |           200 |       20 | rate<0.05       | p(95)<5000        |
