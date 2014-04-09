app.controller('FriendsCtrl', ['$scope', 'facebook', '$location', '$rootScope', 'localization', '$http', 'messageService',
	function ($scope, facebook, $location, $rootScope, localization, $http, messageService) {
		localization.setPageLocale("friends", function(data) { $scope.locale = data; });

		// Variables initialization
		$scope.selectedFriends = [];
		$scope.groups =[];
		$scope.group = '';
		$scope.selected = '';
		$scope.orderProp = 'name';
		$scope.searchOpen = false;
		var friendSpinner = document.getElementById('friend-spinner');
		var spotshotPageId = "190955174445459";

		// Interactive elements initialization (jQuery)
		$('.text-alert').hide();
		$('.new-group-tab').hide();
		$('.add-group-tab').hide();
		$('.group-modify').hide();

		// Fetch friends data
		// Check connection status
		if($rootScope.online) {
			// Get Facebook Login Status
			facebook.getLoginStatus(function(response) {
				// Check if user is logged in
				if (response.authResponse) {
					// Message spinner animation stop
					$('.message').removeClass('message-spinner');
					// Firebase user check and initialization
					FB.api(
						'/me?fields=id',
						'GET',
						function(response) {
							$scope.userId = response.id;
							userIdLocal(response.id);
							firebaseUserInit(response.id);
							facebook.loadFriends(function(response) {
								// Callback for successful friendlist loading
								friendSpinner.className = "";
								$scope.friends = response;
							});
						}
					);
				} else {
					// Redirect to the login page
					$location.path('/login');
				}
			});
		}

		// Fetch group data
		var i = 0;
    while (window.localStorage.getArray("group" + i)) {
      $scope.groups.push(window.localStorage.getArray("group" + i));
      i++;
		}

		function userIdLocal(userId) {
			window.localStorage.setItem("userId", userId);
		}

		// Firebase user check and initialization
		function firebaseUserInit(userId) {
			messageService.checkUser(userId, function(exists) {
				if(!exists) {
					// Add the user
					// Welcome message
					var date = new Date();
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
								var message = messageService.newMessage(
									spotshotPageId,
									window.localStorage.getItem("userId"),
									$scope.locale.WelcomeTitle,
									$scope.locale.WelcomeMessage,
									'',
									'',
									''
								);
								messageService.addMessage(
									spotshotPageId,
									window.localStorage.getItem("userId"),
									name,
									picture,
									message
								);
							}
						}
					);
				}
			});
		}

		// Send message to multiple friends
		$scope.multipleSend = function() {
			// Special group object with unique id (temp)
			var group = {
				id: "temp",
				name: "multipleSend",
				friends: $scope.selectedFriends
            };
			window.localStorage.setArray("grouptemp", group);
			$location.path('/menu/temp,' + $scope.locale.MultipleSend + ',true');
		};

		// Toggle selection on clicked friend
		// (clicked friend object, clicked element)
		$scope.selectFriend = function(friend, e) {
			var elem = angular.element(e.srcElement);
			var li = $(elem).parent();
			// Check if clicked item is already selected
			if ($(li).attr('class').indexOf('selected') == -1) {
				$scope.selectedFriends.push(friend);
			}
			else {
				var found = false;
				// Search for clicked item in the list and remove it
				for (var i = 0; i < $scope.selectedFriends.length && !found; i++) {
					if ($scope.selectedFriends[i].id == friend.id) {
						$scope.selectedFriends.splice(i, 1);
						found = true;
					}
				}
				// Check if the list is empty to hide special tabs
				if ($scope.selectedFriends.length <= 0) {
					$('.new-group-tab').hide();
					$('.add-group-tab').hide();
				}
			}
			// Toggle selection
			$(li).toggleClass('selected');
		};

		// Empty selected friends list
		$scope.resetSelection = function() {
			$('.new-group-tab').hide();
			$('.add-group-tab').hide();
			$scope.selectedFriends = [];
			// Remove selection from all elements
			$('.friends-list > li').each(function() {
				$(this).removeClass('selected');
			});
		};

		// Toggle the input for group creation
		$scope.newGroup = function() {
			$('.new-group-tab').slideToggle(300);
			$('.add-group-tab').slideUp(300);
		};

		// Toggle the add to group tab
		$scope.addGroup = function() {
			$('.add-group-tab').slideToggle(300);
			$('.new-group-tab').slideUp(300);
		};

		// Create a new group
		$scope.createGroup = function() {
			if ($scope.group === "") {
				// If group name is empty, display error
				displayText($('.text-alert'), $scope.locale.ErrorNameShort, 'red');
			}
			else {
				// Select the id
				var i = 0;
				while (window.localStorage.getArray("group" + i)) {
					i++;
				}
				var id = i;
				var group = {
					id: id,
					name: $scope.group,
					friends: $scope.selectedFriends
				};
				// Save group in the local storage
				window.localStorage.setArray("group" + id, group);
				// Add group in the page list
				$scope.groups.push(group);
				$scope.resetSelection();
				$('.new-group-tab').hide();
				displayText($('.text-alert'), $scope.locale.GroupCreated, 'white');
				scrollToTop();
			}
		};

		// Add selected friends to the selected group
		// (selected group id)
		$scope.addToGroup = function(id) {
			// Fetch the group item from local storage
			var item = window.localStorage.getArray("group" + id);
			// Check if one or more selected friends are already in the group
			var len = $scope.selectedFriends.length;
			var found = false;
			for (var i = 0; i < len; i++) {
				found = false;
				for (var j = 0; j < item.friends.length && !found; j++) {
					if ($scope.selectedFriends[i].id == item.friends[j].id) {
						// If already present, ignore it by removing it
						$scope.selectedFriends.splice(i, 1);
						i--;
						len--;
						found = true;
					}
				}
			}
			// Add the selected friend list to the selected group list
			item.friends = item.friends.concat($scope.selectedFriends);
			// Save the new item in the local storage
			window.localStorage.setArray("group" + id, item);
			// Update the group in the page
			$scope.groups[id] = item;
			$scope.resetSelection();
			$('.add-group-tab').hide();
			displayText($('.text-alert'), $scope.locale.FriendsAdded + item.name + '!', 'white');
			scrollToTop();
		};

		$scope.toggleSearch = function() {
			$scope.searchOpen = !$scope.searchOpen;
		}

		// Scroll the page to the top
		function scrollToTop() {
			$("html, body").animate({ scrollTop: $('#deviceready').offset().top }, 400);
		}

		// Utility function for displaying text
		function displayText(selector, text, color) {
          $(selector).stop();
          $(selector).html(text)
            .css('color', color)
            .fadeIn(300)
            .delay(2000)
            .fadeOut(300, function () {
              $(this).empty();
            });
		}
	}
]);