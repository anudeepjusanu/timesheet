var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('timesheets');
db.bind('users');

var service = {};

service.createTimesheet = createTimesheet;
service.updateTimesheet = updateTimesheet;
service.getTimesheet = getTimesheet;
service.deleteTimesheet = deleteTimesheet;
service.getByWeek = getByWeek;
service.getByMonth = getByMonth;
service.getMine = getMine;
service.adminUpdate = adminUpdate;
service.allUserHoursByWeek = allUserHoursByWeek;
service.projectUserHoursByWeek = projectUserHoursByWeek;
service.clientUserHoursByWeek = clientUserHoursByWeek;
service.allUserHoursByMonth = allUserHoursByMonth;
service.projectUserHoursByMonth = projectUserHoursByMonth;
service.timesheetBetweenDates = timesheetBetweenDates;

module.exports = service;

function createTimesheet(user, userParam) {
    var deferred = Q.defer();
    _.each(userParam.projects, function (projectObj) {
        projectObj.projectId = mongo.helper.toObjectID(projectObj.projectId);
        projectObj.resourceType = "";
    });
    db.users.findById(user._id, function(err, user) {
        if (user && user.projects) {
            _.each(userParam.projects, function (projectObj) {
                var billData = getProjectBillData(projectObj, userParam.weekDate, user);
                projectObj.resourceType = billData.resourceType;
                projectObj.allocatedHours = billData.allocatedHours;
                projectObj.billableMaxHours = billData.billableMaxHours;
            });
            /*_.each(userParam.projects, function (projectObj) {
                var prjData = _.find(user.projects, {"projectId": projectObj.projectId+""});
                if(prjData && prjData.billDates){
                    var weekDate = new Date(userParam.weekDate);
                    _.each(prjData.billDates, function (billDate) {
                        if(billDate.start && billDate.start != "" && billDate.end && billDate.end != ""){
                            var startDate = new Date(billDate.start);
                            var endDate = new Date(billDate.end);
                            if(weekDate >= startDate && weekDate <= endDate){
                                projectObj.resourceType = billDate.resourceType
                            }
                        }else if(billDate.start && billDate.start != ""){
                            var startDate = new Date(billDate.start);
                            if(weekDate >= startDate){
                                projectObj.resourceType = billDate.resourceType
                            }
                        }else if(billDate.end && billDate.end != ""){
                            var endDate = new Date(billDate.end);
                            if(weekDate <= endDate){
                                projectObj.resourceType = billDate.resourceType
                            }
                        }else if(billDate.start == "" && billDate.end == ""){
                            projectObj.resourceType = billDate.resourceType
                        }
                    });
                }
            });*/
        }

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
    });

    return deferred.promise;
}

function updateTimesheet(sheetId, userParam, currentUser) {
    var deferred = Q.defer();
    var currentUserId = currentUser._id;
    _.each(userParam.projects, function (projectObj) {
        projectObj.projectId = mongo.helper.toObjectID(projectObj.projectId);
    });
    db.timesheets.findById(sheetId, function(err, sheetObj) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if(sheetObj.userId == currentUserId ||  currentUser.admin === true){
            db.users.findById(sheetObj.userId, function(err, sheetUserObj) {
                _.each(userParam.projects, function (projectObj) {
                    var billData = getProjectBillData(projectObj, userParam.weekDate, sheetUserObj);
                    projectObj.resourceType = billData.resourceType;
                    projectObj.allocatedHours = billData.allocatedHours;
                    projectObj.billableMaxHours = billData.billableMaxHours;
                });
                var newSheetObj = {
                    userId: mongo.helper.toObjectID(sheetObj.userId),
                    week: userParam.week,
                    weekDate: userParam.weekDate,
                    totalHours: userParam.totalHours,
                    projects: userParam.projects
                }
                db.timesheets.update({ _id: mongo.helper.toObjectID(sheetId) }, { $set: newSheetObj }, function(err, responseSheet) {
                    if (err) deferred.reject(err.name + ': ' + err.message);
                    deferred.resolve(responseSheet);
                });
            });
        }else{
            deferred.reject("You are not authorized");
        }
    });

    return deferred.promise;
}

