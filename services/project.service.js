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
db.bind('timesheets');

var mongoose = require('mongoose');
var projects = require("../models/project.model");

var service = {};

service.create = create;
service.update = update;
service.delete = del;
service.getProjectById = getProjectById;
service.getAllProjects = getAllProjects;
service.getAssignedUsers = getAssignedUsers;
service.getAssignedUsersWithWorkedHours = getAssignedUsersWithWorkedHours;
service.assignUsers = assignUsers;
service.assignUser = assignUser;
service.unassignUser = unassignUser;
service.getClients = getClients;
service.getClientById = getClientById;
service.createClient = createClient;
service.updateClient = updateClient;
service.deleteClient = deleteClient;
service.getProjectOwners = getProjectOwners;

module.exports = service;

function create(projectParam) {
    var deferred = Q.defer();
    var projectObj = {
        clientId: mongo.helper.toObjectID(projectParam.clientId),
        projectName: projectParam.projectName,
        projectCode: projectParam.projectCode,
        billingCycle: projectParam.billingCycle,
        clientName: projectParam.clientName,
        startDate: projectParam.startDate,
        projectBillType: projectParam.projectBillType,
        projectType: projectParam.projectType,
        businessUnit: projectParam.businessUnit,
        costAccount: projectParam.costAccount,
        estimatedHours: projectParam.estimatedHours,
        estimatedCost: projectParam.estimatedCost,
        visibility: projectParam.visibility,
        isActive: projectParam.isActive,
        description: projectParam.description,
        ownerId: projectParam.ownerId,
        ownerName: projectParam.ownerName,
        reimbursementApproverId: (projectParam.reimbursementApproverId) ? mongo.helper.toObjectID(projectParam.reimbursementApproverId) : null,
        createdOn: new Date(),
        updatedOn: new Date()
    }
    db.projects.insert(
        projectObj,
        function (err, project) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(project.ops[0]);
        });
    return deferred.promise;
}

function update(_id, params) {
    var deferred = Q.defer();
    var projectObj = {
        clientId: mongo.helper.toObjectID(params.clientId),
        projectName: params.projectName,
        projectCode: params.projectCode,
        billingCycle: params.billingCycle,
        clientName: params.clientName,
        startDate: params.startDate,
        projectBillType: params.projectBillType,
        projectType: params.projectType,
        businessUnit: params.businessUnit,
        costAccount: params.costAccount,
        estimatedHours: params.estimatedHours,
        estimatedCost: params.estimatedCost,
        visibility: params.visibility,
        isActive: params.isActive,
        description: params.description,
        ownerId: params.ownerId,
        ownerName: params.ownerName,
        reimbursementApproverId: (params.reimbursementApproverId) ? mongo.helper.toObjectID(params.reimbursementApproverId) : null
    }
    projectObj.updatedOn = new Date();
    db.projects.update({ _id: mongo.helper.toObjectID(_id) }, { '$set': projectObj }, function (err, project) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        db.users.update({ "projects.projectId": _id }, { '$set': { "projects.$.projectName": params.projectName, "projects.$.ownerId": params.ownerId, "projects.$.ownerName": params.ownerName } }, { upsert: true, multi: true }, function (err, respone) {
            db.timesheets.update({ "projects.projectId": mongo.helper.toObjectID(_id) }, { '$set': { "projects.$.projectName": params.projectName, "projects.$.businessUnit": params.businessUnit, "projects.$.costAccount": params.costAccount } }, { upsert: true, multi: true }, function (err, respone) {
                deferred.resolve(project);
            });
        });
    });

    return deferred.promise;
}

function del(_id) {
    var deferred = Q.defer();

    db.projects.remove({ _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
        });

    return deferred.promise;
}

function getProjectById(projectId) {
    var deferred = Q.defer();
    db.projects.findById(projectId, function (err, project) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (project) {
            deferred.resolve(project);
        } else {
            deferred.reject("Please select valid id");
        }
    });
    return deferred.promise;
}

