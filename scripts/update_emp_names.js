var config = require('../config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('timesheets');
db.bind('users');
db.bind('projects');

var userNames = [];
const fs = require('fs');
const csv = require('csv-parser');

fs.createReadStream('./emp_skill_category.csv').pipe(csv()).on('data', (row) => {
    userNames.push(row);
}).on('end', () => {
    console.log('CSV file successfully processed');
    //console.log(userNames);
    db.users.find({ isActive: true }).toArray(function (err, users) {
        _.each(users, function (userObj) {
            if (userObj.employeeId) {
                var csvUser = _.find(userNames, { "employeeId": userObj.employeeId });
                if (csvUser && csvUser.employeeId) {
                    console.log(userObj.employeeId, csvUser);
                    db.users.update({ _id: mongo.helper.toObjectID(userObj._id) }, { '$set': { skillCategory: csvUser.skillCategory } }, function (err, userResponse) {
                        if (err) deferred.reject(err.name + ': ' + err.message);
                        console.log(userObj.employeeId, true);
                    });
                } else {
                    console.log(userObj.employeeId, false);
                }
            }
        });
    });

});
