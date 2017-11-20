var config = require('./config.json');
var _ = require('lodash');
//var jwt = require('jsonwebtoken');
//var bcrypt = require('bcryptjs');
//var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('timesheets');
db.bind('timesheet');
db.bind('users');

/*db.timesheets.find().toArray(function(err, timesheet) {
    _.each(timesheet, function (sheetObj) {
        console.log(sheetObj);
        return false;
    });
});*/

db.timesheet.find().toArray(function(err, timesheet) {
    _.each(timesheet, function (sheet) {
        var userProjects = [];
        db.users.findById(sheet.userId, function(err, user) {
            if (user && user.projects) {
                _.each(user.projects, function (prjData) {
                    userProjects.push({
                        projectId: mongo.helper.toObjectID(prjData.projectId),
                        projectName: prjData.projectName,
                        projectHours: sheet.hours,
                        projectComment: sheet.comments,
                        isAssigned: true,
                        resourceType: ''
                    });
                    if (prjData && prjData.billDates) {
                        var weekDate = new Date(sheet.cDate);
                        _.each(prjData.billDates, function (billDate) {
                            if (billDate.start && billDate.start != "" && billDate.end && billDate.end != "") {
                                var startDate = new Date(billDate.start);
                                var endDate = new Date(billDate.end);
                                if (weekDate >= startDate && weekDate <= endDate) {
                                    sheet.resourceType = billDate.resourceType
                                }
                            } else if (billDate.start && billDate.start != "") {
                                var startDate = new Date(billDate.start);
                                if (weekDate >= startDate) {
                                    sheet.resourceType = billDate.resourceType
                                }
                            } else if (billDate.end && billDate.end != "") {
                                var endDate = new Date(billDate.end);
                                if (weekDate <= endDate) {
                                    sheet.resourceType = billDate.resourceType
                                }
                            } else if (billDate.start == "" && billDate.end == "") {
                                sheet.resourceType = billDate.resourceType
                            }
                        });
                    }
                    return false;
                });


                db.timesheets.findOne({userId: user._id, week: sheet.week}, function (err, newSheet) {
                    var sheetObj = {
                        userId: user._id,
                        week: sheet.week,
                        weekDate: sheet.cDate,
                        totalHours: sheet.hours,
                        projects: userProjects
                    }
                    if (newSheet) {
                        db.timesheets.update({_id: newSheet._id}, {$set: sheetObj},
                            function (err, sheetRow) {
                                console.log("Sheet Updated");
                            });
                    } else {
                        db.timesheets.insert(sheetObj, function (err, sheetRow) {
                            console.log("Sheet Inserted");
                        });
                    }
                });
            }

        });

    });
});

