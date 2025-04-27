Feature: Run load tests with dynamic GET and POST body from environment variables and JSON files

  @load2
  Scenario Outline: I run the k6 script for load testing with dynamic POST body from environment variables and JSON files
    Given I set a k6 script for POST testing
    When I set to run the k6 script with the following configurations:
      | virtual_users   | duration   | http_req_failed   | http_req_duration   | error_rate   |
      | <virtual_users> | <duration> | <http_req_failed> | <http_req_duration> | <error_rate> |
    When I set the following endpoints used:
      """
      /api/profile
      http://test.k6.io
      """
    When I set the following POST body is used for "/user/1"
      """
      
      {
      
        "username": "{{username}}",
      
        "email": "{{email}}",
      
        "address": "<address.json>"
      
      }
      
      """
    When I set the authentication type to "api_key"
    Then I see the API should handle the GET request successfully

    Examples:
      | virtual_users | duration | http_req_failed | http_req_duration | error_rate |
      |            10 |        5 | rate<0.05       | p(95)<3000        | rate<0.01  |
      |            50 |       10 | rate<0.05       | p(95)<3000        | rate<0.01  |
      |           100 |       15 | rate<0.05       | p(95)<3500        | rate<0.01  |
      |           200 |       20 | rate<0.05       | p(95)<3500        | rate<0.01  |

  @loadTest
  Scenario Outline: I run the k6 script for load testing with dynamic GET requests
    Given I set a k6 script for GET testing
    When I set to run the k6 script with the following configurations:
      | virtual_users   | duration   | http_req_failed   |
      | <virtual_users> | <duration> | <http_req_failed> |
    And I set the following endpoints used:
      """
      https://postman-echo.com/get?foo1=bar1&foo2=bar2
      https://postman-echo.com/get?foo1=bar1&foo2=bar2
      """
    When I set the authentication type to "none"
    Then I see the API should handle the GET request successfully

    Examples:
      | virtual_users | duration | http_req_failed | http_req_duration |
      |            10 |        5 | rate<0.05       | p(95)<3000        |
      |            50 |       10 | rate<0.05       | p(95)<3000        |
# |           100 |       15 | rate<0.05       | p(95)<3500        |
# |           200 |       20 | rate<0.05       | p(95)<3500        |
