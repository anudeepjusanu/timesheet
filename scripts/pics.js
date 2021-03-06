var config = require('../config.json');
var _ = require('lodash');
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
        if(userObj.employeeId){
            userObj.profileImgUrl = 'https://elogos.wavelabs.in/'+userObj.employeeId+'.png';
            var options = {method: 'HEAD', host: 'elogos.wavelabs.in', port: 80, path: userObj.profileImgUrl, body: userObj};
            /*var req = http.request(options, function(response) {
                    if(response.statusCode == 200) {
                        db.users.update({_id: mongo.helper.toObjectID(userObj._id)}, {'$set': userObj}, function (err, userResponse) {
                            if (err) deferred.reject(err.name + ': ' + err.message);
                            console.log(userObj.employeeId + " -- " + response.req.path);
                        });
                    }
                });
            req.end();*/
		db.users.update({_id: mongo.helper.toObjectID(userObj._id)}, {'$set': userObj}, function (err, userResponse) {
                            if (err) deferred.reject(err.name + ': ' + err.message);
                            console.log(userObj.employeeId + " -- ");
                        });
        }
    });
}); 
