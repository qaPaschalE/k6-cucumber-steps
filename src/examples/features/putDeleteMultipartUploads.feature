Feature: Extended Load Testing with PUT, DELETE, and Multipart Uploads

  Scenario Outline: I run the k6 script for load testing with PUT requests
    Given I have a k6 script for PUT testing
    When I run the k6 script with the following configurations:
      | virtual_users   | duration   |
      | <virtual_users> | <duration> |
    And the following endpoint is used: "<endpoint>"
    When the following PUT body is used:
      """
      {
        "userId": "{{user_id}}",
        "status": "{{status}}"
      }
      """
    And the authentication type is "bearer_token"
    Then the API should handle the PUT request successfully

    Examples:
      | virtual_users | duration | endpoint              |
      |            10 |        5 | /api/v1/update-status |

  Scenario Outline: I run the k6 script for load testing with DELETE requests
    Given I have a k6 script for DELETE testing
    When I run the k6 script with the following configurations:
      | virtual_users   | duration   |
      | <virtual_users> | <duration> |
    And the following endpoint is used: "<endpoint>"
    And the authentication type is "api_key"
    Then the API should handle the DELETE request successfully

    Examples:
      | virtual_users | duration | endpoint              |
      |            20 |        3 | /api/v1/delete-record |

  Scenario Outline: I run the k6 script for load testing with multipart/form-data requests
    Given I have a k6 script for multipart POST testing
    When I run the k6 script with the following configurations:
      | virtual_users   | duration   |
      | <virtual_users> | <duration> |
    And the following endpoint is used: "<endpoint>"
    When the following multipart body is used:
      """
      file: <sample.pdf>
      description: {{file_description}}
      """
    And the authentication type is "bearer_token"
    Then the API should handle multipart request successfully

    Examples:
      | virtual_users | duration | endpoint            |
      |            15 |        5 | /api/v1/upload-file |
