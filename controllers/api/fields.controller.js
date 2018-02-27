var express = require('express');
var router = express.Router();
var fieldsService = require('services/fields.service');

//declare routes that are to be called from the client (angular)
router.get('/:name', getAll);
router.put('/:id', update);

module.exports = router;

/*
        Function name: get all fields
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: get the fields from a specific name (e.g. user, asset, etc)
        Parameter(s): 
        Return: none
    */
function getAll(req, res){
    fieldsService.getAll(req.params.name).then(function(response){
        res.status(200).send(response);
    }).catch(function(err){
        res.status(400).send(err);
    });
}

/*
        Function name: update field array
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: setter function for updating the fields array of a specific name (e.g. user, asset, etc)
        Parameter(s): 
        Return: none
    */
function update(req, res){
    fieldsService.update(req.params.id, req.body).then(function(response){
        res.status(200).send(response);
    }).catch(function(err){
        res.status(400).send(err);
    });
}