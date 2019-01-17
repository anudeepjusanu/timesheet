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
var http = require('http');

var service = {};

db.users.find({}).toArray(function(err, users) {
    _.each(users, function (userObj) {
        if(userObj.projects){
            _.each(userObj.projects, function (userProjectObj) {
                _.each(userProjectObj.billDates, function (billDateObj) {
                    if(billDateObj.salesItemId){
                        var param = {
                            userId: userObj._id
                        }
                        if(billDateObj.start && billDateObj.end){
                            billDateObj.start = new Date(billDateObj.start);
                            billDateObj.end = new Date(billDateObj.end);
                            param.weekDate = {     
                                $gte:  billDateObj.start,     
                                $lt :  billDateObj.end 
                            }
                        }else if(billDateObj.start){
                            billDateObj.start = new Date(billDateObj.start);
                            param.weekDate = {     
                                $gte:  billDateObj.start
                            }
                        }else if(billDateObj.end){
                            billDateObj.end = new Date(billDateObj.end);
                            param.weekDate = {     
                                $lt :  billDateObj.end 
                            }
                        }
                        db.timesheets.find(param).toArray(function(err, timesheets) {
                            _.each(timesheets, function (timesheetObj) {
                                _.each(timesheetObj.projects, function (sheetProjectObj) {
                                    if(sheetProjectObj.projectId == userProjectObj.projectId){
                                        sheetProjectObj.salesItemId = billDateObj.salesItemId;
                                        console.log("-------------------------------------------");
                                        console.log(timesheetObj._id);
                                        db.timesheets.update({ _id: timesheetObj._id}, { $set: timesheetObj }, function(err, response) {
                                            console.log(timesheetObj._id);
                                        });
                                    }
                                });
                            });
                        });
                    }
                });
            });
        }
    });
});