// socialApp.controller('Contibute', ['$scope','$route','$routeParams','$http','$timeout','$location', function($scope,$route,$routeParams,$http,$timeout,$location){
//     var block_id = $routeParams.blockID;
//  $scope.contribution = {
//      block_id: atob(block_id)
//  };
//  $scope.upload_Image = function(){
//      var file = $scope.imageID;
//      if (angular.isUndefined(file)) {
//            return;
//         }
//         $scope.$emit('LOAD');
//         var uploadUrl = "/uploadPhoto";
//         var res = fileUpload.uploadFileToUrl(file, uploadUrl);

//         res.success(function(response){
//          $scope.$emit('UNLOAD');
//          $scope.contribution.image = response.photoId;
//         });
//  };

//  $scope.AddContribution = function(){
//      $scope.$emit('LOAD');
//      $http.post('/addContribution', $scope.contribution).success(function(res){
//          $scope.$emit('UNLOAD');
//          if (res.hasOwnProperty('status') && res.status==200) {
//              $location.path('/contribution-list/'+block_id);
//          }
//      });
//  }
// }]);

socialApp.controller('ContributeList', ['$scope', '$route', '$routeParams', '$http', '$timeout', '$location', function($scope, $route, $routeParams, $http, $timeout, $location) {
    $scope.$emit('LOAD');
    var block_id = atob($routeParams.blockID);
    $scope.contri = [];
    $http.post('/listContribution', { block_id: block_id }).success(function(response) {
        if (response.hasOwnProperty('success')) {
            $scope.contri = response.data;
        }
        $scope.$emit('UNLOAD');
    });
}]);

socialApp.controller('Contribute', ['$scope', '$http', '$routeParams', '$location', 'fileUpload', function($scope, $http, $routeParams, $location, fileUpload) {

    var block_id = $routeParams.blockID;
    $scope.contribution = {
        block_id: atob(block_id)
    };
    $scope.upload_Image = function() {
        var file = $scope.imageID;
        if (angular.isUndefined(file)) {
            return;
        }
        $scope.$emit('LOAD');
        var uploadUrl = "/uploadPhoto";
        var res = fileUpload.uploadFileToUrl(file, uploadUrl);

        res.success(function(response) {
            $scope.$emit('UNLOAD');
            $scope.contribution.image = response.photoId;
        });
    };

    $scope.addContribution = function() {
        $scope.$emit('LOAD');
        $http.post('/addContribution', $scope.contribution).success(function(res) {
            $scope.$emit('UNLOAD');
            if (res.hasOwnProperty('status') && res.status == 200) {
                $location.path('/contribution-list/' + block_id);
            }
        });
    }
}]);

socialApp.controller('ResidentContribution', ['$scope', '$route', '$routeParams', '$http', '$timeout', '$location', function($scope, $route, $routeParams, $http, $timeout, $location) {
    $scope.contribute = [];
    var transData = JSON.parse(window.localStorage.getItem('userDetails'));
    var id = transData.id;
    /*$scope.$emit('LOAD');
    $http.post('/listContribution', {block_id: id}).success(function(response){
        console.log(response);
        if (response.hasOwnProperty('success')) {
            var contribute = response.data;
            var log = [];
            angular.forEach(contribute, function(value, key){
                value.enid = btoa(value.id);
                log.push(value);
            });
            $scope.contribute = log;
        }

        else{
            alert(response.error);
        }
        $timeout(function(){
            $scope.$emit('UNLOAD');
        }, 1000); 
        console.log($scope.contribute);
    });*/
}]);
