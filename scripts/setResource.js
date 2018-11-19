var config = require('../config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('timesheets');
db.bind('users');
db.bind('projects');

var service = {};
console.log("My Welcome");
db.users.find({isActive: true}).toArray(function(err, users) {
    _.each(users, function (userObj) {
        /*db.timesheets.find({userId: mongo.helper.toObjectID(userObj._id)}).toArray(function(err, timesheets) {
            _.each(timesheets, function (sheetObj) {
                console.log(sheetObj._id +" -- "+userObj.userResourceType);
                db.timesheets.update({_id: mongo.helper.toObjectID(sheetObj._id)}, {'$set': {userResourceType: userObj.userResourceType}}, function (err, response) {
                    //console.log(sheetObj.id + " -- ");
                });
            });
        });*/
        console.log(userObj);
        userObj.employeeType = 'InternalEmployee';
        db.users.update({_id: mongo.helper.toObjectID(userObj._id)}, {'$set': userObj}, function (err, userResponse) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            console.log(userObj.employeeId + " -- ");
        });
    });
});