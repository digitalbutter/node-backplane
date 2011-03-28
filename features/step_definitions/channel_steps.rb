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
  
  @expected_response.push(back_message)

  begin
    @response = RestClient.post @current_channel_url, message.to_json, :Authentication => @defaults.get_auth_header(@key), :content_type => :json
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
  @expected_response.push(back_message)

  begin
    @response = RestClient.post @current_channel_url, message.to_json, :Authentication => @defaults.get_auth_header(@key), :content_type => :json
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


When /^I get messages from the bus/ do
  @response = RestClient.get @defaults.get_valid_bus, {:accept => :json}
end

And /^receive both messages back from both channels$/ do
  response = JSON.parse(@response)
  @expected_response.each do |entry|
    response.should be_include(entry)
  end
end


# This shit is doomed, don't approach it.
#And /^receive both messages back from both channels$/ do
#  # OH MY GOD I WASTED SO MUCH TIME ON THIS SHIT I'M GONNA KILL A KITTY
#  # I just wanted to remove ID, persistant on the server but not in the test
#  # (in other word, we just compare the message and the channel ID,
#  # not the message ID, unknown and unpredictable for the client)
#  # Finally I just kept the channel name (which are random and actually depend on message posted). Fuck it !
#  response = JSON.parse(@response)
##  obtained = Array.new
##  response.each do |entry|
##    res = Hash.new
##    res["channel_name"] = entry["channel_name"]
##    obtained += [res]
##  end
##
##  STDERR.puts
#  @expected_response.each do |entry|
#    response.should be_include(entry)
##    res = Hash.new
##    entry.each do |k,v|
##      if (k.to_s == "channel_name")
##        res["channel_name"] = v
###      elsif (k.to_s == "message")
###        res["message"] = v
##      end
##    end
##    obtained.should be_include(res)
#  end
#end