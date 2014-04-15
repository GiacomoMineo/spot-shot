app.service('facebook', ['$rootScope', '$location', '$timeout',
	function ($rootScope, $location, $timeout) {

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
					       	$location.path('/login');
					    });
				    });
			    } else {
			    	// User logged out
			    	$timeout(function() {
				        $rootScope.$apply(function () {
				        	that.authorized = false;
				        	$location.path('/login');
				        });
			    	});
			    }
		} else {
			$rootScope.$apply(function () {
				that.authorized = false;
				$location.path('/login');
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

	this.redirectCheck = function () {
		if($rootScope.online) {
			this.getLoginStatus(function(response) {
				if (!response.authResponse) {
					$location.path('/login'); 
				}
			});
		}
	}
}]);