var config = require('config.json');
var Q = require('q');
var _ = require('lodash');
//var mongoose = require('mongoose');
//var Device = mongoose.model('Device');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('devices');

var service = {};

service.getAllDevices = getAllDevices;
service.addDevice = addDevice;
service.updateDevice = updateDevice;
service.delete = _delete;

module.exports = service;

function getAllDevices(){
    var deferred = Q.defer();
    db.devices.find({}).toArray(function(err, devices) {
        if(err) deferred.reject(err);

        //if documents are present
        if(devices.length > 0) {
            deferred.resolve(devices);
        }

        //empty collection
        else{
            deferred.resolve([]);
        }
    });

    return deferred.promise;
}

function addDevice(deviceParam){

    var deferred = Q.defer();

    db.devices.findOne(
        { device_id : deviceParam['device_id'] },
        function (err, device) {
            if (err) deferred.reject(err);
 
            if (device) {
                deferred.reject('Device_id "' + deviceParam['device_id'] + '" is already taken');
            } else {
                insertDevice();
            }
    });

    function insertDevice(){
        db.devices.insert(deviceParam, function(err){
            if (err) deferred.reject(err);
            deferred.resolve();
        });
            
        return deferred.promise;
    }
    return deferred.promise;
}

function updateDevice(_id, deviceParam){
    
        var deferred = Q.defer();
        
        var set = _.omit(deviceParam, '_id');
    
        db.devices.update({_id: mongo.helper.toObjectID(_id)}, {$set: set}, function(err){
            if(err) {
               deferred.reject(err);
            }
            deferred.resolve();
        });
    
        return deferred.promise;
    }

function _delete(_id) {
    var deferred = Q.defer();
 
    db.devices.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err);
 
            deferred.resolve();
        });
 
    return deferred.promise;
}
