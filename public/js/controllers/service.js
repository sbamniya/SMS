
socialApp.controller('service',['$scope', '$http','$location',function ($scope, $http,$location) {
	$scope.service_name={};
	$scope.addService = function(){
	   $http.post('/addService',{ service_name : $scope.service_name.name, description:$scope.service_name.description }).success(function(res){
           if (res.hasOwnProperty('success')) {
				$location.path('/service-all')
			};
		});
	}
}]);
socialApp.controller('serviceList', ['$scope','$http','$routeParams','$route','$timeout', function($scope, $http, $routeParams,$route, $timeout){
	
	$scope.service_name={};
	$scope.services = [];
	$http.post('/requestedServicesListToAdmin').success(function(response){
		if (response.hasOwnProperty('success')) {
			$scope.services = response.data;
		}
	});
	$scope.updateData = {};
	$scope.setId = function(id){
		$scope.updateData.id = id;
	}
	$scope.UpdateStatus = function(req_id, status){
		
		var returnVal = confirm('Are You Sure ?');
		if (!returnVal) {
			return;
		}

		$http.post('/updateServiceRequestStatus', {id: req_id, status:status, comment: $scope.updateData.comment}).success(function(res){
			if (res.hasOwnProperty('success')) {
				$timeout(function(){
					$route.reload();
				}, 200);
				
			}
		});
	}
}]);

socialApp.controller('serviceAll', ['$scope', '$http','$route', function($scope, $http, $route){
	$scope.services = [];
	$http.post('/ListServices').success(function(response){
		if (response.hasOwnProperty('success')) {
			$scope.services = response.data;
		}
	});

	$scope.deleteService = function(service_id){
		var returnVal = confirm('Are You Sure ?');
		if(!returnVal){
			return;
		}

		$http.post('/deleteService', {service_id: service_id}).success(function(response){
			if (response.hasOwnProperty('success')) {
				$route.reload();
			}
		});
	}
}]);
