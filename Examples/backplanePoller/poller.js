//Start polling backplane
var backplanePoller = require("backplane").createBackplanePoller(
    {
        interval: 5000,
        busName: 'valid_bus1',
        base64AuthString: 'dmFsaWRfYnVzMTp1bmd1ZXNzYWJsZV9rZXk=',
        host: '127.0.0.1',
        port: 8001
    }
    ,{ ssl: false });


backplanePoller.addListener('data',function(message){
    console.log(require('util').inspect(message))
});

backplanePoller.addListener('session/ready',function(message){
    //Process the message
    console.log(require('util').inspect(message));
});