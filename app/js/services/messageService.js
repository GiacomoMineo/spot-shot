app.factory('messageService', ['FIREBASE_URI', 'NOTIFICATIONS_URI', '$firebase', '$http', 'facebook', 'localization',
function(FIREBASE_URI, NOTIFICATIONS_URI, $firebase, $http, facebook, localization) {
	var locale;
	localization.setPageLocale("welcome", function(data) { locale = data; });
	var ref = new Firebase(FIREBASE_URI + '/users');
	var users = $firebase(ref);

	// Max messages to to keep
	var max_messages = 3;
	// SpotShot Facebook page id
	var spotshotPageId = "1418855031715838";

	// Constructor for the message object
	var newMessage = function(fromId, toId, location, content, map, address, picture) {
		var date = new Date();
		var message = {
			from: fromId,
			to: toId,
			body: {
				location: location,
				content: content,
				map: map,
				address: address,
				picture: picture,
				time: date.today() + ' ' + date.timeNow()
			}
		}
		return message;
	}

	var getUsers = function() {
		return users;
	}

	var getUsersIds = function() {
		return users.$getIndex();
	}

	var getUserChats = function(id) {
		var chats = users.$child(id).$child('chats');
		return chats;
	}

	var cleanChat = function(userId, chatId) {
		var chatMessages = users.$child(chatId).$child('chats').$child(userId).$child('messages');
		chatMessages.$on('loaded', function() {
			var keys = chatMessages.$getIndex();
			// If the messages in the chat exceedes the maximum allowed
			var len = keys.length;
			while (len > max_messages) {
				chatMessages.$remove(keys[0]);
				len--;
			}
		})
	}

	// Add a new account (app ownership)
	var setupAccount = function(userId, userName, deviceId) {
		users.$on('loaded', function() {
			// If the account doesn't exist, create it and set the display_name
			if (typeof users[userId] === 'undefined') {
				users.$child(userId).$child('account').$child('display_name').$set(userName);
				sendWelcomeMessage(userId);
			}
			// Load account devices and check if the current one already exists
			var devices = users.$child(userId).$child('account').$child('devices');
			devices.$on('loaded', function() {
				var keys = devices.$getIndex();
				var found = false;
				angular.forEach(keys, function(i) {
					if(devices[i] == deviceId) {
						found = true;
					}
				});
				// If the device doesn't already exist, add it
				if (!found) {
					devices.$add(deviceId);
				}
			});
		});
	}

	var sendWelcomeMessage = function(id) {
		FB.api(
			spotshotPageId + '?fields=name,picture',
			'GET',
			function(response) {
				if(response.error) {
					// Error
				} else {
					// Success
				  var name = response.name;
					var picture = response.picture.data.url;
					var message = newMessage(
						spotshotPageId,
						id,
						locale.WelcomeTitle,
						locale.WelcomeMessage,
						'',
						'',
						''
					);
					addMessage(
						spotshotPageId,
						id,
						name,
						picture,
						message
					);
				}
			}		
		);
	}

	// Add message to target chat
	var addMessage = function(userId, chatId, chatName, chatPicture, message) {
		// Push the message in the chat
		var userChat = users.$child(chatId).$child('chats').$child(userId);
		userChat.$child('messages').$add(message);
		userChat.$child('user').$child('name').$set(chatName);
		userChat.$child('user').$child('picture').$set(chatPicture);

		// Read recipient device registrationId from Firebase
		var devices = users.$child(chatId).$child('account').$child('devices');
		devices.$on('loaded', function() {
			var keys = devices.$getIndex();
			var regid = new Array();
			angular.forEach(keys, function(i) {
				regid.push(devices[i]);
			});
			message['name'] = chatName;
			message['regid'] = regid;
			// Push the message to the notification server
			var data = JSON.stringify(message);
			console.log(data);
			$http.post(NOTIFICATIONS_URI + '/message/', data)
				.success(function(data) {
					console.log('Success: ' + data);
				})
				.error(function(data) {
					console.log('Error: ' + data);
				});
		});
	}

	// Remove message with passed id from the specified chat
	var removeMessage = function(userId, chatId, messageId) {
		var userMessages = users.$child(userId).$child('chats').$child(chatId).$child('messages');
		userMessages.$remove(messageId)
		userMessages.$on('change', function() {
			// If the are no more messages, remove the chat
			var m = users.$child(userId).$child('chats').$child(chatId).$child('messages').$getIndex();
			if(m.length == 0) {
				users.$child(userId).$child('chats').$remove(chatId);
			}
		});
	}

	return {
		newMessage: newMessage,
		setupAccount: setupAccount,
		sendWelcomeMessage: sendWelcomeMessage,
		getUsers: getUsers,
		getUsersIds: getUsersIds,
		getUserChats: getUserChats,
		cleanChat: cleanChat,
		addMessage: addMessage,
		removeMessage: removeMessage
	}
}])