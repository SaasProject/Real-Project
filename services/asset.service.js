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
/*
        Function name: get all asset
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: service for getting all assets
        Parameter(s): none
        Return: none
    */
function getAll(){
    //imitate angular promise. start by initializing this
    var deferred = Q.defer();

   // Asset.find({}, {__v: false}, function(err, assets)
   //need to use toArray() when using find({})
   db.assets.find({}).toArray(function(err, assets){
        //console.log('assets.service');
        //standard error
        //reject means error status is sent as response
        if(err) deferred.reject(err);

        //if documents are present
        //console.log(assets);
        if(assets.length > 0) {
            //resolve means ok status is sent as response
            deferred.resolve(assets);
        }
        //empty collection
        else{
            //respond with an empty object
            deferred.resolve([]);
        }
    });

    //return the promise along with either resolve or reject
    return deferred.promise;
}
/*
        Function name: add asset
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: service for adding an asset
        Parameter(s): assetParam (object)
        Return: none
    */
function addAsset(assetParam){
    var deferred = Q.defer();
    
    //check for duplicate 'asset_tag' s
	 db.assets.findOne({ asset_tag: assetParam['asset_tag'] },
        function (err, asset) {
            if (err) deferred.reject(err);
 
            if (asset) {
                deferred.reject();
            } else {
                //if no duplicates, insert to database
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
/*
        Function name: update asset
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: service for updating an asset
        Parameter(s): _id (String), assetParam (object)
        Return: none
    */
function updateAsset(_id, assetParam){
	
	   var deferred = Q.defer();
        
       //remove the '_id' property from the object
		var set = _.omit(assetParam, '_id');
	

            //use mongo.helper.toObjectID() when using '_id' in queries
            // use $set to apply changes while retaining existing information in the database
            //not using $set and passing an object to update() 's second parameter will rewrite the whole document
                 db.assets.update({_id: mongo.helper.toObjectID(_id)}, {$set: set}, function(err){
					if(err) {
						deferred.reject(err);
						console.log(err);
					}
				
					deferred.resolve();
				});
            
        
        return deferred.promise;
    
      
    }

    /*
        Function name: delete asset
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: service function for adding an asset
        Parameter(s): 
        Return: none
    */
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
