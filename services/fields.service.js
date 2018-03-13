var config = require('config.json');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, {native_parser: true});
db.bind('fields');
var Q = require('q');

var service = {};

service.getAll = getAll;
service.update = update;

/*
        Function name: get all fields
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: get the fields from a specific name (e.g. user, asset, etc)
        Parameter(s): 
        Return: none
    */
function getAll(name){
        //imitate angular promise. start by initializing this
    var deferred = Q.defer();

    //query with 'name' to get the specific document that its own fields array
    db.fields.findOne({"name": name}, function(err, fields){
        //reject means error status is sent as response
        if(err) deferred.reject();
        //resolve means ok status is sent as response
        deferred.resolve(fields);
    });
    
    //return the promise along with either resolve or reject
    return deferred.promise;
}

/*
        Function name: update field array
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: setter function for updating the fields array of a specific name (e.g. user, asset, etc)
        Parameter(s): 
        Return: none
    */
function update(id, updated_fields){
    var deferred = Q.defer();

    //console.log(id, updated_fields);
    //use mongo.helper.toObjectID() when using '_id' in queries
            // use $set to apply changes while retaining existing information in the database
            //not using $set and passing an object to update() 's second parameter will rewrite the whole document
    db.fields.update({_id: mongo.helper.toObjectID(id)}, {$set: {fields: updated_fields}}, function(err){
        if(err) {
            console.log(err);
            deferred.reject();
        }
        deferred.resolve();
    });

    return deferred.promise;
}

module.exports = service;
