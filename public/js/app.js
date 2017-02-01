'use strict';

var socialApp = angular.module('socialApp', ['ngRoute']);

socialApp.config(['$routeProvider',function($routeProvider) {
	$routeProvider
	.when('/', {
		controller: 'home',
        templateUrl: 'templates/home.html',
        title: 'Society Management | Home'
	});
}]);

socialApp.run(['$rootScope', '$route', '$anchorScroll', function($rootScope, $route, $anchorScroll) {
    $rootScope.$on('$routeChangeSuccess', function() {
        document.title = $route.current.title;
        $anchorScroll();
    });
}]);