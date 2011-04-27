class Defaults
  def initialize(config)
    @config = config
    @valid_info = @config['valid_info']
    @count = 1
  end

  def get_count()
    return @count
  end
  def inc_count()
    @count += 1
  end

  def get_valid_bus()
      @config['base_url'] + '/' + @config['backplane']['version'] + '/bus/' + @valid_info['bus']
  end

  def get_invalid_bus()
      @config['base_url'] + '/' + @config['backplane']['version'] + '/bus/' + 'invalid_bus'
  end

  def get_valid_channel(channel)
     get_valid_bus + '/channel/' + channel
  end

  def get_valid_token()
    @config['valid_info']['key']
  end

  def get_auth_header(key)
     'Basic ' + Base64.encode64(@valid_info['bus'] + ':' + key)
  end
end