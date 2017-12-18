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
service.getProjectInfoById = getProjectInfoById;

db.timesheets.find({}).sort({createdOn: 1}).toArray(function(err, timesheets) {
    _.each(timesheets, function (timesheetObj) {
        db.users.findById(timesheetObj.userId, function(err, userObj) {
            if (err) console.log(err.name + ': ' + err.message);
            if(userObj === null){
                console.log(timesheetObj);
            }
            if(userObj !== null && userObj.userResourceType){
                timesheetObj.userResourceType = userObj.userResourceType;
            }else{
                timesheetObj.userResourceType = "";
            }
            timesheetObj.createdOn = new Date(timesheetObj.weekDate);
            timesheetObj.updatedOn = new Date(timesheetObj.weekDate);
            _.each(timesheetObj.projects, function (projectObj) {
                projectObj.sickLeaveHours = 0;
                projectObj.timeoffHours = 0;
                var billData = getProjectBillData(projectObj, timesheetObj.weekDate, userObj);
                projectObj.resourceType = billData.resourceType;
                projectObj.allocatedHours = billData.allocatedHours;
                projectObj.billableMaxHours = billData.billableMaxHours;
                if(projectObj.billableMaxHours > 0){
                    if(projectObj.projectHours > projectObj.billableMaxHours){
                        projectObj.billableHours = projectObj.billableMaxHours;
                    }else{
                        projectObj.billableHours = projectObj.projectHours;
                    }
                }else{
                    projectObj.billableHours = projectObj.projectHours;
                }
            });
            var timeoffObj = _.find(timesheetObj.projects, {projectName: 'Timeoff'});
            if(timeoffObj && timesheetObj.projects.length > 1){
                timesheetObj.projects.splice(timesheetObj.projects.indexOf(timeoffObj), 1);
                timesheetObj.projects[0].timeoffHours = timeoffObj.projectHours;
                timesheetObj.projects[0].projectComment = timesheetObj.projects[0].projectComment + " Timeoff: " +timeoffObj.projectComment;
            }
            timesheetObj.timeoffHours = 0;
            timesheetObj.totalHours = 0;
            _.each(timesheetObj.projects, function (projectObj) {
                projectObj.businessUnit = "";
                var projectInfo = getProjectInfoById(projectObj.projectId, timesheetObj._id);
                if(projectInfo.businessUnit){
                    projectObj.businessUnit = projectInfo.businessUnit;
                }
                timesheetObj.totalHours += projectObj.projectHours;
                timesheetObj.timeoffHours += projectObj.sickLeaveHours;
                timesheetObj.timeoffHours += projectObj.timeoffHours;
            });
            db.timesheets.update({ _id: mongo.helper.toObjectID(timesheetObj._id) }, { $set: timesheetObj }, function(err, responseSheet) {
                if (err) console.log(err.name + ': ' + err.message);
                console.log(timesheetObj._id+" Updated");
            });
        });
    });
});

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
    if(!(BillData.allocatedHours >= 0)){
        BillData.allocatedHours = 40;
    }
    if(!(BillData.billableMaxHours >= 0)){
        BillData.billableMaxHours = 0;
    }
    return BillData;
}

function getProjectInfoById(projectId, timesheetId) {
    var deferred = Q.defer();
    db.projects.findById(projectId, function(err, projectInfo) {
        console.log("Project Info " + timesheetId);
        if (projectInfo) {
            deferred.resolve(projectInfo);
        } else {
            deferred.resolve([])
        }
    });
    return deferred.promise;
}
