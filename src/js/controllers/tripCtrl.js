app.controller("tripCtrl", function($scope, $routeParams, $firebase, $timeout, $location) {

  $scope.sortableOptions = {

    axis: "y", 
    containment: "parent", 
    cursor: "move",
    delay: 150,
    helper: "clone",
    opacity: 0.5,
    tolerance: "pointer",
    stop: function(event, ui) {

      console.log(ui.item.data("id"));
      var event = $scope.events.$getRecord(ui.item.data("id"));
      
      index = $scope.events.$indexFor(ui.item.data("id"));
      priorities = $scope.getNeighborPriorities(index);

      event.$priority = pryority.generate(priorities.before, priorities.after);

      $scope.events.$save(event);

    }

  };

  $scope.getNeighborPriorities = function(index) {

    return { before: $scope.getPriorityByKey(index - 1), after: $scope.getPriorityByKey(index + 1) };

  }

  $scope.getPriorityByKey = function(key) {

    if(key < 0) return "";
    if(key >= $scope.events.length) return "";

    return $scope.events[key].$priority;

  }

  $scope.keyAsPriority = function() {

    console.log("Running Key as priority.");
    var update_count = 0;
    for(var i = 0; i < $scope.events.length; i++) {

      var e = $scope.events.$getRecord($scope.events.$keyAt(i));
      //deletee.ranking = $scope.hex(i);
      //console.log(e.ranking);
      e.$priority = $scope.hex(i);
      update_count++;
      
      $scope.events.$save(i).then(function() {

        console.log($scope.events.length + "/" + update_count + " priorities updated.");

      });


    }

  }



  $scope.activeNameKeypress = function($event) {

    if($event.keyCode == 13) {
      
      if((!$scope.active_event.location || !$scope.active_event.formatted_address) && $scope.active_event.name) {

          $scope.active_event.location = {};
          $scope.active_event.location.formatted_address = $scope.active_event.name;
          $scope.search($event, true);
          $("#active-event-location").focus();
      }

    }

  }

  
  $scope.search = function($event, autoconfirm) {

    $scope.active_event.location_confirmed = false;
    if($event.keyCode == 13) {

      if($scope.active_event.location.formatted_address != "") {

        var address = $scope.active_event.location.formatted_address;
        $scope.geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            
            $scope.active_event.searchResults = results;

            if(results.length > 0 && (autoconfirm || results[0].formatted_address == $scope.active_event.formatted_address)) {

              $scope.selectAddress(results[0]);

            }

            $scope.$apply();

          } 
          else {
            alert("Geocode was not successful for the following reason: " + status);
          }

        });

      }
      else {

        $scope.active_event.location = {};
        $scope.active_event.searchResults = null;
        $scope.active_event.location_confirmed = false;

      }

    }

  }
  $scope.selectAddress = function(location) {

    $scope.active_event.location = location;
    $scope.active_event.location_confirmed = true;

    $scope.setMarker($scope.active_event);
    $scope.centerMap($scope.active_event);

  }

    $scope.preSelection = {};

  $scope.setActive = function(event, $event) {

    if(eventDetail != null) eventDetail.$destroy();



    if($scope.active_event) {

      var marker = $scope.markers[$scope.active_event.$id];
      if(marker) {

        marker.setIcon("http://maps.google.com/mapfiles/ms/icons/red.png");
      
      }

      if($scope.clicked_event && $scope.clicked_event.$id == event.$id) {

        $scope.clicked_event = $scope.active_event;

      }
      else $scope.clicked_event = null;

    }

    eventRef = new Firebase("https://maalls.firebaseio.com/roadtrip/events/" + $routeParams.trip_id + "/" + event.$id);

    eventDetail = $firebase(eventRef).$asObject();

    eventDetail.$bindTo($scope, "active_event").then(function() {


    
    if(!!$scope.active_event.location) {

        if($scope.clicked_event && $scope.clicked_event.$id == $scope.active_event.$id) {

          $scope.clicked_event = null;
        }

        $scope.centerMap($scope.active_event);

      }

    });

    console.log("Set active", event.$id);

    $scope.preSelection.length = event.name.length;
    
    /*if($event != undefined) {

      console.log("event");
      console.log($event.target.selectionStart, $event.target.selectionStart);
      $scope.preSelection.end = $event.target.selectionEnd;
      $scope.preSelection.start = $event.target.selectionStart;

    }*/
    
    $location.search("id", event.$id);
    //window.history.pushState(null,"", "/trip/" + $routeParams.trip_id + "/" + event.$id);

  }

  $scope.centerMap = function(event) {
    
    marker = $scope.markers[event.$id];

    if(!!marker) {

      console.log("Centering map", marker);
      marker.setIcon("http://maps.google.com/mapfiles/ms/icons/blue.png");
      //marker.labelClass = "active-label";
      $scope.map.panTo(marker.position);
      
    }

  }

  $scope.create = function() {

    return { name: '', header: '3' };

  }

  $scope.active_event = {};
  ref = new Firebase("https://maalls.firebaseio.com/roadtrip/" + $routeParams.trip_id);
  trip = $firebase(ref).$asObject();
  trip.$bindTo($scope, "trip");

  eventsRef = new Firebase("https://maalls.firebaseio.com/roadtrip/events/" + $routeParams.trip_id);
  var eventDetail = null;
  $scope.markers = {};

  $scope.events = $firebase(eventsRef).$asArray();
  $scope.events.$loaded().then(function() {

    if($routeParams.id != undefined) {

      var e = $scope.events.$getRecord($routeParams.id);
      

      if(e) $scope.setActive(e);
      else alert("Invalid event id " + $routeParams.id);

    }
    else if($scope.events.length > 0) $scope.setActive($scope.events[0]);

  });

  $scope.events.$watch(function(event) {

    var key = event.key;
    console.log(event.event, event.key);
    switch(event.event) {

      case 'child_changed':
      case 'child_added':
        var event = $scope.events.$getRecord(key);
        if(event != null) $scope.setMarker(event);
        else {

          console.log("event removed.");

        }
        break;
      case 'child_removed':
        if($scope.markers[key]) {

          $scope.markers[key].setMap(null);
          delete $scope.markers[key];

        }
        break;

    }

  });

  $scope.geocoder = new google.maps.Geocoder();




  $scope.setMarker = function(event) {

    var marker = $scope.markers[event.$id];
    if(marker) marker.setMap(null);

    if(!!event.location && event.location.geometry != undefined) {
 
      var location = event.location;
      var latLng = new google.maps.LatLng(location.geometry.location.k,location.geometry.location.B);

      var icon = $scope.active_event && $scope.active_event.$id == event.$id ? 'http://maps.google.com/mapfiles/ms/icons/blue.png': 'http://maps.google.com/mapfiles/ms/icons/red.png';

      var marker = new MarkerWithLabel({
          map: $scope.map,
          position: latLng,
          title: event.name,
          labelContent: event.name,
          labelAnchor: new google.maps.Point(20, 35),
          labelClass: "labels",
          labelVisible: true,
          //labelAnchor: latLng,
          labelInBackground: false,
          icon: icon 
      });
      marker.event = event;
      $scope.markers[event.$id] = marker;

      google.maps.event.addListener(marker, 'click', function() {
        calcRoute($scope.markers[$scope.active_event.$id], marker);
        $scope.clicked_event = marker.event;
        $scope.$apply();

      });

    }

  }

  var latlng = new google.maps.LatLng(-34.397,150.644);
  var mapOptions = {
    zoom: 8,
    center: latlng,
    scrollwheel: false
  }

  $scope.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);


  var rendererOptions = {
    draggable: false,
    preserveViewport: true,
    suppressMarkers: true
  };

  var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
  var directionsService = new google.maps.DirectionsService();

  directionsDisplay.setMap($scope.map);
  //directionsDisplay.setPanel(document.getElementById('directionsPanel'));
  google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
    computeTotalDistance(directionsDisplay.directions);
  });
  function calcRoute(source, target) {

    var request = {
      origin: source.position,
      destination: target.position,
      //waypoints:[{location: 'Bourke, NSW'}, {location: 'Broken Hill, NSW'}],
      travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      }
      else alert(status);
    });
  }

