app.controller('SendCtrl', ['$scope', '$routeParams', '$window', '$timeout', 'googlemaps', 'localization', '$http', 'messageService', 'facebook',
	function ($scope, $routeParams, $window, $timeout, googlemaps, localization, $http, messageService, facebook) {
		facebook.redirectCheck();
		localization.setPageLocale("send", function(data) { $scope.locale = data; });

		$window.getLocation = function() {
			document.getElementById("refresh").className = '';
			$('#send, #sendFb, #picture-add').prop('disabled', true);
			loc.className = "spinner";
			var lat = $routeParams.lat;
			var lng = $routeParams.lng;
			var myLocation = new google.maps.LatLng(lat, lng);
			var locationAddress;
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({'latLng': myLocation}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
	        		locationAddress = results[0].formatted_address;
	        		var x = lat;
					var y = lng;
					var zoom = 18;
					var url = '';
					if($scope.placeName != '') {
						url = 'http://maps.google.com/?q=' + $scope.placeName + ',' + locationAddress + '&ll=' + x + ',' + y + '&z=' + zoom;
					} else {
						url = 'http://maps.google.com/?q=' + x + ',' + y + '&ll=' + x + ',' + y + '&z=' + zoom;
					}
					var location = {
						address: locationAddress,
						url: url
					}
					$('#send, #sendFb, #picture-add').prop('disabled', false);
					loc.className = '';
					$scope.location = location;
					$scope.$apply();
				} else {
					document.getElementById("refresh").className = 'refresh';
					loc.className = '';
					$scope.location = { address: $scope.locale.GeocoderError + status };
					$scope.$apply();
			    }
			});
		}
		$window.getCurrentLocation = function() {
			$('#send, #sendFb, #picture-add').prop('disabled', true);
			if (navigator.geolocation)
			{
				var options = {
					enableHighAccuracy: true,
					timeout: 15000,
					maximumAge: 0
				};
				$scope.location = { address: '' };
				$('#refresh').attr('class', '');
				loc.className = "spinner";
				navigator.geolocation.getCurrentPosition( success, error, options);
			} else { 
				$scope.location = { address: "Geolocation is not supported." }; 
			}
		}
		$window.error = function(e) {
			loc.className = '';
			$('#refresh').attr('class', 'refresh');
			$scope.location = { address: "Error code: " + e.code + ' message: ' + e.message };
			$scope.$apply();
		}
		$window.success = function(position) {
			var  lat  = position.coords.latitude;
			var  lng =  position.coords.longitude;

			var myLocation = new google.maps.LatLng(lat, lng);
			var locationAddress;
			var geocoder = new google.maps.Geocoder();

			geocoder.geocode({'latLng': myLocation}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
	        		locationAddress = results[0].formatted_address;
	        		var x = lat;
					var y = lng;
					var zoom = 18;
					var location = {
						address: locationAddress,
						url: 'http://maps.google.com/maps?q=' + x + ',' + y + '&ll=' + x + ',' + y +
							 '&z=' + zoom
					}
					$('#send, #sendFb, #picture-add').prop('disabled', false);
					loc.className = '';
					$scope.location = location;
					$scope.$apply();
				} else {
					loc.className = '';
					$scope.location = { address: $scope.locale.GeocoderError + status };
					$scope.$apply();
			  }
			  $('#refresh').attr('class', 'refresh');
			});
		}
	
		// Variables initialization
		var spotshotPageId = "1418855031715838";
		$scope.message = "";
		$scope.addSend = false;

		// Route parameters variables
		$scope.id = $routeParams.id;
		$scope.name = $routeParams.name;
		$scope.group = $routeParams.group;
		var loc = document.getElementById('location-spinner');
		$('#send, #sendFb, #picture-add').prop('disabled', true);
		if($routeParams.placeName != 'default') {
			$scope.placeName = $routeParams.placeName;
		} else {
			$scope.placeName = '';
		}
		var isTrueSet = ($routeParams.group === 'true');
		$scope.group = isTrueSet;

		// Interactive elements initialization (jQuery)
		$('.group-tab').slideUp();
		$('.spinner-upload').hide();
		$('.frame').hide();

		// Set send buttons
		// Check for group send or single send
		if ($scope.group) {
			var group = window.localStorage.getArray("group" + $scope.id);
			console.log(group);
			// Check for Facebook send or Firebase send for each recipient
			id = "";
			for (var i = 0; i < group.friends.length && !$scope.appSend; i++) {
				chooseSendMode(group.friends[i].id, 0, function(result, index) {
					if(result) {
						$scope.appSend = true;
					}
				});
			}
		}
		else {
			// Single recipient, choose method
			chooseSendMode($routeParams.id, 0, function(result, index) {
				if(result) {
					$scope.appSend = true;
				}
			});
		}

		// Check if location has been passed
		if($routeParams.lat == 0 && $routeParams.lng == 0) {
			// Not passed, get current location
			$scope.here = true;
			// Check if Google API's have already been loaded 
			if (typeof google === 'object' && typeof google.maps === 'object')  {
				getCurrentLocation();
			} else {
				googlemaps.loadMapsApi('getCurrentLocation');
			}
		} else {
			// Passed, get that location
			$scope.here = false;
			// Check if Google API's have already been loaded 
			if (typeof google === 'object' && typeof google.maps === 'object')  {
				getLocation();
			} else {
				googlemaps.loadMapsApi('getLocation');
			}
		}

		// Get the group item
		if ($scope.group) {
			var group = window.localStorage.getArray("group" + $scope.id);
			$scope.friends = group.friends;
		}

		// Toggle the recipients tab (only if the recipient is a group)
		$scope.toggleRecipients = function() {
			if ($scope.group) {
				$('.group-tab').stop();
				$('.group-tab').slideToggle(300);
			}
		}

		// Toggle the picture tab (only if the picture has already been uploaded)
		$scope.togglePicture = function() {
			if(!(typeof $scope.picture === 'undefined')) {
				$('.frame').stop();
				$('.frame').slideToggle(300);
				$("html, body").animate({ scrollTop: $('.frame').offset().top }, 300);
			}
		}

		// Call the correct location detection function according to parameters passed
		$scope.refreshLocation = function() {
			// Check if location has been passed
			if($routeParams.lat == 0 && $routeParams.lng == 0) {
				// Not passed
				getCurrentLocation();
			} else {
				// Location passed
				getLocation();
			}
		}

		// Send the message via Facebook
		$scope.sendFbMessage = function() {
			$('#send, #sendFb, #picture-add').prop('disabled', true);
			$('#sendFb > span').text($scope.locale.ButtonSending);
			var beginningMessage = '';
			if ($scope.here) {
				beginningMessage = $scope.locale.MessageHere;
			} else {
				beginningMessage = $scope.locale.MessageThere;
			}
			// Map url shortening
			var url = {"longUrl": $scope.location.url};
			$http.post("https://www.googleapis.com/urlshortener/v1/url", url)
					 .success(
				function(data) {
					var shortUrl = data.id;
					var id = "";
					if ($scope.group) {
						var group = window.localStorage.getArray("group" + $scope.id);
						// Check for Facebook send or Firebase send for each recipient
						id = "";
						for (var i = 0; i < group.friends.length; i++) {
							id += group.friends[index].id + ',';
						}
						id = id.substring(0, id.length - 1);
						facebookPost(id, shortUrl, spotshotPageId, beginningMessage);
					} else {
						facebookPost($scope.id, shortUrl, spotshotPageId, beginningMessage);
					}
			});
		}

		// Send the message via App
		$scope.sendAppMessage = function() {
			$('#send, #sendFb, #picture-add').prop('disabled', true);
			$('#send > span').text($scope.locale.ButtonSending);
			var beginningMessage = '';
			if ($scope.here) {
				beginningMessage = $scope.locale.MessageHere;
			} else {
				beginningMessage = $scope.locale.MessageThere;
			}
			// Map url shortening
			var url = {"longUrl": $scope.location.url};
			$http.post("https://www.googleapis.com/urlshortener/v1/url", url)
					 .success(
				function(data) {
					var shortUrl = data.id;
					var id = "";

					if ($scope.group) {
						var group = window.localStorage.getArray("group" + $scope.id);
						// Check for Facebook send or Firebase send for each recipient
						id = "";
						for (var i = 0; i < group.friends.length; i++) {
							chooseSendMode(group.friends[i].id, i, function(result, index) {
								if(result) {
									$scope.appSend = true;
									// If the user has the app, send a single message to him
									firebaseSend(group.friends[index].id, shortUrl, beginningMessage, false);
								}
								else {
									// If the user doesn't have the app, add him on the Facebook list
									id += group.friends[index].id + ',';
								}
								// When all recipients have been scanned, send the Facebook
								// message if there is at least 1 recipient
								if (index == (group.friends.length - 1) && id.length != 0) {
									id = id.substring(0, id.length - 1);
									facebookPost(id, shortUrl, spotshotPageId, beginningMessage);
								}
								else {
									// Firebase button interaction
									firebaseSendInteraction();
								}
							});
						}
					}
					else {
						// Single recipient, choose method
						chooseSendMode($routeParams.id, i, function(result, index) {
							if(result) {
								firebaseSend($routeParams.id, shortUrl, beginningMessage, true);
							} else {
								facebookPost($routeParams.id, shortUrl, spotshotPageId, beginningMessage);
							}
						});
					}
				}
			);
		}

		// Choose the method to send the message
		// based on the user having the app
		// Return the result as a boolean with a callback
		function chooseSendMode(id, index, callback) {
			var users = messageService.getUsers();
			users.$on('loaded', function() {
				if(!(typeof users[id] === 'undefined')) {
					// Firebase send
					callback(true, index);
				}
				else {
					// Facebook send
					callback(false, index);
				}
			});
		}

		// Facebook post
		function facebookPost(id, shortUrl, spotshotPageId, beginningMessage) {
			// Set the privacy according to the switch on the page
			var privacy = {
			  "value": "CUSTOM",
			  "allow": id,
			  "deny": ""
			};
			if($scope.publicPost) {
				privacy = {
					"value": "ALL_FRIENDS"
				}
			}
			// Post on Facebook Wall
			if (typeof $scope.picture === 'undefined') {
				// A picture has not been uploaded, normal post
				console.log("Normal Post");
			  FB.api(
					"me/feed",
					"POST",
					{
						"message": beginningMessage + $scope.placeName + ' - ' + $scope.location.address +
								   	   " \n " + $scope.message +
								   		 " \n\n " + $scope.locale.MapMessage + ": " + shortUrl,
				    "place": spotshotPageId,
				    "tags": id,
				    "privacy": privacy
					},
					function(response) {
						facebookPostCallback(response);
					}
				);
			}
			else {
				// A picture has been uploaded, link post
				console.log("Post with picture included");
				FB.api(
					"me/feed",
					"POST",
					{
						"message": beginningMessage + $scope.placeName + ' - ' + $scope.location.address +
										   " \n " + $scope.message +
										   " \n\n " + $scope.locale.MapMessage + ": " + shortUrl,
						"link": $scope.picture,
						"name": "Foto",
						"picture": $scope.picture,
	          "place": spotshotPageId,
	          "tags": id,
	          "privacy": privacy
					},
					function(response) {
						facebookPostCallback(response);
					}
				);
			}
		}

		// Facebook post callback routine
		// Checks for errors and re-enables the button after a timeout
		function facebookPostCallback(response) {
			if(response.error) {
				// Error
				console.log(response.error);
				$('#sendFb > span').text($scope.locale.ButtonError);
				$('#sendFb').addClass('error');
				$timeout(function() {
					$('#send, #sendFb, #picture-add').prop('disabled', false);
					$('#sendFb').removeClass('error');
					$('#sendFb > span').text($scope.locale.ButtonFB);
				}, 3000);
			} else {
				// Success
				$('#sendFb > span').text($scope.locale.ButtonSent);
				$('#sendFb').addClass("done");
				// Reset button after 3 seconds
				$timeout(function() {
					$('#send, #sendFb, #picture-add').prop('disabled', false);
					$('#sendFb').removeClass('done');
					$('#sendFb > span').text($scope.locale.ButtonFB);
				}, 3000);
			}
		}

		// Firebase message send
		function firebaseSend(id, map, msg, animation) {
			var userId = window.localStorage.getItem("userId");
			var users = messageService.getUsers();
			users.$on('loaded', function() {
				// Check if the user has the app
				if(!(typeof users[id] === 'undefined')) {
					// Load info from Facebook and put it in the chat
					FB.api(
						'me?fields=name,picture',
						'GET',
						function(response) {
							if(response.error) {
								// Error
							} else {
								// Success
								var name = response.name;
								var picture = response.picture.data.url;
								// Message Object
								var message = messageService.newMessage(
									userId,
									id,
									msg,
									$scope.message,
									map,
									$scope.location.address + ' ' + $scope.placeName,
									$scope.picture
								);
								console.log("Firebase send");
								// Push the message in the chat
								messageService.addMessage(userId, id, name, picture, message);
								// Button interaction
								// Success
								if(animation) {
									firebaseSendInteraction();
								}
								// Delete old messages
								messageService.cleanChat(userId, id);
							}
						}
					);
				}
			});
		}

		function firebaseSendInteraction() {
			$('#send > span').text($scope.locale.ButtonSent);
			$('#send').addClass("done");
			// Reset button after 3 seconds
			$timeout(function() {
				$('#send, #sendFb, #picture-add').prop('disabled', false);
				if (typeof $scope.picture === 'undefined') {
					$('#send').attr('class', "topcoat-button--large--cta send");
				} else {
					$('#send').attr('class', "topcoat-button--large--cta send picture");
				}
				$('#send > span').text($scope.locale.Button);
			}, 3000);
		}

		// Picture uploading on Facebook
		$scope.takePicture = function() {
			if(navigator.camera) {
				pictureSource = navigator.camera.PictureSourceType;
	      destinationType = navigator.camera.DestinationType;
				// Take a picture with the camera or select it from gallery
				var cameraOptions = { 
					quality: 20,
    			destinationType: Camera.DestinationType.DATA_URL,
    			popoverOptions: CameraPopoverOptions,
    			allowEdit : true,
    			saveToPhotoAlbum: false
				};
				navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
			}
			else {
				console.log("Camera not supported!");
			}
		}

		function cameraSuccess(imageData) {
			/*
			// Success
      // Load picture in canvas
      var context = document.getElementById('picture').getContext("2d");
      var img = new Image();
      img.onload = function() {
        context.drawImage(img, 0, 0);
      }
      img.src = imageData;

      // Convert photo to Base64
      var canvas = document.getElementById('picture');
      var c = imageData.toDataURL('image/jpeg');
      var encodedImage = c.substring(c.indexOf(',')+1,c.length);*/
      console.log(imageData);
      var decodedImage = Base64Binary.decode(imageData);
      console.log(decodedImage);
			if ( XMLHttpRequest.prototype.sendAsBinary === undefined ) {
			  XMLHttpRequest.prototype.sendAsBinary = function(string) {
			    var bytes = Array.prototype.map.call(string, function(c) {
			      return c.charCodeAt(0) & 0xff;
			    });
			    this.send(new Uint8Array(bytes).buffer);
			  };
			}

			uploadRoutineStart();

			// Check if the SpotShot album already exists
			FB.api(
				"me/albums",
				"GET",
				function(response) {
					if (response.error) {
						// Error getting albums from Facebook
						console.log(response.error);
					}
					else {
						// Scan albums on Facebook
						var found = false;
						var id = 0;
						for (var i = 0; i < response.data.length && !found; i++) {
							if (response.data[i].name == "SpotShot") {
								found = true;
								id = response.data[i].id;
							}
						}
						// Check if the album has been found
						if (found == false) {
							// Create the album
							privacy = {
								"value": "SELF"
							}
							FB.api(
								"me/albums",
								"POST",
								{
									"name": "SpotShot",
									"message": "",
									"privacy": privacy
								},
								function(response) {
									if(response.error) {
										// Error Creating the album

									} else {
										// Album created, add the image to it
										AddImageToFacebookAlbum(FB.getAuthResponse()['accessToken'],
											'image.jpg',
											'image/jpg', 
											decodedImage,
											'',
											response.id,
											function(pictureData) {
												manageUploadedPicture(pictureData);
											}
										);
									}
							});
						}
						else {
							// Add the image to the already existing album
							AddImageToFacebookAlbum(FB.getAuthResponse()['accessToken'],
								'image.jpg',
								'image/jpg', 
								decodedImage,
								'',
								id,
								function(pictureData) {
									manageUploadedPicture(pictureData);
								}
							);
						}
					}
				});
		}

		function cameraError(message) {
			console.log('Camera failed because: ' + message);
		}

		// Process the uploaded image data, finding it's url and returing it as callback
		function manageUploadedPicture(pictureData, success) {
			if (pictureData !== null) {
				if(pictureData.error) {
					// Upload Error
					console.log(pictureData.error);
					uploadRoutineEnd(false);
				} else {
					var picture = JSON.parse(pictureData);
					FB.api(
						'/' + picture.id,
						"GET",
						function(response) {
							if(response.error) {
								// Error
								console.log(response.error);
								uploadRoutineEnd(false);
							}
							else {
								// Success
								console.log("Image uploaded and id fetched");
								uploadRoutineEnd(true);
								$scope.picture = response.source;
								$scope.$apply();
							}
						}
					);
				}
			} 
		}

		// Uploading routine START
		function uploadRoutineStart() {
			var upBtn = document.getElementById('upload');
			$('.spinner-upload').fadeIn(300);
			$('#send, #sendFb, #picture-add').prop('disabled', true);
			upBtn.setAttribute("disabled", false);
			upBtn.className += " uploading";
			$(upBtn).find('> span').text($scope.locale.PictureUploading);
		}

		// Uploading routine END
		function uploadRoutineEnd(result) {
			var upBtn = document.getElementById('upload');
			$('#send, #sendFb, #picture-add').prop('disabled', false);
			$('.spinner-upload').fadeOut(300);
			if(result) {
				upBtn.className = "topcoat-button--large picture-btn done";
				$(upBtn).find('> span').text($scope.locale.PictureUploaded);
			} else {
				upBtn.className = "topcoat-button--large picture-btn error";
				$(upBtn).find('> span').text($scope.locale.PictureError);
			}
			// Reset button after 3 seconds
			$timeout(function() {
				upBtn.removeAttribute("disabled");
				upBtn.className = "topcoat-button--large picture-btn";
				$(upBtn).find('> span').text($scope.locale.TakePicture);
			}, 3000);
		}

		// Add the selected image to the selected album on Facebook
		function AddImageToFacebookAlbum( authToken, filename, mimeType, imageData, message, albumId, callback )
		{
		    // this is the multipart/form-data boundary we'll use
		    var boundary = '----ThisIsTheBoundary1234567890';
		    
		    // let's encode our image file, which is contained in the var
		    var formData = '--' + boundary + '\r\n'
		    formData += 'Content-Disposition: form-data; name="source"; filename="' + filename + '"\r\n';
		    formData += 'Content-Type: ' + mimeType + '\r\n\r\n';
		    for ( var i = 0; i < imageData.length; ++i )
		    {
		      formData += String.fromCharCode( imageData[ i ] & 0xff );
		    }
		    formData += '\r\n';
		    formData += '--' + boundary + '\r\n';
		    formData += 'Content-Disposition: form-data; name="message"\r\n\r\n';
		    formData += message + '\r\n'
		    formData += '--' + boundary + '--\r\n';
		    
		    var xhr = new XMLHttpRequest();
		    xhr.open( 'POST', 'https://graph.facebook.com/' + albumId + '/photos?access_token=' + authToken, true );
		    xhr.onload = xhr.onerror = function() {
		      callback(xhr.responseText);
		    };
		    xhr.setRequestHeader( "Content-Type", "multipart/form-data; boundary=" + boundary );
		    xhr.sendAsBinary( formData );
		}

		var Base64Binary = {
			_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

			/* will return a  Uint8Array type */
			decodeArrayBuffer: function(input) {
				var bytes = (input.length/4) * 3;
				var ab = new ArrayBufferView(bytes);
				this.decode(input, ab);

				return ab;
			},

			decode: function(input, arrayBuffer) {
				//get last chars to see if are valid
				var lkey1 = this._keyStr.indexOf(input.charAt(input.length-1));		 
				var lkey2 = this._keyStr.indexOf(input.charAt(input.length-2));		 

				var bytes = (input.length/4) * 3;
				if (lkey1 == 64) bytes--; //padding chars, so skip
				if (lkey2 == 64) bytes--; //padding chars, so skip

				var uarray;
				var chr1, chr2, chr3;
				var enc1, enc2, enc3, enc4;
				var i = 0;
				var j = 0;

				if (arrayBuffer)
					uarray = new Uint8Array(arrayBuffer);
				else
					uarray = new Uint8Array(bytes);

				input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

				for (i=0; i<bytes; i+=3) {	
					//get the 3 octects in 4 ascii chars
					enc1 = this._keyStr.indexOf(input.charAt(j++));
					enc2 = this._keyStr.indexOf(input.charAt(j++));
					enc3 = this._keyStr.indexOf(input.charAt(j++));
					enc4 = this._keyStr.indexOf(input.charAt(j++));

					chr1 = (enc1 << 2) | (enc2 >> 4);
					chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
					chr3 = ((enc3 & 3) << 6) | enc4;

					uarray[i] = chr1;			
					if (enc3 != 64) uarray[i+1] = chr2;
					if (enc4 != 64) uarray[i+2] = chr3;
				}

				return uarray;	
			}
		}
}])