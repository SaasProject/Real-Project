/*
    Name: Field Controller
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
        .controller('Fields.IndexController', Controller)
 
    function Controller($scope, $rootScope, FieldsService, $stateParams, FlashService, socket) {
        //current document variables
        $scope.id = "";
        $scope.fields = [];

        //model for form
        $scope.newField = {
            name: "",
            required: false,
            type: "text",
            options:{}
        };
        //name of document . defaults to user
        $scope.name = "user";

        //current index of field selected. defaults to -1
        $scope.index = -1;
        
        $scope.editable = false;
        $scope.fieldOptions = "";
        $scope.OptionsArray = {};

        //show text area if dropdown is selected
        var e = document.getElementById("inputType");
        var selected = e.options[e.selectedIndex].text;

        var textAreaValues = document.getElementById("fieldValues").value;

        /*
            Function name: Enable Text Area
            Author(s): 
                    Flamiano, Glenn
                    Reccion, Jeremy
            Date Modified: 03/13/2018
            Description: Show text area when dropdown, checkbox, or radio field type is selected
            Parameter(s): none
            Return: none
        */
        $scope.enableTextArea = function(){
            selected = e.options[e.selectedIndex].value;

            //console.log(selected);
            
            if(selected == 'dropdown' || selected == 'checkbox' || selected == 'radio'){
                $scope.editable = true;
            }else{
                $scope.editable = false;
            }
            $scope.fieldOptions = "";
        };

        /*
            Function name: Fields getter
            Author(s): Reccion, Jeremy
            Date Modified: 03/13/2018
            Description: Gets array of fields in 'fields' collection by name
            Parameter(s): none
            Return: none
        */
        $scope.getAllFields = function(){
			
            $scope.newField = {
                name: "",
                required: false,
                type: "text"
            };
            
            FieldsService.GetAll($scope.name).then(function(response){
                //console.log(response);
                $scope.fields = response.fields;
                $scope.id = response._id;
			
            }).catch(function(){
                //db error
                FlashService.Error($rootScope.selectedLanguage.fields.flashMessages.dbError);
            });
        };
		
		
		//function for sorting  fields
		$scope.sortableOptions = {
			axis: 'y',
            update: function(e, ui) {
                console.log($scope.fields);
				
				FieldsService.Update($scope.id, $scope.fields).then(function(){
                        //alert('sorted');
						//FlashService.Success('Fields successfully updated');
                      
                    }).catch(function(){
                        //db error
                        FlashService.Error($rootScope.selectedLanguage.fields.flashMessages.dbError);
                    });
            },
            
        };
		
        
        // get realtime changes
        socket.on('fieldsChange', function(){
            $scope.getAllFields();
        });

        $scope.getAllFields();

        /*
            Function name: Add or Update field
            Author(s): 
                        Flamiano, Glenn
                        Reccion, Jeremy
            Date Modified: 03/13/2018
            Description: one function for adding or updating a field. add/update can be determined by $scope.index
            Parameter(s): none
            Return: Array
        */
        $scope.addUpdateField = function(){
            //check for blank field name
            if($scope.newField.name == ""){
                FlashService.Error($rootScope.selectedLanguage.fields.flashMessages.empty);
            }
            else{
                if($scope.fieldOptions != ''){
                    $scope.OptionsArray = $scope.fieldOptions.split(',');
                }

                var foundDuplicate = false;
                //if $scope.index = -1, field is to be added. therefore, check for duplicates
                if($scope.index == -1){
                    for(var i=0;i<$scope.fields.length;i++){
                        if($scope.newField.name.toLowerCase() === $scope.fields[i].name.toLowerCase()){
                            foundDuplicate = true;
                            break;
                        }
                    }
                }
                
                if(foundDuplicate){
                    FlashService.Error($rootScope.selectedLanguage.fields.flashMessages.exists);
                }
                else{
                    if($scope.editable && $scope.fieldOptions == ''){
                        FlashService.Error($rootScope.selectedLanguage.fields.flashMessages.noOptions);
                    }else{
                        $scope.newField.options = $scope.OptionsArray;
                        //for add
                        if($scope.index == -1){
                            $scope.fields.push($scope.newField);
                        }
                        //for update
                        else{
                            angular.copy($scope.newField, $scope.fields[$scope.index]);
                        }
                        //use Update since the fields array in the specified document will be changed
                        FieldsService.Update($scope.id, $scope.fields).then(function(){
                            //alert(response.msg_success);
                            FlashService.Success($rootScope.selectedLanguage.fields.flashMessages.added);
                            
                            //reset variables
                            $scope.newField = {
                                name: "",
                                required: false,
                                type: "text",
                                options: {}
                            };
                            $scope.index = -1;
                            $scope.editable = false;
                            $scope.OptionsArray = {};
                            $scope.fieldOptions = "";
                            socket.emit('fieldsChange')
                        }).catch(function(){
                            //db error;
                            FlashService.Error($rootScope.selectedLanguage.fields.flashMessages.dbError);
                        });
                    }
                }
            }
        };   

        /*
            Function name: Edit field
            Author(s): 
                        Flamiano, Glenn
                        Reccion, Jeremy
            Date Modified: 02/26/2018
            Description: prepares the selected field to be edited
            Parameter(s): index
            Return: Array
        */
        $scope.editField = function(index){
            //index of the selected field in the array
            $scope.index = index;

            //use copy to avoid binding 
            angular.copy($scope.fields[index], $scope.newField);

            if($scope.fields[index].type == 'dropdown' || $scope.fields[index].type == 'checkbox' || $scope.fields[index].type == 'radio'){
                $scope.editable = true;
                $scope.fieldOptions = String($scope.fields[index].options);
            }else{
                $scope.editable = false;
                $scope.fieldOptions = "";
            }
        }
        
        /*
            Function name: Remove field
            Author(s): 
                        Flamiano, Glenn
                        Reccion, Jeremy
            Date Modified: 03/13/2018
            Description: delete the field from the field array
            Parameter(s): none
            Return: Array
        */
        $scope.removeField = function(index){
            if(confirm($rootScope.selectedLanguage.fields.flashMessages.confirmDelete1 + $scope.fields[index].name + $rootScope.selectedLanguage.fields.flashMessages.confirmDelete2)){
                //use splice to remove from array
                $scope.fields.splice(index, 1);
                //reset $scope.index
                $scope.index = -1;
                FieldsService.Update($scope.id, $scope.fields).then(function(){
                    //alert(response.msg_success);
                    FlashService.Success($rootScope.selectedLanguage.fields.flashMessages.deleted);
                    $scope.editable = false;
                    $scope.fieldOptions = "";
                    socket.emit('fieldsChange');
                }).catch(function(){
                    //db error
                    FlashService.Error($rootScope.selectedLanguage.fields.flashMessages.dbError);
                });
            }
        };

        /*
            Function name: reset flash message
            Author(s): Reccion, Jeremy
            Date Modified: 03/14/2018
            Description: removes the flash message when a change in the dropdown occurs
            Paramter(s): field (String)
            Return: boolean
        */
        $scope.resetFlash = function(){
            //$rootScope.flash.show = false;
            FlashService.Reset();
        }

        /*
            Function name: Removable field logic
            Author(s): Reccion, Jeremy
            Date Modified: 02/07/2018
            Description: explicitly state all fields per module that are not removable / customizable
            Paramter(s): field (String)
            Return: boolean
        */
        $scope.isRemovable = function(field){
            switch($scope.name){
                case 'user': {
                    return (field != 'email' && field != 'password' && field != 'firstName' && field != 'lastName' && field != 'role') ? true : false;
                } break;
                case 'asset': {
                    return (field != 'asset_tag' && field != 'location' && field != 'type') ? true : false;
                }break;
                case 'rfid_scanner': {
                    return (field != 'device_id' && field != 'location') ? true : false;
                }break;
                case 'warehouse': {
                    return (field != 'name' && field != 'capacity') ? true : false;
                }
                default: return true; break;
            }
        }
    }
})();