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

/*db.projects.findOne({projectName: 'Timeoff'}, function(err, projectObj) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    db.users.find().toArray(function(err, usersData) {
        _.each(usersData, function (userRoc) {
            var rowData = {
                "projects": []
            };
            if(userRoc.projects){
                rowData.projects = userRoc.projects;
            }
            var projectData = {
                "projectId": projectObj._id+"",
                "projectName": projectObj.projectName,
                "clientName": projectObj.clientName,
                "startDate": '2017-01-01T00:01:00.000Z',
                "allocatedHours": 0,
                "billDates": []
            }
            var projectIndex = _.findIndex(rowData.projects, {"projectId": projectObj._id});
            if(projectIndex >=0 ){
                rowData.projects[projectIndex] = projectData;
            }else{
                rowData.projects.push(projectData);
            }
            db.users.update({ _id: mongo.helper.toObjectID(userRoc._id) }, { '$set': rowData }, function(err, project) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                console.log(userRoc.name);
            });
        });
    });
});*/

/*
db.timesheets.find({week: '2017-W47'}).toArray(function(err, timesheets) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    _.each(timesheets, function (timesheetObj) {
        db.users.findOne({_id: timesheetObj.userId}, function(err, userObj) {
            console.log(userObj);

            _.each(timesheetObj.projects, function (projectObj) {
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
            });

        });
    });
});*/


db.users.find().toArray(function(err, usersData) {
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
        console.log(rowData.projects);
        db.users.update({ _id: mongo.helper.toObjectID(userRoc._id) }, { '$set': rowData }, function(err, response) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            console.log(userRoc.name);
        });
    });
});