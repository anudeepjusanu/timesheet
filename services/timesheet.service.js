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
service.update = update;
service.getSheet = getSheet;
service.getByWeek = getByWeek;
service.getByMonth = getByMonth;
service.getMine = getMine;
service.adminUpdate = adminUpdate;

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
            cDate: userParam.cDate,
            week: userParam.week,
            postedOn: new Date(),
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

function update(userId, id, params) {
    var deferred = Q.defer();

    db.timesheet.findById(id, function(err, sheet) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (sheet.userId == userId) {
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

function getSheet(id){
    var deferred = Q.defer();
    db.timesheet.findById(id, function(err, doc) {
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
    db.timesheet.find({ week: week }).toArray(function(err, doc) {
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
    db.timesheet.find({ "week": {"$in": weekArr} }).toArray(function(err, doc) {
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
    db.timesheet.find({ userId: mongo.helper.toObjectID(userId) }).toArray(function(err, doc) {
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

    db.timesheet.findById(id, function(err, sheet) {
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