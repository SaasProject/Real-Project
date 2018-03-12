(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('LanguageService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.getEnglishLanguage = getEnglishLanguage;
        service.getNihongoLanguage = getNihongoLanguage;
        service.getDefaultLanguage = getDefaultLanguage;
        service.saveDefaultLanguage = saveDefaultLanguage;
 
        return service;
        
        function getEnglishLanguage() {
            return $http.get('/api/languages/getEnglishLanguage').then(handleSuccess, handleError);
        }

        function getNihongoLanguage() {
            return $http.get('/api/languages/getNihongoLanguage').then(handleSuccess, handleError);
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