Feature: Backplane channel implementation (http://backplanespec.googlegroups.com/web/backplane-20101101.pdf?hl=en)
  In order to allow communication between javascript clients and server applications
  As a javascript widget server
  I want to securely post messages and anonymously consume messages on a randomly generated channel

  Background: I want a fresh started server!

  Scenario: Get an empty channel on a valid bus
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

  Scenario: Retrieve unread messages only
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
    When I post another valid message to the same channel
    Then I should receive an HTTP Response code of "200"
    When I get new messages from that channel
    Then I should receive an HTTP Response code of "200"
    And receive only the last message back

  Scenario: Malformed message (source)
    Given a valid api key
    When I post a message without a source to a random channel
    Then I should receive an HTTP Response code of "400"
    And  a "400", "BadRequest" json error object with the message "Mandatory parameter absent"

  Scenario: Malformed message (type)
    Given a valid api key
    When I post a message without a type to a random channel
    Then I should receive an HTTP Response code of "400"
    And  a "400", "BadRequest" json error object with the message "Mandatory parameter absent"

  Scenario: Malformed message (invalid source)
    Given a valid api key
    When I post a message with an incorrect source to a random channel
    Then I should receive an HTTP Response code of "400"
    And  a "400", "BadRequest" json error object with the message "Source must be a valid URL"

  Scenario: Invalid authentication protocol (or no protocol)
    Given a valid api key
    When I post a valid message, without authentication, to a random channel
    Then I should receive an HTTP Response code of "400"
    And a "400", "AuthenticationError" json error object with the message "This server only supports Basic authentication."

Scenario: Empty payload
   Given a valid api key
   When I post a valid message, without payload, to a random channel
   Then I should receive an HTTP Response code of "200"
   When I get messages from that channel
   And receive the same message back

 Scenario: Get an invalid bus
   When I get messages from an invalid bus
   Then I should receive an HTTP Response code of "400"
   And a "400", "BusError" json error object with the message "Bus does not exist."
   