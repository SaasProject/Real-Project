/*
    Name: Devices Controller
    Date Created: 01/03/2018
    Author(s): Sanchez, Macku
               Flamiano, Glenn  
*/

(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('ManageUsers.IndexController', Controller)

        /*
            Function name: Object filter
            Author(s): Flamiano, Glenn
            Date Modified:
            Description: to order the rows of the table
            Parameter(s): none
            Return: Array
        */
        .filter('orderObjectBy', function() {
          return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
              filtered.push(item);
            });
            filtered.sort(function (a, b) {
              return (a[field] > b[field] ? 1 : -1);
            });
            if(reverse) filtered.reverse();
            return filtered;
          };
        })

        /*
            Function name: Pagination filter
            Author(s): Flamiano, Glenn
            Date Modified:
            Description: to slice table per page based on number of items
            Parameter(s): none
            Return: Array
        */
        .filter('pagination', function(){
            return function(data, start){
                //data is an array. slice is removing all items past the start point
                return data.slice(start);
            };
        });
 
    function Controller(UserService, $scope, FlashService, FieldsService, socket) {
        var vm = this;
 
        vm.user = [];
		
		$scope.loading = true;
        $scope.confirmPassword = {};

        /*
            Function name: Calculate Object size
            Author(s): Flamiano, Glenn
            Date Modified:
            Description: to compute the size of an object
            Parameter(s): none
            Return: size
        */
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        // initialize pages of user list
        $scope.currentPage = 1;
        $scope.pageSize = 10;

        // Scope for users data
        $scope.aUsers = {};
        $scope.aUsers.password = "";

        $scope.btnchc = "Edit";
        $scope.shw = false;

        // initialize modal flash message display
        function resetModalFlash(){
            $scope.showMainFlash = true;
            $scope.showAddFlash = false;
            $scope.showEditFlash = false;
        }
        resetModalFlash();
        
        //$scope.fntcn = "enableEditing()";

        // Table sort functions
        // column to sort
        $scope.column = 'role';

        // sort ordering (Ascending or Descending). Set true for desending
        $scope.reverse = false; 

        // called on header click
        $scope.sortColumn = function(col){
            $scope.column = col;
            if($scope.reverse){
                $scope.reverse = false;
                $scope.reverseclass = 'arrow-up';
            }else{
                $scope.reverse = true;
                $scope.reverseclass = 'arrow-down';
            }
        };

        // remove and change class
        $scope.sortClass = function(col){
            if($scope.column == col ){
                if($scope.reverse){
                    return 'arrow-down'; 
                }else{
                    return 'arrow-up';
                }
            }else{
                return 'arrow-dormant';
            }
        } 
        // End of Table Functions

        //added by Glenn to set the width of each column
        //arbitrary only
        $scope.setWidth = function(column){
            switch(column){
                case "role": return 'col-sm-1'; break;
                case "firstName": return 'col-sm-3'; break;
                case "lastName": return 'col-sm-3'; break;
                case "email": return 'col-sm-3'; break;
                default: return '';
            }
        };

        //Clear $scope.aUsers
        function resetAUsers () {
            $scope.aUsers = {};
            $scope.aUsers.email = "";
            $scope.aUsers.password = "";
            selected = [];
            $scope.confirmPassword = {};

            //Uncheck all checkboxes and radio
            var checkboxes = document.getElementsByTagName('input');    
            for (var i = 0; i < checkboxes.length; i++){
                if(checkboxes[i].type == 'checkbox' || checkboxes[i].type == 'radio'){
                    checkboxes[i].checked = false;
                }
            }
        }
 
        // get realtime changes
        socket.on('userChange', function(){
            initController();
        });

        initController();
 
        function initController() {
            // get current user
            UserService.GetAll().then(function (user) {
                vm.user = user;
                $scope.allUsers = user;
                $scope.userLength = Object.size(user);
            }).finally(function() {
				$scope.loading = false;
			});
        }

        $scope.id = "";
        $scope.fields = [];
        $scope.name = 'user';
		
        function getAllFields(){
			
            FieldsService.GetAll($scope.name).then(function(response){
    
               $scope.fields = response.fields;
               $scope.id = response._id;
              
               $scope.fieldsLength = Object.size(response.fields);
                
            }).catch(function(err){
                alert(err.msg_error);
            });
        };
        
        getAllFields();

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

        /*
            Function name: Array remove element function
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/24
            Description: Remove and element in an array
            Parameter(s): none
            Return: size
        */
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

        /*
            Function name: Get all checkbox elements
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/31
            Description: Get all checkbox elements and set dynamic temporary variables for checked items
            Parameter(s): none
            Return: none
        */
        var selected = [];
        var checkboxFields = [];
        var selectedLength = 0;
        $scope.declareSelected = function(){
            $scope.showMainFlash = false;
            checkboxFields = document.getElementsByName("checkBoxInput");
            for(var i=0;i<checkboxFields.length;i++){
                selected[checkboxFields[i].className] = [];
                selectedLength++;
            }
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
                return isChecked;
            }
        };

        $scope.isRadioSelected = function(field_name, option, type){
            if(type == 'radio'){
                if($scope.aUsers[field_name] == undefined) $scope.aUsers[field_name] = [];
                var isChecked = ($scope.aUsers[field_name].indexOf(option) != -1) ? true : false;
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
            if(checkedOption[0].checked){
                selected['checkBoxAdd '+fieldName].push(option);
            }else{
                selected['checkBoxAdd '+fieldName].remove(option);
            }
            $scope.aUsers[fieldName] = selected['checkBoxAdd '+fieldName];
        };

        /*
            Function name: Insert checkbox checked values to
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check all password inputs in edit modal
            Parameter(s): field.name, checkbox element
            Return: none
        */
        $scope.pushEditToAUsers = function(fieldName, option){

            var checkedOption = document.getElementsByName('edit '+option);
            //console.log(option+' field is '+checkedOption.checked);
            if(checkedOption[0].checked){
                selected['checkBoxAdd '+fieldName].push(option);
            }else{
                selected['checkBoxAdd '+fieldName].remove(option);
            }

            $scope.aUsers[fieldName] = selected['checkBoxAdd '+fieldName];
        };


        /*
            Function name: Add User Function
            Author(s): Sanchez, Macku
            Date Modified: January 2018
            Description: Adds New User and Assigns a Temporary Password to the New User
        */
        $scope.addUser = function(){
            
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 10; i++){
                $scope.aUsers.password += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            $scope.showAddFlash = true;

            var requiredTextField=0;
            var forDataBase=0;


            for(var h in $scope.fields){
                if($scope.fields[h].required==true){
                    requiredTextField++;
                    if($scope.aUsers[$scope.fields[h].name]===undefined){
                        FlashService.Error("Please input all the required the fields");
                        break;
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
                    $scope.showAddFlash = false;
                    UserService.Insert($scope.aUsers)
                        .then(function () {
                                initController();
                                $('#myModal').modal('hide');
                                FlashService.Success('User Added');
                                resetModalFlash();
                                resetAUsers();
                            }).catch(function (error) {
                                $scope.showAddFlash = true;
                                FlashService.Error(error);
                            });
                            initController();
                             
                            
                }
            }

            // Clear $scope.aUsers

            /* 
            var checkEmpField=0;
            var tempArray=[];
            var indexNum=0;
            var checkField=0;
            for(var b in $scope.aUsers){
                checkEmpField++;
            }
               
            if(checkEmpField<$scope.fields.length){
                FlashService.Error("Please Input all the fields");
            }else{
                for(var x in $scope.aUsers){
                    tempArray=Object.entries(Object.entries($scope.aUsers)[indexNum])[1];
                    if(tempArray[1]===""){
                        indexNum++;
                        checkField++;
                    }else{
                        indexNum++;
                    }
                }
                if(checkField>0){
                    FlashService.Error("Please Input all the textfields");
                }else{
                    UserService.Insert($scope.aUsers)
                    .then(function () {
                            initController();
                            resetAUsers();
                            FlashService.Success('User Added');
                        }).catch(function (error) {
                            FlashService.Error(error);
                        });
                        resetAUsers();
                        initController(); 

                }
            }
           


                /*var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < 10; i++){
                    $scope.aUsers.password += possible.charAt(Math.floor(Math.random() * possible.length));
                }*/
                /*UserService.Insert($scope.aUsers)
                    .then(function () {
                            initController();
                            FlashService.Success('User Added');
                        }).catch(function (error) {
                            FlashService.Error(error);
                        });
                        initController();*/ 

                //}
        };

        $scope.clearField = function(){
            resetAUsers();
        }

        //filter function for pagination indexes
        function filterIndexById(input, id) {
            var i=0, len=Object.size(input);
            for (i=0; i<len; i++) {
                if (input[i]._id == id) {
                    return input[i];
                }
            }
        }

        $scope.editUser = function(index){
            $scope.btnchc = "Edit";
            $scope.shw = false;
            $scope.aUsers = angular.copy(filterIndexById($scope.allUsers, index));
        };
		
		vm.cancelEdit = function() {
			
			$scope.aUsers = {};			
			initController();
		}
		
		/*
            Function name: Update User Function
            Author(s): Sanchez, Macku
            Date Modified: January 2018
            Description: Update User
        */
		vm.updateUser = function() {
            $scope.aUsers.password="qwe";
            var requiredTextField=0;
            var forDataBase=0;

            $scope.showEditFlash = true;
            for(var h in $scope.fields){
                if($scope.fields[h].required==true){
                    requiredTextField++;
                    if($scope.aUsers[$scope.fields[h].name]===undefined){
                        FlashService.Error("Please input all the required the fields");
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
                    delete $scope.aUsers.password;
                    UserService.Update($scope.aUsers)
                        .then(function () {
                            initController();
                            $scope.btnchc = "Edit";
                            $scope.shw = false;
                            $('#editModal').modal('hide');
                            FlashService.Success('User updated');
                        }).catch(function (error) {
                            FlashService.Error(error);
                        }); 
                        $scope.btnchc = "Edit";
                        $scope.shw = false;
                        resetAUsers();
                        resetModalFlash();
                }
            }

            /*var checkEmpField=0;
            var tempArray=[];
            var indexNum=0;
            var checkField=0;
            for(var b in $scope.aUsers){
                checkEmpField++;
            }   
            if(checkEmpField<$scope.fields.length){
                FlashService.Error("Please Input all the fields");
            }else{
                for(var x in $scope.aUsers){                   
                    tempArray=Object.entries(Object.entries($scope.aUsers)[indexNum])[1];
                    if(tempArray[1]===""){
                        indexNum++;
                        checkField++;
                    }else{
                        indexNum++;
                    }
                }
                if(checkField>0){
                    FlashService.Error("Please Input all the textfields");
                }else{
                    UserService.Update($scope.aUsers)
                        .then(function () {
                            initController();
                            resetAUsers();
                            $scope.btnchc = "Edit";
                            $scope.shw = false;
                            FlashService.Success('User updated');
                        }).catch(function (error) {
                            FlashService.Error(error);
                        });
                        resetAUsers(); 
                        $scope.btnchc = "Edit";
                        $scope.shw = false;

                }
            }*/
        }		
		
		/*
            Function name: Delete User Function
            Author(s): Sanchez, Macku
            Date Modified: January 2018
            Description: Delet eUser
        */
		vm.deleteUser = function(index) {
			
			
			 var toDel = filterIndexById($scope.allUsers, index);
        

            if (confirm("Are you sure to delete this user?")){
				
             UserService.Delete(toDel._id)
                 .then(function () {
					resetModalFlash();
                    FlashService.Success('User Deleted');
                    socket.emit('userChange');
					 
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
            }
        }


        vm.enableEditing = function() {
            $scope.btnchc = "Save";
            $scope.shw = true;
            
        }

         vm.restart = function() {
            $scope.btnchc = "Edit";
            $scope.shw = false;
            initController();
            resetAUsers();
            resetModalFlash();
            $scope.showMainFlash = false;
        }

    }
 
})();