var config = require('../config.json');
var mongoose = require('mongoose');
var timesheet = require("../models/timesheet.model");
mongoose.connect('mongodb://localhost:27017/wltimesheet');
var _ = require('lodash');
var Q = require('q');

// var mongo = require('mongoskin');
// var db = mongo.db(config.connectionString, { native_parser: true });
// db.bind('timesheets');
// db.bind('users');
// db.bind('projects');

function getTimesheetApproveProjectOwners() {
    var deferred = Q.defer();
    timesheet.aggregate([
        {$match: {week: '2019-W40', 'projects.sheetStatus': 'Pending'}},
        {$unwind:{path:"$projects", preserveNullAndEmptyArrays: true}},
        {$lookup: {from: 'projects', localField: 'projects.projectId', foreignField: '_id', as: 'project_info'}},
        {$unwind:"$project_info"},
        {$project:{week: 1, projectId: "$projects.projectId", projectName: "$projects.projectName", sheetStatus: "$projects.sheetStatus", 
        ownerId: {'$toObjectId': '$project_info.ownerId'}, ownerName: "$project_info.ownerName", userName: "$user_info.name"}},
        {$lookup: {from: 'users', localField: 'ownerId', foreignField: '_id', as: 'user_info'}},
        {$unwind:"$user_info"},
    ]).exec(function(error, response){
        if (error) deferred.reject(error);
        deferred.resolve(response);
    });
    return deferred.promise;
}

getTimesheetApproveProjectOwners().then(function(timesheets) {
  //console.log("timesheets :", timesheets);
  _.each(timesheets, function(timesheetObj){
    console.log(timesheetObj);
    //return false;
  });
}).catch(function(err) {
  console.log(err);
});

// db.timesheets.find({week: '2019-W40'}).toArray(function(err, timesheets) {
//     _.each(timesheets, function (timesheetObj) {
//         console.log(timesheetObj);
//         return false;
//     });
// });