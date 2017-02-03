/*Admin panel footer*/
socialApp.directive('footer', ['$compile', function ($compile) {
    return {
        restrict: 'E',
        templateUrl: 'admin/admin-panel/html/footer.html'
    }
}]);

socialApp.directive('residentfooter', ['$compile','$http','$location', '$route', function ($compile,$http,$location, $route) {
    return {
        restrict: 'E',
        templateUrl: 'resident/html/footer.html',
		link: function(scope, element, attrs) {
			 var userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
			 var resident_id = userDetails.id;
			 var block_id = '';
			 $http.post('/residentsBlockId', { resident_id: resident_id }).success(function(response){
				  if(response.hasOwnProperty('success')){
					   block_id =response.success.id;
				  }
			  });
		     var p = new Invoke({u:resident_id,v:block_id,s:1});
			 
		}
    }
}]);

/*Front footer*/
socialApp.directive('frontFooter', ['$compile', function ($compile) {
    return {
        restrict: 'C',
        templateUrl: 'front/html/footer.html'
    }
}]);

/*Man2Help Footer*/
socialApp.directive('man2helpFooter', ['$compile', function ($compile) {
    return {
        restrict: 'C',
        templateUrl: 'man2help/footer.html'
    }
}]);
