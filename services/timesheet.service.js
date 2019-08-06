var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('timesheets');
db.bind('users');
db.bind('projects');

var service = {};

service.createTimesheet = createTimesheet;
service.updateTimesheet = updateTimesheet;
service.setTimesheetStatus = setTimesheetStatus;
service.getTimesheet = getTimesheet;
service.deleteTimesheet = deleteTimesheet;
service.adminDeleteTimesheet = adminDeleteTimesheet;
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
service.getProjectInfoById = getProjectInfoById;
service.utilizationByMonth = utilizationByMonth;
service.getByProject = getByProject;
service.remindByProject = remindByProject;
service.usersLeaveBalance = usersLeaveBalance;
service.userTakenLeaves = userTakenLeaves;
service.userTakenLeaveBalance = userTakenLeaveBalance;

module.exports = service;

function createTimesheet(currentUser, userParam) {
    var deferred = Q.defer();
    if (!userParam.userId) {
        userParam.userId = currentUser._id + "";
    }
    _.each(userParam.projects, function(projectObj) {
        projectObj.projectId = mongo.helper.toObjectID(projectObj.projectId);
    });
    var timeOffPrj = _.find(userParam.projects, { projectName: "Timeoff" });
    if (timeOffPrj && timeOffPrj.projectHours == 0) {
        userParam.projects.splice(userParam.projects.indexOf(timeOffPrj), 1);
    }
    var allProjects;
    db.projects.find({}).toArray(function(err, projects) {
        allProjects = projects;

        db.users.findById(userParam.userId, function(err, user) {
            if (user && user.projects) {
                _.each(userParam.projects, function(projectObj) {
                    var billData = getProjectBillData(projectObj, userParam.weekDate, user);
                    projectObj.resourceType = billData.resourceType;
                    projectObj.allocatedHours = billData.allocatedHours;
                    projectObj.billableMaxHours = billData.billableMaxHours;
                    projectObj.salesItemId = billData.salesItemId;
                    projectObj.overtimeHours = 0;
                    if (projectObj.billableMaxHours > 0 && projectObj.projectHours > projectObj.billableMaxHours) {
                        projectObj.billableHours = projectObj.billableMaxHours;
                        projectObj.overtimeHours = projectObj.projectHours - projectObj.billableMaxHours;
                    } else {
                        projectObj.billableHours = projectObj.projectHours;
                    }
                    projectObj.sheetStatus = projectObj.sheetStatus;
                });
                userParam.totalHours = 0;
                userParam.totalBillableHours = 0;
                userParam.timeoffHours = 0;
                userParam.overtimeHours = 0;
                _.each(userParam.projects, function(projectObj) {
                    if (!projectObj.businessUnit) {
                        projectObj.businessUnit = "";
                    }
                    var projectInfo = _.find(allProjects, { projectName: projectObj.projectName });
                    if (projectInfo && projectInfo.businessUnit) {
                        projectObj.businessUnit = projectInfo.businessUnit;
                    }
                    userParam.totalHours += projectObj.projectHours;
                    userParam.totalBillableHours += projectObj.billableHours;
                    userParam.timeoffHours += projectObj.sickLeaveHours;
                    userParam.timeoffHours += projectObj.timeoffHours;
                    userParam.overtimeHours += projectObj.overtimeHours;
                });
            }
            if (!user.userResourceType) {
                user.userResourceType = "";
            }
            db.timesheets.findOne({ userId: user._id, week: userParam.week }, function(err, sheet) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                if (!sheet) {
                    var sheetObj = {
                        userId: mongo.helper.toObjectID(userParam.userId),
                        week: userParam.week,
                        weekDate: new Date(userParam.weekDate),
                        userResourceType: user.userResourceType,
                        totalHours: userParam.totalHours,
                        totalBillableHours: userParam.totalBillableHours,
                        timeoffHours: userParam.timeoffHours,
                        overtimeHours: userParam.overtimeHours,
                        projects: userParam.projects,
                        reportingTo: userParam.reportingTo,
                        createdOn: new Date(),
                        updatedOn: new Date()
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
    });

    return deferred.promise;
}

function updateTimesheet(sheetId, userParam, currentUser) {
    var deferred = Q.defer();
    var currentUserId = currentUser._id + "";
    _.each(userParam.projects, function(projectObj) {
        projectObj.projectId = mongo.helper.toObjectID(projectObj.projectId);
    });
    var timeOffPrj = _.find(userParam.projects, { projectName: "Timeoff" });
    if (timeOffPrj && timeOffPrj.projectHours == 0) {
        userParam.projects.splice(userParam.projects.indexOf(timeOffPrj), 1);
    }
    var allProjects;
    db.projects.find({}).toArray(function(err, projects) {
        allProjects = projects;

        db.timesheets.findById(sheetId, function(err, sheetObj) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            if (sheetObj.userId == currentUserId || currentUser.admin === true) {
                db.users.findById(sheetObj.userId, function(err, sheetUserObj) {
                    _.each(userParam.projects, function(projectObj) {
                        var billData = getProjectBillData(projectObj, userParam.weekDate, sheetUserObj);
                        projectObj.resourceType = billData.resourceType;
                        projectObj.allocatedHours = billData.allocatedHours;
                        projectObj.billableMaxHours = billData.billableMaxHours;
                        projectObj.salesItemId = billData.salesItemId;
                        projectObj.overtimeHours = 0;
                        if (projectObj.billableMaxHours > 0 && projectObj.projectHours > projectObj.billableMaxHours) {
                            projectObj.billableHours = projectObj.billableMaxHours;
                            projectObj.overtimeHours = projectObj.projectHours - projectObj.billableMaxHours;
                        } else {
                            projectObj.billableHours = projectObj.projectHours;
                        }
                        projectObj.sheetStatus = projectObj.sheetStatus;
                    });
                    userParam.totalHours = 0;
                    userParam.totalBillableHours = 0;
                    userParam.timeoffHours = 0;
                    userParam.overtimeHours = 0;
                    _.each(userParam.projects, function(projectObj) {
                        if (!projectObj.businessUnit) {
                            projectObj.businessUnit = "";
                        }
                        var projectInfo = _.find(allProjects, { _id: projectObj.projectId });
                        if (projectInfo && projectInfo.businessUnit) {
                            projectObj.businessUnit = projectInfo.businessUnit;
                        }
                        userParam.totalHours += projectObj.projectHours;
                        userParam.totalBillableHours += projectObj.billableHours;
                        userParam.timeoffHours += projectObj.sickLeaveHours;
                        userParam.timeoffHours += projectObj.timeoffHours;
                        userParam.overtimeHours += projectObj.overtimeHours;
                    });
                    if (!sheetUserObj.userResourceType) {
                        sheetUserObj.userResourceType = "";
                    }
                    var newSheetObj = {
                        userId: mongo.helper.toObjectID(sheetObj.userId),
                        week: userParam.week,
                        weekDate: new Date(userParam.weekDate),
                        userResourceType: sheetUserObj.userResourceType,
                        totalHours: userParam.totalHours,
                        totalBillableHours: userParam.totalBillableHours,
                        timeoffHours: userParam.timeoffHours,
                        overtimeHours: userParam.overtimeHours,
                        projects: userParam.projects,
                        reportingTo: userParam.reportingTo,
                        timesheetStatus: userParam.timesheetStatus
                    }
                    newSheetObj.updatedOn = new Date();
                    db.timesheets.update({ _id: mongo.helper.toObjectID(sheetId) }, { $set: newSheetObj }, function(err, responseSheet) {
                        if (err) deferred.reject(err.name + ': ' + err.message);
                        deferred.resolve(responseSheet);
                    });
                });
            } else {
                deferred.reject("You are not authorized");
            }
        });
    });
    return deferred.promise;
}

function setTimesheetStatus(sheetId, projectId, sheetStatus) {
    var deferred = Q.defer();
    db.timesheets.find({ '_id': mongo.helper.toObjectID(sheetId), "projects.projectId": mongo.helper.toObjectID(projectId) }).toArray(function(err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (doc && doc[0]) {
            for (var i = 0, len = doc[0].projects.length; i < len; i++) {
                if (doc[0].projects[i].projectId == projectId) {
                    doc[0].projects[i].sheetStatus = sheetStatus;
                    break;
                }
            }
            db.timesheets.update({ _id: mongo.helper.toObjectID(sheetId), "projects.projectId": mongo.helper.toObjectID(projectId) }, { $set: doc[0] }, function(err, responseSheet) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve(responseSheet);
            });
        } else {
            deferred.reject("Invalid project Id");
        }
    });
    return deferred.promise;
}

function getProjectBillData(projectObj, weekDateVal, sheetUserObj) {
    var BillData = {
        resourceType: "buffer",
        allocatedHours: 40,
        billableMaxHours: 0,
        salesItemId: null
    };
    if (sheetUserObj && sheetUserObj.projects) {
        var prjData = _.find(sheetUserObj.projects, { "projectId": projectObj.projectId + "" });
        if (prjData && prjData.billDates) {
            var weekDate = new Date(weekDateVal);
            _.each(prjData.billDates, function(billDate) {
                if (billDate.start && billDate.start != "" && billDate.end && billDate.end != "") {
                    var startDate = new Date(billDate.start);
                    var endDate = new Date(billDate.end);
                    if (weekDate >= startDate && weekDate <= endDate) {
                        BillData.resourceType = billDate.resourceType;
                        BillData.allocatedHours = billDate.allocatedHours;
                        BillData.billableMaxHours = billDate.billableMaxHours;
                        BillData.salesItemId = (billDate.salesItemId)?billDate.salesItemId:null;
                    }
                } else if (billDate.start && billDate.start != "") {
                    var startDate = new Date(billDate.start);
                    if (weekDate >= startDate) {
                        BillData.resourceType = billDate.resourceType;
                        BillData.allocatedHours = billDate.allocatedHours;
                        BillData.billableMaxHours = billDate.billableMaxHours;
                        BillData.salesItemId = (billDate.salesItemId)?billDate.salesItemId:null;
                    }
                } else if (billDate.end && billDate.end != "") {
                    var endDate = new Date(billDate.end);
                    if (weekDate <= endDate) {
                        BillData.resourceType = billDate.resourceType;
                        BillData.allocatedHours = billDate.allocatedHours;
                        BillData.billableMaxHours = billDate.billableMaxHours;
                        BillData.salesItemId = (billDate.salesItemId)?billDate.salesItemId:null;
                    }
                } else if (billDate.start == "" && billDate.end == "") {
                    BillData.resourceType = billDate.resourceType;
                    BillData.allocatedHours = billDate.allocatedHours;
                    BillData.billableMaxHours = billDate.billableMaxHours;
                    BillData.salesItemId = (billDate.salesItemId)?billDate.salesItemId:null;
                }
            });
        }
    }
    if (!(BillData.allocatedHours >= 0)) {
        BillData.allocatedHours = 40;
    }
    if (!(BillData.billableMaxHours >= 0)) {
        BillData.billableMaxHours = 0;
    }
    return BillData;
}

function getProjectInfoById(projectId) {
    var deferred = Q.defer();
    db.projects.findById(projectId, function(err, projectInfo) {
        if (projectInfo) {
            deferred.resolve(projectInfo);
        } else {
            deferred.reject(false);
        }
    });
    return deferred.promise;
}

function getTimesheet(id) {
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

function deleteTimesheet(timesheetId, userId) {
    var deferred = Q.defer();
    db.timesheets.remove({ _id: mongo.helper.toObjectID(timesheetId), userId: mongo.helper.toObjectID(userId) }, function(err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (doc) {
            deferred.resolve(doc);
        } else {
            deferred.reject("Please select valid id");
        }
    });
    return deferred.promise;
}

function adminDeleteTimesheet(timesheetId) {
    var deferred = Q.defer();
    db.timesheets.remove({ _id: mongo.helper.toObjectID(timesheetId) }, function(err, doc) {
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
    db.timesheets.find({ "week": { "$in": weekArr } }).toArray(function(err, doc) {
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

var resourceTypes = ["shadow", "buffer", "billable", "bizdev", "internal", "operations", "trainee", "bench"];

function weekHoursCal(sheets, resourceTypes, weekVal) {
    var report = {
        week: weekVal,
        availableUserCount: 0,
        availableHours: 0,
        totalUserCount: 0,
        totalHours: 0,
        resourceTypes: []
    };
    _.each(resourceTypes, function(resourceType) {
        report.resourceTypes.push({
            resourceType: resourceType,
            projectUserCount: 0,
            projectHours: 0
        });
    })
    _.each(sheets, function(sheet) {
        report.totalUserCount += 1;
        report.totalHours += sheet.totalHours;
        _.each(sheet.projects, function(project) {
            var resourceTypeId = (project.resourceType == "") ? "buffer" : project.resourceType;
            var resourceTypeObj = _.find(report.resourceTypes, { "resourceType": resourceTypeId });
            if (resourceTypeObj) {
                resourceTypeObj.projectUserCount += 1;
                resourceTypeObj.projectHours += project.projectHours;
            }
        });
    });
    return report;
}

function allUserHoursByWeek(week) {
    var deferred = Q.defer();
    db.timesheets.find({ week: week }).toArray(function(err, sheets) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (sheets) {
            /*var report = {
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
            });*/
            deferred.resolve(weekHoursCal(sheets, resourceTypes, week));
        } else {
            deferred.reject("Please select valid week");
        }
    });
    return deferred.promise;
}

function projectUserHoursByWeek(week, projectId) {
    var deferred = Q.defer();
    db.timesheets.find({ week: week, "projects.projectId": { "$in": [mongo.helper.toObjectID(projectId)] } }).toArray(function(err, sheets) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (sheets) {
            /*var report = {
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
            });*/
            deferred.resolve(weekHoursCal(sheets, resourceTypes, week));
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
    if (month >= 11) {
        var endDate = new Date(year + 1, 0, 0);
    } else {
        var endDate = new Date(year, month + 1, 0);
    }
    var loop = 1;
    while (startDate < endDate && loop++ < 6) {
        if (startDate.getWeek() <= 9) {
            weeks.push(startDate.getFullYear() + "-W0" + startDate.getWeek());
        } else {
            weeks.push(startDate.getFullYear() + "-W" + startDate.getWeek());
        }
        startDate.setDate(startDate.getDate() + 7);
    }
    _.each(weeks, function(weekVal) {
        db.timesheets.find({ week: weekVal }).toArray(function(err, sheets) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            if (sheets) {
                /*var report = {
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
                });*/
                resultData.push(weekHoursCal(sheets, resourceTypes, weekVal));
                if (resultData.length == weeks.length) {
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
    if (month >= 11) {
        var endDate = new Date(year + 1, 0, 0);
    } else {
        var endDate = new Date(year, month + 1, 0);
    }
    var loop = 1;
    while (startDate < endDate && loop++ < 6) {
        if (startDate.getWeek() <= 9) {
            weeks.push(startDate.getFullYear() + "-W0" + startDate.getWeek());
        } else {
            weeks.push(startDate.getFullYear() + "-W" + startDate.getWeek());
        }
        startDate.setDate(startDate.getDate() + 7);
    }
    _.each(weeks, function(weekVal) {
        db.timesheets.find({ week: weekVal, "projects.projectId": { "$in": [mongo.helper.toObjectID(projectId)] } }).toArray(function(err, sheets) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            if (sheets) {
                /*var report = {
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
                });*/
                resultData.push(weekHoursCal(sheets, resourceTypes, weekVal));
                if (resultData.length == weeks.length) {
                    resultData = _.sortBy(resultData, 'week');
                    deferred.resolve(resultData);
                }
            } else {
                deferred.reject("Please select valid week");
            }
        });
    });
    return deferred.promise;
}

function timesheetBetweenDates(startDateVal, endDateVal, params) {
    var deferred = Q.defer();
    Date.prototype.getWeek = function() {
        var onejan = new Date(this.getFullYear(), 0, 1);
        return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    }
    var weeks = [];
    var startDate = new Date(startDateVal);
    var endDate = new Date(endDateVal);
    var loop = 1;
    while (startDate < endDate && loop++ < 50) {
        if (startDate.getWeek() <= 9) {
            weeks.push(startDate.getFullYear() + "-W0" + startDate.getWeek());
        } else {
            weeks.push(startDate.getFullYear() + "-W" + startDate.getWeek());
        }
        startDate.setDate(startDate.getDate() + 7);
    }
    if (weeks.length > 0) {
        var queryStr = {};
        var projectList = [];
        if (params.projectIds && params.projectIds.length > 0) {
            _.each(params.projectIds, function(projectId) {
                projectList.push(mongo.helper.toObjectID(projectId));
            });
            queryStr = {
                "projects.projectId": { "$in": projectList }
            };
        }
        var timesheets = [];
        var loopCount = 0;
        _.each(weeks, function(weekVal) {
            queryStr.week = weekVal;
            db.timesheets.find(queryStr).toArray(function(err, sheets) {
                _.each(sheets, function(sheetObj) {
                    var timesheetObj = {
                        _id: sheetObj._id,
                        userId: sheetObj.userId,
                        week: sheetObj.week,
                        weekDate: sheetObj.weekDate,
                        projects: []
                    };
                    if (projectList.length === 0) {
                        _.each(sheetObj.projects, function(projectObj) {
                            timesheetObj.projects.push(projectObj);
                        });
                    } else {
                        _.each(projectList, function(projectIdVal) {
                            projectIdVal = projectIdVal + "";
                            _.each(sheetObj.projects, function(sheetPrj) {
                                sheetPrj.projectId = sheetPrj.projectId + "";
                                if (sheetPrj.projectId == projectIdVal) {
                                    timesheetObj.projects.push(sheetPrj);
                                }
                            });
                            /*var projectObj = _.find(sheetObj.projects, {projectId: projectIdVal});
                            if(projectObj){
                                timesheetObj.projects.push(projectObj);
                            }*/
                        });
                    }
                    timesheets.push(timesheetObj);
                });
                loopCount++;
                if (loopCount >= weeks.length) {
                    //timesheets = _.groupBy(timesheets, 'userId');
                    deferred.resolve(timesheets);
                }
            });
        });
    } else {
        deferred.reject("Please enetr valid date range");
    }

    return deferred.promise;
}

function utilizationByMonth(month, year, params) {
    var deferred = Q.defer();
    Date.prototype.getWeek = function() {
        var onejan = new Date(this.getFullYear(), 0, 1);
        return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    }
    var resultData = [];
    var weeks = [];
    var startDate = new Date(year, month, 1);
    if (month >= 11) {
        var endDate = new Date(year + 1, 0, 0);
    } else {
        var endDate = new Date(year, month + 1, 0);
    }
    var loop = 1;
    while (startDate < endDate && loop++ < 6) {
        if (startDate.getWeek() <= 9) {
            weeks.push(startDate.getFullYear() + "-W0" + startDate.getWeek());
        } else {
            weeks.push(startDate.getFullYear() + "-W" + startDate.getWeek());
        }
        startDate.setDate(startDate.getDate() + 7);
    }
    _.each(weeks, function(weekVal) {
        db.timesheets.find({ week: weekVal }).toArray(function(err, sheets) {
            var report = {
                week: weekVal,
                weekHeadCount: 0,
                weekBillableHours: 0,
                businessUnits: [
                    { businessUnit: 'Launchpad' },
                    { businessUnit: 'Enterprise' }
                ],
                launchpadHeadCount: 0,
                launchpadBillableHours: 0,
                enterpriseHeadCount: 0,
                enterpriseBillableHours: 0,
                haveNoBillableProjectHeadCount: 0,
                haveBillableProjectHeadCount: 0
            };
            if (sheets) {
                _.each(sheets, function(sheetObj) {
                    var hasBillableProject = false;
                    if (sheetObj.userResourceType == "Billable") {
                        report.weekHeadCount += 1;
                        _.each(sheetObj.projects, function(projectObj) {
                            if (projectObj.resourceType == "billable") {
                                hasBillableProject = true;
                                report.weekBillableHours += projectObj.billableHours;
                                if (projectObj.businessUnit == "Launchpad") {
                                    report.launchpadHeadCount += 1;
                                    report.launchpadBillableHours += projectObj.billableHours;
                                } else if (projectObj.businessUnit == "Enterprise") {
                                    report.enterpriseHeadCount += 1;
                                    report.enterpriseBillableHours += projectObj.billableHours;
                                }
                            }
                        });
                        if (hasBillableProject === true) {
                            report.haveBillableProjectHeadCount += 1;
                        } else {
                            report.haveNoBillableProjectHeadCount += 1;
                        }
                    }
                });
            }
            resultData.push(report);
            if (resultData.length == weeks.length) {
                resultData = _.sortBy(resultData, 'week');
                deferred.resolve(resultData);
            }
        });
    });
    return deferred.promise;
}

function getByProject(week, projectId) {
    var deferred = Q.defer();
    db.timesheets.find({ week: week, "projects.projectId": mongo.helper.toObjectID(projectId) }).toArray(function(err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (doc) {
            deferred.resolve(doc);
        } else {
            deferred.reject("Please select valid week");
        }
    });
    return deferred.promise;
}

function remindByProject(user, projectName, week) {
    
}

function usersLeaveBalance(financialYear) {
    var deferred = Q.defer();
    var financialYearArr = financialYear.split("-");
    var startDate = new Date(financialYearArr[0], 3, 1);
    var endDate = new Date(financialYearArr[1], 3, 1);
    var queryStr = {
        weekDate: {
            $gte: startDate,
            $lt: endDate
        },
        timeoffHours: {
            $gt: 0
        }
    };
    var users = [];
    db.timesheets.find(queryStr).toArray(function(err, sheets) {
        _.each(sheets, function(sheetObj) {
            var userObj = _.find(users, {_id: sheetObj.userId});
            if(userObj){
                userObj.timesheets.push({
                    timeoffHours: sheetObj.timeoffHours,
                    week: sheetObj.week,
                    weekDate: sheetObj.weekDate,
                    totalHours: sheetObj.totalHours,
                    totalBillableHours: sheetObj.totalBillableHours 
                });
            }else{
                var userObj = {
                    _id: sheetObj.userId,
                    userResourceType: sheetObj.userResourceType,
                    timesheets: [{
                        timeoffHours: sheetObj.timeoffHours,
                        week: sheetObj.week,
                        weekDate: sheetObj.weekDate,
                        totalHours: sheetObj.totalHours,
                        totalBillableHours: sheetObj.totalBillableHours
                    }]
                }
                users.push(userObj);
            }
        });
        deferred.resolve(users);
    });
    
    return deferred.promise;
}

function userTakenLeaves(userId, financialYear=null) {
    var deferred = Q.defer();
    if(financialYear){
        var financialYearArr = financialYear.split("-");
        var startDate = new Date(financialYearArr[0], 3, 1);
        var endDate = new Date(financialYearArr[1], 3, 1);
    }else{
        var now = new Date();
        var startYear = (now.getMonth()>=3)?now.getFullYear():now.getFullYear()+1; 
        var startDate = new Date(startYear, 3, 1);
        var endDate = new Date((startYear+1), 3, 1);
    }
    var queryStr = {
        userId: mongo.helper.toObjectID(userId),
        weekDate: {
            $gte: startDate,
            $lt: endDate
        },
        timeoffHours: {
            $gt: 0
        }
    };
    var userSheets = [];
    db.timesheets.find(queryStr).toArray(function(err, sheets) {
        _.each(sheets, function(sheetObj) {
            userSheets.push({
                timeoffHours: sheetObj.timeoffHours,
                week: sheetObj.week,
                weekDate: sheetObj.weekDate,
                totalHours: sheetObj.totalHours,
                totalBillableHours: sheetObj.totalBillableHours 
            });
        });
        deferred.resolve(userSheets);
    });
    return deferred.promise;
}

function userTakenLeaveBalance(userId, financialYear=null) {
    var deferred = Q.defer();
    if(financialYear){
        var financialYearArr = financialYear.split("-");
        var startDate = new Date(financialYearArr[0], 3, 1);
        var endDate = new Date(financialYearArr[1], 3, 1);
    }else{
        var now = new Date();
        var startYear = (now.getMonth()>=3)?now.getFullYear():now.getFullYear()+1; 
        var startDate = new Date(startYear, 3, 1);
        var endDate = new Date((startYear+1), 3, 1);
    }
    var queryStr = {
        userId: mongo.helper.toObjectID(userId),
        weekDate: {
            $gte: startDate,
            $lt: endDate
        },
        timeoffHours: {
            $gt: 0
        }
    };
    var userSheetBalance = {
        sickLeaveHours: 0.00,
        sickLeaveDays: 0.00,
        timeoffHours: 0.00,
        timeoffDays: 0.00
    };
    db.timesheets.find(queryStr).toArray(function(err, sheets) {
        _.each(sheets, function(sheetObj) {
            _.each(sheetObj.projects, function(projectObj) {
                userSheetBalance.sickLeaveHours += sheetObj.sickLeaveHours;
                userSheetBalance.timeoffHours += sheetObj.timeoffHours;
            });
        });
        userSheetBalance.sickLeaveDays = parseFloat(userSheetBalance.timeoffHours/8).toFixed(2);
        userSheetBalance.timeoffDays = parseFloat(userSheetBalance.timeoffHours/8).toFixed(2);
        deferred.resolve(userSheetBalance);
    });
    return deferred.promise;
}