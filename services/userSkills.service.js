var config = require(__dirname + '/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
var UserSkill = require("../models/userskill.model");
var UserModel = require("../models/user.model");

var service = {};

service.getAllUserSkills = getAllUserSkills;
service.getUserSkill = getUserSkill;
service.addUserSkill = addUserSkill;
service.updateUserSkill = updateUserSkill;
service.deleteUserSkill = deleteUserSkill;

module.exports = service;

function getAllUserSkills() {
    return new Promise((resolve, reject) => {
        var aggregateQuery = [
            { $match: {} },
            { $lookup: { from: "userskills", localField: "_id", foreignField: "userId", as: "userSkills" } },
            { $project: { name: 1, username: 1, profileImgUrl: 1, userResourceType: 1, skillCategory: 1, userSkills: 1, resourceInPool: 1, poolName: 1, poolSinceDate: 1, isActive: 1 } }
        ];
        UserModel.aggregate(aggregateQuery).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

function getUserSkill(UserSkillId) {
    return new Promise((resolve, reject) => {
        UserSkill.findOne({ _id: mongoose.Types.ObjectId(UserSkillId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addUserSkill(UserSkillData) {
    return new Promise((resolve, reject) => {
        UserSkillData.userId = mongoose.Types.ObjectId(UserSkillData.userId);
        UserSkillObj = new UserSkill(UserSkillData);
        UserSkillObj.save(function (error, data) {
            if (error) {
                reject({ error: error });
            }
            resolve(data);
        });
    });
}

function updateUserSkill(UserSkillId, UserSkillData) {
    return new Promise((resolve, reject) => {
        UserSkillData.userId = mongoose.Types.ObjectId(UserSkillData.userId);
        UserSkill.updateOne({ _id: mongoose.Types.ObjectId(UserSkillId) }, UserSkillData).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function deleteUserSkill(UserSkillId) {
    return new Promise((resolve, reject) => {
        UserSkill.deleteOne({ _id: mongoose.Types.ObjectId(UserSkillId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}