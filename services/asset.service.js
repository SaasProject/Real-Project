var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, {native_parser:true});
db.bind('assets');

var service = {};

service.getAll = getAll;
service.addAsset = addAsset;
service.updateAsset = updateAsset;
service.delete = _delete;

module.exports = service;

function getAll(){
    var deferred = Q.defer();

   // Asset.find({}, {__v: false}, function(err, assets)
   db.assets.find({}).toArray(function(err, assets){
        //console.log('assets.service');
        //standard error
        if(err) deferred.reject(err);

        //if documents are present
        //console.log(assets);
        if(assets.length > 0) {
            deferred.resolve(assets);
        }
        //empty collection
        else{
            deferred.resolve([]);
        }
    });

    return deferred.promise;
}

function addAsset(assetParam){
    var deferred = Q.defer();
	
	 db.assets.findOne({ asset_tag: assetParam['asset_tag'] },
        function (err, asset) {
            if (err) deferred.reject(err);
 
            if (asset) {
                deferred.reject('Tag already exists');
            } else {
                 db.assets.insert(assetParam, function(err){
					if (err) deferred.reject(err);
					deferred.resolve();
				});
            }
    });


    // Asset.create(assetParam, function(err){
        // if (err) deferred.reject(err);
        // console.log(err)
        // deferred.resolve();
    // });
        
    return deferred.promise;
}

function updateAsset(_id, assetParam){
	
	   var deferred = Q.defer();
		
		var set = _.omit(assetParam, '_id');
	

                 db.assets.update({_id: mongo.helper.toObjectID(_id)}, {$set: set}, function(err){
					if(err) {
						deferred.reject(err);
						console.log(err);
					}
				
					deferred.resolve();
				});
            
        
        return deferred.promise;
    
      
    }

function _delete(_id) {
    var deferred = Q.defer();
 
     db.assets.remove(
        { _id:mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err);
 
            deferred.resolve();
        });
 
    return deferred.promise;
}
