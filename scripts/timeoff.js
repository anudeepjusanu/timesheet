var config = require('../config.json');
var _ = require('lodash');
//var jwt = require('jsonwebtoken');
//var bcrypt = require('bcryptjs');
//var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('projects');
db.bind('timesheets');
db.bind('users');


// Reset ResourceType
db.projects.find().toArray(function(err, projects) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    _.each(projects, function (projectObj) {
        //projectObj.estimatedHours = 0;
        //projectObj.estimatedCost = 0;
        console.log(projectObj);
        // db.projects.update({ _id: mongo.helper.toObjectID(projectObj._id) }, { '$set': projectObj }, function(err, response) {
        //     if (err) deferred.reject(err.name + ': ' + err.message);
        //     console.log(projectObj._id);
        // });

    });
});



