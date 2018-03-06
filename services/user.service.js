var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
var multer = require('multer');
db.bind('users');

var fs = require('fs');

/*
    Function name: User Service Multer Storage
    Author(s): Flamiano, Glenn
    Date Modified: 2018/03/01
    Description: Configuration for saving uploaded image file
    Parameter(s): request, file, cb
    Return: cb
*/
var storage = multer.diskStorage({
    destination: './profile_pictures',
    filename: function(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpeg|jpg|PNG|JPEG|JPG)$/)) {
            var err = new Error();
            err.code = 'filetype';
            return cb(err);
        } else {
            return cb(null, req.body.email +'.'+ file.mimetype.toString().slice(6));
        }
    }
});

var upload = multer({storage: storage}).single("myfile");
 
var service = {};

//Added by Glenn
service.getAll = getAll;

service.authenticate = authenticate;
service.emailOn = emailOn;      // added by dyan0
service.getById = getById;
service.insert = insert;    // macku
service.update = update;
service.delete = _delete;
service.uploadPic = uploadPic; //glenn
 
module.exports = service;

/*
    Function name: User Service Upload Profile Picture
    Author(s): Flamiano, Glenn
    Date Modified: 2018/03/01
    Description: Updates profile picture url in user collection and saves image request to profile pictures folder
        within the workspace
    Parameter(s): none
    Return: none
*/
function uploadPic(req, res){
    var deferred = Q.defer();
    upload(req, res, function (err) {
        if (err) {
            deferred.reject(err)
        } else {
            if (!req.file) {
                deferred.reject(err)
            } else {
                //update db
                db.users.findOne({ email: req.body.email }, function (err, user) {
                    if (err) deferred.reject(err);
             
                    if (user) {
                        db.users.update({email: req.body.email}, {$set: { profilePicUrl: req.file.filename}}, function(err){
                            if(err) deferred.reject(err);
                            //If no errors, send it back to the client
                            deferred.resolve();
                        });
                    } else {
                        // authentication failed
                        deferred.resolve();
                    }
                });
                deferred.resolve();
            }
        }
        deferred.resolve();
    });
    return deferred.promise;
}
 
function authenticate(email, password) {
    var deferred = Q.defer();
 
    db.users.findOne({ email: email }, function (err, user) {
        if (err) deferred.reject(err);
 
        if (user && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
            deferred.resolve(jwt.sign({ sub: user._id }, config.secret ,{expiresIn:'9h'}));
        } else {
            // authentication failed
            deferred.resolve();
        }
    });
 
    return deferred.promise;
}

// added by dyan0
function emailOn(email) {
    var deferred = Q.defer();
    db.users.findOne({ email: email.email }, function (err, user) {
        if (err) deferred.reject(err);
 
        if (user) {
            var liveEmail = email.tempPass;
            // authentication successful

            hash = bcrypt.hashSync(email.tempPass, 10);

            db.users.update({email: email.email}, 
                {$set:{hash: hash}}, 
                function(err, task){
                    if (err) deferred.reject(err);
                
                    deferred.resolve();
            });

            deferred.resolve(liveEmail);
        } else {
            // authentication failed
            deferred.resolve();
        }
    });
 
    return deferred.promise;
}
// end of add - dyan0

function getById(_id) {
    var deferred = Q.defer();
    
 
    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err);
 
        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

/*
    Function name: User Service Get All Users
    Author(s): Flamiano, Glenn
    Date Modified: 2018/03/01
    Description: Retrieves all the users from user collection
    Parameter(s): none
    Return: none
*/
function getAll() {
    var deferred = Q.defer();
 
    //db.users.find({role:  {$ne : "Admin"}}).toArray(function(err, user) {
    db.users.find({}).toArray(function(err, user) {
        if (err) deferred.reject(err);
 
        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });
    
    return deferred.promise;
}
/*
    Function name: Add User Function
    Author(s): Sanchez, Macku
    Date Modified: January 2018
    Description: Adds new user to the database and checks for duplicate data
*/
function insert(userParam){
    var deferred = Q.defer();
    db.users.findOne(
        { email: userParam.email },
        function (err, user) {
            if (err) deferred.reject(err);
 
            if (user) {
                // email already exists
                deferred.reject('Email "' + userParam.email + '" is already taken');
            } else {
                insertUser();
            }
        });
    function insertUser() {


        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, 'password');
 
        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);

 
        db.users.insert(
            user,
            function (err, doc) {
                if (err) deferred.reject(err);
 
                deferred.resolve();
            });
    }
 
    return deferred.promise;
}
 
function update(_id, userParam) {
    var deferred = Q.defer();
 
    // validation
    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err);
 
            db.users.findOne(
                { email: userParam.email },
                function (err, user) {
                    if (err) deferred.reject(err);

					if(userParam.oldPassword){
						if (user && bcrypt.compareSync(userParam.oldPassword, user.hash)){
							updateUser();
						}else{
							deferred.reject('Old password is incorrect');
						}
					}
					else{
						updateUser();
					}
                });
    });

    /*
        Function name: Update User Function
        Author(s): Sanchez, Macku
        Date Modified: January 2018
        Description: Updates Data,Checks for old password and checks for duplicate data
    */
 
    function updateUser() {
        // fields to update
        delete userParam.oldPassword;
        delete userParam.confirmPassword;
        var set = _.omit(userParam,'_id');
 
        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }
        delete set.password;
       
       db.users.update({_id: mongo.helper.toObjectID(_id)}, {$set: set}, function(err){
            if(err) {
               deferred.reject(err);
            }
            deferred.resolve();
        });
    }
 
    return deferred.promise;
}
 
// prefixed function name with underscore because 'delete' is a reserved word in javascript
function _delete(_id) {
    var deferred = Q.defer();

    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err);

        //console.log(user.profilePicUrl);

        fs.unlink('profile_pictures/'+user.profilePicUrl, function (err) {
          if (err) deferred.reject(err);
        });

        db.users.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err);
 
            deferred.resolve();
        });

    });
 
    return deferred.promise;
}
