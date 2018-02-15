(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('WarehouseService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.getAllWarehouse = getAllWarehouse;
        service.addWarehouse = addWarehouse;
        service.updateWarehouse = updateWarehouse;
        service.Delete = Delete;
 
        return service;
 
        function getAllWarehouse() {
            return $http.get('/api/warehouses/all').then(handleSuccess, handleError);
        }

        function addWarehouse(warehouse) {
            return $http.post('/api/warehouses/addWarehouse', warehouse).then(handleSuccess, handleError);
        }

        function updateWarehouse(warehouse){
            return $http.put('/api/warehouses/' + warehouse._id, warehouse).then(handleSuccess, handleError);
        }
        
        function Delete(_id) {
            return $http.delete('/api/warehouses/' + _id).then(handleSuccess, handleError);
        }
  
        // private functions
 
        function handleSuccess(res) {
            return res.data;
        }
 
        function handleError(res) {
            return $q.reject(res.data);
        }
    }
 
})();