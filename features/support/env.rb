require 'rspec/expectations'
require 'rest_client'
require 'json'
require 'base64'

# "before each"
# How do we make this path anchored at some sort of root, so that 'cucumber' doesn't have to be instantiated
# relative to this path?
config = YAML.load_file "features/config.yml"
Before do
  @config = config
  @defaults = Defaults.new(config)
  # Starting the server:
  @pipe = IO.popen("node Examples/backplaneServer/#{@config["server"]}", "r")

  system('sleep 0.3') # give it some time to set up and listen
end


# After each
After do
  Process.kill("KILL", @pipe.pid)
end

# "after all"
at_exit do
end