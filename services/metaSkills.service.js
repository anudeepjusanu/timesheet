var config = require(__dirname + '/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
var metaSkills = require("../models/metaSkills.model");

var service = {};

service.getMetaSkills = getMetaSkills;
service.getMetaSkill = getMetaSkill;
service.addMetaSkill = addMetaSkill;
service.updateMetaSkill = updateMetaSkill;
service.delMetaSkill = delMetaSkill;

module.exports = service;

function getMetaSkills() {
    return new Promise((resolve, reject) => {
        metaSkills.find().lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function getMetaSkill(metaSkillId) {
    return new Promise((resolve, reject) => {
        metaSkills.findOne({ _id: mongoose.Types.ObjectId(metaSkillId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addMetaSkill(metaSkillData) {
    return new Promise((resolve, reject) => {
        metaSkillObj = new metaSkills(metaSkillData);
        metaSkillObj.save(function (error, data) {
            if (error) {
                reject({ error: error.errmsg });
            }
            resolve(data);
        });
    });
}


function updateMetaSkill(metaSkillId, metaSkill) {
    return new Promise((resolve, reject) => {
        metaSkills.updateOne({ _id: mongoose.Types.ObjectId(metaSkillId) }, metaSkill).exec().then((data) => {
            console.log(data);
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function delMetaSkill(metaSkillId) {
    return new Promise((resolve, reject) => {
        metaSkills.deleteOne({ _id: mongoose.Types.ObjectId(metaSkillId) }).lean().exec().then((data) => {
            console.log(data);
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}