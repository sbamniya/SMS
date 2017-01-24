socialApp.controller('managerList', ['$scope', '$http', '$location', '$compile', '$route', '$routeParams', '$timeout', 'DTOptionsBuilder', 'DTColumnBuilder', function($scope, $http, $location, $compile, $route, $routeParams, $timeout, DTOptionsBuilder, DTColumnBuilder) {
    /*$scope.$emit('LOAD');*/
    $scope.managers = {};
    $scope.dtColumns = [
        //here We will add .withOption('name','column_name') for send column name to the server 
        DTColumnBuilder.newColumn("manager_name", "Name").notSortable(),
        DTColumnBuilder.newColumn("email", "Email").notSortable(),
        DTColumnBuilder.newColumn("idType", "ID Type").notSortable(),
        DTColumnBuilder.newColumn("idNumber", "ID Number").notSortable(),
        DTColumnBuilder.newColumn("description", "Description").notSortable(),
        DTColumnBuilder.newColumn("status_var", "Status").notSortable(),
        DTColumnBuilder.newColumn(null, "Action").notSortable().renderWith(actionsHtml)
    ]

    $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            contentType: "application/json;",
            url: "/getmanagerList",
            type: "get",
            dataSrc: function(res) {

                var log = [];
                var generateResponse = JSON.parse(res.success);
                angular.forEach(generateResponse, function(item, index) {
                    item.status_var = '';
                    if (item.status == 1) {
                        item.status_var = '<div class="alert alert-success">Active</div>';
                    } else {
                        item.status_var = '<div class="alert alert-danger">Inactive</div>';
                    }
                    if (item.idType == '') {
                        item.idType = 'N/A';
                    }

                    if (item.idNumber == '') {
                        item.idNumber = 'N/A';
                    }
                    log.push(item);
                });

                return log;
                /*$timeout(function(){
                    $scope.$emit('UNLOAD');
                }, 2500);*/
            }
        })
        .withOption('processing', true) //for show progress bar
        .withOption('serverSide', true) // for server side processing
        .withPaginationType('full_numbers') // for get full pagination options // first / last / prev / next and page numbers
        .withDisplayLength(10) // Page size
        .withOption('aaSorting', [0, 'asc'])
        .withOption('responsive', true)
        .withOption('createdRow', createdRow);

    function createdRow(row, data, dataIndex) {

        $compile(angular.element(row).contents())($scope);
    }

    function actionsHtml(data, type, full, meta) {
        $d = full;
        var str = '<a href="javascript:void(0)" ng-click="deleteManager(' + $d.id + ')" title="Delete"><i class="fa fa-trash"></i></a>';

        return str;
    }

    $scope.deleteManager = function(id) {

        var returnVal = confirm('Are You Sure ?');
        if (!returnVal) {
            return;
        }
        var url = '/deleteManager';
        $scope.$emit('LOAD');
        $http.post(url, { id: id }).success(function(response) {
            $scope.$emit('UNLOAD');
            $route.reload();
        });
    }

}]);

socialApp.controller('addManager', ['$scope', '$http', '$location', '$compile', function($scope, $http, $location, $compile) {
    $scope.formErrorShow = false;
    $scope.addManager = function() {
        $scope.$emit('LOAD');
        $scope.formErrorShow = false;
        $http.post('/addManager', $scope.manager).success(function(response) {

            if (response.success) {
                $scope.$emit('UNLOAD');
                $location.path('/manager-list');
            } else {
                $scope.formError = response.error;
                $scope.formErrorShow = true;
                $scope.$emit('UNLOAD');
            }

        });
    }
}]);

