var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('timesheets');

var service = {};

service.createTimesheet = createTimesheet;
service.updateTimesheet = updateTimesheet;
service.getTimesheet = getTimesheet;
service.getByWeek = getByWeek;
service.getByMonth = getByMonth;
service.getMine = getMine;
service.adminUpdate = adminUpdate;

module.exports = service;

function createTimesheet(user, userParam) {
    var deferred = Q.defer();

    db.timesheets.findOne({ userId: user._id, week: userParam.week}, function(err, sheet) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (!sheet) {
            var sheetObj = {
                userId: user._id,
                week: userParam.week,
                weekDate: userParam.weekDate,
                totalHours: userParam.totalHours,
                projects: userParam.projects
            }
            db.timesheets.insert(sheetObj, function(err, sheet) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve(sheet);
            });
        } else {
            deferred.reject("You have already posted for current week");
        }
    });

    return deferred.promise;
}

function updateTimesheet(userId, id, userParam) {
    var deferred = Q.defer();

    db.timesheets.findById(id, function(err, sheet) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (sheet.userId == userId) {
            var sheetObj = {
                userId: mongo.helper.toObjectID(userId),
                week: userParam.week,
                weekDate: userParam.weekDate,
                totalHours: userParam.totalHours,
                projects: userParam.projects
            }
            db.timesheets.update({ _id: mongo.helper.toObjectID(id) }, { $set: sheetObj },
                function(err, sheet) {
                    if (err) deferred.reject(err.name + ': ' + err.message);
                    deferred.resolve(sheet);
                });
        } else {
            deferred.reject("You are not authorized");
        }
    });

    return deferred.promise;
}

function getTimesheet(id){
    var deferred = Q.defer();
    db.timesheets.findById(id, function(err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (doc) {
            deferred.resolve(doc);
        } else {
            deferred.reject("Please select valid id");
        }
    });
    return deferred.promise;
}

function getByWeek(week) {
    var deferred = Q.defer();
    db.timesheets.find({ week: week }).toArray(function(err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (doc) {
            deferred.resolve(doc);
        } else {
            deferred.reject("Please select valid week");
        }
    });
    return deferred.promise;
}

function getByMonth(weekArr) {
    var deferred = Q.defer();
    db.timesheets.find({ "week": {"$in": weekArr} }).toArray(function(err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (doc) {
            deferred.resolve(doc);
        } else {
            deferred.reject("Please select valid week");
        }
    });
    return deferred.promise;
}

function getMine(userId) {
    var deferred = Q.defer();
    db.timesheets.find({ userId: mongo.helper.toObjectID(userId) }).toArray(function(err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (doc) {
            deferred.resolve(doc);
        } else {
            deferred.reject("You have already posted for current week");
        }
    });
    return deferred.promise;
}

function adminUpdate(id, params) {
    var deferred = Q.defer();

    db.timesheets.findById(id, function(err, sheet) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (sheet) {
            updateSheet();
        } else {
            deferred.reject("You are not authorized");
        }
    });

    function updateSheet() {
        // fields to update
        var set = {
            hours: params.hours,
            week: params.week,
            cDate: params.cDate,
            postedOn: new Date(),
            project: params.project,
            comments: params.comments,
        };

        db.timesheet.update({ _id: mongo.helper.toObjectID(id) }, { $set: set },
            function(err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve(doc);
            });
    }

    return deferred.promise;
}