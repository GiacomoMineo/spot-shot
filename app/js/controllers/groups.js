app.controller('GroupsCtrl', ['$scope', '$routeParams', 'localization', '$location',
	function($scope, $routeParams, localization, $location) {
		localization.setPageLocale("group", function(data) { $scope.locale = data; });

		// Variables initialization
		$scope.selectedGroup = window.localStorage.getArray("group" + $routeParams.id);

		// Interactive elements initialization (jQuery)
		$('.confirmation').hide();

		// Toggle confimation for group deletion
		$scope.confirm = function() {
			$('.confirmation').slideToggle(300);
		}

		$scope.removeGroup = function(id) {
			var i = 0;
			var deleted = false;
			$scope.groups = [];
			while (window.localStorage.getArray("group" + i)) {
				if (deleted) {
					var item = window.localStorage.getArray("group" + i);
					item.id--;
					$scope.groups.push(item);
					window.localStorage.setArray("group" + (i - 1), item);
					window.localStorage.removeItem("group" + i);
				}
				if (i == id) {
					window.localStorage.removeItem("group" + id);
					deleted = true;
				}
				if (!deleted) {
					$scope.groups.push(window.localStorage.getArray("group" + i));
				}
				i++;
			}
			$location.path('/');
		}

		$scope.removeFriend = function(friendId) {
			var groupId = $scope.selectedGroup.id;
			window.localStorage.removeItem("group" + groupId);
			var len = $scope.selectedGroup.friends.length;
			var found = false;
			for (var i = 0; i < $scope.selectedGroup.friends.length && !found; i++) {
				if ($scope.selectedGroup.friends[i].id == friendId) {
					$scope.selectedGroup.friends.splice(i, 1);
					i--;
					len--;
					found = true;
				}
			}
			window.localStorage.setArray("group" + groupId, $scope.selectedGroup);
			if ($scope.selectedGroup.friends.length <= 0) {
				$scope.removeGroup(groupId);
			}
		}
	}
]);