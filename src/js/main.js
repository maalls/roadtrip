var app = angular.module('trip', ["ngRoute","firebase", 'ui.sortable', 'ui.map']);

app.controller('tripsCtrl', function ($scope, $firebase) {
  
  $scope.createTrip = function() {

    $scope.trip = { name: '' };

  }

  var ref = new Firebase("https://maalls.firebaseio.com/roadtrip");
  $scope.trips = $firebase(ref).$asArray();
  console.log($scope.trips);
  $scope.createTrip();

  $scope.updateTrip = function(key) {

    $scope.trips.$save(key);

  }

  $scope.removeTrip = function(key) {


    if(confirm("Sure ?")) $scope.trips.$remove(key);

  }
  $scope.addTrip = function(e) {

    if(e.keyCode == 13 && $scope.trip) {

      $scope.trips.$add($scope.trip);
      $scope.createTrip();

    }

  };

});

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
   .when('/', {
    templateUrl: 'trips.html',
    controller: 'tripsCtrl'
    
  })
  .when('/trip/:trip_id', {
    templateUrl: 'trip.html',
    controller: 'tripCtrl',
    reloadOnSearch:false
  });

  // configure html5 to get links working on jsfiddle
  $locationProvider.html5Mode(true);
});
