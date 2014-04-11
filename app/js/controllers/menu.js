app.controller('MenuCtrl', ['$scope', 'facebook', '$routeParams', 'localization',
	function ($scope, facebook, $routeParams, localization) {
		facebook.redirectCheck();
		localization.setPageLocale("menu", function(data) { $scope.locale = data; });

		// --- Page initialization
		// Variables initialization
		$scope.lat = '0';
		$scope.lng = '0';

		// Route parameters variables
		$scope.id = $routeParams.id;
		$scope.name = $routeParams.name;
		var isTrueSet = ($routeParams.group === 'true');
		$scope.group = isTrueSet;

		// Interactive elements initialization (jQuery)
		$('.group-tab').slideUp();

		// Get the group item
		if ($scope.group) {
			var group = window.localStorage.getArray("group" + $scope.id);
			$scope.friends = group.friends;
		}

		// --- UI Interactions
		// Toggle the recipients tab (only if the recipient is a group)
		$scope.toggleRecipients = function() {
			if ($scope.group) {
				$('.group-tab').stop();
				$('.group-tab').slideToggle(300);
			}
		}
	}
]);