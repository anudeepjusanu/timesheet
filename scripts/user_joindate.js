var config = require('../config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('timesheets');
db.bind('users');
db.bind('projects');
var http = require('http');

var service = {};

db.users.find({}).toArray(function(err, users) {
    _.each(users, function (userObj) {
        if(userObj.employeeId){
            if(typeof userObj.joinDate == "string"){
                console.log(userObj.joinDate, typeof userObj.joinDate);
                // db.users.update({_id: mongo.helper.toObjectID(userObj._id)}, {'$set': {joinDate: new Date(userObj.joinDate)}}, function (err, userResponse) {
                //     if (err) deferred.reject(err.name + ': ' + err.message);
                //     console.log(userObj.employeeId + " ");
                // });
            }
        }
    });
}); 
