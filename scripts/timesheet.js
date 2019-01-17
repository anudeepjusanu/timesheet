var config = require('../config.json');
var mongo = require('mongoskin');
var _ = require('lodash');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('timesheets');
db.bind('users');
db.bind('projects');
var Q = require('q');


let setSalesItemId = async function () {
// Get All Users
let allUsers = await getAll();
if (allUsers.length > 0) {
allUsers.forEach(async (user, index) => {
if (user.projects) {
user.projects.forEach(async (userProjectObj) => {
if (userProjectObj.billDates) {
await userProjectObj.billDates.forEach(async (billDateObj) => {
if (billDateObj.salesItemId) {
var param = {
userId: user._id
}
if (billDateObj.start && billDateObj.end) {
billDateObj.start = new Date(billDateObj.start);
billDateObj.end = new Date(billDateObj.end);
param.weekDate = {
$gte: billDateObj.start,
$lt: billDateObj.end
}
} else if (billDateObj.start) {
billDateObj.start = new Date(billDateObj.start);
param.weekDate = {
$gte: billDateObj.start
}
} else if (billDateObj.end) {
billDateObj.end = new Date(billDateObj.end);
param.weekDate = {
$lt: billDateObj.end
}
} else {

}
// Get TimeSheets Query
let getTimeSheets = await getByUserIdDate(param);
if (getTimeSheets.length > 0) {
getTimeSheets.forEach(async (timeSheetObj) => {
let newTimeSheetObj = {};
newTimeSheetObj = timeSheetObj;
let newProjects = [];
await timeSheetObj.projects.forEach(async (sheetProjectObj) => {
let newProject = {};
newProject = sheetProjectObj;
if (sheetProjectObj.projectId == userProjectObj.projectId) {
newProject.salesItemId = billDateObj.salesItemId;
newProjects.push(newProject);
} else {
newProject.salesItemId = null;
}
});
newTimeSheetObj.projects = newProjects;
let updateNewTimeSheetObj = await updateTimeSheetObj(newTimeSheetObj._id, newTimeSheetObj);
console.log('==== UPDATE COMMAND RUN ONLY ONCE =====')
console.log(updateNewTimeSheetObj.result);
});
}
}
});
}
});
}
});
}

}

setSalesItemId();

function updateTimeSheetObj(sheetId, newSheetObj) {
var deferred = Q.defer();
db.timesheets.update({ _id: mongo.helper.toObjectID(sheetId) }, { $set: newSheetObj }, function(err, responseSheet) {
if (err) deferred.reject(err.name + ': ' + err.message);
deferred.resolve(responseSheet);
});
return deferred.promise;
}

function getByUserIdDate(param) {
var deferred = Q.defer();
db.timesheets.find(param).toArray(function(err, doc) {
if (err) deferred.reject(err.name + ': ' + err.message);
if (doc) {
deferred.resolve(doc);
} else {
deferred.reject("You have already posted for current week");
}
});
return deferred.promise;
}

function getAll() {
var deferred = Q.defer();

db.users.find().toArray(function(err, users) {
if (err) deferred.reject(err.name + ': ' + err.message);

if (users) {
var usersList = _.map(users, function(e) {
return _.omit(e, 'hash');
});
// return user (without hashed password)
deferred.resolve(usersList);
} else {
// user not found
deferred.resolve();
}
});

return deferred.promise;
}