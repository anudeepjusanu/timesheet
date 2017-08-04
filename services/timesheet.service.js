var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('timesheet');

var service = {};

service.create = create;
service.getByWeek = getByWeek;
service.getMine = getMine;

module.exports = service;

function create(user, userParam) {
    var deferred = Q.defer();

    db.timesheet.findOne({ userId: user._id, week: userParam.week }, function(err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (!doc) {
            postHours();
        } else {
            deferred.reject("You have already posted for current week");
        }
    });

    function postHours() {
        var weeklyHour = {
            userId: user._id,
            name: user.name,
            hours: userParam.hours,
            week: userParam.week,
            project: userParam.project,
            comments: userParam.comments,
        }

        db.timesheet.insert(
            weeklyHour,
            function(err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve(doc.ops[0]);
            });
    }


    return deferred.promise;
}

function getByWeek(week) {
    var deferred = Q.defer();
    db.timesheet.find({ week: week }).toArray(function(err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (doc) {
            deferred.resolve(doc);
        } else {
            deferred.reject("You have already posted for current week");
        }
    });
    return deferred.promise;
}

function getMine(userId) {
    var deferred = Q.defer();
    db.timesheet.find({ userId: userId }).toArray(function(err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (doc) {
            deferred.resolve(doc);
        } else {
            deferred.reject("You have already posted for current week");
        }
    });
    return deferred.promise;
}