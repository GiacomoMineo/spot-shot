app.factory('messageService', ['FIREBASE_URI', 'NOTIFICATIONS_URI', '$firebase', '$http', 'facebook', 
function(FIREBASE_URI, NOTIFICATIONS_URI, $firebase, $http, facebook) {
	var ref = new Firebase(FIREBASE_URI + '/users');
	var users = $firebase(ref);

	// Max messages to to keep
	var max_messages = 3;

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

	var getUserChats = function(id) {
		var chats = users.$child(id).$child('chats');
		return chats;
	}

	var checkUser = function(id, callback) {
		users.$on('loaded', function() {
			if (typeof users[id] === 'undefined') {
				callback(false);
			} else {
				callback(true);
			}
		})
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

	// Add message to target chat
	var addMessage = function(userId, chatId, chatName, chatPicture, message) {
		// Push the message in the chat
		var userChat = users.$child(chatId).$child('chats').$child(userId);
		userChat.$child('messages').$add(message);
		userChat.$child('user').$child('name').$set(chatName);
		userChat.$child('user').$child('picture').$set(chatPicture);
		// Read Device registrationId from the local storage
		var regid = window.localStorage.getItem("regid");
		message['regid'] = regid;
		// Push the message to the notification server
		var data = JSON.stringify(message);
		console.log(data);
		$http.post(NOTIFICATIONS_URI + '/message', data)
			.success(function(data) {
				console.log('Success: ' + data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
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
		getUsers: getUsers,
		getUserChats: getUserChats,
		checkUser: checkUser,
		cleanChat: cleanChat,
		addMessage: addMessage,
		removeMessage: removeMessage
	}
}])