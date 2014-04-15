angular.module('spotshotApp', [
  'ngRoute',
  'firebase'
  ])
.config(function ($routeProvider) {
  $routeProvider
  .when('/login', {
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl'
  })
  .when('/friends', {
    templateUrl: 'views/friends.html',
    controller: 'FriendsCtrl'
  })
  .when('/message/:id', {
    templateUrl: 'views/message.html',
    controller: 'MessageCtrl'
  })
  .when('/group/:id', {
    templateUrl: 'views/group.html',
    controller: 'GroupsCtrl'
  })
  .when('/menu/:id,:name,:group', {
    templateUrl: 'views/menu.html',
    controller: 'MenuCtrl'
  })
  .when('/map/:id,:name,:group', {
    templateUrl: 'views/map.html',
    controller: 'MapCtrl'
  })
  .when('/send/:id,:name,:group/:lat,:lng/:placeName', {
    templateUrl: 'views/send.html',
    controller: 'SendCtrl'
  })
  .otherwise({
    redirectTo: '/friends'
  });
});

var app = angular.module('spotshotApp');

if(window.plugins) {
  var pushNotification;
  pushNotification = window.plugins.pushNotification;
}

// Firebase SpotShot URI
app.constant('FIREBASE_URI', 'https://blinding-fire-9444.firebaseio.com/spotshot');
// Notification Server API Endpoint base URI
app.constant('NOTIFICATIONS_URI', 'http://www.mineogiacomo.com');

// Connection detection and event listener
app.run(function($window, $rootScope) {
  $rootScope.online = window.navigator.onLine;
  $window.addEventListener("offline", function () {
    $rootScope.$apply(function() {
      $rootScope.online = false;
    });
  }, false);
  $window.addEventListener("online", function () {
    $rootScope.$apply(function() {
      $rootScope.online = true;
    });
  }, false);
});

app.filter('orderDate', function() {
  return function(items, reverse) {
    var filtered = [];
    angular.forEach(items, function(item, key) {
      // Parse the date
      var d = item.body.time;
      var year = new Date().getFullYear();
      var month = d.split(' ')[0].split('/')[1];
      var day = d.split('/')[0];
      var hour = d.split(' ')[1].split(':')[0];
      var minute = d.split(':')[1];
      item.body.time = new Date(year, --month, day, hour, minute);
      item['key'] = key;
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a.body.time > b.body.time);
    });
    if(reverse) filtered.reverse();
    // Reconvert date
    angular.forEach(items, function(item) {
      var d = item.body.time;
      var month = d.getMonth();
      month++;
      var ds = d.today() + ' ' + d.timeNow();
      item.body.time = ds;
    });
    // Rebuild object structure
    var result = new Object();
    for(i = 0; i < filtered.length; i++) {
      result[filtered[i].key] = filtered[i];
    }
    return result;
  };
});


// Local storage utility functions for complex objects
Storage.prototype.setArray = function(key, obj) {
  return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getArray = function(key) {
  var item = this.getItem(key);
  if(item != null)
    return JSON.parse(item)
  else 
    return null;
}

// For todays date;
Date.prototype.today = function () { 
  return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1);
}
// For the time now
Date.prototype.timeNow = function () {
  return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes();
}
