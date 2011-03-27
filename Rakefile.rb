require 'yaml'
require 'rake/clean'
require 'ftools'

$:.unshift(File.dirname(__FILE__) + '/../../lib')

#import rake tasks
if(ENV['BUILD_TOOLS_PATH'])
  puts "Importing rake tasks from #{ENV['BUILD_TOOLS_PATH']}rake"
  Dir.glob("#{ENV['BUILD_TOOLS_PATH']}rake/*.rake").each { |r| import r }
elsif(File.directory?('rake'))
  puts "Importing tasks from the rake directory"
  Dir.glob('rake/*.rake').each { |r| import r }
else
  puts 'No external rake tasks imported'
end

#Set paths to clean and clobber
CLEAN.add 'test/output/*'
CLEAN.add 'test/parser/*'

CLOBBER.add 'tmp/'

#set a scope variable that always points to the directory
@directory = File.dirname(__FILE__)

desc "Clean and clobber"
task :clean_and_clobber => [:clean, :clobber] do
  puts "Finished and cleaned."
end

#Actual tasks for this project used by teamcity
#none