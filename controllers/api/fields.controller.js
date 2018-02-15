var express = require('express');
var router = express.Router();
var fieldsService = require('services/fields.service');

router.get('/:name', getAll);
router.put('/:id', update);

module.exports = router;

function getAll(req, res){
    fieldsService.getAll(req.params.name).then(function(response){
        res.status(200).send(response);
    }).catch(function(err){
        res.status(400).send(err);
    });
}

function update(req, res){
    fieldsService.update(req.params.id, req.body).then(function(response){
        res.status(200).send(response);
    }).catch(function(err){
        res.status(400).send(err);
    });
}