var config = require('../config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('timesheets');
db.bind('users');
db.bind('projects');
var mongoose = require("mongoose");
var ObjectId = require('mongoose').Types.ObjectId;
var userModel = require("../models/user.model");
mongoose.connect(config.connectionString);
var employees = [];
const fs = require('fs');
const csv = require('csv-parser');
const { async } = require('q');

fs.createReadStream('./users_practice.csv').pipe(csv()).on('data', (row) => {
    employees.push(row);
}).on('end', () => {
    console.log('CSV file successfully processed');

    _.each(employees, function (empObj) {
        db.users.find({ employeeId: empObj.emp_id }).toArray(function (err, users) {
            if (users && users[0]) {
                var userObj = users[0];

                var projects = userObj.projects
                var userIndex = _.findIndex(projects, { projectName: 'FirstResponder - IOT' });
                console.log(projects[userIndex].billDates);
                for (var i = 0; i < projects[userIndex].billDates.length; i++) {
                    projects[userIndex].billDates[i].pratice = "Digital";
                }

                db.users.update({ _id: mongo.helper.toObjectID(userObj._id) }, { $set: { projects: projects } }, { upsert: true, multi: true }, function (err, doc) {

                });
            }
        });
    });

});
