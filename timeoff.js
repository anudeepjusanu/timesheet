var config = require('./config.json');
var _ = require('lodash');
//var jwt = require('jsonwebtoken');
//var bcrypt = require('bcryptjs');
//var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('projects');
db.bind('users');

db.projects.findOne({projectName: 'Timeoff'}, function(err, projectObj) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    //console.log(projectObj);
    db.users.find().toArray(function(err, usersData) {
        _.each(usersData, function (userRoc) {
            var rowData = {
                "projects": []
            };
            if(userRoc.projects){
                rowData.projects = userRoc.projects;
            }
            var projectData = {
                "projectId": projectObj._id,
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
});
