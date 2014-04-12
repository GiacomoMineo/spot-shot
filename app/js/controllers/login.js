app.controller('LoginCtrl', ['$scope', 'facebook', '$location', 'localization',
	function($scope, facebook, $location, localization) {
		localization.setPageLocale("login", function(data) { $scope.locale = data; });
		
		// --- Page initialization
		// Interactive elements initialization (jQuery)
		$('.login-tab').hide();

		// --- UI Interactions
		// Calls the facebook login routine
		$scope.facebookLogin = function() {
			facebook.login();
		}

		// Shows the app login form
		$scope.appLogin = function() {
			$('.app, .fb').fadeOut(300);
			$('.login-tab').slideDown(300);
		}
	}
]);