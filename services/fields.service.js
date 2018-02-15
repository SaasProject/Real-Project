var config = require('config.json');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, {native_parser: true});
db.bind('fields');
var Q = require('q');

var service = {};

service.getAll = getAll;
service.update = update;


function getAll(name){
    var deferred = Q.defer();

    db.fields.findOne({"name": name}, function(err, fields){
        if(err) deferred.reject({msg_error: 'Failed to get fields'});
        deferred.resolve(fields);
    });

    return deferred.promise;
}

function update(id, updated_fields){
    var deferred = Q.defer();

    //console.log(id, updated_fields);
    db.fields.update({_id: mongo.helper.toObjectID(id)}, {$set: {fields: updated_fields}}, function(err){
        if(err) {
            console.log(err);
            deferred.reject({msg_error: 'Failed to get fields'});
        }
        deferred.resolve({msg_success: 'Successfully updated fields'});
    });

    return deferred.promise;
}

module.exports = service;
