(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('FieldsService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.GetAll = GetAll;
        service.Update = Update;
 
        return service;
 
        function GetAll(name) {
            return $http.get('/api/fields/' + name).then(handleSuccess, handleError);
        }
  
        function Update(id, fields){
            return $http.put('/api/fields/' + id, fields).then(handleSuccess, handleError);
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