Feature: Backplane channel implementation (http://backplanespec.googlegroups.com/web/backplane-20101101.pdf?hl=en)
  In order to allow communication between javascript clients and server applications
  As a javascript widget server
  I want to securely post messages and anonymously consume messages on a randomly generated channel

  Scenario: Get an empty channel
    Given a valid api key
    When I get an empty channel
    Then I should receive an HTTP Response code of "200"
    And I should receive an empty array

  Scenario: Post a message
    Given a valid api key
    When I post a valid message to a random channel
    Then I should receive an HTTP Response code of "200"
    When I get messages from that channel
    And receive the same message back
    When I post another valid message to the same channel
    Then I should receive an HTTP Response code of "200"
    When I get messages from that channel
    Then I should receive an HTTP Response code of "200"
    And receive both messages back

  Scenario: Retrieve messages from multiple channels
    Given a valid api key
    When I post a valid message to a random channel
    And I post a valid message to a random channel
    When I get messages from the bus
    And receive both messages back from both channels

  Scenario: Use an invalid key
    Given an invalid api key
    When I post a valid message to a random channel
    Then I should receive an HTTP Response code of "401"
    And  a "401", "Unauthorized" json error object with the message "Wrong username and/or password."