function getAllProjects() {
    var deferred = Q.defer();
    projects.aggregate([
        { $match: { isActive: true } },
        { $lookup: { from: 'clients', localField: 'clientId', foreignField: '_id', as: 'client_info' } },
        { $unwind: { path: "$client_info", preserveNullAndEmptyArrays: true } },
        { $sort: { clientName: 1, projectName: 1 } }
    ]).exec(function (error, response) {
        if (error) deferred.reject(error);
        deferred.resolve(response);
    });
    return deferred.promise;
}

function getAssignedUsers(projectId) {
    var deferred = Q.defer();
    db.users.find({ "projects.projectId": { "$in": [projectId] }, "isActive": true }).toArray(function (err, users) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (users) {
            var assignedUsers = [];
            _.each(users, function (user) {
                if (user.isActive) {
                    var userProject = _.find(user.projects, { "projectId": projectId });
                    if (!userProject.billDates) {
                        userProject.billDates = [];
                    }
                    assignedUsers.push({
                        projectId: projectId,
                        userId: user._id,
                        userName: user.name,
                        //startDate: userProject.startDate,
                        //allocatedHours: userProject.allocatedHours,
                        billDates: userProject.billDates
                    });
                }

            });
            deferred.resolve(assignedUsers);
        } else {
            // project not found
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function getAssignedUsersWithWorkedHours(projectId) {
    var deferred = Q.defer();
    db.users.find({ "projects.projectId": { "$in": [projectId] } }).toArray(function (err, users) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (users) {
            var assignedUsers = [];
            _.each(users, function (user) {
                var userProject = _.find(user.projects, { "projectId": projectId });
                userProject.billDates = (userProject.billDates) ? userProject.billDates : [];
                _.each(userProject.billDates, function (billDate) {
                    billDate.workedHours = 0;
                    billDate.sheets = [];
                    db.timesheets.find({ "weekDate": { $gte: new Date(billDate.start), $lt: new Date(billDate.end) }, "projects.projectId": { "$in": [projectId] } }).toArray(function (err, sheets) {
                        billDate.sheets = sheets;
                        _.each(sheets, function (sheet) {
                            var billProject = _.find(sheet.projects, { "projectId": projectId });
                            billDate.workedHours += billProject.projectHours;
                        });
                    });
                });
                assignedUsers.push({
                    projectId: projectId,
                    userId: user._id,
                    userName: user.name,
                    billDates: userProject.billDates
                });
            });
            deferred.resolve(assignedUsers);
        } else {
            deferred.resolve([]);
        }
    });
    return deferred.promise;
}

function assignUsers(projectId, users) {
    var deferred = Q.defer();

    _.each(users, function (user) {
        db.users.findById(user.userId, function (err, userRoc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            if (userRoc) {
                db.projects.findById(projectId, function (err, projectRoc) {
                    if (err) deferred.reject(err.name + ': ' + err.message);
                    if (projectRoc) {
                        var rowData = {
                            "projects": []
                        };
                        if (userRoc.projects) {
                            rowData.projects = userRoc.projects;
                        }
                        var projectData = {
                            "projectId": projectId,
                            "projectName": projectRoc.projectName,
                            "clientName": projectRoc.clientName,
                            "billDates": user.billDates,
                            "ownerName": projectRoc.ownerName,
                            "ownerId": projectRoc.ownerId
                        }
                        var projectIndex = _.findIndex(rowData.projects, { "projectId": projectId });
                        if (projectIndex >= 0) {
                            rowData.projects[projectIndex] = projectData;
                        } else {
                            rowData.projects.push(projectData);
                        }
                        db.users.update({ _id: mongo.helper.toObjectID(userRoc._id) }, { '$set': rowData },
                            function (err, project) {
                                if (err) deferred.reject(err.name + ': ' + err.message);
                                //deferred.resolve(project);
                                // update user timesheets as per new changes
                                db.users.findById(userRoc._id, function (err, userObj) {
                                    var userSheetCnt = 0;
                                    var userSheetTotalCnt = 0;
                                    db.timesheets.find({ userId: userObj._id }).toArray(function (err, sheetObjs) {
                                        if (err) deferred.reject(err.name + ': ' + err.message);
                                        userSheetTotalCnt = sheetObjs.length;
                                        _.each(sheetObjs, function (sheetObj) {
                                            _.each(sheetObj.projects, function (projectObj) {
                                                var billData = getProjectBillData(projectObj, sheetObj.weekDate, userObj);
                                                projectObj.resourceType = billData.resourceType;
                                                projectObj.allocatedHours = billData.allocatedHours;
                                                projectObj.billableMaxHours = billData.billableMaxHours;
                                                projectObj.overtimeHours = 0;
                                                if (projectObj.billableMaxHours > 0 && projectObj.projectHours > projectObj.billableMaxHours) {
                                                    projectObj.billableHours = projectObj.billableMaxHours;
                                                    projectObj.overtimeHours = projectObj.projectHours - projectObj.billableMaxHours;
                                                } else {
                                                    projectObj.billableHours = projectObj.projectHours;
                                                }
                                            });
                                            sheetObj.totalHours = 0;
                                            sheetObj.totalBillableHours = 0;
                                            sheetObj.timeoffHours = 0;
                                            sheetObj.overtimeHours = 0;
                                            _.each(sheetObj.projects, function (projectObj) {
                                                /*if(!projectObj.businessUnit){
                                                    projectObj.businessUnit = "";
                                                }
                                                var projectInfo = _.find(allProjects, {_id: projectObj.projectId});
                                                if(projectInfo && projectInfo.businessUnit){
                                                    projectObj.businessUnit = projectInfo.businessUnit;
                                                }*/
                                                sheetObj.totalHours += projectObj.projectHours;
                                                sheetObj.totalBillableHours += projectObj.billableHours;
                                                sheetObj.timeoffHours += projectObj.sickLeaveHours;
                                                sheetObj.timeoffHours += projectObj.timeoffHours;
                                                sheetObj.overtimeHours += projectObj.overtimeHours;
                                            });
                                            var newSheetObj = {
                                                userId: mongo.helper.toObjectID(sheetObj.userId),
                                                week: sheetObj.week,
                                                weekDate: sheetObj.weekDate,
                                                userResourceType: userObj.userResourceType,
                                                totalHours: sheetObj.totalHours,
                                                totalBillableHours: sheetObj.totalBillableHours,
                                                timeoffHours: sheetObj.timeoffHours,
                                                overtimeHours: sheetObj.overtimeHours,
                                                projects: sheetObj.projects
                                            }
                                            newSheetObj.updatedOn = new Date();
                                            db.timesheets.update({ _id: mongo.helper.toObjectID(sheetObj._id) }, { $set: newSheetObj }, function (err, responseSheet) {
                                                userSheetCnt++;
                                                if (userSheetCnt >= userSheetTotalCnt) {
                                                    deferred.resolve();
                                                }
                                            });
                                        });
                                    });
                                });
                                // end of update user timesheets as per new changes
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

function getProjectBillData(projectObj, weekDateVal, sheetUserObj) {
    var BillData = {
        resourceType: "buffer",
        allocatedHours: 40,
        billableMaxHours: 0
    };
    if (sheetUserObj && sheetUserObj.projects) {
        var prjData = _.find(sheetUserObj.projects, { "projectId": projectObj.projectId + "" });
        if (prjData && prjData.billDates) {
            var weekDate = new Date(weekDateVal);
            _.each(prjData.billDates, function (billDate) {
                if (billDate.start && billDate.start != "" && billDate.end && billDate.end != "") {
                    var startDate = new Date(billDate.start);
                    var endDate = new Date(billDate.end);
                    if (weekDate >= startDate && weekDate <= endDate) {
                        BillData.resourceType = billDate.resourceType;
                        BillData.allocatedHours = billDate.allocatedHours;
                        BillData.billableMaxHours = billDate.billableMaxHours;
                    }
                } else if (billDate.start && billDate.start != "") {
                    var startDate = new Date(billDate.start);
                    if (weekDate >= startDate) {
                        BillData.resourceType = billDate.resourceType;
                        BillData.allocatedHours = billDate.allocatedHours;
                        BillData.billableMaxHours = billDate.billableMaxHours;
                    }
                } else if (billDate.end && billDate.end != "") {
                    var endDate = new Date(billDate.end);
                    if (weekDate <= endDate) {
                        BillData.resourceType = billDate.resourceType;
                        BillData.allocatedHours = billDate.allocatedHours;
                        BillData.billableMaxHours = billDate.billableMaxHours;
                    }
                } else if (billDate.start == "" && billDate.end == "") {
                    BillData.resourceType = billDate.resourceType;
                    BillData.allocatedHours = billDate.allocatedHours;
                    BillData.billableMaxHours = billDate.billableMaxHours;
                }
            });
        }
    }
    if (!(BillData.allocatedHours >= 0)) {
        BillData.allocatedHours = 40;
    }
    if (!(BillData.billableMaxHours >= 0)) {
        BillData.billableMaxHours = 0;
    }
    return BillData;
}

function assignUser(projectId, user) {
    var deferred = Q.defer();

    db.users.findById(user.userId, function (err, userRoc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (userRoc) {
            db.projects.findById(projectId, function (err, projectRoc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                if (projectRoc) {
                    var rowData = {
                        "projects": []
                    };
                    if (userRoc.projects) {
                        rowData.projects = userRoc.projects;
                    }
                    var projectData = {
                        "projectId": projectId,
                        "projectName": projectRoc.projectName,
                        "clientName": projectRoc.clientName,
                        "startDate": user.startDate,
                        "billDates": user.billDates,
                        "ownerId": projectRoc.ownerId,
                        "ownerName": projectRoc.ownerName,
                    }
                    var projectIndex = _.findIndex(rowData.projects, { "projectId": projectId });
                    if (projectIndex >= 0) {
                        rowData.projects[projectIndex] = projectData;
                    } else {
                        rowData.projects.push(projectData);
                    }
                    db.users.update({ _id: mongo.helper.toObjectID(userRoc._id) }, { '$set': rowData },
                        function (err, project) {
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
    db.users.findById(userId, function (err, userRoc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (userRoc) {
            var rowData = {
                "projects": []
            };
            if (userRoc.projects) {
                rowData.projects = userRoc.projects;
            }
            var projectIndex = _.findIndex(rowData.projects, { "projectId": projectId });
            if (projectIndex >= 0) {
                rowData.projects.splice(projectIndex, 1);
            }
            db.users.update({ _id: mongo.helper.toObjectID(userRoc._id) }, { '$set': rowData },
                function (err, project) {
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

function getClients() {
    var deferred = Q.defer();
    db.clients.find().toArray(function (err, clients) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (clients) {
            deferred.resolve(clients);
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function getClientById(clientId) {
    var deferred = Q.defer();
    db.clients.findById(clientId, function (err, client) {
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
        clientCode: clientParam.clientCode,
        createdOn: new Date(),
        updatedOn: new Date()
    }
    db.clients.insert(clientObj, function (err, client) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(client);
    });
    return deferred.promise;
}

function updateClient(_id, clientParam) {
    var deferred = Q.defer();
    var clientObj = {
        clientName: clientParam.clientName,
        clientCode: clientParam.clientCode
    }
    clientObj.updatedOn = new Date();
    db.clients.update({ _id: mongo.helper.toObjectID(_id) }, { '$set': clientObj }, true, function (err, client) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        db.projects.update({ clientId: mongo.helper.toObjectID(_id) }, { '$set': { clientName: clientParam.clientName } }, { upsert: true, multi: true }, function (err, respone) {
            deferred.resolve(client);
        });
    });
    return deferred.promise;
}

function deleteClient(_id) {
    var deferred = Q.defer();

    db.clients.remove({ _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
        });

    return deferred.promise;
}

function getProjectOwners() {
    var deferred = Q.defer();
    projects.aggregate([
        { $match: { isActive: true } },
        { $project: { 'projectName': true, 'ownerId': { '$toObjectId': '$ownerId' }, 'user_info.name': 1 } },
        { $lookup: { from: 'users', localField: 'ownerId', foreignField: '_id', as: 'user_info' } },
    ]).exec(function (error, response) {
        if (error) deferred.reject(error);
        deferred.resolve(response);
    });
    return deferred.promise;
}