var config = require('./config.json');
var _ = require('lodash');
//var jwt = require('jsonwebtoken');
//var bcrypt = require('bcryptjs');
//var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('projects');
db.bind('timesheets');
db.bind('users');

// Removing "Timeoff" project from all assigned projects
/*db.users.find().toArray(function(err, usersData) {
    _.each(usersData, function (userRoc) {
        var rowData = {
            "projects": []
        };
        if(userRoc.projects){
            rowData.projects = userRoc.projects;
        }
        var projectIndex = _.findIndex(rowData.projects, {"projectName": 'Timeoff'});
        if(projectIndex >= 0){
            rowData.projects.splice(projectIndex, 1);
        }
        db.users.update({ _id: mongo.helper.toObjectID(userRoc._id) }, { '$set': rowData }, function(err, response) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            console.log(userRoc.name);
        });
    });
});*/

// Removeing  double "timeoff" project from timesheets
db.timesheets.find({week: '2017-W49'}).toArray(function(err, timesheets) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    _.each(timesheets, function (timesheetObj) {
        /*var rowData = {
            projects: timesheetObj.projects
        }
        var projectIndex = _.findIndex(rowData.projects, {"projectName": 'Timeoff', "projectHours": 0});
        if(projectIndex >= 0){
            var projectObj = rowData.projects[projectIndex];
            console.log(projectObj);
            if(projectObj.projectHours === 0){
                rowData.projects.splice(projectIndex, 1);
                db.timesheets.update({ _id: mongo.helper.toObjectID(timesheetObj._id) }, { '$set': rowData }, function(err, response) {
                    if (err) deferred.reject(err.name + ': ' + err.message);
                    console.log(timesheetObj._id);
                });
            }
        }*/
        db.users.findOne({_id: timesheetObj.userId}, function(err, userObj) {
            _.each(timesheetObj.projects, function (projectObj) {
                var prjData = _.find(userObj.projects, {"projectId": projectObj.projectId+""});
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
            });
        });

    });
});


