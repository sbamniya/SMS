/*Admin Dashboard*/
socialApp.controller('AdminDashboard', ['$scope','$http','$timeout', function($scope, $http, $timeout){
	$scope.$emit('LOAD');
	var chart1 = {};
	chart1.type = "PieChart";
	chart1.data = [
	       ['Component', 'Complaints'],
	    ];

    $http.post('/getComplaintsStatusForAdmin').success(function(res){
    	if (res.hasOwnProperty('success')) {
    		angular.forEach(res.success, function(data, key){
    			var society_name = data.society_name;
    			var complaints = data.complaints;
    			var temp = [society_name, complaints];
    			chart1.data.push(temp);
    		});
		    chart1.options = {
		        displayExactValues: true,
		        width: 400,
		        height: 200,
		        //is3D: true,
		        chartArea: {left:10,top:10,bottom:0,height:"100%"}
		    };

		    $scope.chart = chart1;
		    $timeout(function(){
		    	$scope.$emit('UNLOAD');
		    }, 1000);
    	}
    });
}]);

/*Society Manager*/
socialApp.controller('societyDashboard',['$scope', '$http', '$location', '$compile', '$routeParams', '$route', '$timeout', function ($scope, $http,$location, $compile, $routeParams,$route, $timeout) {
		$scope.$emit('LOAD');
		var chart1 = {};
		var id = window.atob($routeParams.blockID);
		$scope.flatInfo = {
				flat_id : '',
				flat_type : '',
				flat_number : '',
				area: '',
				location:'',
				parking_type: '2-wheeler',
				balcony: 'yes'
			};

		$http.post('/getSingleBlock', {id: id}).success(function(response){
			if(response.success){

				$scope.block = response.success;
				if ($scope.block.parking_avail==1) {
					$scope.parkAvail = true;
				}
				$scope.blockStorey = [];
				
				var numberOfStoreys = parseInt(response.success.storeys);
				
				for (var i = numberOfStoreys; i >= 1; i--) {
					
					$http.post('/getFlatList', {id: id, storey_number:i}).success(function(res){
						if(res.success){
							
								if(res.success.length > 0){

									$scope.blockStorey.push({flats:res.success, storeyNo: res.success[0].storey_number});
									$scope.isUpdated = false;
								}else{
									$scope.isUpdated = true;
								}
								$scope.$emit('UNLOAD');
						}else{
							$scope.$emit('UNLOAD');
							$location.path('/404');
						}
					});
				}

				$http.post('/getComplaintsStatusForManager', {id: id}).success(function(res){
					if (res.hasOwnProperty('success')) {
			    		resolved = res.success.Resolved;
						pending = res.success.Pending;
						under_surveillance = res.success.Under_Surveillance;

						chart1.type = "PieChart";

					    chart1.data = [
					       ['Component', 'Complaints'],
					       ['Resolved', resolved],
					       ['Pending', pending],
					       ['Under Surveillance',under_surveillance]
					    ];
					 
					    chart1.options = {
					        displayExactValues: true,
					        width: 400,
					        height: 200,
					        //is3D: true,
					        chartArea: {left:10,top:10,bottom:0,height:"100%"}
					    };

					    $scope.chart = chart1;
			    	}
			    });
				$scope.block.parent_id = window.btoa($scope.block.parent_id);
				$scope.block.id = window.btoa($scope.block.id);
				$timeout(function(){
			    	$scope.$emit('UNLOAD');
			    }, 1000);
			}else{
				$scope.$emit('UNLOAD');
				$location.path('/404');
			}

		});

		$scope.addResident = function(flatId){
			$location.path('/add-resident/'+btoa(id)+'/'+btoa(flatId));
		}

		$scope.flatDetails = function(flat_id, type, flat_number){
			$scope.success = false;
			$scope.Error = false;

			$scope.$emit('LOAD');

			$scope.flatInfo = {
				flat_id : flat_id,
				flat_type : type,
				flat_number : flat_number,
				area: '',
				location:'',
				parking_avail: $scope.block.parking_avail,
				
				balcony: 'yes'
			};
			$http.post('/getFlatDetails', {flat_id: flat_id}).success(function(response){
				$scope.flatInfo.area = response.success.area;
				$scope.flatInfo.location = response.success.location;
				if (response.success.parking_id!=null) {
					$scope.flatInfo.parking_slots = response.success.parking_id.split(',');
				}else{
					$scope.flatInfo.parking_slots = [];
				}
				$scope.$emit('UNLOAD');
			});
		}

		$scope.flatInfo.parking_slots = [];

		$scope.updateFlatDetails = function(){
			$scope.Error = false;
			$scope.success = false;

			if ($scope.flatInfo.parking_avail==1) {
				if (angular.isUndefined($scope.flatInfo.parking_slots) || $scope.flatInfo.parking_slots=='' || $scope.flatInfo.parking_slots.length==0) {
					$scope.Error = true;
					$scope.success =false;
					$scope.ErrorMsg = "Please Fill All Fields !";
					return;
				}
			}
			$scope.$emit('LOAD');
			$http.post('/updateFlatDetails', $scope.flatInfo).success(function(res){
				if (res.hasOwnProperty('success')) {
					$scope.Error = false;
					$scope.success =true;
					$scope.successMsg = res.success;
				}else{
					$scope.Error = true;
					$scope.success =false;
					$scope.ErrorMsg = res.error;
				}
				$scope.$emit('UNLOAD');
				/*angular.element('#myModal').css('display', 'none');
				$route.reload();*/
			});
			
		}

		$scope.GetFlatDetails = function(flat_id){
			$scope.$emit('LOAD');
			$http.post('/getFlatDetails', {flat_id:flat_id}).success(function(response){
				if (response.hasOwnProperty('success')) {
					var res = response.success;
					$scope.flatsFullDetails = res;
					if (res.residen_name==null || res.residen_name=='') {
						$scope.flatsFullDetails.residen_name = 'N/A Yet';
					}
					if (res.residen_email==null || res.residen_email=='') {
						$scope.flatsFullDetails.residen_email = 'N/A Yet';
					}
					if (res.residen_contact_number==null || res.residen_contact_number=='') {
						$scope.flatsFullDetails.residen_contact_number = 'N/A Yet';
					}
					if (res.resdent_type==null || res.resdent_type=='') {
						$scope.flatsFullDetails.resdent_type = 'N/A Yet';
					}
					if (res.parking_type==null || res.parking_type=='') {
						$scope.flatsFullDetails.parking_type = 'N/A Yet';
					}
					if (res.parking_desc==null || res.parking_desc=='') {
						$scope.flatsFullDetails.parking_desc = 'N/A Yet';
					}
					if (res.parking_area==null || res.parking_area=='') {
						$scope.flatsFullDetails.parking_area = 'N/A Yet';
					}
					if (res.location==null || res.location=='') {
						$scope.flatsFullDetails.location = 'N/A Yet';
					}
					if (res.area==null || res.area=='') {
						$scope.flatsFullDetails.area = 'N/A Yet';
					}
				}else{
					alert('Error');
					return false;
				}
				$scope.$emit('UNLOAD');
			})
		}

		$scope.parkArray = [];
		var block_id = window.atob($routeParams.blockID);
	
		$http.get('/getParkingList/?block_id='+block_id).success(function(response){
			
			if (response.hasOwnProperty('data')) {
				angular.forEach(response.data, function(item, key){
					/*if(item.status==0){*/
						$scope.parkArray.push(item);
					/*}*/
				});
			}
		});
}]);

