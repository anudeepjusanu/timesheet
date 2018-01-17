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

var service = {};

db.timesheets.find({}).sort({createdOn: -1}).toArray(function(err, timesheets) {
    _.each(timesheets, function (timesheetObj) {
        timesheetObj.overtimeHours = 0;
        _.each(timesheetObj.projects, function (projectObj) {
            projectObj.overtimeHours = 0;
            if(projectObj.billableMaxHours > 0 && projectObj.projectHours > projectObj.billableMaxHours){
                projectObj.overtimeHours = projectObj.projectHours - projectObj.billableMaxHours;
            }
            timesheetObj.overtimeHours += projectObj.overtimeHours;
        });
        db.timesheets.update({ _id: mongo.helper.toObjectID(timesheetObj._id) }, { '$set': timesheetObj }, function(err, response) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            console.log(timesheetObj._id);
        });
    });
});

