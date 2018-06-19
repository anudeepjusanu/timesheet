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
        var weekDate = new Date(timesheetObj.weekDate);
        if(weekDate.getDay()!==5){
            //console.log(weekDate.getDay()+" "+weekDate);
            console.log(timesheetObj);
        }
        /*db.timesheets.update({ _id: mongo.helper.toObjectID(timesheetObj._id) }, { '$set': timesheetObj }, function(err, response) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            console.log(timesheetObj._id);
        });*/
    });
});

