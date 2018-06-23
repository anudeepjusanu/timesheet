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
db.bind('poolLogs');

var service = {};

db.poolLogs.find({}).toArray(function(err, poolLogs) {
    _.each(poolLogs, function (logObj) {
        if(logObj.startDate) {
            logObj.createdDate = new Date(logObj.startDate);
            db.poolLogs.update({_id: mongo.helper.toObjectID(logObj._id)}, {'$set': logObj}, function (err, userResponse) {
                if (err) deferred.reject(err.name + ': ' + err.message);
            });
        }
    });
});