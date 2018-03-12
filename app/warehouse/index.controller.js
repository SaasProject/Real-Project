/*
    Name: Warehouse Controller
    Date Created: 02/06/2018
    Author(s): Ayala, Jenny
               Flamiano, Glenn  
*/

(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('ManageWarehouses.IndexController', Controller)

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
 
    function Controller(WarehouseService, AssetService, $scope, FlashService, FieldsService, socket) {
        var vm = this;
		
		// Scope for data
        $scope.warehouses = [];
		$scope.whouse = {};
		
        $scope.formValid = true;
        $scope.unEditAble = false;
		$scope.loading = true;
		$scope.viewModal = false;
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
      

        /*
            Function name: Reset Flash Messages
            Author(s): Flamiano, Glenn
            Date Modified: February 2018
            Description: Hide flash messages of every modal
            Parameter(s): none
            Return: none
        */
        function resetModalFlash(){
            $scope.showMainFlash = true;
            $scope.showAddFlash = false;
            $scope.showEditFlash = false;
        }
        resetModalFlash();

		
   /***** Table functions *****/
		
		// initialize table page
        $scope.currentPage = 1;
        $scope.pageSize = 10;
        
        // column to sort, default is warehouse name
        $scope.column = 'name';

        // sort ordering(Ascending/Descending). Set true for descending
        $scope.reverse = false; 

        /*
            Function name: Sort Table Columns
            Author(s): Flamiano, Glenn
            Date Modified: December 2018
            Description: To sort the table by ascending/desending order by clicking the column header
            Parameter(s): column
            Return: none
        */
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

        /*
            Function name: Sort Class
            Author(s): Flamiano, Glenn
            Date Modified: December 2018
            Description: To change column sort arrow UI when user clicks the column
            Parameter(s): column
            Return: none
        */
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
		
    /***** End of Table Functions *****/
		

        /*
            Function name: Set column width
            Author(s): Flamiano, Glenn
            Date Modified: December 2018
            Description: To set the fixed with of the specific columns in the table
            Parameter(s): none
            Return: none
        */
        $scope.setWidth = function(column){
            switch(column){
                case "name": return 'col-sm-2'; break;
                case "capacity": return 'col-sm-3'; break;
             //   case "location": return 'col-sm-3'; break;
                default: return '';
            }
        };

        //Clear
        function resetScope() {
            $scope.whouse = {};
            $scope.confirmPassword = {};

            //Uncheck all checkboxes and radio
            var checkboxes = document.getElementsByTagName('input');    
            for (var i = 0; i < checkboxes.length; i++){
                if(checkboxes[i].type == 'checkbox' || checkboxes[i].type == 'radio'){
                    checkboxes[i].checked = false;
                }
            }
        }
		
		
		/*
			Function name: getFields
			Date modified: 2-6-2018
			Description: get all fields for the warehouse model
		*/
		function getFields() {
			FieldsService.GetAll('warehouse').then(function(response){
               $scope.fields = response.fields;
               $scope.id = response._id;
               $scope.fieldsLength = Object.size(response.fields); 			   
            })
			.catch(function(err){
                alert(err.msg_error);
            });
		}
		getFields();
		
		
		/*
			Function name: getAllWH
			Date modified: 2-6-2018
			Description: get all data for warehouse
		*/
		function getAllWH() {
            WarehouseService.getAllWarehouse().then(function (warehouse) {
                $scope.warehouses = warehouse;
                $scope.warehouseLength = Object.size(warehouse);
            
				/*** Function for getting asset count for each warehouse by getting all assets first then filtering ***/
				AssetService.GetAll().then(function (assets) {
					$scope.assets = assets;
					$scope.assetsLength = Object.size(assets);
					
					
					for(var i = 0; i < $scope.warehouseLength; i++) {
						var quantity = 0;
					
						for(var j = 0; j < $scope.assetsLength; j++) {
							if($scope.assets[j].location == $scope.warehouses[i].name)
								quantity++;
						}
						
						$scope.warehouses[i].quantity = quantity;
						
						if($scope.viewModal == true) {
							if($scope.whouse.name == $scope.warehouses[i].name) {
								$scope.whouse.quantity = $scope.warehouses[i].quantity;
							}
						}
					}
				
				});
				/*** End of function for getting asset count ***/
			
			}).finally(function() {
				$scope.loading = false;
			});
        }
		getAllWH();
		
		function getAssetUpdate(){
            
            AssetService.GetAll().then(function(assets) {
                    $scope.assets = assets;
                    $scope.assetsLength = Object.size(assets);

                    //loop warehouse
                    for (var i = 0; i<$scope.warehouseLength; i++){
                        var quantity = 0;
               

                        //loop assets then filter by warehouse
                        for (var j = 0; j<$scope.assetsLength; j++){
                            if ($scope.assets[j].location == $scope.warehouses[i].name){
                                quantity++;
                            }
                        }
                        $scope.warehouses[i].quantity = quantity;
						
						if($scope.viewModal == true) {
							if($scope.whouse.name == $scope.warehouses[i].name) {
								$scope.whouse.quantity = $scope.warehouses[i].quantity;
							}
						}
                    
                    }
                
            }).catch(function(error){
                FlashService.Error(error);
            })
        };
		
		
        // get realtime changess
        socket.on('whouseChange', function(){
            getAllWH();
        });
		socket.on('assetChange', function(){
            getAssetUpdate();
        });

 

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
            Description: To format a date and to be inserted
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
            Function name: Insert formatted date to $scope.whouse
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/25
            Description: To format a date and to be inserted to $scope.whouse
            Parameter(s): none
            Return: none
        */
        $scope.pushDateTowhouse = function(fieldName, fieldType, inputDate) {
            if(!$scope.unEditAble){
                if(fieldType == 'date'){
                    $scope.whouse[fieldName] = formatDate(inputDate);
                }
            }
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
            //for add/edit checkboxes
            checkboxFields = document.getElementsByName("checkBoxInput");
            for(var i=0;i<checkboxFields.length;i++){
                selected[checkboxFields[i].className] = [];
                selectedLength++;
            }
        };

        /*
            Function name: Insert radio button value to $scope.aUsers
            Author(s): Flamiano, Glenn
            Date Modified: February 2018
            Description: To insert radio button value to $scope.aUsers, it is called
                when radio button is checked
            Parameter(s): option, fieldName
            Return: none
        */
        $scope.putToModel = function(option, fieldName){
            //console.log(option);
            $scope.whouse[fieldName] = option;
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
                    if($scope.whouse[currentField.name] != $scope.confirmPassword[currentField.name]){
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
                //console.log(type);
                if($scope.whouse[field_name] == undefined) $scope.whouse[field_name] = [];
                var isChecked = ($scope.whouse[field_name].indexOf(option) != -1) ? true : false;
                return isChecked;
            }
        };

        /*
            Function name: isRadioSelected
            Author(s): Reccion, Jeremy
            Date Modified: 2018/01/31
            Description: Check an option of the radio button if checked
            Parameter(s): field.name, html input type
            Return: none
        */
        $scope.isRadioSelected = function(field_name, option, type){
            if(type == 'radio'){
                //console.log(type);
                if($scope.whouse[field_name] == undefined) $scope.whouse[field_name] = [];
                var isChecked = ($scope.whouse[field_name].indexOf(option) != -1) ? true : false;
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
        $scope.pushTowhouse = function(fieldName, option){
            //console.log('pushed '+fieldName+' '+option+' '+event);
            //selected.push(option);

            var checkedOption = document.getElementsByName(option);
            if(checkedOption[0].checked){
                selected['checkBoxAdd '+fieldName].push(option);
            }else{
                selected['checkBoxAdd '+fieldName].remove(option);
            }

            //console.log('Selected options', selected);
            $scope.whouse[fieldName] = selected['checkBoxAdd '+fieldName];
        };

        /*
            Function name: Insert checkbox checked values to
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check all password inputs in edit modal
            Parameter(s): field.name, checkbox element
            Return: none
        */
        $scope.pushEditTowhouse = function(fieldName, option){
            //console.log('pushed '+fieldName+' '+option);
            //selected.push(option);

            var checkedOption = document.getElementsByName('edit '+option);
            if(checkedOption[0].checked){
                selected['checkBoxAdd '+fieldName].push(option);
            }else{
                selected['checkBoxAdd '+fieldName].remove(option);
            }

            //console.log('Selected options', selected);
            $scope.whouse[fieldName] = selected['checkBoxAdd '+fieldName];
        };

        // added add function
        $scope.addWH = function(isValid){
            $scope.showAddFlash = true;
            for (var i = 0; i < $scope.fieldsLength; i++){
                if ($scope.fields[i].required && $scope.whouse[$scope.fields[i].name] == null){
                    $scope.formValid = false;
                }
            }
            if(!$scope.formValid){
                FlashService.Error('Please Fill up all the textfields');
                $scope.formValid = true;
            }else{
                if(!checkEmails()){
                    FlashService.Error("Please Input valid email");
                }else if(!checkNumbers()){
                    FlashService.Error("Please Input numbers only to number fields");
                }else if(!checkPasswords()){
                    FlashService.Error("Passwords should contain lowercase, uppercase, numbers and at least 8 characters");
                }else if(!checkConfirmPasswords()){
                    FlashService.Error("Confirm password/s does not match");
                }else{
                    WarehouseService.addWarehouse($scope.whouse)
                    .then(function () {
                        $('#myModal').modal('hide');
                        FlashService.Success('Warehouse Added');
                        socket.emit('whouseChange');
						
						resetScope();
						resetModalFlash();
                    })
                    .catch(function (error) {
                        errorFunction(error);
                    });
                  
                }  
            }
        };

      
        /*
            Function name: Filter Table Row by Index
            Author(s): Flamiano, Glenn
            Date Modified: January 2018
            Description: Retrieve specific table row by index
            Parameter(s): all table rows, index
            Return: none
        */
        function filterIndexById(input, id) {
            var i=0, len=Object.size(input);
            for (i=0; i<len; i++) {
                if (input[i]._id == id) {
                    return input[i];
                }
            }
        }

        $scope.editWH = function(index){
            $scope.unEditAble = true;
            $scope.whouse = angular.copy(filterIndexById($scope.warehouses, index));
			$scope.viewModal = true;
        };

        /*

        */
        vm.editAble = function(){
            $scope.unEditAble = false;
            //this is to initialize dropdowns that were added after adding warehouses
            //loop the fields to initialize value of a dropdown to the first item of its options if it is undefined
            angular.forEach($scope.fields, function(value, key){
                //initialize if the dropdown is required
                //when editing, non existing property may be undefined or ''
                if(value.type == 'dropdown' && value.required && ($scope.whouse[value.name] == undefined || $scope.whouse[value.name] == '')){                    
                        $scope.whouse[value.name] = value.options[0];
                }
            });
        };
		
		vm.cancelEdit = function() {
            $scope.viewModal = false;
			$scope.whouse = {};			
			getAllWH();
            resetModalFlash();
            $scope.showMainFlash = false;
		}
		
		
		vm.updateWH = function(isValid) {
            $scope.showEditFlash = true;
            for (var i = 0; i < $scope.fieldsLength; i++){
                if ($scope.fields[i].required && $scope.whouse[$scope.fields[i].name] == null){
                    $scope.formValid = false;
                }
                if ($scope.fields[i].required && $scope.whouse[$scope.fields[i].name] == ""){
                    $scope.formValid = false;
                }
            }

            if(!$scope.formValid){
                FlashService.Error('Please Fill up all the textfields');
                //resetwhouse();
                $scope.formValid = true;
            }else{
                if(!checkEmails()){
                    FlashService.Error("Please Input valid email");
                }else if(!checkNumbers()){
                    FlashService.Error("Please Input numbers only to number fields");
                }else if(!checkPasswords()){
                    FlashService.Error("Passwords should contain lowercase, uppercase, numbers and at least 8 characters");
                }else if(!checkConfirmPasswords()){
                    FlashService.Error("Confirm password/s does not match");
                }else{
                    WarehouseService.updateWarehouse($scope.whouse)
                        .then(function () {
							$scope.viewModal = false;							
                            $scope.whouse = {};
                            $('#editModal').modal('hide');
                            FlashService.Success('Warehouse Updated');
                            socket.emit('whouseChange');
							
							resetScope();
							resetModalFlash();
                    })
                    
                    .catch(function (error) {
                        errorFunction(error);
                    });
         
                }  
            }
        }		
        
        /*
            Name: modify dropdown 
            Author(s):
                    Reccion, Jeremy
            Date modified: 2018/03/06
            Descrption: initialize dropdown values if they are required
        */
        $scope.modifyDropdown = function(){
            //this is to initialize dropdowns that were added after adding assets
            //loop the fields to initialize value of a dropdown to the first item of its options if it is undefined
            angular.forEach($scope.fields, function(value, key){
                //initialize if the dropdown is required
                if(value.type == 'dropdown' && value.required){
                    $scope.whouse[value.name] = value.options[0];
                }
            });
        };

		//deleteUser function
		$scope.deleteWH = function(index) {
            
            var toDel = filterIndexById($scope.warehouses, index);

            if (confirm("Are you sure to delete " + toDel.name + "?")){
				
            WarehouseService.Delete(toDel._id)
                 .then(function () {
					resetModalFlash();
                    FlashService.Success('Successfully Deleted');
                    socket.emit('whouseChange');
					 
                })
                .catch(function (error) {
                    errorFunction(error);
                });
            }
        }

        function errorFunction(error){
            if(error.code == 11000){
                FlashService.Error('Warehouse already exists');
            }
            else if(error.name == 'ValidationError'){
                FlashService.Error(error.message);
            }
            else{
                FlashService.Error(error);
            }
        }
    }
 
})();