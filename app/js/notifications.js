var pushNotification;

function onDeviceReady() {
	pushNotification = window.plugins.pushNotification;
	if (device.platform == 'android' || device.platform == 'Android') {
		pushNotification.register(
			successHandler, 
			errorHandler,
			{
				"senderID":"659074549826",
				"ecb":"onNotificationGCM"
			}
		);
	} else {
		// Registration for other platforms
	}
}

// GCM notifications for Android
function onNotificationGCM(e) {
	console.log('Event received: ' + e.event);
	$("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');

	switch( e.event )
	{
		case 'registered':
			if ( e.regid.length > 0 )
			{
				console.log('Device registered with ID: ' + e.regid);
				// Save the registrationId in the Local Storage
				window.localStorage.setItem("regid", e.regid);
				// Your GCM push server needs to know the regID before it can push to this device
				// here is where you might want to send it the regID for later use.
			}
			break;
		case 'message':
			// if this flag is set, this notification happened while we were in the foreground.
      // you might want to play a sound to get the user's attention, throw up a dialog, etc.
      if (e.foreground)
      {
      	console.log('Inline notification');
				// if the notification contains a soundname, play it.
				/*var my_media = new Media("/android_asset/www/" + e.soundname);
				my_media.play();*/
			}
			else
			{	// otherwise we were launched because the user touched a notification in the notification tray.
				if (e.coldstart)
					console.log('Coldstart notification');
				else
					console.log('Background notification');
			}
			console.log('Message: ' + e.payload.message);
			console.log('Content: ' + e.payload.msgcnt);
			break;
		case 'error':
			console.log('Error: ' + e.msg);
			break;
		default:
			console.log('Unknown message');
			break;
	}
}
function successHandler (result) {
	console.log('Registration successful: ' + result);
}
function errorHandler (error) {
	console.log('Registration error: ' + error);
}

document.addEventListener('deviceready', onDeviceReady, true);

