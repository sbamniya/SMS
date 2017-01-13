
socialApp.controller('blockLanding',['$scope', '$http', '$location', '$compile','Upload', '$timeout','$routeParams', function ($scope, $http,$location, $compile, Upload, $timeout, $routeParams) {
		var societySlug = $routeParams.societySlug;
		var blockSlug = $routeParams.blockSlug;
		$scope.societyDetails = {};

		$http.post('/getSlug', {slug: societySlug, blockSlug: blockSlug}).success(function(response){
			if(response.success){
				$scope.societyDetails = response.success;
				
				SetMarker($scope.societyDetails.lattitute, $scope.societyDetails.longtitute, $scope.societyDetails.name, $scope.societyDetails.address);
			}else{
				$location.path('/404');
			}
			
		});

		/*Load Google Map*/
		var map;
	    var marker;
		 /*Set marker possition*/
	    function SetMarker(latitude, longitude, title, address) {

			var myLatlng = new google.maps.LatLng(latitude, longitude);

			var mapOptions = {
	            center: myLatlng,
	            zoom: 10,
	            mapTypeId: google.maps.MapTypeId.ROADMAP
	        };

	        map = new google.maps.Map(document.getElementById("society-map"), mapOptions);

	        marker = new google.maps.Marker({
	            position: myLatlng,
	            map: map,
	            title: title
	        });
	        var contentString = '<div id="content"><div id="siteNotice"></div><h1 id="firstHeading" class="firstHeading">'+title+'</h1><div id="bodyContent"><p><b>Address: </b>'+address+'<p></div></div>';

	        var infowindow = new google.maps.InfoWindow({
	          content: contentString
	        });
	        marker.addListener('mouseover', function() {
		    	infowindow.open(map, this);
			});

			// assuming you also want to hide the infowindow when user mouses-out
			marker.addListener('mouseout', function() {
			    infowindow.close();
			});
	 	}
}]);