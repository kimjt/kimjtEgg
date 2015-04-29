document.addEventListener("deviceready", onDeviceReady, false);

var compassHelpter;

function onDeviceReady() {
	navigator.splashscreen.hide();
	compassHelpter = new CompassHelper();
	compassHelpter.run();
}

function CompassHelper() {
}

CompassHelper.prototype = {
	watchID : null,
    
	run: function() {
		var that = this,
		refreshButton = document.getElementById("refreshButton"),
		buttonWatch = document.getElementById("map-navigate-home");
		
		buttonWatch.addEventListener("click", 
									 function() {
										 that._handleWatch.apply(that, arguments);
									 }, 
									 false);
		
		refreshButton.addEventListener("click", 
									   function() {
										   that._handleRefresh.apply(that, arguments)
									   }, 
									   false);
	},
    
	_handleRefresh: function() {
		var that = this;
		navigator.compass.getCurrentHeading(function() { 
			that._rotateCompassImage.apply(that, arguments);
			that._displayHeading.apply(that, arguments)
		},
											function() {
												that._onCompassWatchError.apply(that, arguments)
											});
	},
    
	_handleWatch: function() {
		var that = this,
		button = document.getElementById("map-navigate-home");

		if (that.watchID !== null) {
			navigator.compass.clearWatch(that.watchID);
			that.watchID = null;
			button.innerHTML = "Start Compass";
			that._clearCurrentNotification();
		}
		else {
			var options = { frequency: 1000 };
			
			that._clearCurrentNotification();
			that._writeNotification("Waiting for compass information...");
			button.innerHTML = "Stop Compass";
            
			that.watchID = navigator.compass.watchHeading(function() { 
				that._displayHeading.apply(that, arguments)
				that._rotateCompassImage.apply(that, arguments);
			}, 
														  function() {
															  that._onCompassWatchError.apply(that, arguments)
														  }, 
														  options);
		}
	},
    
	_displayHeading: function(heading) {
		var that = this,
		magneticHeading = heading.magneticHeading,
		timestamp = heading.timestamp;
        
		var informationMessage = 'Magnetic field: ' + magneticHeading + '<br />' +
								 'Timestamp: ' + timestamp + '<br />' 
        
		that._clearCurrentNotification();
		that._writeNotification(informationMessage);
	},
    
	_onCompassWatchError: function(error) {
		var that = this,
		errorMessage,
		button = document.getElementById("map-navigate-home");
		switch (error.code) {
			case 20:
				errorMessage = "Compass not supported";
				break;
			case 0:
				errorMessage = "Compass internal error";
				break;
			default:
				errorMessage = "Compass error";
		}
        
		button.innerHTML = "Start Compass";
		that.watchID = null;
		that._clearCurrentNotification();
		that._writeNotification(errorMessage);
	},
    
	_writeNotification: function(text) {
		var result = document.getElementById("result");
		result.innerHTML = text;
	},
    
	_clearCurrentNotification: function() {
		var result = document.getElementById("result");
		result.textContent = "";
	}, 
      
	_rotateCompassImage : function(heading) {
		var compassDiv = document.getElementById("map-canvas"),
		magneticHeading = magneticHeading = 360 - heading.magneticHeading;
        
		var rotation = "rotate(" + magneticHeading + "deg)";
              
		compassDiv.style.webkitTransform = rotation;
	}
}