var config = require('config.json');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, {native_parser: true});
db.bind('language');
var Q = require('q');
var fs=require('fs');

var service = {};

service.getSpecificLanguage = getSpecificLanguage;
service.saveDefaultLanguage = saveDefaultLanguage;
service.getDefaultLanguage = getDefaultLanguage;

module.exports = service;

function getSpecificLanguage(req, res) {
    var deferred = Q.defer();
    
    var file=fs.readFileSync(__dirname + '/../languages/'+req.query.option+'.json', 'utf8');
    var languages=JSON.parse(file);

    deferred.resolve(languages);
    
    return deferred.promise;
}

function saveDefaultLanguage(req, res){
	var deferred = Q.defer();
	db.language.update({name: 'defaultLanguage'}, {$set: { value: req.body.option, updatedBy: req.body.email}}, function(err){
        if(err) deferred.reject(err);
        //If no errors, send it back to the client
        deferred.resolve();
    });
    return deferred.promise;
}

function getDefaultLanguage(req, res){
	var deferred = Q.defer();
 
    db.language.findOne({ name: 'defaultLanguage' }, function (err, results) {
        if (err) deferred.reject(err);
 
        if (results) {
            deferred.resolve(results);
        } else {
            //not found
            deferred.resolve();
        }
    });
    
    return deferred.promise;
}