/*For resident*/
socialApp.controller('residentDashboard', ['$scope','$http','$timeout', function($scope, $http, $timeout){
	var chart1 = {};
    $scope.$emit('LOAD');
    var resolved = '';
    var pending = '';
    var under_surveillance = '';

   	var userDetail = JSON.parse(window.localStorage.getItem('userDetails'));
	var id = userDetail.id;

    $http.post('/getComplaintsStatusForResident', {id: id}).success(function(res){
    	if (res.hasOwnProperty('success')) {
    		resolved = res.success.Resolved;
			pending = res.success.Pending;
			under_surveillance = res.success.Under_Surveillance;

			chart1.type = "PieChart";

		    chart1.data = [
		       ['Component', 'Complaints'],
		       ['Resolved', resolved],
		       ['Pending', pending],
		       ['Under Surveillance',under_surveillance]
		    ];
		 
		    chart1.options = {
		        displayExactValues: true,
		        width: 400,
		        height: 200,
		        //is3D: true,
		        chartArea: {left:10,top:10,bottom:0,height:"100%"}
		    };

		    $scope.chart = chart1;
		    $timeout(function(){
		    	$scope.$emit('UNLOAD');
		    }, 1500);
    	}
    });

	
}]);


/*Staff Dashboard*/

socialApp.controller('staffDashboard', ['$scope', function($scope){
	
}]);