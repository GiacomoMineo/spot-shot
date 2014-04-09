app.service('facebook', ['$rootScope', '$location', '$window', '$timeout',
	function ($rootScope, $location, $window, $timeout) {

	var that = this;

	this.authorized = false;

	FB.Event.subscribe('auth.authResponseChange', function (response) {
		if (response.authResponse) {
			if (response.status === 'connected') {
		        // User logged in and authorized
		        $timeout(function() {
		        	$rootScope.$apply(function () {
			        	that.authorized = true;
			        	$location.path('/friends');
			        });
		        });
		    } else if (response.status === 'not_authorized') {
		    		// User logged in but has not authorized app
		    		$timeout(function() {
					    $rootScope.$apply(function () {
					       	that.authorized = false;
					       	$location.path('/');
					    });
				    });
			    } else {
			    	// User logged out
			    	$timeout(function() {
				        $rootScope.$apply(function () {
				        	that.authorized = false;
				        	$location.path('/');
				        });
			    	});
			    }
		} else {
			$log.info('No valid authResponse found, user logged out');
			$rootScope.$apply(function () {
				that.authorized = false;
			});
		}
	});

	this.login = function (success, fail) {
		FB.login(function (response) {}, {scope: 'publish_actions,user_photos,photo_upload'});
	};

	this.logout = function () {
		$timeout(function() {
			FB.logout(function () {
				$rootScope.$apply(function () {
					that.authorized = false;
				});
			});
		});
	};

	this.getLoginStatus = function (success) {
		$timeout(function() {
			FB.getLoginStatus(function (response) {
				$rootScope.$apply(function() {
					success(response);
				});
			});
		});
	};

	this.loadFriends = function (success) {
		$timeout(function() {
			FB.api('me/friends?fields=picture,name', function(response) {
				success(response.data);
				$rootScope.$apply();
			});
		});		
	}
}]);