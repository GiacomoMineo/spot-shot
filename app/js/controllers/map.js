app.controller('MapCtrl', ['$scope', '$routeParams', '$window', '$timeout', 'googlemaps', '$location', 'localization',
	function ($scope, $routeParams, $window, $timeout, googlemaps, $location, localization) {
		localization.setPageLocale("map", function(data) { $scope.locale = data; });

		// Map loading routine
		$window.loadMap = function() {
			document.getElementById("refresh").className = '';
			$scope.error = '';
			// Check if geolocation is available
			if (navigator.geolocation) {
				var options = {
					enableHighAccuracy: true,
					timeout: 15000,
					maximumAge: 0
				};
				loc.className = "spinner";
				navigator.geolocation.getCurrentPosition(
					function(position) {
						// Geolocation Successful
						var lat = position.coords.latitude;
					  var lng = position.coords.longitude;
						var mapOptions = {
							center: new google.maps.LatLng(lat, lng),
							zoom: 15
						};
						loc.className = '';
					  var markers = [];
					  // Map creation
					  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
					  // Click event listener
		        google.maps.event.addListener(map, 'click', function(event) {
		        	setClickedLocation(event.latLng);
		        });
					  // Link the search box to the map
					  var input = document.getElementById('place-input');
						var searchBox = new google.maps.places.SearchBox((input));
						// Listen for the event fired when the user selects an item from the
						// pick list. Retrieve the matching places for that item
						google.maps.event.addListener(searchBox, 'places_changed', function() {
							var places = searchBox.getPlaces();
							for (var i = 0, marker; marker = markers[i]; i++) {
								marker.setMap(null);
							}
							var bounds = new google.maps.LatLngBounds();
							if(places.length == 0) {
								// If no place is found, hide the list overlay
								$scope.placesList = false;
							}	
							else {
							  if(places.length == 1) {	
							  	// Single result, set the marker to it
							  	// Setting the flag to show the address instead of place name
							  	setPlaceMarker(places[0], false);
							  	$scope.placesList = false;
							  	$scope.$apply();
							  } 
							  else {
							  	// Show the list overlay
							  	$scope.placesList = true;
							  	for (var i = 0, place; place = places[i]; i++) {
							  		bounds.extend(place.geometry.location);
							  	}
							  	$scope.places = places;
							  	$scope.$apply();
							  	map.fitBounds(bounds);
							  }		
							}
						});
						// Bias the SearchBox results towards places that are within the bounds of the
						// current map's viewport
						google.maps.event.addListener(map, 'bounds_changed', function() {
							var bounds = map.getBounds();
							searchBox.setBounds(bounds);
						});
					}, 
					function(e) {	
					// Geolocation Error
						loc.className = '';
						document.getElementById("refresh").className = 'refresh';
						$scope.error = 'Error: ' + e.message;
						$scope.$apply();
					}, options);
			} else { 
				document.getElementById("refresh").className = 'refresh';
				$scope.error = "Geolocation is not supported."; 
			}
		}

		// Variables initialization
		var map;
		var marker;
		$scope.placeName = "default";
		$scope.error = "";
		document.getElementById("refresh").className = '';
		var loc = document.getElementById('location-spinner');
		var confirmBtn = document.getElementById('confirm');
		confirmBtn.setAttribute("disabled", false);

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

		// Check if Google API's have already been loaded 
		if (typeof google === 'object' && typeof google.maps === 'object')  {
			loadMap();
		} else {
			googlemaps.loadMapsApi('loadMap');
		}

		// Interactive elements initialization (jQuery)
		$('.icon-clear').hide();

		// Filter Clear
		$(document).on('input', 'input#place-input', function(){
			var io = $(this).val().length ? 1 : 0 ;
			$(this).next('.icon-clear').stop().fadeTo(300,io);
		}).on('click', '.icon-clear', function() {
			$(this).delay(300).fadeTo(300,0).prev('input').val('');
			$scope.query = '';
			$scope.$apply();
		});

		// Set the marker and coordinates
		// (location of the clicked position on the map)
		function setClickedLocation(location) {
			// Check if the marker has already been initialized
			if(typeof(marker) === 'undefined') {
				marker = new google.maps.Marker({
					position: location,
					map: map,
					icon: "",
					title: ""
				});
				marker.setMap(map);
				confirmBtn.removeAttribute('disabled');
			}
			else {
				marker.position = location;
				marker.icon = "";
				marker.setMap(map);
			}
			var p = location.toString();
			// Parse the location string in latitude and longitude
			var lat = p.split(",")[0].substring(1);
			var lng = p.split(",")[1].substring(1);
			lng = lng.substring(0, lng.length - 1);
			$scope.lat = lat;
			$scope.lng = lng;
			$scope.$apply();
		}

		// Set the marker on the map when a place is selected
		// (position to set the marker to, flag for custom place name or address)
		function setPlaceMarker(place, defaultName) {
			var p = place.geometry.location.toString();
			// Parse the location string in latitude and longitude
			var lat = p.split(",")[0].substring(1);
			var lng = p.split(",")[1].substring(1);
			lng = lng.substring(0, lng.length - 1);
			confirmBtn.removeAttribute('disabled');
			// Get the selected place special icon
			var image = {
				url: place.icon,
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(25, 25)
			};
			if(typeof(marker) === 'undefined') {
				marker = new google.maps.Marker({
					map: map,
					icon: image,
					title: place.name,
					position: place.geometry.location
				});
				marker.setMap(map);
			}
			else {
				marker.position = place.geometry.location;
				marker.icon = image;
				marker.title = place.name;
				marker.setMap(map);
			}
			// Center Map on marker
			map.setCenter(place.geometry.location);
			map.setZoom(18);
			$scope.lat = lat;
			$scope.lng = lng;
			if(defaultName) {
				// If the name flag is true, set the place name to the chosen one
				$scope.placeName = place.name;
			} else {
				// If the name flag is false, the place name won't be shown
				$scope.placeName = 'default';
			}
			// Hide the list overlay
			$scope.placesList = false;
		}

		// Handle the selected place from the list overlay
		// (clicked place object)
		$scope.selectPlace = function(place) {
			setPlaceMarker(place, true);
		}

		// Redirect to the send page passing parameters
		// Replaces anchor have button functionalities
		$scope.goSend = function() {
			$location.path('/send/' + $scope.id + ','
				+ $scope.name + ',' + $scope.group + '/' + $scope.lat + 
				',' + $scope.lng + '/' + $scope.placeName);
		}

		$scope.reloadMap = function() {
			loadMap();
		}
	}
]);