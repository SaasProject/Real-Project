var express = require('express');
var router = express.Router();
var warehouseService = require('services/warehouse.service');

router.get('/all', getAllWarehouse);
router.post('/addWarehouse', addWarehouse);
router.put('/:_id', updateWarehouse);
router.delete('/:_id', deleteWarehouse);


module.exports = router;

function getAllWarehouse(req, res){
    warehouseService.getAllWarehouse().then(function(warehouse){
        if(warehouse){
            res.send(warehouse);
        }
        else{
            res.send(404);
        }
    }).catch(function(err){
        res.status(400).send(err);
    });
}
function addWarehouse(req, res){
    warehouseService.addWarehouse(req.body).then(function(){
        res.sendStatus(200);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function updateWarehouse(req, res){
    warehouseService.updateWarehouse(req.params._id, req.body).then(function(){
        res.sendStatus(200);
    }).catch(function(err){
        res.status(400).send(err);
    });
}

function deleteWarehouse(req, res) {
    var whId = req.params._id
 
    warehouseService.delete(whId).then(function () {
        res.sendStatus(200);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}