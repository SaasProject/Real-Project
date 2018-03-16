(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('LanguageService', Service);
 
    function Service($http, $q) {
        var service = {};

        service.getDefaultLanguage = getDefaultLanguage;
        service.saveDefaultLanguage = saveDefaultLanguage;
        service.getSpecificLanguage = getSpecificLanguage;
 
        return service;

        function getSpecificLanguage(option){
            //user.option = option;
            //return $http.get('/api/languages/getSpecificLanguage', user).then(handleSuccess, handleError);
            return $http({url: '/api/languages/getSpecificLanguage', 
                method: "GET", params: {option: option}}).then(handleSuccess, handleError);

        }

        function getDefaultLanguage() {
            return $http.get('/api/languages/getDefaultLanguage').then(handleSuccess, handleError);
        }

        function saveDefaultLanguage(user, option){
            user.option = option;
            return $http.post('/api/languages/saveDefaultLanguage', user).then(handleSuccess, handleError);
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