function computeTotalDistance(result) {
  var total = 0;
  var myroute = result.routes[0];
  for (var i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i].distance.value;
  }
  total = total / 1000.0;
  document.getElementById('total').innerHTML = total + ' km';
}

  $scope.eventPreSelectionStart = null;

  
  $scope.event = $scope.create();

  $scope.add = function(e) {

    if(e.keyCode == 13 && $scope.trip) {

      $scope.event.$priority = $scope.events.length;
      event = $scope.events.$add($scope.event);

      $scope.event = $scope.create();

    } 

  }

  $scope.update = function(key) {

    $scope.events.$save(key);

  }

  $scope.focusKey = function(key, callback) {

    console.log("Calling focus key for " + key);
    var e = $scope.events.$getRecord($scope.events.$keyAt(key));
    $timeout(function() { 

      $("#event-" + e.$id).focus();
      if(callback != undefined) callback();

    }, 0, false);
      //$scope.setActive(e);

  }




  $scope.keyLock = {};

  $scope.keyup = function($event, key, ev) {


    console.log($event.target.selectionStart, $event.target.selectionEnd );

    if(ev.name.match(/::$/)) {

      $scope.active_event.header = 2;

    }
    else if(ev.name.match(/:$/)) {

      $scope.active_event.header = 1;

    }
    else $scope.active_event.header = 3;

    if($event.keyCode == 8) {

      if($scope.preSelection.length == 0) {

        if($scope.keyLock[8]) {

          console.log("lock");
          return;

        }
        console.log("Removing key " + key);
        eventDetail.$destroy();
        $scope.keyLock[8] = true;
        //eventDetail.$distroy();
        console.log("Distroying active event");
        $scope.events.$remove(ev).then(function(ref) {

          
          
          console.log(ref.name(), "Key removed for " + key);

          $scope.focusKey(key > 0 ? key - 1 : 0, function() { 

            $timeout(function() {$scope.keyLock[8] = false; console.log("Unlocking remove key"); }, 100);
            

          });

        }, function(error) {

          alert("error");
          console.log("error", error);

        });
        

      }
      
    }

    $scope.preSelection.length = ev.name;
    //$scope.eventPreSelectionEnd = $event.target.selectionEnd;

    if($event.keyCode == 40) {

      $event.preventDefault();
      $event.stopPropagation();
      $scope.focusKey(key + 1);
      
    }
    if($event.keyCode == 38) {

      $event.stopPropagation();
      $event.preventDefault();
      $scope.focusKey(key - 1);

    }

    if($event.keyCode == 13) {

      if($scope.keyLock[13]) return;
      $scope.keyLock[13] = true;
      var event = $scope.create();

      console.log($event.target.selectionStart, $event.target.selectionEnd );
      if($event.target.selectionStart == 0 && $event.target.selectionEnd == 0 && ev.name != "") {

        before_key = key - 1;
 
        
      }
      else {

        before_key = key;

      }


      event.$priority = pryority.generate($scope.getPriorityByKey(before_key), $scope.getPriorityByKey(before_key+1));
      
      $scope.events.$add(event).then(
        function(ref) {

          
          $timeout(function() { $("#event-" + ref.name()).focus(); $scope.keyLock[13] = false; }, 0, false);

        }
      );
        

    }

    

  }

});