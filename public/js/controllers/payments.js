socialApp.controller('PayDues', ['$scope','$http','$timeout','sha256','$location','$crypthmac', function($scope, $http, $timeout, sha256, $location, $crypthmac){
	var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
	var id = userDetails.id;
	var userName = userDetails.first_name+' '+userDetails.last_name;
	var userEmail = userDetails.email;
	var userCon = userDetails.contact_no;

	$scope.noData = true;
	/*Define PayuCredentials*/
	var SALT = "yIEkykqEH3";
	
	var protocol = $location.protocol();
	var host = $location.host();
	var port = $location.port();

	var surl = protocol+'://'+host;
	var furl = protocol+'://'+host;

	if (host=='localhost') {
		surl += ':'+port;
		furl += ':'+port;
	}
	surl += '/payment-success';
	furl += '/payment-fail';

	$scope.paymentDetails = {
		key : "hDkYGPQe",
		firstname: userName,
		email: userEmail,
		phone: userCon,
		surl:  surl,
		furl: furl,
		udf1 : id
	};

	$scope.pay = function(event) {
		$scope.paymentDetails.txnid = sha256.convertToSHA256(randomString(5)).substring(0, 20).toLowerCase();
		//$scope.paymentDetails.txnid = 'ae7dc1217fe9a4994ea0';
		$scope.paymentDetails.amount = $scope.totalPayableAmount;

		var product = $scope.AmenityPaid.concat($scope.FacilityPaid);
		var proDetail = JSON.stringify(product);
		$scope.paymentDetails.productinfo =  proDetail;
		/*var hashSequence = "key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10";*/
		
		hashString = $scope.paymentDetails.key+'|'+$scope.paymentDetails.txnid+'|'+$scope.totalPayable+'|'+$scope.paymentDetails.productinfo+'|'+$scope.paymentDetails.firstname+'|'+$scope.paymentDetails.email+'|'+id+'||||||||||'+SALT;

		$http.post('/createHash', {string: hashString}).success(function(response){
			$scope.paymentDetails.hash = response;
		});	
		
		$scope.paymentDetails.hash = $crypthmac.encrypt(hashString,"").toLowerCase();
		$scope.paymentDetails.service_provider = 'service_provider';
		$scope.paymentDetails.service_provider = $scope.totalPayable;

		setTimeout(function(){
			document.paymentFrm.submit();
		},2000);
	}

	$scope.Facilities = [];
	$scope.Amenities = [];
	$scope.$emit('LOAD');
	$http.post('/residentAllFacilityMaintainance',{resident_id: id} ).success(function(response){
		
		if (response.hasOwnProperty('success')) {

			var totalPayableForFacility = 0;
			var today = new Date();
			var todayDate = today.getDate();

			angular.forEach(response.data, function(item, key){

				var paymentDate = new Date(item.response_date);
				var last_payment_date = new Date(item.last_payment_date);
				var payDate = paymentDate.getDate();
				var diff = payDate - todayDate;
				var days = (today - last_payment_date)/(1000*60*60*24);
				/*if ((diff>=5 || diff<=-26) && (days)) {
					console.log(diff)
				}*/

				item.availFcaility = true;
				if (days>=5 || last_payment_date=='Invalid Date') {
					totalPayableForFacility += item.charges;
					item.availFcaility = false;
				}
				$scope.Facilities.push(item);
			});

			$scope.totalPayableAmount = totalPayableForFacility;
			$http.post('/residentAllAmenityMaintainance', {resident_id: id}).success(function(Res){
				
				if (Res.hasOwnProperty('success')) {
					var totalPayableForService = 0;
					angular.forEach(Res.data, function(item, key){
						var booking_end_date = new Date(item.booking_end_date);
						var booking_start_date =  new Date(item.booking_start_date);
						var days = (Math.round((booking_end_date-booking_start_date)/(1000*60*60*24))+1);
						item.days = days;
						item.amount = item.charges*days;
						totalPayableForService += item.charges*days;

						$scope.Amenities.push(item);
					});
					$scope.totalPayableAmount += totalPayableForService;
				}
				$scope.$emit('UNLOAD');
				/*if ($scope.Amenities.length>0 || $scope.Facilities.length>0) {
					$scope.noData = false;
				}*/
			});
		}
	});
	$scope.changeFac = {};
	$scope.FacilityPaid = [];

	$scope.totalPayable = 0;

	$scope.changeFacility = function(){
		
		angular.forEach($scope.changeFac, function(item, key){
			var faciltyId = {
				id: key,
				amount:item,
				type: 'Facility'
			}
			if (item) {
				$scope.FacilityPaid.push(faciltyId);
				var i = 1;
				angular.forEach($scope.FacilityPaid, function(req, key1){
					if (req.id==key && i<=2) {
						if (i==1) {
							$scope.totalPayable += parseInt(item);
						}else if(i>=2){
							$scope.totalPayable -= parseInt(item);
							$scope.FacilityPaid.splice(key1, 1);
						}
						i++;
					}
				});
				
			}else{
				angular.forEach($scope.FacilityPaid, function(req, key1){
					
					if (req.id==key) {
						$scope.totalPayable -= parseInt(req.amount);
						$scope.FacilityPaid.splice(key1, 1);
					}
				});
				
			}
		});
	}

	$scope.changeAme = {};
	$scope.AmenityPaid = [];

	$scope.changeAmenity = function(){
		angular.forEach($scope.changeAme, function(item, key){
			var faciltyId = {
				id: key,
				amount:item,
				type: 'Amenity'
			}
			if (item) {
				$scope.AmenityPaid.push(faciltyId);
				var i = 1;
				angular.forEach($scope.AmenityPaid, function(req, key1){
					if (req.id==key && i<=2) {
						if (i==1) {
							$scope.totalPayable += parseInt(item);
						}else if(i>=2){
							$scope.totalPayable -= parseInt(item);
							$scope.AmenityPaid.splice(key1, 1);
						}
						i++;
					}
				});
				
			}else{
				angular.forEach($scope.AmenityPaid, function(req, key1){
					if (req.id==key) {
						$scope.totalPayable -= parseInt(req.amount);
						$scope.AmenityPaid.splice(key1, 1);
					}
				});
			}
		});
	}
	
	
	
	function randomString (length) {
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	    for(var i = 0; i < length; i++) {
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    return text;
	}

}]);


socialApp.controller('listTransaction', ['$scope','$http','$window','$timeout', function($scope,$http,$window, $timeout){
	$scope.transaction = [];
	var transData = JSON.parse(window.localStorage.getItem('userDetails'));
	var id = transData.id;
	$scope.$emit('LOAD');
	$http.post('/displayPaymentDetails', {id: id}).success(function(response){
		if (response.hasOwnProperty('status') && response.status==200) {
			var transaction = response.data;
			var log = [];
			angular.forEach(transaction, function(value, key){
				value.enid = btoa(value.id);
				log.push(value);
			});
			$scope.transaction = log;
		}
		else{
			alert(response.error);
		}
		$timeout(function(){
			$scope.$emit('UNLOAD');
		}, 1000);
		
	});
	$scope.printReceipt = function(id){
		var transID = btoa(id);
		$window.open('#/transaction-receipt/'+transID, "popup", "width=600,height=400,left=10,top=50");
	}
}]);


socialApp.controller('printReceipt', ['$scope','$http','$location', '$routeParams','$timeout', '$window', function($scope, $http, $location, $routeParams, $timeout, $window){
        
        var transId = atob($routeParams.transID);
        
        $scope.transDetail = [];
        $http.post('/paymentReceipt', {id: transId}).success(function(response){
            if (response.hasOwnProperty('success')) {
                /*$scope.transDetail = response.data;*/
                var data = response.data;
                var dataProduct = JSON.parse(response.data.productinfo);
                var productinfo = [];
                angular.forEach(dataProduct, function(value, key){
                	var url = '';
                	if (value.type=='Facility') {
                		url = '/getFacilityName';
                	}else if(value.type=='Amenity'){
                		url = '/getAmenityName';
                	}
                	$http.post(url, {id: value.id}).success(function(Res){
                		value.name = Res.data.name;
                		productinfo.push(value);
                	});

                });
                $scope.transDetail = response.data;
                $scope.transDetail.productinfo = productinfo;
                $timeout($window.print, 0);
            } 
        });        
}]);


socialApp.controller('BlockIncomes', ['$scope','$http', '$routeParams','$route','$window', function($scope, $http, $routeParams, $route, $window){
	/**/
	$scope.$emit('LOAD');
	var block_id = atob($routeParams.blockID);

	$http.post('/transactionHistoryToManager', {id: block_id}).success(function(response){
		
		if (response.hasOwnProperty('success')) {
			var transaction = response.data;
			var log = [];
			angular.forEach(transaction, function(value, key){
				value.enid = btoa(value.id);
				log.push(value);
			});
			$scope.transaction = log;
			$scope.$emit('UNLOAD');
		}
		else{
			$scope.$emit('UNLOAD');
			alert(response.error);
		}

	});
	$scope.printReceipt = function(id){
		var transID = btoa(id);
		$window.open('#/transaction-receipt/'+transID, "popup", "width=600,height=400,left=10,top=50");
	}
}]);


socialApp.controller('Expenses', ['$scope','$http','$location', '$route', '$timeout', function($scope, $http, $location, $route, $timeout){
	
}]);