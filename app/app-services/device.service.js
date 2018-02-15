(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('DeviceService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.getAllDevices = getAllDevices;
        service.addDevice = addDevice;
        service.updateDevice = updateDevice;
        service.Delete = Delete;
 
        return service;
 
        function getAllDevices() {
            return $http.get('/api/devices/all').then(handleSuccess, handleError);
        }

        function addDevice(device) {
            return $http.post('/api/devices/addDevice', device).then(handleSuccess, handleError);
        }

        function updateDevice(device){
            return $http.put('/api/devices/' + device._id, device).then(handleSuccess, handleError);
        }
        
        function Delete(_id) {
            return $http.delete('/api/devices/' + _id).then(handleSuccess, handleError);
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