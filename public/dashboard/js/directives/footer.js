/*Admin panel footer*/
socialApp.directive('footer', ['$compile', function ($compile) {
    return {
        restrict: 'E',
        templateUrl: 'admin/admin-panel/html/footer.html'
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
