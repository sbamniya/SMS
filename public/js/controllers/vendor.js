/**/
socialApp.controller('AddVendor', ['$scope','fileUpload', '$http','$location','$routeParams', function($scope, fileUpload, $http, $location, $routeParams){
	var block_id = $routeParams.blockID;
	$scope.vendor = {
		block_id: atob(block_id)
	};
	$scope.upload_idImage = function(){

		var file = $scope.idFile;
		console.log(file);
        if (angular.isUndefined(file)) {
           return;
        }
        $scope.$emit('LOAD');
        var uploadUrl = "/uploadPhoto";
        var res = fileUpload.uploadFileToUrl(file, uploadUrl);

        res.success(function(response){
        	$scope.vendor.id_proof = response.photoId;
        	$scope.$emit('UNLOAD');
        });
	};

	$scope.addVendor = function(){
		$scope.$emit('LOAD');
		$http.post('/addVendor', $scope.vendor).success(function(res){
			$scope.$emit('UNLOAD');
			if (res.hasOwnProperty('status') && res.status==200) {
				$location.path('/view-vendor/'+block_id);
			}
		});
	}
}]);

socialApp.controller('ViewVendorForManager', ['$scope','$http','$routeParams', '$route', '$timeout', function($scope, $http, $routeParams, $route, $timeout){
	$scope.vendors = [];
	$scope.success = false;
	$scope.Error = false;
	$scope.$emit('LOAD');
	var block_id = atob($routeParams.blockID);
	$http.post('/listvendors', {block_id: block_id}).success(function(response){
		if (response.hasOwnProperty('success')) {
			$scope.vendors = response.data;
		}
		$scope.$emit('UNLOAD');
	});

	$scope.deleteVendor = function(vendor_id){
		var returnVal = confirm('Are You Sure ?');
		if (!returnVal) {
			return;
		}
		$scope.$emit('LOAD');
		$http.post('/deleteVendor', {id: vendor_id}).success(function(response){
			if (response.hasOwnProperty('success')) {
				$route.reload();
			}
			$scope.$emit('UNLOAD');
		});
	}
	$scope.updateId = function(vendor_id, vendor_name, email, contact, description){
		$scope.updateData = {
			id: vendor_id,
			vendor_name: vendor_name,
			email: email,
			contact: contact,
			description: description
		}
	}

	$scope.updateDetails = function(){
		$scope.success = false;
		$scope.Error = false;
		$scope.$emit('LOAD');
		$http.post('/updateVendor', $scope.updateData).success(function(response){
			if (response.hasOwnProperty('success')) {
				$scope.success = true;
				$scope.Error = false;
				$scope.successMsg = "Details Updated Successfully !";
				$timeout(function(){
					$route.reload();
				}, 2000);
			}else{
				$scope.Error = true;
				$scope.ErrorMsg = "Some Error Ocuured While Updating Data !";
				$scope.success = false;
			}
			$scope.$emit('UNLOAD');
		});
	}
}]);