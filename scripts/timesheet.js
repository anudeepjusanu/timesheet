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
                        console.log("------------------------------------------");
                        var param = {
                            userId: userObj._id
                        }
                        if(billDateObj.start && billDateObj.end){
                            // between param
                            param.weekDate = new Date(billDateObj.start);
                            param.weekDate = new Date(billDateObj.end);
                        }else if(billDateObj.start){
                            // grayter then
                        }else if(billDateObj.end){
                            // less then
                        }else{

                        }
                        db.timesheets.find(param).toArray(function(err, timesheets) {
                            console.log(timesheets);
                        });
                        //console.log(billDateObj);
                    }
                });
            });
        }
    });
});