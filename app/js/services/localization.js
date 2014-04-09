app.service('localization', ['$http', 
	function($http) {
		var localizationService = {};

		// Set strings on the passed page
		localizationService.setPageLocale = function(pageName, callback) {
			// Set locale based on system language (or browser)
			var lang;
			if (navigator
				&& navigator.userAgent
				&& (lang = navigator.userAgent
					.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
						lang = lang[1];
				}	
			if (!lang && navigator) {
				if (navigator.language) {
					lang = navigator.language;
				} else if (navigator.browserLanguage) {
					lang = navigator.browserLanguage;
				} else if (navigator.systemLanguage) {
					lang = navigator.systemLanguage;
				} else if (navigator.userLanguage) {
					lang = navigator.userLanguage;
				} else {
					lang = 'en/en';
				}
				lang = lang.substr(0, 2);
			}
			var langPath = "lang/";
			// Load selected locale into object array
			$http.get(langPath + lang + '.json').success(function(data) {
		    callback(data[pageName]);
			});
		}

		return localizationService;
	}
]);