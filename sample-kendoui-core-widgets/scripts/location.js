(function (global) {
    var map,
        geocoder,
        LocationViewModel,
        poly,
        app = global.app = global.app || {};

    LocationViewModel = kendo.data.ObservableObject.extend({
        _lastMarker: null,
        _isLoading: false,

        address: "",
        isGoogleMapsInitialized: false,
        hideSearch: false,
        
        vecter: function(){
            var ctaLayer = new google.maps.KmlLayer('http://javacool.net/m/track.kmz');
            ctaLayer.setMap(map);
        },
        
        onNavigateHome: function () {
            var that = this,
                position;

            that._isLoading = true;
            that.toggleLoading();

            navigator.geolocation.watchPosition(
                function (position) {
                    position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    map.panTo(position);
                    that._putMarker(position);
                    that._isLoading = false;
                    that.toggleLoading();
                    var path = poly.getPath();
                    path.push(position);
                },
                function (error) {
                    //default map coordinates
                    //position = new google.maps.LatLng(36.383647, 127.370214);
                    //map.panTo(position);

                    //that._isLoading = false;
                    //that.toggleLoading();

                    //navigator.notification.alert("위치 정보를 확인할수 없습니다.",function () { }, "에러", 'OK');
                },
                {
                    enableHighAccuracy: true, 
                    maximumAge        : 30000, 
                    timeout           : 27000
                }
            );
        },

        onSearchAddress: function () {
            var that = this;

            geocoder.geocode(
                {
                    'address': that.get("address")
                },
                function (results, status) {
                    if (status !== google.maps.GeocoderStatus.OK) {
                        navigator.notification.alert("찾을 수 없는 주소 입니다.",
                            function () { }, "Search failed", 'OK');

                        return;
                    }

                    map.panTo(results[0].geometry.location);
                    that._putMarker(results[0].geometry.location);
                });
        },

        toggleLoading: function () {
            if (this._isLoading) {
                kendo.mobile.application.showLoading();
            } else {
                kendo.mobile.application.hideLoading();
            }
        },
        
        polyLine: function (position) {
            var flightPlanCoordinates = [
                new google.maps.LatLng(lat, lon),
                position
            ];
            var flightPath = new google.maps.Polyline({
                    path: flightPlanCoordinates,
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                    });
             flightPath.setMap(map);
        },

        _putMarker: function (position) {
            var that = this;

            if (that._lastMarker !== null && that._lastMarker !== undefined) {
                that._lastMarker.setMap(null);
            }

            that._lastMarker = new google.maps.Marker({
                map: map,
                position: position
            });
        },       
        
    });

    app.locationService = {
        initLocation: function () {
            var mapOptions,
            	streetView;

            if (typeof google === "undefined") {
                return;
            }

            app.locationService.viewModel.set("isGoogleMapsInitialized", true);

            mapOptions = {
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.LEFT_BOTTOM
                },

                mapTypeControl: false,
                streetViewControl: false
            };

            map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
             var polyOptions = {
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
              };
              poly = new google.maps.Polyline(polyOptions);
              poly.setMap(map);
            geocoder = new google.maps.Geocoder();
            app.locationService.viewModel.onNavigateHome.apply(app.locationService.viewModel, []);
            
            streetView = map.getStreetView();

			google.maps.event.addListener(streetView, 'visible_changed', function() {

			    if (streetView.getVisible()) {                  
					app.locationService.viewModel.set("hideSearch", true);
			    } else {
					app.locationService.viewModel.set("hideSearch", false);
  			  }
 
			});
        },

        show: function () {
            if (!app.locationService.viewModel.get("isGoogleMapsInitialized")) {
                return;
            }

            //resize the map in case the orientation has been changed while showing other tab
            google.maps.event.trigger(map, "resize");
        },

        hide: function () {
            //hide loading mask if user changed the tab as it is only relevant to location tab
            kendo.mobile.application.hideLoading();
        },

        viewModel: new LocationViewModel()
    };
}
)(window);