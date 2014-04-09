app.factory('googlemaps', [function() {
	var GoogleService = {};

	// Load Google Maps API and execute the callback function
	GoogleService.loadMapsApi = function(callback) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&libraries=places&' +
      		'callback=' + callback;
		document.body.appendChild(script);
    };

    return GoogleService;
}]);