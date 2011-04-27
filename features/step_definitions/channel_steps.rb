Given /^a valid api key$/ do
  @key="unguessable_key"
end


When /^I get an empty channel$/ do
  @expected_response = Array.new
  @current_channel = rand(9999999999999).to_s
  @current_channel_url = @defaults.get_valid_channel(@current_channel)
  @response = RestClient.get @current_channel_url, {:accept => :json}
end

Then /^I should receive an HTTP Response code of "(\d+)"$/ do |expected_response|
  @response.code.to_s().should == expected_response
end


And /^I should receive an empty array$/ do
  Then "receive the same message back"
end


Given /^an invalid api key$/ do
  @key="invalid_key"
end


When /^I post a valid message to a random channel$/ do
  @current_channel = rand(9999999999999).to_s
  @current_channel_url = @defaults.get_valid_channel(@current_channel)
  message = { "source" => "http://ep.com", "type" => "string" , "payload" => "Yo Mamas Load"}
  # What the server will reply is a bit different. It adds some unique id and channel name
  back_message = {"message" => message,  "channel_name"=>@current_channel,"id"=>@defaults.get_count}
  if(!defined? @expected_response)
    @expected_response = Array.new
  end

  @last_message = back_message
  @expected_response.push(back_message)

  begin
    @response = RestClient.post @current_channel_url, message.to_json, :Authorization => @defaults.get_auth_header(@key), :content_type => :json
    @defaults.inc_count
  rescue => e
    @response = e.response
  end
end

When /^I get messages from that channel$/ do
  @response = RestClient.get @current_channel_url, {:accept => :json}
end

Then /^receive the same message back$/ do
  JSON.parse(@response).should == JSON.parse(@expected_response.to_json)
end

When /^I post another valid message to the same channel$/ do
  message = { "source" => "http://ep.com", "type" => "string" , "payload" => "Yo Mamas Load"}

  back_message = {"id"=>(@defaults.get_count).to_i,"message" => message, "channel_name"=>@current_channel}
  @last_message = back_message
  @expected_response.push(back_message)

  begin
    @response = RestClient.post @current_channel_url, message.to_json, :Authorization => @defaults.get_auth_header(@key), :content_type => :json
    @defaults.inc_count
  rescue => e
    @response = e
  end
end

Then /^receive both messages back$/ do
  Then "receive the same message back"
end

Then /^a "(\d+)", "([^"]*)" json error object with the message "([^"]*)"$/ do |arg1, arg2, arg3|
  @expected_response = { :error => { :code => arg1, :type => arg2, :message => arg3} }
  @response.should == @expected_response.to_json
end


When /^I get new messages from that channel$/ do
  @since = 2

  @response = RestClient.get @current_channel_url+"?since="+@since.to_s, {:accept => :json}
end

Then /^receive only the last message back$/ do
  JSON.parse(@response).should == [JSON.parse(@last_message.to_json)]
end

When /^I get messages from the bus/ do
  @response = RestClient.get @defaults.get_valid_bus, {:accept => :json}
end

When /^I get messages from an invalid bus/ do
  begin
    @response = RestClient.get @defaults.get_invalid_bus, {:accept => :json}
  rescue => e
    @response = e.response
  end
end


And /^receive both messages back from both channels$/ do
  response = JSON.parse(@response)
  @expected_response.each do |entry|
    response.should be_include(entry)
  end
end


When /^I post a message without a source to a random channel$/ do
  @current_channel = rand(9999999999999).to_s
  @current_channel_url = @defaults.get_valid_channel(@current_channel)
  message = { "type" => "string" , "payload" => "Yo Mamas Load"}
  # What the server will reply is a bit different. It adds some unique id and channel name
  back_message = {"message" => message,  "channel_name"=>@current_channel,"id"=>@defaults.get_count}
  if(!defined? @expected_response)
    @expected_response = Array.new
  end

  @last_message = back_message
  @expected_response.push(back_message)

  begin
    @response = RestClient.post @current_channel_url, message.to_json, :Authorization => @defaults.get_auth_header(@key),:content_type => :json
    @defaults.inc_count
  rescue => e
    @response = e.response
  end
end

When /^I post a message without a type to a random channel$/ do
  @current_channel = rand(9999999999999).to_s
  @current_channel_url = @defaults.get_valid_channel(@current_channel)
  message = { "source" => "http://ep.com", "payload" => "Yo Mamas Load"}
  # What the server will reply is a bit different. It adds some unique id and channel name
  back_message = {"message" => message,  "channel_name"=>@current_channel,"id"=>@defaults.get_count}
  if(!defined? @expected_response)
    @expected_response = Array.new
  end

  @last_message = back_message
  @expected_response.push(back_message)

  begin
    @response = RestClient.post @current_channel_url, message.to_json, :Authorization => @defaults.get_auth_header(@key),:content_type => :json
    @defaults.inc_count
  rescue => e
    @response = e.response
  end
end

When /^I post a message with an incorrect source to a random channel$/ do
  @current_channel = rand(9999999999999).to_s
  @current_channel_url = @defaults.get_valid_channel(@current_channel)
  message = { "source" => "http://ep", "type" => "string" , "payload" => "Yo Mamas Load"}
  # What the server will reply is a bit different. It adds some unique id and channel name
  back_message = {"message" => message,  "channel_name"=>@current_channel,"id"=>@defaults.get_count}
  if(!defined? @expected_response)
    @expected_response = Array.new
  end

  @last_message = back_message
  @expected_response.push(back_message)

  begin
    @response = RestClient.post @current_channel_url, message.to_json, :Authorization => @defaults.get_auth_header(@key),:content_type => :json
    @defaults.inc_count
  rescue => e
    @response = e.response
  end
end

When /^I post a valid message, without authentication, to a random channel$/ do
  @current_channel = rand(9999999999999).to_s
  @current_channel_url = @defaults.get_valid_channel(@current_channel)
  message = { "source" => "http://ep.com", "type" => "string" , "payload" => "Yo Mamas Load"}
  # What the server will reply is a bit different. It adds some unique id and channel name
  back_message = {"message" => message,  "channel_name"=>@current_channel,"id"=>@defaults.get_count}
  if(!defined? @expected_response)
    @expected_response = Array.new
  end

  @last_message = back_message
  @expected_response.push(back_message)

  begin
    @response = RestClient.post @current_channel_url, message.to_json, :content_type => :json
    @defaults.inc_count
  rescue => e
    @response = e.response
  end
end

When /^I post a valid message, without payload, to a random channel$/ do
  @current_channel = rand(9999999999999).to_s
  @current_channel_url = @defaults.get_valid_channel(@current_channel)
  message = { "source" => "http://ep.com", "type" => "string"}
  # What the server will reply is a bit different. It adds some unique id and channel name
  back_message = {"message" => message,  "channel_name"=>@current_channel,"id"=>@defaults.get_count}
  if(!defined? @expected_response)
    @expected_response = Array.new
  end

  @last_message = back_message
  @expected_response.push(back_message)

  begin
    @response = RestClient.post @current_channel_url, message.to_json, :Authorization => @defaults.get_auth_header(@key), :content_type => :json
    @defaults.inc_count
  rescue => e
    @response = e.response
  end
end