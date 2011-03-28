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
  @server = IO.popen("node Examples/backplaneServer/node.js > /dev/null")

  system('sleep 0.3') # give it some time to set up and listen
end


# After each
After do
  system("killall node") # Hope it didn't kill another running server'
end

# "after all"
at_exit do
end