/*
    Name: Asset Controller
    Date Created: 01/03/2018
    Author(s): Ayala, Jenny
               Flamiano, Glenn
               Omugtong, Jano
               Reccion, Jeremy
    
 */

(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('Asset.IndexController', Controller)
        /*
            Function name: Custom pagination filter
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: removes assets from the table after the start index
            Parameter(s): none
            Return: Array
        */
        .filter('pagination', function(){
            return function(data, start){
                //data is an array. slice is removing all items past the start point
                return data.slice(start);
            };
        });
 
    function Controller($window, AssetService, FlashService, $scope, $interval, $filter, DeviceService, socket, FieldsService, WarehouseService, $stateParams) {
 
        /* Initialization of scope variables */
		
		$scope.loading = true;

        //asset variables
        $scope.newAsset = {};
        $scope.assets = [];
        $scope.type = "add";
		$scope.isNull = false;
		$scope.readOnly = true;

        //fields variable
        $scope.fields = [];

        //pagination variables
        $scope.currentPage = 1;
        $scope.pageSize = 5;

        //sort variables
        $scope.reverse = false;
        $scope.sortColumn = "tag";

        //filter/search variables
        $scope.searchColumn = "";
        $scope.searchDate = null;
        $scope.search = {};
        $scope.filtered_assets = {};
        //$scope.format = "yyyy-MM-dd";

        //CSV variables
        $scope.reportColumns = [];

        //confirm passwords all inputs
        $scope.confirmPassword = {};


        // initialize modal flash message display
        function resetModalFlash(){
            $scope.showMainFlash = true;
            $scope.showAddFlash = false;
        }
        resetModalFlash();
		
		// function to convert object to array
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
        
        /*
            Function name: Get All fields
            Author(s):  Flamiano, Glenn
                        Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: gets all fields to be used in Assets Page
            Parameter(s): none
            Return: none
        */
		function getAllFields(){
			
		  FieldsService.GetAll("asset").then(function(response){
				$scope.fields = response.fields;
                $scope.id = response._id;
				$scope.fieldsLength = Object.size(response.fields);
								
			}).catch(function(err){
				alert(err.msg_error);
            });
        };
        

        //call this function to get all fields when Assets page is loaded
        getAllFields();
        
        //check if the url has asset_tag parameter. this is executed upon loading of asset page
        if($stateParams.asset_tag){
            //console.log('asset_tag query', $stateParams.asset_tag)
            $scope.searchColumn = 'asset_tag';
            $scope.search['asset_tag'] = $stateParams.asset_tag;

            //forcibly remove modal backdrop when moving from warehouse modal to asset page via link
            //since there is no flag to determine if a modal is open, this will always execute
            $('.modal-backdrop').hide();
        }
		
		
        /*
            Function name: CSV - filename
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: Sets the filename to 'Asset Report' with the current date and time of download
            Parameter(s): none
            Return: String
        */
        $scope.setFilename = function(){
            return "Asset Report " + $filter('date')(new Date(), "yyyy-MM-dd h:mm a");
        };

        /*
            Function name: CSV - assets
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: checks the value of each asset per each field. if the value is undefined, it is replaced by ' - '
            Parameter(s): none
            Return: Array
        */
        $scope.getFilteredAssets = function(){

            var temp = [];      //store $scope.filtered_assets to avoid any changes
            var temp2 = [];     //store processed list of assets
            var tempObj = {};   //store currently processed asset

            //use angular.copy to avoid changes in binding
            angular.copy($scope.filtered_assets, temp); 
            
            //when user does not select anything in the Generate Report modal, return all field names
            if($scope.reportColumns.length == 0){
                $scope.reportColumns = $scope.fields.map(function(x){
                    return x.name;
                });
                /* angular.forEach($scope.fields, function(value, key){
                    $scope.reportColumns.push(value.name);
                }); */
            }

            //use nested angular.forEach to process each value of each asset
            //value = asset object
            //value2 = asset[field.name]
            angular.forEach(temp, function(value, key){
                angular.forEach($scope.reportColumns, function(value2, key2){
                    tempObj[value2] = (value[value2] != undefined) ? value[value2] : " - ";
                });

                temp2.push(tempObj);
                tempObj = {};
            });
            return temp2;
        };

        /*
            Function name: CSV - column headers and column order
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: gets the fields selected by the user to enable column headers in the CSV file
            Paramter(s): none
            Return: Array
        */
        $scope.getColumns = function(){
            var temp = []; //store processed fields

            //when user does not select anything in the Generate Report modal, return all field names
            if($scope.reportColumns.length == 0){
                $scope.reportColumns = $scope.fields.map(function(x){
                    return x.name;
                });
            }

            /* console.log($scope.reportColumns);
            angular.forEach($scope.reportColumns, function(value, key){
                temp.push(value);
            }); */

            //use angular.copy to avoid binding changes
            angular.copy($scope.reportColumns, temp);

            return temp;
        };

        /*
            Function name: CSV - reset report columns
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: when 'Generate Report' is clicked, it resets the selected fields to be included in the report
            Parameter(s): none
            Return: none
        */
        $scope.resetReportColumns = function(){
            $scope.reportColumns = [];
        };

        /*
            Function name: Sorting - sorted column and order
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: sets the column to be sorted and its order
            Parameter(s): column (String)
            Return: none
        */
        $scope.setTo = function(column){

            //when switching columns, sort in ascending order.
            $scope.reverse = (column != $scope.sortColumn) ? false : !$scope.reverse;
            $scope.sortColumn = column;  
        };

        //added by Glenn Add Arrow sort in table column
        $scope.sortClass = function(column){
            if($scope.sortColumn == column){
                if($scope.reverse){
                    return 'arrow-down'; 
                }else{
                    return 'arrow-up';
                }
            }else{
                return 'arrow-dormant';
            }
        }; 
        ////////////////////////////////////////////////////////
        /*
            Function name: $watch functions for sort & search
            Author(s): Reccion, Jeremy
            Date Modified: 02/13/2018
            Description: when specific scope variables change, it filters and sorts the table in html
            Paramter(s): none
            Return: none
        */
        //var counter = 0;
        $scope.$watch('searchDate', function(){
            //valid date format (from datepicker)
            if($scope.searchDate != null && $scope.searchDate != undefined){
                $scope.search['updated_date'] = $filter('date')(new Date($scope.searchDate), "yyyy-MM-dd");
            }
            //to avoid emptying the asset when the datepicker has no value
            else if($scope.searchDate == null){
                delete $scope.search['updated_date'];
            }
        });
        $scope.$watchGroup(['sortColumn', 'reverse'], function(){evalAssets();});
        $scope.$watchCollection('assets', function(){evalAssets();});
        $scope.$watchCollection('search', function(){evalAssets();});

        function evalAssets(){
            //console.log('Times evalAssets() was fired: ', counter++);
            //call $eval to execute search and sort commands
            $scope.filtered_assets = $scope.$eval("assets | filter: search | orderBy: sortColumn : reverse ");
        }
        ////////////////////////////////////////////////////////

        // get realtime changes
        socket.on('assetChange', function(){
            getAllAssets();
            $scope.searchColumn = "";
            $scope.searchDate = null;
            $scope.search = {};
        });

        /*
            Function name: Get all assets
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: retrieves all assets from the database
            Paramter(s): none
            Return: none
        */
        function getAllAssets(){
            //get all assets
            AssetService.GetAll().then(function(assets){
                if(assets.length > 0){               
                    //store to array
                    $scope.assets = assets;
                }
                else{
                    //perform notification here
                    FlashService.Error("No assets found");
                }
            })
            .catch(function(error){
                errorFunction(error);
            }).finally(function() {
				$scope.loading = false;
			});
        }

        /*
            Function name: getAllWH
            Author(s): Ayala, Jenny
			Date modified: 2-6-2018
			Description: get all data for warehouse
		*/
		function getAllWH() {
            WarehouseService.getAllWarehouse().then(function (warehouse) {
                $scope.warehouses = warehouse;
                $scope.warehouseLength = Object.size(warehouse);
            }).finally(function() {
				$scope.loading = false;
			});
        }

        //get all assets & warehouses when controller is first loaded
        getAllAssets();
        getAllWH();

        
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

        /*Function name: Array remove element function
        / author: glenn.flamiano
        / date created: 2018/01/24
        / date modified: 2018/01/24
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

        /*Function name: Insert date to $scope.newAsset
        / author: glenn.flamiano
        / date created: 2018/01/25
        / date modified: 2018/01/25
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

        $scope.pushDateToAAssets = function(fieldName, inputDate) {
            $scope.newAsset[fieldName] = formatDate(inputDate);
        };

        /*Function name: Check all email inputs
        / author: glenn.flamiano
        / date created: 2018/01/25
        / date modified: 2018/01/25
        / return: boolean
        */
        function checkEmails(){
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var myRows = document.getElementsByName('email');
            var allValid = true;
            for(var i=0;i<myRows.length;i++){ 
                if(myRows[i].value != ''){
                    if(!re.test(myRows[i].value.toLowerCase())){
                        allValid = false;
                    }
                }
            } 
            return allValid;
        };

        /*Function name: Check all number inputs
        / author: glenn.flamiano
        / date created: 2018/01/26
        / date modified: 2018/01/26
        / return: boolean
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

        /*Function name: Check password characters
        / author: glenn.flamiano
        / date created: 2018/01/26
        / date modified: 2018/01/26
        / return: number
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

        /*Function name: Check all password inputs
        / author: glenn.flamiano
        / date created: 2018/01/26
        / date modified: 2018/01/26
        / return: boolean
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

        $scope.putToModel = function(option, fieldName){
            //console.log(option);
            $scope.newAsset[fieldName] = option;
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
                    if($scope.confirmPassword[currentField.name] == undefined){
                        $scope.confirmPassword[currentField.name] = '';
                    }
                    if($scope.newAsset[currentField.name] != $scope.confirmPassword[currentField.name]){
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
                if($scope.newAsset[field_name] == undefined) $scope.newAsset[field_name] = [];
                var isChecked = ($scope.newAsset[field_name].indexOf(option) != -1) ? true : false;
                return isChecked;
            }
        };

        $scope.isRadioSelected = function(field_name, option, type){
            if(type == 'radio'){
                //console.log(type);
                if($scope.newAsset[field_name] == undefined) $scope.newAsset[field_name] = [];
                var isChecked = ($scope.newAsset[field_name].indexOf(option) != -1) ? true : false;
                return isChecked;
            }
        };

        /*
            Function name: Insert checkbox checked values to
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/31
            Description: Check all password inputs in add modal
            Parameter(s): field.name, checkbox element
            Return: none
        */
        $scope.pushToAAssets = function(fieldName, option){
            var checkedOption = document.getElementsByName(option);
            if(checkedOption[0].checked){
                selected['checkBoxAdd '+fieldName].push(option);
            }else{
                selected['checkBoxAdd '+fieldName].remove(option);
            }

            $scope.newAsset[fieldName] = selected['checkBoxAdd '+fieldName];
        };

        /*$scope.pushEditToAAssets = function(fieldName, option){
            //console.log('pushed '+fieldName+' '+option);
            //selected.push(option);

            var checkedOption = document.getElementById('edit '+option);
            //console.log(option+' field is '+checkedOption.checked);
            if(checkedOption.checked){
                selected.push(option);
            }else{
                selected.remove(option);
            }

            //console.log('Selected options', selected);
            $scope.newAsset[fieldName] = selected;
        };*/

        /*
            Function name: Asset - add
            Author(s):  Flamiano, Glenn
                        Reccion, Jeremy
            Date Modified: 2018/02/08
            Description: performs validation when adding an asset. Serves also has function to toggle readonly property
            Paramter(s): none
            Return: none
        */
        $scope.addOrUpdateAsset = function(){
            
			if($scope.type == "add"){
				for (var i = 0; i < $scope.fieldsLength; i++){
                    if ($scope.newAsset[$scope.fields[i].name] == undefined){
                        if($scope.fields[i].required){
                            $scope.isNull = true;
                        }
                        else{
                            $scope.newAsset[$scope.fields[i].name] = "";
                        }
                    }
                }

				if($scope.isNull) {
                    $scope.showAddFlash = true;
				    FlashService.Error('Please fill up the required textfields');
				    //$scope.newAsset = {};
				    $scope.isNull = false;
				} else {
                    $scope.showAddFlash = true;
                    if(!checkEmails()){
                        FlashService.Error("Please Input valid email");
                    }else if(!checkNumbers()){
                        FlashService.Error("Please Input numbers only to number fields");
                    }else if(!checkPasswords()){
                        FlashService.Error("Passwords should contain lowercase, uppercase, numbers and at least 8 characters");
                    }else if(!checkConfirmPasswords()){
                        FlashService.Error("Confirm password/s does not match");
                    }else{
                        $scope.newAsset.created_date = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
                        $scope.newAsset.updated_date = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");                        
                        AssetService.addAsset($scope.newAsset).then(function(){
                        //  get all assets to refresh the table
                        $('#myModal').modal('hide');
                        FlashService.Success('Asset Added');
                        $scope.newAsset = {};
                        socket.emit('assetChange');
                        })
                        .catch(function(error){
                            errorFunction(error);
                        });
                        resetModalFlash();
                    }
                    $scope.confirmPassword = {};
				}
			} else {
				$scope.readOnly = false;					
			}
          
        };
		
		
		
		 $scope.saveUpdate = function(){
			for (var i = 0; i < $scope.fieldsLength; i++){
                //console.log($scope.newAsset[$scope.fields[i].name]);
				if ($scope.newAsset[$scope.fields[i].name] == undefined){
                    if($scope.fields[i].required){
                        $scope.isNull = true;
                        break;
                    }
                    else{
                        $scope.newAsset[$scope.fields[i].name] = "";
                    }
				}
			}
			
			if($scope.isNull) {
                    $scope.showAddFlash = true;
					FlashService.Error('Please fill up the required textfields');
					//$scope.newAsset = {};
					$scope.isNull = false;
					
			} else {
                    $scope.showAddFlash = true;
                    if(!checkEmails()){
                        FlashService.Error("Please Input valid email");
                    }else if(!checkNumbers()){
                        FlashService.Error("Please Input numbers only to number fields");
                    }else if(!checkPasswords()){
                        FlashService.Error("Passwords should contain lowercase, uppercase, numbers and at least 8 characters");
                    }else if(!checkConfirmPasswords()){
                        FlashService.Error("Confirm password/s does not match");
                    }else{
                        $scope.newAsset.updated_date = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");                        
                            AssetService.updateAsset($scope.newAsset).then(function(){
                            $('#myModal').modal('hide');
                            FlashService.Success('Asset Updated');
                            $scope.newAsset = {};
                        socket.emit('assetChange');
                        })
                        .catch(function(error){
                            errorFunction(error);
                        });
                        resetModalFlash();
                    }
                    $scope.confirmPassword = {};
			} 
        };

        /*
            Function name: Asset - edit
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: sets the asset to be edited
            Paramter(s): asset (Object)
            Return: none
        */
        $scope.editModal = function(asset){
			$scope.readOnly = true;
            $scope.type = "edit";

            //copy instead of assigning to new asset to avoid binding (changes text as you type)
            angular.copy($scope.assets[$scope.assets.indexOf(asset)], $scope.newAsset);
        };

        /*
            Function name: Modal - reset scope variables
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: Since 1 modal is used in adding or updating, reset them when 'Add New' button is clicked
            Paramter(s): none
            Return: none
        */
        $scope.resetModal = function(){
            $scope.type = "add";
            $scope.newAsset = {};
            selected = [];
        };		

        /*
            Function name: Asset - delete
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: deletes asset from the database
            Paramter(s): asset (Object)
            Return: none
        */
		$scope.deleteAsset = function(asset) {
            
            if (confirm("Are you sure to delete asset " + asset['asset_tag'] + "?")){
				AssetService.Delete(asset._id).then(function () {
                    resetModalFlash();
                    FlashService.Success('Asset Deleted');
                    socket.emit('assetChange');
                })
                .catch(function(error){
                    errorFunction(error);
                });
            }
        };

        $scope.restart = function() {
            resetModalFlash();
            $scope.showMainFlash = false;
        }

        function errorFunction(error){
            if(error.code == 11000){
                FlashService.Error('Tag already exists');
            }
            else if(error.name == 'ValidationError'){
                FlashService.Error(error.message);
            }
            else{
                FlashService.Error(error);
            }
        }
    };

    
})();