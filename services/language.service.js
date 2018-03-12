var config = require('config.json');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, {native_parser: true});
db.bind('language');
var Q = require('q');
var fs=require('fs');

var service = {};

service.saveDefaultLanguage = saveDefaultLanguage;
service.getEnglishLanguage = getEnglishLanguage;
service.getNihongoLanguage = getNihongoLanguage;
service.getDefaultLanguage = getDefaultLanguage;

module.exports = service;

function saveDefaultLanguage(req, res){
	var deferred = Q.defer();
	db.language.update({name: 'defaultLanguage'}, {$set: { value: req.body.option, updatedBy: req.body.email}}, function(err){
        if(err) deferred.reject(err);
        //If no errors, send it back to the client
        deferred.resolve();
    });
    return deferred.promise;
}

function getEnglishLanguage(req, res) {
    var deferred = Q.defer();
    
    var file=fs.readFileSync(__dirname + '/../languages/english.json', 'utf8');
    var languages=JSON.parse(file);

    deferred.resolve(languages);
    
    return deferred.promise;
}

function getNihongoLanguage(req, res) {
    var deferred = Q.defer();
    
    var file=fs.readFileSync(__dirname + '/../languages/nihongo.json', 'utf8');
    var languages=JSON.parse(file);

    deferred.resolve(languages);
    
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