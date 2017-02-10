
socialApp.controller('service',['$scope', '$http','$location',function ($scope, $http,$location) {
	$scope.service_name={};
	$scope.addService = function(){
		$scope.$emit('LOAD');
	   $http.post('/addService',{ service_name : $scope.service_name.name, description:$scope.service_name.description }).success(function(res){
           	$scope.$emit('UNLOAD');
           	if (res.hasOwnProperty('success')) {
				$location.path('/service-all')
			};
		});
	}
}]);
socialApp.controller('serviceList', ['$scope','$http','$routeParams','$route','$timeout','DTOptionsBuilder', function($scope, $http, $routeParams,$route, $timeout,DTOptionsBuilder){
	$scope.$emit('LOAD');
	$scope.dtOptions = DTOptionsBuilder.newOptions() 
                        .withOption('order', [1, 'desc'])
                        .withButtons([
                            'print',
                            'excel',
                            'csv',
                            'pdf'
                        ]);
	$scope.service_name={};
	$scope.services = [];
	$http.post('/requestedServicesListToAdmin').success(function(response){
		if (response.hasOwnProperty('success')) {
			$scope.services = response.data;
		}
		$scope.$emit('UNLOAD');
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
		$scope.$emit('LOAD');
		$http.post('/updateServiceRequestStatus', {id: req_id, status:status, comment: $scope.updateData.comment}).success(function(res){
			$scope.$emit('UNLOAD');
			if (res.hasOwnProperty('success')) {
				$timeout(function(){
					$route.reload();
				}, 200);
				
			}
		});
	}
}]);

socialApp.controller('serviceAll', ['$scope', '$http','$route','DTOptionsBuilder', function($scope, $http, $route,DTOptionsBuilder){
	$scope.dtOptions = DTOptionsBuilder.newOptions() 
                        .withOption('order', [1, 'desc'])
                        .withButtons([
                            'print',
                            'excel',
                            'csv',
                            'pdf'
                        ]);
	$scope.services = [];
	$scope.$emit('LOAD');
	$http.post('/ListServices').success(function(response){
		if (response.hasOwnProperty('success')) {
			$scope.services = response.data;
		}
		$scope.$emit('UNLOAD');
	});

	$scope.deleteService = function(service_id){
		var returnVal = confirm('Are You Sure ?');
		if(!returnVal){
			return;
		}
		$scope.$emit('LOAD');
		$http.post('/deleteService', {service_id: service_id}).success(function(response){
			$scope.$emit('UNLOAD');
			if (response.hasOwnProperty('success')) {
				$route.reload();
			}
		});
	}
}]);