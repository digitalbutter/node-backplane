//Start polling backplane
var backplanePoller = echo.BackplanePoller.spawn(
    {
        interval: 500,
        busName: 'your_bus_name',
        base64AuthString: 'your_auth_string',
        host: 'api.js-kit.com'
    }
    ,{ ssl: false });

backplanePoller.addListener('session/ready',function(message){
    //Process the message
    console.log(require('sys').inspect(message));
});