(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('Account.IndexController', Controller);
 
    function Controller($window, UserService, FlashService, $scope, FieldsService) {
        var vm = this;
 
        vm.user = null;
        vm.saveUser = saveUser;
        vm.deleteUser = deleteUser;
        $scope.aUsers = {};
        $scope.confirmPassword = {};

          /*
        Function name: Get all checkbox elements
        Author(s): Flamiano, Glenn
        Date Modified: 2018/01/31
        Description: Get all checkbox elements and set dynamic temporary variables for checked items
        Parameter(s): none
        Return: none
        */
        
        var selected = [];
        var selectedLength = 0;
        var checkboxFields = [];
        function declareSelected(){
            checkboxFields = document.getElementsByName("checkBoxInput checkbox");
            //console.log(checkboxFields);
            for(var i=0;i<checkboxFields.length;i++){
                selected[checkboxFields[i].className] = [];
                selectedLength++;
                //console.log(checkboxFields[i].className+' '+selected[checkboxFields[i].className]);
            }
        }
        
 
        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                $scope.aUsers = user;
                declareSelected();

                //in order to restart initcontroller to make sure selected checkboxes are declared
                //by restarting init controller if NodeList has no length.
                if(selectedLength == 0){
                    initController();
                } else {
                    //Nodelist has length
                }
            });
        }

        /*
            Function name: Show different field types
            Author(s): Flamiano, Glenn
            Date Modified: 01/26/2018
            Description: To hide/show different input types
            Parameter(s): none
            Return: boolean
        */
        $scope.showTextBox = function(data){
            if(data == 'text'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showEmail = function(data){
            if(data == 'email'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showNumber = function(data){
            if(data == 'number'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showPassword = function(data){
            if(data == 'password'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showTextArea = function(data){
            if(data == 'textarea'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showCheckBox = function(data){
            if(data == 'checkbox'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showDropDown = function(data){
            if(data == 'dropdown'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showRadio = function(data){
            if(data == 'radio'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showDate = function(data){
            if(data == 'date'){
                return true;
            } else {
                return false;
            }
        };

        Array.prototype.remove = function() {
            var what, a = arguments, L = a.length, ax;
            while (L && this.length) {
                what = a[--L];
                while ((ax = this.indexOf(what)) !== -1) {
                    this.splice(ax, 1);
                }
            }
            return this;
        };

        /*
            Function name: Format date
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/25
            Description: To iformat a date and to be inserted to $scope.aUsers
            Parameter(s): none
            Return: formatted date
        */
        function formatDate(date) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }

        /*
            Function name: Insert formatted date to $scope.aUsers
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/25
            Description: To iformat a date and to be inserted to $scope.aUsers
            Parameter(s): none
            Return: none
        */
        $scope.pushDateToAUsers = function(fieldName, inputDate) {
            //console.log('push date');
            $scope.aUsers[fieldName] = formatDate(inputDate);
        };

        /*
            Function name: Validate email inputs
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/25
            Description: Check all email inputs in add/edit modal
            Parameter(s): none
            Return: boolean
        */
        function checkEmails(){
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var myRows = document.getElementsByName('email');
            var allValid = true;
            for(var i=0;i<myRows.length;i++){ 
                //console.log('aaaaaa', myRows[i].value);
                if(myRows[i].value != ''){
                    //console.log(myRows[i].value+' grrrr '+re.test(myRows[i].value.toLowerCase()));
                    if(!re.test(myRows[i].value.toLowerCase())){
                        allValid = false;
                    }
                }
            } 
            return allValid;
        };

        /*
            Function name: Validate number inputs
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check all number inputs in add/edit modal
            Parameter(s): none
            Return: boolean
        */
        function checkNumbers(){
            var myRows = document.getElementsByName('number');
            var allValid = true;
            for(var i=0;i<myRows.length;i++){ 
                if(myRows[i].value != ''){
                    if(isNaN(myRows[i].value)){
                        allValid = false;
                    }
                }
            } 
            return allValid;
        };

        /*
            Function name: Validate password strength
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check password if it contains a lowercase, uppercase, number, and is 8 characters
            Parameter(s): none
            Return: boolean
        */
        function checkPasswordChars(password){
            var points = 0;
            var valid = false;

            // Validate lowercase letters
            var lowerCaseLetters = /[a-z]/g;
            if(password.match(lowerCaseLetters)) {  
                points += 1;
            }

            // Validate capital letters
            var upperCaseLetters = /[A-Z]/g;
            if(password.match(upperCaseLetters)) {  
                points += 1;
            }

            // Validate numbers
            var numbers = /[0-9]/g;
            if(password.match(numbers)) {  
                points += 1;
            }

            // Validate length
            if(password.length >= 8) {
                points += 1;
            }

            // if points = 4 return true
            if(points == 4){
                valid = true;
            }
            
            return valid;
        }

        /*
            Function name: Validate password inputs
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check all password inputs in add/edit modal
            Parameter(s): none
            Return: boolean
        */
        function checkPasswords(){
            var myRows = document.getElementsByName('password');
            var allValid = true;
            for(var i=0;i<myRows.length;i++){ 
                if(myRows[i].value != ''){
                    if(!checkPasswordChars(myRows[i].value)){
                        allValid = false;
                    }
                }
            } 
            return allValid;
        };

        $scope.putToModel = function(option, fieldName){
            //console.log(option);
            $scope.aUsers[fieldName] = option;
        }

        /*
            Function name: Validate confirm passwords
            Author(s): Flamiano, Glenn
                       Reccion, Jeremy
            Date Modified: 2018/02/01
            Description: Check all password inputs in add/edit modal
            Parameter(s): none
            Return: boolean
        */
        function checkConfirmPasswords(){
            var allValid = true;
            for(var i in $scope.fields){
                var currentField = $scope.fields[i];
                
                //validation for password
                if(currentField.type == 'password'){
                    if($scope.aUsers[currentField.name] != $scope.confirmPassword[currentField.name]){
                        allValid = false;
                    }
                }
            }
            return allValid;
        };

        /*
            Function name: isChecked
            Author(s): Reccion, Jeremy
            Date Modified: 2018/01/31
            Description: Check an option of the checkbox if checked
            Parameter(s): field.name, checkbox element
            Return: none
        */
        $scope.isChecked = function(field_name, option, type){
            if(type == 'checkbox'){
                if($scope.aUsers[field_name] == undefined) $scope.aUsers[field_name] = [];
                var isChecked = ($scope.aUsers[field_name].indexOf(option) != -1) ? true : false;
                //console.log(isChecked);
                return isChecked;
            }
        };

        $scope.isRadioSelected = function(field_name, option, type){
            if(type == 'radio'){
                if($scope.aUsers[field_name] == undefined) $scope.aUsers[field_name] = [];
                var isChecked = ($scope.aUsers[field_name].indexOf(option) != -1) ? true : false;
                //console.log(isChecked);
                return isChecked;
            }
        };

        /*
            Function name: Insert checkbox checked values to
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check all password inputs in add modal
            Parameter(s): field.name, checkbox element
            Return: none
        */
        $scope.pushToAUsers = function(fieldName, option){
            var checkedOption = document.getElementsByName(option);
            //console.log(selected['checkBoxAdd '+fieldName]);
            if(checkedOption[0].checked){
                selected['checkBoxAdd '+fieldName].push(option);
            }else{
                selected['checkBoxAdd '+fieldName].remove(option);
            }
            //console.log(selected['checkBoxAdd '+fieldName]);
            $scope.aUsers[fieldName] = selected['checkBoxAdd '+fieldName];
        };

        $scope.id = "";
        $scope.fields = [];
        $scope.name = 'user';
        function getAllFields(){
            FieldsService.GetAll($scope.name).then(function(response){
    
                $scope.fields = response.fields;
                $scope.id = response._id;
                
            }).catch(function(err){
                alert(err.msg_error);
            });
        };
        
        getAllFields();
        initController();
 
        function saveUser() {
            if(vm.user.password===undefined){
                FlashService.Error("Enter New Password");
            }else{
                if(vm.user.password != vm.user.confirmPassword){
                    
                    FlashService.Error("Password doesn't match");
                }else{
                    var requiredTextField=0;
                    var forDataBase=0;
                    for(var h in $scope.fields){
                        if($scope.fields[h].required==true){
                            requiredTextField++;
                            if($scope.aUsers[$scope.fields[h].name]===undefined){
                                FlashService.Error("Please input all the required the fields");
                                $scope.aUsers = tempUsers;
                            }else{
                                forDataBase++;
                            }
                        }
                    }

                    if(!checkEmails()){
                        FlashService.Error("Please Input valid email");
                    }else if(!checkNumbers()){
                        FlashService.Error("Please Input numbers only to number fields");
                    }else if(!checkPasswords()){
                        FlashService.Error("Passwords should contain lowercase, uppercase, numbers and at least 8 characters");
                    }else if(!checkConfirmPasswords()){
                        FlashService.Error("Confirm password/s does not match");
                    }else{
                        if(forDataBase===requiredTextField){
                            UserService.Update(vm.user)
                                .then(function () {
                                    FlashService.Success('User updated');
                                })
                                .catch(function (error) {
                                    FlashService.Error(error);
                                });
                        }
                    }
                }
            }
        }
 
        function deleteUser() {

            if (confirm("sure to delete?")){


            UserService.Delete(vm.user._id)
                .then(function () {
                    // log user out
                    $window.location = '/login';
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
            }
        }
    }
 
})();