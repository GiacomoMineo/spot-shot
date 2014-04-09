app.controller('MenuCtrl', ['$scope', '$routeParams', 'localization',
	function ($scope, $routeParams, localization) {
		localization.setPageLocale("menu", function(data) { $scope.locale = data; });

		// Variables initialization
		$scope.lat = '0';
		$scope.lng = '0';

		// Route parameters variables
		$scope.id = $routeParams.id;
		$scope.name = $routeParams.name;
		var isTrueSet = ($routeParams.group === 'true');
		$scope.group = isTrueSet;

		// Get the group item
		if ($scope.group) {
			var group = window.localStorage.getArray("group" + $scope.id);
			$scope.friends = group.friends;
		}

		// Interactive elements initialization (jQuery)
		$('.group-tab').slideUp();

		// Toggle the recipients tab (only if the recipient is a group)
		$scope.toggleRecipients = function() {
			if ($scope.group) {
				$('.group-tab').stop();
				$('.group-tab').slideToggle(300);
			}
		}
	}
]);