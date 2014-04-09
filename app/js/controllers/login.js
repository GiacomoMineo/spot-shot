app.controller('LoginCtrl', ['$scope', 'facebook', '$location', 'localization',
	function($scope, facebook, $location, localization) {
		// Localization service for the page
		localization.setPageLocale("login", function(data) { $scope.locale = data; });

		// Calls the facebook login routine
		$scope.facebookLogin = function() {
			facebook.login()
		}
	}
]);