function getProjectBillData(projectObj, weekDateVal, sheetUserObj) {
    var BillData = {
        resourceType: "buffer",
        allocatedHours: 40,
        billableMaxHours: 0
    };
    if (sheetUserObj && sheetUserObj.projects) {
        var prjData = _.find(sheetUserObj.projects, {"projectId": projectObj.projectId+""});
        if (prjData && prjData.billDates) {
            var weekDate = new Date(weekDateVal);
            _.each(prjData.billDates, function (billDate) {
                if (billDate.start && billDate.start != "" && billDate.end && billDate.end != "") {
                    var startDate = new Date(billDate.start);
                    var endDate = new Date(billDate.end);
                    if (weekDate >= startDate && weekDate <= endDate) {
                        BillData.resourceType = billDate.resourceType;
                        BillData.allocatedHours = billDate.allocatedHours;
                        BillData.billableMaxHours = billDate.billableMaxHours;
                    }
                } else if (billDate.start && billDate.start != "") {
                    var startDate = new Date(billDate.start);
                    if (weekDate >= startDate) {
                        BillData.resourceType = billDate.resourceType;
                        BillData.allocatedHours = billDate.allocatedHours;
                        BillData.billableMaxHours = billDate.billableMaxHours;
                    }
                } else if (billDate.end && billDate.end != "") {
                    var endDate = new Date(billDate.end);
                    if (weekDate <= endDate) {
                        BillData.resourceType = billDate.resourceType;
                        BillData.allocatedHours = billDate.allocatedHours;
                        BillData.billableMaxHours = billDate.billableMaxHours;
                    }
                } else if (billDate.start == "" && billDate.end == "") {
                    BillData.resourceType = billDate.resourceType;
                    BillData.allocatedHours = billDate.allocatedHours;
                    BillData.billableMaxHours = billDate.billableMaxHours;
                }
            });
        }
    }
    return BillData;
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

function deleteTimesheet(timesheetId, userId){
    var deferred = Q.defer();
    db.timesheets.remove({ _id: mongo.helper.toObjectID(timesheetId), userId: mongo.helper.toObjectID(userId)}, function(err, doc) {
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

var resourceTypes = ["shadow", "buffer", "billable", "bizdev", "internal"];

function allUserHoursByWeek(week) {
    var deferred = Q.defer();
    db.timesheets.find({ week: week }).toArray(function(err, sheets) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (sheets) {
            var report = {
                availableUserCount: 0,
                availableHours: 0,
                totalUserCount: 0,
                totalHours: 0,
                resourceTypes: []
            };
            _.each(resourceTypes, function (resourceType) {
                report.resourceTypes.push({
                    resourceType: resourceType,
                    projectUserCount: 0,
                    projectHours: 0
                });
            })
            _.each(sheets, function (sheet) {
                report.totalUserCount += 1;
                report.totalHours += sheet.totalHours;
                _.each(sheet.projects, function (project) {
                    var resourceTypeId = (project.resourceType == "")?"buffer":project.resourceType;
                    var resourceTypeObj = _.find(report.resourceTypes, {"resourceType": resourceTypeId});
                    if(resourceTypeObj){
                        resourceTypeObj.projectUserCount += 1;
                        resourceTypeObj.projectHours += project.projectHours;
                    }
                });
            });
            deferred.resolve(report);
        } else {
            deferred.reject("Please select valid week");
        }
    });
    return deferred.promise;
}

function projectUserHoursByWeek(week, projectId) {
    var deferred = Q.defer();
    db.timesheets.find({ week: week, "projects.projectId": {"$in":[mongo.helper.toObjectID(projectId)]} }).toArray(function(err, sheets) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (sheets) {
            var report = {
                availableUserCount: 0,
                availableHours: 0,
                totalUserCount: 0,
                totalHours: 0,
                resourceTypes: []
            };
            _.each(resourceTypes, function (resourceType) {
                report.resourceTypes.push({
                    resourceType: resourceType,
                    projectUserCount: 0,
                    projectHours: 0
                });
            })
            _.each(sheets, function (sheet) {
                report.totalUserCount += 1;
                report.totalHours += sheet.totalHours;
                _.each(sheet.projects, function (project) {
                    var resourceTypeId = (project.resourceType == "")?"buffer":project.resourceType;
                    var resourceTypeObj = _.find(report.resourceTypes, {"resourceType": resourceTypeId});
                    if(resourceTypeObj){
                        resourceTypeObj.projectUserCount += 1;
                        resourceTypeObj.projectHours += project.projectHours;
                    }
                });
            });
            deferred.resolve(report);
        } else {
            deferred.reject("Please select valid week");
        }
    });
    return deferred.promise;
}

function clientUserHoursByWeek(week, clientId) {
    var deferred = Q.defer();
    db.timesheets.find({ week: week }).toArray(function(err, sheets) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (sheets) {

            deferred.resolve(sheets);
        } else {
            deferred.reject("Please select valid week");
        }
    });
    return deferred.promise;
}

function allUserHoursByMonth(month, year) {
    var deferred = Q.defer();
    Date.prototype.getWeek = function() {
        var onejan = new Date(this.getFullYear(), 0, 1);
        return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    }
    var resultData = [];
    var weeks = [];
    var startDate = new Date(year, month, 1);
    if(month >= 11){
        var endDate = new Date(year+1, 0, 0);
    }else{
        var endDate = new Date(year, month + 1, 0);
    }
    var loop = 1;
    while (startDate < endDate && loop++ < 6){
        weeks.push(startDate.getFullYear()+"-W"+startDate.getWeek());
        startDate.setDate(startDate.getDate() + 7);
    }
    _.each(weeks, function (weekVal) {
        db.timesheets.find({ week: weekVal }).toArray(function(err, sheets) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            if (sheets) {
                var report = {
                    week: weekVal,
                    availableUserCount: 0,
                    availableHours: 0,
                    totalUserCount: 0,
                    totalHours: 0,
                    resourceTypes: []
                };
                _.each(resourceTypes, function (resourceType) {
                    report.resourceTypes.push({
                        resourceType: resourceType,
                        projectUserCount: 0,
                        projectHours: 0
                    });
                })
                _.each(sheets, function (sheet) {
                    report.totalUserCount += 1;
                    report.totalHours += sheet.totalHours;
                    _.each(sheet.projects, function (project) {
                        var resourceTypeId = (project.resourceType == "")?"buffer":project.resourceType;
                        var resourceTypeObj = _.find(report.resourceTypes, {"resourceType": resourceTypeId});
                        if(resourceTypeObj){
                            resourceTypeObj.projectUserCount += 1;
                            resourceTypeObj.projectHours += project.projectHours;
                        }
                    });
                });
                resultData.push(report);
                if(resultData.length == weeks.length){
                    resultData = _.sortBy(resultData, ['week']);
                    deferred.resolve(resultData);
                }
            } else {
                deferred.reject("Please select valid week");
            }
        });
    });
    return deferred.promise;
}

