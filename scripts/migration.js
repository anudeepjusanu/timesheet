var config = require('../config.json');
var _ = require('lodash');
//var jwt = require('jsonwebtoken');
//var bcrypt = require('bcryptjs');
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
        userObj.employeeType = 'InternalEmployee';
        db.users.update({_id: mongo.helper.toObjectID(userObj._id)}, {'$set': userObj}, function (err, userResponse) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            console.log(userObj._id + " -- ");
        });
    });
});