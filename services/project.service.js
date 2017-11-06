var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('projects');

var service = {};

service.create = create;
service.update = update;
service.delete = del;
service.getProjectById = getProjectById;
service.getAllProjects = getAllProjects;

module.exports = service;

function create(projectParam) {
    var deferred = Q.defer();
    var projectObj = {
        clientName: projectParam.clientName,
        projectName: projectParam.projectName,
        startDate: projectParam.startDate,
        createdOn: new Date(),
        updatedOn: new Date()
    }
    db.projects.insert(
        projectObj,
        function(err, project) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(project.ops[0]);
        });
    return deferred.promise;
}

function update(_id, params) {
    var deferred = Q.defer();
    params.updatedOn = new Date();
    db.projects.update({ _id: mongo.helper.toObjectID(_id) }, { $set: params },
        function(err, project) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(project);
        });

    return deferred.promise;
}

function del(_id) {
    var deferred = Q.defer();

    db.projects.remove({ _id: mongo.helper.toObjectID(_id) },
        function(err) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
        });

    return deferred.promise;
}

function getProjectById(projectId){
    var deferred = Q.defer();
    db.projects.findById(projectId, function(err, project) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (project) {
            deferred.resolve(project);
        } else {
            deferred.reject("Please select valid id");
        }
    });
    return deferred.promise;
}

function getAllProjects(){
    var deferred = Q.defer();
    db.projects.find().toArray(function(err, projects) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (projects) {
            deferred.resolve(projects);
        } else {
            // project not found
            deferred.resolve();
        }
    });
    return deferred.promise;
}
