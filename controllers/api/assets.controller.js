var express = require('express');
var router = express.Router();
var assetService = require('services/asset.service');

router.get('/getAll', getAllAssets);
router.post('/addAsset', addAsset);
router.put('/:_id', updateAsset);
router.delete('/:_id', deleteAsset);


module.exports = router;

function getAllAssets(req, res){
    assetService.getAll().then(function(assets){
        //console.log('assets.controller');
        //console.log(assets);
        if(assets){
            res.send(assets);
        }
        else{
            res.send(404);
        }
    }).catch(function(err){
        res.status(400).send(err);
    });
}
function addAsset(req, res){
    assetService.addAsset(req.body).then(function(){

            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateAsset(req, res){
    assetService.updateAsset(req.params._id, req.body).then(function(){
        res.sendStatus(200);
    }).catch(function(err){
        res.status(400).send(err);
    });
}

function deleteAsset(req, res) {
    var assetId = req.params._id
 
 
    assetService.delete(assetId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}