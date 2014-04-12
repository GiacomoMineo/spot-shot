var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var gcm = require('node-gcm');
var app = express();

app.use(cors());
app.use(bodyParser());
app.use(express.static(__dirname + '/app'));

// Google Cloud Messaging API
var sender = new gcm.Sender('AIzaSyAUYOUUPOBjFPHDU083GnZpJk1yen7QvhA');

// RESTful endpoint for message
app.post('/message', function(req, res){
	var message = req.body;
	if(req.body.regid) {
		var registrationId = req.body.regid;
		console.log(message);
		// Send the message to the Google Cloud Service
		var gcmMsg = new gcm.Message();
		gcmMsg.addData('message', message.body.address);
		gcmMsg.addData('title', 'SpotShot - ' + message.from);
		gcmMsg.addData('msgcnt','3'); // Shows up in the notification in the status bar
		gcmMsg.addData('soundname','beep.wav'); //Sound in www folder
		gcmMsg.timeToLive = 3000;
		sender.send(message, registrationId, 4, function (result) {
	    console.log(result);
		});
	}
	// Send response
	res.send(message);
});

var port = Number(process.env.PORT || 5000);
app.listen(port);
console.log('Server listening on port ' + port + '...');