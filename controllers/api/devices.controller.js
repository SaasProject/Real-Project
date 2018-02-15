var express = require('express');
var router = express.Router();
var deviceService = require('services/device.service');

router.get('/all', getAllDevices);
router.post('/addDevice', addDevice);
router.put('/:_id', updateDevice);
router.delete('/:_id', deleteDevice);


module.exports = router;

function getAllDevices(req, res){
    deviceService.getAllDevices().then(function(devices){
        if(devices){
            res.send(devices);
        }
        else{
            res.send(404);
        }
    }).catch(function(err){
        res.status(400).send(err);
    });
}
function addDevice(req, res){
    deviceService.addDevice(req.body).then(function(){
        res.sendStatus(200);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function updateDevice(req, res){
    deviceService.updateDevice(req.params._id, req.body).then(function(){
        res.sendStatus(200);
    }).catch(function(err){
        res.status(400).send(err);
    });
}

function deleteDevice(req, res) {
    var deviceId = req.params._id
 
    deviceService.delete(deviceId).then(function () {
        res.sendStatus(200);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}