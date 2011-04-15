This library implements a [backplane](https://sites.google.com/site/backplanespec/) server and client.

## Installation

    npm install backplane

## Usage

This library includes 3 major components. A client for periodically polling an existing backplane server, a backplane server that runs on a plain node installation and a backplane server designed to work with connect.

### Client:

The client is used to poll an existing backplane server for messages. Once created it will check the backplane server for new messages at a specified interval.

<script src="http://gist-it.appspot.com/github/digitalbutter/node-backplane/raw/master/Examples/backplanePoller/poller.js"></script>

### Connect Server:

<script src="http://gist-it.appspot.com/github/digitalbutter/node-backplane/raw/master/Examples/backplaneServer/connect.js"></script>

### Plain Node Server:

<script src="http://gist-it.appspot.com/github/digitalbutter/node-backplane/raw/master/Examples/backplaneServer/node.js"></script>

## Support

* [Issues](https://github.com/digitalbutter/node-backplane/issues)
* [API](http://digitalbutter.github.com/node-backplane/api/)
* [Project Tracker](https://www.pivotaltracker.com/projects/255711)

## License

This library is licensed under the MIT license. A copy of this can be found [here](https://github.com/digitalbutter/node-backplane/blob/master/LICENSE)
