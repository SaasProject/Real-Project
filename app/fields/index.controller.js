(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('Fields.IndexController', Controller)
 
    function Controller($scope, $rootScope, FieldsService, $stateParams, FlashService, socket) {
        $scope.id = "";
        $scope.fields = [];

        $scope.newField = {
            name: "",
            required: false,
            type: "text",
            options:{}
        };
        $scope.name = "user";
        $scope.index = -1;
        $scope.editable = false;
        $scope.fieldOptions = "";
        $scope.OptionsArray = {};

        //show text area if dropdown is selected
        var e = document.getElementById("inputType");
        var selected = e.options[e.selectedIndex].text;

        var textAreaValues = document.getElementById("fieldValues").value;

        $scope.enableTextArea = function(){
            selected = e.options[e.selectedIndex].text;
            
            if(selected == 'dropdown' || selected == 'checkbox' || selected == 'radio'){
                $scope.editable = true;
            }else{
                $scope.editable = false;
            }
            $scope.fieldOptions = "";
        };

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
			
            }).catch(function(err){
                alert(err.msg_error);
            });
        };
		
		
		//function for sorting  fields
		$scope.sortableOptions = {
			axis: 'y',
            update: function(e, ui) {
                console.log($scope.fields);
				
				FieldsService.Update($scope.id, $scope.fields).then(function(response){
                        //alert('sorted');
						//FlashService.Success('Fields successfully updated');
                      
                    }).catch(function(err){
                        //alert(err.msg_error);
                        FlashService.Error(err.msg_error);
                    });
            },
            
        };
		
        
        // get realtime changes
        socket.on('fieldsChange', function(){
            $scope.getAllFields();
        });

        $scope.getAllFields();

        $scope.addUpdateField = function(){
            if($scope.newField.name == ""){
                FlashService.Error("Field must not be empty");
            }
            else{
                if($scope.fieldOptions != ''){
                    $scope.OptionsArray = $scope.fieldOptions.split(',');
                }

                var foundDuplicate = false;
                if($scope.index == -1){
                    for(var i=0;i<$scope.fields.length;i++){
                        if($scope.newField.name.toLowerCase() === $scope.fields[i].name.toLowerCase()){
                            foundDuplicate = true;
                            break;
                        }
                    }
                }
                
                if(foundDuplicate){
                    FlashService.Error("Field already exists");
                }
                else{
                    if($scope.editable && $scope.fieldOptions == ''){
                        FlashService.Error("Please input option values");
                    }else{
                        $scope.newField.options = $scope.OptionsArray;
                        if($scope.index == -1){
                            $scope.fields.push($scope.newField);
                        }
                        else{
                            angular.copy($scope.newField, $scope.fields[$scope.index]);
                        }

                        FieldsService.Update($scope.id, $scope.fields).then(function(response){
                            //alert(response.msg_success);
                            FlashService.Success('Fields successfully updated');
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
                        }).catch(function(err){
                            //alert(err.msg_error);
                            FlashService.Error(err.msg_error);
                        });
                    }
                }
            }
        };   
        
        $scope.editField = function(index){
            $scope.index = index;
            angular.copy($scope.fields[index], $scope.newField);
            if($scope.fields[index].type == 'dropdown' || $scope.fields[index].type == 'checkbox' || $scope.fields[index].type == 'radio'){
                $scope.editable = true;
                $scope.fieldOptions = String($scope.fields[index].options);
            }else{
                $scope.editable = false;
                $scope.fieldOptions = "";
            }
        }
        
        $scope.removeField = function(index){
            if(confirm("Are you sure you want to delete " + $scope.fields[index].name + "?")){
                $scope.fields.splice(index, 1);
                $scope.index = -1;
                FieldsService.Update($scope.id, $scope.fields).then(function(response){
                    //alert(response.msg_success);
                    FlashService.Success('Field successfully deleted');
                    $scope.editable = false;
                    $scope.fieldOptions = "";
                    socket.emit('fieldsChange');
                }).catch(function(err){
                    //alert(err.msg_error);
                    FlashService.Error(err.msg_error);
                });
            }
        };

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
                    return (field != 'device_id') ? true : false;
                }break;
                case 'warehouse': {
                    return (field != 'name' && field != 'capacity') ? true : false;
                }
                default: return true; break;
            }
        }
    }
})();