socialApp.controller('Due', ['$scope', '$http', '$location', '$routeParams', '$route', '$timeout', '$crypthmac', 'sha256', function($scope, $http, $location, $routeParams, $route, $timeout, $crypthmac, sha256) {
    $scope.$emit('LOAD');
    var block_id = atob($routeParams.blockID);
    $scope.VendorDues = [];
    /*console.log($scope.VendorDues);*/
    $http.post('/paymentDuesFromManager', { block_id: block_id }).success(function(response) {
        if (response.hasOwnProperty('succes')) {
            if (response.hasOwnProperty('data')) {
                //console.log(response.data);
                angular.forEach(response.data, function(item, key) {
                    item.enc_id = btoa(item.job_card_id);
                    if (item.job_card_type == 2) {
                        item.job_card_type = "Recurring";
                    } else {
                        item.job_card_type = "Onetime";
                    }
                    if (item.contract_type == 1) {
                        item.contract_type = "Periodic";
                    } else if (item.contract_type == 2) {
                        item.contract_type = "A.M.C";
                    } else if (item.contract_type == 0) {
                        item.contract_type = "Onetime";
                    }
                    $scope.VendorDues.push(item);
                });
            }
            //$scope.VendorDues = response.data;
        }
        $scope.$emit("UNLOAD");
    });

    $scope.cashDetail = {};
    $scope.payCash = function(id, type) {

        $scope.cashDetail.type = type;
        $scope.$emit('LOAD');
        $scope.cashDetail.id = id;
        $http.post('/paymentDuesFromManagerForUpdate', { id: id }).success(function(response) {

            if (response.hasOwnProperty('success')) {
                $scope.cashDetail.jobcard_id = response.data.jobcard_id;
                $scope.cashDetail.vendor_id = response.data.vendor_id;
                $scope.cashDetail.vendor_name = response.data.vendor_name;
                $scope.cashDetail.job_card_type = response.data.job_card_type;
                $scope.cashDetail.payment_type = type;
                $scope.cashDetail.category = response.data.category;
                $scope.cashDetail.paydate = response.data.paydate;
                $scope.cashDetail.contract_type = response.data.contract_type;
                $scope.cashDetail.charge = response.data.charge;
                $scope.cashDetail.chequeno = response.data.chequeno;
                $scope.cashDetail.ifsc = response.data.ifsc;
                $scope.cashDetail.chequedate = response.data.chequedate;
                $scope.cashDetail.email = response.data.vendor_email;
                $scope.cashDetail.contact = response.data.contact;
                $scope.cashDetail.merchant_key = response.data.merchant_key;
                $scope.cashDetail.merchant_salt = response.data.merchant_salt;

                if ($scope.cashDetail.job_card_type == 1) {
                    $scope.cashDetail.job_card_type = "Onetime";
                } else if ($scope.cashDetail.job_card_type == 2) {
                    $scope.cashDetail.job_card_type = "Recurring";
                }
                if ($scope.cashDetail.contract_type == 0) {
                    $scope.cashDetail.contract_type = "One time";
                } else if ($scope.cashDetail.contract_type == 1) {
                    $scope.cashDetail.contract_type = "Periodic";
                } else if ($scope.cashDetail.contract_type == 2) {
                    $scope.cashDetail.contract_type = "A.M.C.";
                }
            }

            $scope.$emit('UNLOAD');
        });
    }

    $scope.submitPayDetails = function() {
        $scope.$emit('LOAD');
        $http.post('/managersDueForVendor', $scope.cashDetail).success(function(response) {
            $timeout(function() {
                $scope.$emit('UNLOAD');
                $location.path('/expense/' + $routeParams.blockID)
            }, 500);
        });
    }



    $scope.pay = function(id, event) {

        $scope.PayDues = [];
        $scope.PayDues.id = id;
        $http.post('/paymentDuesFromManagerForSinglePay', { id: id, block_id: block_id }).success(function(response) {
            if (response.hasOwnProperty('success')) {
                $scope.PayDues = response.data;
                $scope.noData = true;
                /*Define PayuCredentials*/
                var SALT = "yIEkykqEH3";

                var protocol = $location.protocol();
                var host = $location.host();
                var port = $location.port();

                var surl = protocol + '://' + host;
                var furl = protocol + '://' + host;

                if (host == 'localhost') {
                    surl += ':' + port;
                    furl += ':' + port;
                }
                surl += '/payment-success';
                furl += '/payment-fail';

                $scope.paymentDetails = {
                    key: "hDkYGPQe",
                    firstname: $scope.PayDues.vendor_name,
                    email: $scope.PayDues.email,
                    phone: $scope.PayDues.contact,
                    surl: surl,
                    furl: furl,
                    udf1: id,
                    udf2: 1,
                    udf3: block_id,
                    service_provider: "payu_paisa"
                };

                $scope.paymentDetails.txnid = sha256.convertToSHA256(randomString(5)).substring(0, 20).toLowerCase();
                //$scope.paymentDetails.txnid = 'ae7dc1217fe9a4994ea0';
                $scope.paymentDetails.totalPayable = $scope.PayDues.charge;

                var product = $scope.PayDues.job_card_type;
                var proDetail = JSON.stringify(product);
                $scope.paymentDetails.productinfo = proDetail;
                /*var hashSequence = "key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10";*/

                hashString = $scope.paymentDetails.key + '|' + $scope.paymentDetails.txnid + '|' + $scope.paymentDetails.totalPayable + '|' + $scope.paymentDetails.productinfo + '|' + $scope.paymentDetails.firstname + '|' + $scope.paymentDetails.email + '|' + id + '|' + $scope.paymentDetails.udf2 + '|' + $scope.paymentDetails.udf3 + '||||||||' + SALT;

                $http.post('/createHash', { string: hashString }).success(function(response) {
                    $scope.paymentDetails.hash = response;
                    console.log($scope.paymentDetails.hash)
                });

                $scope.paymentDetails.service_provider = $scope.paymentDetails.service_provider;

                /*$scope.paymentDetails.service_provider = $scope.totalPayable;
                 */
                console.log($scope.paymentDetails)
                setTimeout(function() {
                    angular.element('#paymentFrm').trigger('submit');
                }, 2000);

            }

            function randomString(length) {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < length; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }
        });
    }
}]);
