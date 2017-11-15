var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('projects');
db.bind('users');
db.bind('clients');

var service = {};

service.create = create;
service.update = update;
service.delete = del;
service.getProjectById = getProjectById;
service.getAllProjects = getAllProjects;
service.getAssignedUsers = getAssignedUsers;
service.assignUsers = assignUsers;
service.assignUser = assignUser;
service.unassignUser = unassignUser;
service.getClients = getClients;
service.getClientById = getClientById;
service.createClient = createClient;
service.updateClient = updateClient;
service.deleteClient = deleteClient;

module.exports = service;

function create(projectParam) {
    var deferred = Q.defer();
    var projectObj = {
        clientId: projectParam.clientId,
        projectName: projectParam.projectName,
        clientName: projectParam.clientName,
        startDate: projectParam.startDate,
        description: projectParam.description,
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
    var projectObj = {
        clientId: projectParam.clientId,
        projectName: params.projectName,
        clientName: params.clientName,
        startDate: params.startDate,
        description: params.description
    }
    projectObj.updatedOn = new Date();
    db.projects.update({ _id: mongo.helper.toObjectID(_id) }, { '$set': projectObj },
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

function getAssignedUsers(projectId){
    var deferred = Q.defer();
    db.users.find({"projects.projectId": {"$in":[projectId]}}).toArray(function(err, users) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (users) {
            var assignedUsers = [];
            _.each(users, function (user) {
                var userProject = _.find(user.projects, {"projectId": projectId});
                if(!userProject.isBillable){
                    userProject.isBillable = false;
                }
                if(!userProject.billDates){
                    userProject.billDates = [];
                }
                assignedUsers.push({
                    userId: user._id,
                    userName: user.name,
                    startDate: userProject.startDate,
                    isBillable: userProject.isBillable,
                    billDates: userProject.billDates
                });
            });
            deferred.resolve(assignedUsers);
        } else {
            // project not found
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function assignUsers(projectId, users) {
    var deferred = Q.defer();

    _.each(users, function (user) {
        db.users.findById(user.userId, function(err, userRoc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            if (userRoc) {
                db.projects.findById(projectId, function(err, projectRoc) {
                    if (err) deferred.reject(err.name + ': ' + err.message);
                    if(projectRoc){
                        var rowData = {
                            "projects": []
                        };
                        if(userRoc.projects){
                            rowData.projects = userRoc.projects;
                        }
                        var projectData = {
                            "projectId": projectId,
                            "projectName": projectRoc.projectName,
                            "clientName": projectRoc.clientName,
                            "startDate": user.startDate,
                            "isBillable": user.isBillable,
                            "billDates": user.billDates
                        }
                        var projectIndex = _.findIndex(rowData.projects, {"projectId": projectId});
                        if(projectIndex >=0 ){
                            rowData.projects[projectIndex] = projectData;
                        }else{
                            rowData.projects.push(projectData);
                        }
                        db.users.update({ _id: mongo.helper.toObjectID(userRoc._id) }, { '$set': rowData },
                            function(err, project) {
                                if (err) deferred.reject(err.name + ': ' + err.message);
                                deferred.resolve(project);
                            });

                    }
                });
            } else {
                deferred.reject("Please select valid id");
            }
        });
        deferred.resolve();
    });

    return deferred.promise;
}

function assignUser(projectId, user) {
    var deferred = Q.defer();

    db.users.findById(user.userId, function(err, userRoc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (userRoc) {
            db.projects.findById(projectId, function(err, projectRoc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                if (projectRoc) {
                    var rowData = {
                        "projects": []
                    };
                    if(userRoc.projects){
                        rowData.projects = userRoc.projects;
                    }
                    var projectData = {
                        "projectId": projectId,
                        "startDate": user.startDate,
                        "isBillable": user.isBillable,
                        "billDates": user.billDates
                    }
                    var projectIndex = _.findIndex(rowData.projects, {"projectId": projectId});
                    if(projectIndex >=0 ){
                        rowData.projects[projectIndex] = projectData;
                    }else{
                        rowData.projects.push(projectData);
                    }
                    db.users.update({ _id: mongo.helper.toObjectID(userRoc._id) }, { '$set': rowData },
                        function(err, project) {
                            if (err) deferred.reject(err.name + ': ' + err.message);
                            deferred.resolve(project);
                        });
                }
            });
        } else {
            deferred.reject("Please select valid id");
        }
    });
    deferred.resolve();

    return deferred.promise;
}

function unassignUser(projectId, userId) {
    var deferred = Q.defer();
    db.users.findById(userId, function(err, userRoc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (userRoc) {
            var rowData = {
                "projects": []
            };
            if(userRoc.projects){
                rowData.projects = userRoc.projects;
            }
            var projectIndex = _.findIndex(rowData.projects, {"projectId": projectId});
            if(projectIndex >=0 ){
                rowData.projects.splice(projectIndex, 1);
            }
            db.users.update({ _id: mongo.helper.toObjectID(userRoc._id) }, { '$set': rowData },
                function(err, project) {
                    if (err) deferred.reject(err.name + ': ' + err.message);
                    deferred.resolve(project);
                });
        } else {
            deferred.reject("Please select valid id");
        }
    });
    deferred.resolve();

    return deferred.promise;
}

function getClients(){
    var deferred = Q.defer();
    db.clients.find().toArray(function(err, clients) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (clients) {
            deferred.resolve(clients);
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function getClientById(clientId){
    var deferred = Q.defer();
    db.clients.findById(clientId, function(err, client) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (client) {
            deferred.resolve(client);
        } else {
            deferred.reject("Please select valid id");
        }
    });
    return deferred.promise;
}

function createClient(clientParam) {
    var deferred = Q.defer();
    var clientObj = {
        clientName: clientParam.clientName,
        createdOn: new Date(),
        updatedOn: new Date()
    }
    db.clients.insert(clientObj, function(err, client) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(client);
    });
    return deferred.promise;
}

function updateClient(_id, clientParam) {
    var deferred = Q.defer();
    var clientObj = {
        clientName: clientParam.clientName
    }
    clientObj.updatedOn = new Date();
    db.clients.update({ _id: mongo.helper.toObjectID(_id) }, { '$set': clientObj },
        function(err, client) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(client);
        });

    return deferred.promise;
}

function deleteClient(_id) {
    var deferred = Q.defer();

    db.clients.remove({ _id: mongo.helper.toObjectID(_id) },
        function(err) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
        });

    return deferred.promise;
}