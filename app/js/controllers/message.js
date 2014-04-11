app.controller('MessageCtrl', ['$scope', 'localization', '$routeParams', 'messageService', 'facebook',
	function($scope, localization, $routeParams, messageService, facebook) {
		facebook.redirectCheck();
		localization.setPageLocale("message", function(data) { $scope.locale = data; });

		$scope.chats = messageService.getUserChats($routeParams.id);

		$scope.toggleChat = function(id, messageClick) {
			var $chat = $('#' + id);
			var animate = false;

			if(!messageClick) {
				animate = true;
			}
				else {
				if($chat.attr('class').indexOf('open') == -1) {
					animate = true;
				}
			}
			if(animate) {
				// Check if the element is open or closed
				if($chat.attr('class').indexOf('open') == -1) {
					// Open
					openChat($chat);
					// Close other chats
					$chat.siblings().each(function(index, el) {
						if($(el).attr('class').indexOf('open') != -1) {
							closeChat($(el));
						}
					});
				} else {
					// Close
					closeChat($chat);
				}
			} 
		};

		var animationSpeed = 200;

		function openChat($element) {
			$element.addClass('open');
			$element.find('.messages').hide();
			$element.find('.messages').slideDown(animationSpeed, 'linear', function() {
				var h = $element.find('li:first-child').height() + 32;
				$element.find('.messages').animate({ 'height': h + 'px' }, animationSpeed, 'linear');
			});
		}

		function closeChat($element) {
			$element.find('.messages').slideUp(animationSpeed, 'linear', function() {
				$element.find('.messages').css({ 'height': '132px' });
				$element.removeClass('open');
				$element.find('.messages').fadeIn(animationSpeed);
			});
		}

		$scope.removeMessage = function(chatId, messageId) {
			console.log('chatid: ' + chatId + ', messageid: ' + messageId);
			//messageService.removeMessage($routeParams.id, chatId, messageId);
		};

		$scope.togglePicture = function(e) {
			var $el = $(e.srcElement);
			var $img;
			if($el.attr('class') == 'img-overlay enlarged') {
				$img = $(e.srcElement)
			} else {
				$img = $(e.srcElement).parent();
			}
			$img.toggleClass('enlarged');
		}
	}
]);
