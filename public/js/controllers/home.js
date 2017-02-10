socialApp.controller('home', ['$scope','$http', function($scope, $http){
	$scope.help = {
		time: '9am-12pm',
		service: 'Architech'
	};
	/*$http.post('/ListServices').success(function(response){
		console.log(response);
	})*/
	$scope.requestHelp = function(){
		$http
		.post(
			'http://man2help.com/anyuser.php', 
			$scope.help
		)
		.then(
			function successCallback(response) {
				console.log(response);
			},
			function errorCallback(response) {
				console.log(response);
			}
		);
	}
}]);