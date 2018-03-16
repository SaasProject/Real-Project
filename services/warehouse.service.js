var config = require('config.json');
var Q = require('q');
var _ = require('lodash');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('warehouses');

var service = {};

service.getAllWarehouse = getAllWarehouse;
service.addWarehouse = addWarehouse;
service.updateWarehouse = updateWarehouse;
service.delete = _delete;

module.exports = service;

function getAllWarehouse(){
    var deferred = Q.defer();
    db.warehouses.find({}).toArray(function(err, warehouse) {
        if(err) deferred.reject(err);

        //if documents are present
        if(warehouse.length > 0) {
            deferred.resolve(warehouse);
        }

        //empty collection
        else{
            deferred.resolve([]);
        }
    });

    return deferred.promise;
}

function addWarehouse(whouseParam){

    var deferred = Q.defer();

    db.warehouses.findOne(
        { name : whouseParam['name'] },
        function (err, warehouse) {
            if (err) deferred.reject(err);
 
            if (warehouse) {
                deferred.reject(whouseParam['name'] + whouseParam['flash']);
            } else {
				whouseParam = _.omit(whouseParam, 'flash');
                insertWarehouse();
            }
    });

    function insertWarehouse(){
        db.warehouses.insert(whouseParam, function(err){
            if (err) deferred.reject(err);
            deferred.resolve();
        });
            
        return deferred.promise;
    }
    return deferred.promise;
}

function updateWarehouse(_id, whouseParam){
    
        var deferred = Q.defer();
        
        var set = _.omit(whouseParam, '_id');
    
        db.warehouses.update({_id: mongo.helper.toObjectID(_id)}, {$set: set}, function(err){
            if(err) {
               deferred.reject(err);
            }
            deferred.resolve();
        });
    
        return deferred.promise;
    }

function _delete(_id) {
    var deferred = Q.defer();
 
    db.warehouses.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err);
 
            deferred.resolve();
        });
 
    return deferred.promise;
}