function projectUserHoursByMonth(month, year, projectId) {
    var deferred = Q.defer();
    Date.prototype.getWeek = function() {
        var onejan = new Date(this.getFullYear(), 0, 1);
        return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    }
    var resultData = [];
    var weeks = [];
    var startDate = new Date(year, month, 1);
    if(month >= 11){
        var endDate = new Date(year+1, 0, 0);
    }else{
        var endDate = new Date(year, month + 1, 0);
    }
    var loop = 1;
    while (startDate < endDate && loop++ < 6){
        weeks.push(startDate.getFullYear()+"-W"+startDate.getWeek());
        startDate.setDate(startDate.getDate() + 7);
    }
    _.each(weeks, function (weekVal) {
        db.timesheets.find({ week: weekVal, "projects.projectId": {"$in":[mongo.helper.toObjectID(projectId)]} }).toArray(function(err, sheets) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            if (sheets) {
                var report = {
                    week: weekVal,
                    availableUserCount: 0,
                    availableHours: 0,
                    totalUserCount: 0,
                    totalHours: 0,
                    resourceTypes: []
                };
                _.each(resourceTypes, function (resourceType) {
                    report.resourceTypes.push({
                        resourceType: resourceType,
                        projectUserCount: 0,
                        projectHours: 0
                    });
                })
                _.each(sheets, function (sheet) {
                    report.totalUserCount += 1;
                    report.totalHours += sheet.totalHours;
                    _.each(sheet.projects, function (project) {
                        var resourceTypeId = (project.resourceType == "")?"buffer":project.resourceType;
                        var resourceTypeObj = _.find(report.resourceTypes, {"resourceType": resourceTypeId});
                        if(resourceTypeObj){
                            resourceTypeObj.projectUserCount += 1;
                            resourceTypeObj.projectHours += project.projectHours;
                        }
                    });
                });
                resultData.push(report);
                if(resultData.length == weeks.length){
                    resultData = _.sortBy(resultData, ['week']);
                    deferred.resolve(resultData);
                }
            } else {
                deferred.reject("Please select valid week");
            }
        });
    });
    return deferred.promise;
}

function timesheetBetweenDates(params){
    var deferred = Q.defer();
    Date.prototype.getWeek = function() {
        var onejan = new Date(this.getFullYear(), 0, 1);
        return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    }
    var resultData = [];
    var weeks = [];
    var startDate = new Date(params.startDate);
    var endDate = new Date(params.endDate);
    var loop = 1;
    while (startDate < endDate && loop++ < 50){
        weeks.push(startDate.getFullYear()+"-W"+startDate.getWeek());
        startDate.setDate(startDate.getDate() + 7);
    }
    _.each(weeks, function (weekVal) {
        var report = {
            week: weekVal,
            sheets: []
        } ;
        db.timesheets.find({ week: weekVal }).toArray(function(err, sheets) {
            var report = {
                week: weekVal,
                sheets: []
            } ;
            if (sheets) {
                report.sheets = sheets;
            }
            resultData.push(report);
            if(resultData.length == weeks.length){
                deferred.resolve(resultData);
            }
        });
    });
    return deferred.promise;
}