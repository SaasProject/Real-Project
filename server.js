/*Main Server of the Saas Team Project*/
require('rootpath')();
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
//macku
var net = require('net'),
    JsonSocket = require('json-socket');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://192.168.223.65:27017/";
var ObjectID = require('mongodb').ObjectID;
 
//added by dyan0 --socket.io for realtime
var http = require('http').Server(app);
var io = require('socket.io')(http);

//macku
var server = net.createServer();
var fs = require('fs');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));
 
// use JWT auth to secure the api   // edited by dyan0: added '/api/users/emailOn'
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register', '/api/users/emailOn'] }));
 
// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));
app.use('/api/devices', require('./controllers/api/devices.controller'));
app.use('/api/warehouses',require('./controllers/api/warehouse.controller'));
 
//added by jeremy
app.use('/api/assets', require('./controllers/api/assets.controller'));
app.use('/api/fields', require('./controllers/api/fields.controller'));

//added by dyan0
io.on('connection', function(socket){
    
    //for asset changes in realtime
    socket.on('assetChange', function(){
        io.emit('assetChange');
    });
    socket.on('deviceChange', function(){
        io.emit('deviceChange');
    });
    socket.on('userChange', function(){
        io.emit('userChange');
    });
    socket.on('fieldsChange', function(){
        io.emit('fieldsChange');
    });
    socket.on('whouseChange', function(){
         io.emit('whouseChange');
    });

    //console.log('a user is connected');
    socket.on('disconnect', function(){
        //console.log('a user has disconnected');
    })
});

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});


 
// start server --edited by dyan0 from app.listen to http.listen
var server = http.listen(3000, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);


    /* Author: Macku I. Sanchez
       Date: 01/23/2018
       Purpose: Recieves the Data that is sent by the Dummy Program.
    */
    server.on('connection', function(socket) { //This is a standard net.Socket
        socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
        socket.on('message', function(message) {

     
            var assetParam = message;
            var set;
            var assettg;
            //console.log(assetParam);



            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("SaasDatabaseRealProj");
                dbo.collection("assets").findOne({asset_tag: assetParam.asset_tag}, 
                    function(err, result) {
                        if (err) throw err;
                        if(result===null){
                            checkAssetforAdd(); 
                        }else{
                            assettg = result.location;
                            checkAssetforUpdate();
                        }   
                        //console.log(result);
                        db.close();
                      });
            });


            function checkAssetforAdd(){
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("SaasDatabaseRealProj");
                    dbo.collection("assets").find({location: assetParam.location}).toArray(function(err, assetResult) {
                        if (err) throw err;
                        dbo.collection("warehouses").findOne({name: assetParam.location}, 
                            function(err, warehouseResult) {
                                if (err) throw err;
                                var wQ = assetResult.length;
                                var wC = parseInt(warehouseResult.capacity);
                                if(wQ>=wC){
                                    /*if(wQ>wC){
                                        fs.appendFile('Logs.txt',assettg+" "+warehouseResult.name+" "+wQ+" "+wC+"\n", function (err) {
                                            if (err) throw err;
                                        });
                                    }*/
                                    console.log(assetParam.location+" is full");
                                    createDB();
                                }else{
                                    /*if(wQ>wC){
                                        fs.appendFile('Logs.txt',assettg+" "+warehouseResult.name+" "+wQ+" "+wC+"\n", function (err) {
                                            if (err) throw err;
                                        });
                                    }*/
                                    createDB();
                                }
                        });
                        
                    });
                });
            }

            function checkAssetforUpdate(){
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("SaasDatabaseRealProj");
                    dbo.collection("assets").find({location: assetParam.location}).toArray(function(err,  assetResult) {
                        if (err) throw err;
                        dbo.collection("warehouses").findOne({name: assetParam.location}, 
                            function(err, warehouseResult) {
                                if (err) throw err;
                                var wQ = assetResult.length;
                                var wC = parseInt(warehouseResult.capacity);

                                if(assetParam.location===assettg){
                                    /*if(wQ>wC){
                                        fs.appendFile('Logs.txt',assettg+" "+warehouseResult.name+" "+wQ+" "+wC+"\n", function (err) {
                                            if (err) throw err;
                                        });
                                    }*/
                                    set={location: "",
                                        Status:  assetParam.status,
                                        updated_date: assetParam.updated_date
                                        };
                                        updateDB();
                                         
                                }else{
                                    if(wQ>=wC){
                                        /*if(wQ>wC){
                                            fs.appendFile('Logs.txt',assettg+" "+warehouseResult.name+" "+wQ+" "+wC+"\n", function (err) {
                                                if (err) throw err;
                                            });
                                        }*/
                                        set={location: assetParam.location,
                                             Status:  assetParam.status,
                                             updated_date: assetParam.updated_date
                                        };
                                        console.log(assetParam.location+" is full");
                                        updateDB();
                                    }else{
                                       /*if(wQ>wC){
                                            fs.appendFile('Logs.txt',assettg+" "+warehouseResult.name+" "+wQ+" "+wC+"\n", function (err) {
                                                if (err) throw err;
                                            });
                                        }*/
                                        set={location: assetParam.location,
                                             Status:  assetParam.status,
                                             updated_date: assetParam.updated_date
                                        };
                                        updateDB();
                                         
                                    }
                                }
                                db.close();
                        });
                        
                    });
                });
            }


            function createDB(){
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("SaasDatabaseRealProj");
                    dbo.collection("assets").insertOne(assetParam, function(err, res) {
                        if (err) throw err;
                        io.emit('assetChange');
                        db.close();
                      });
                });

            }
            function updateDB(){
                //console.log(set);
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("SaasDatabaseRealProj");
                    dbo.collection("assets").updateOne(
                            { asset_tag: assetParam.asset_tag }, 
                            { $set: set },
                            function(err, res) {
                                if (err) throw err;
                                io.emit('assetChange');
                                db.close();
                    });
                });
            }
        });
    });
});