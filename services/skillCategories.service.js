var config = require(__dirname + '/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
var skillCategories = require("../models/skillCategories.model");

var service = {};

service.getSkillCategories = getSkillCategories;
service.getSkillCategory = getSkillCategory;
service.addSkillCategory = addSkillCategory;
service.updateSkillCategory = updateSkillCategory;
service.delSkillCategory = delSkillCategory;

module.exports = service;

function getSkillCategories() {
    return new Promise((resolve, reject) => {
        skillCategories.find().lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function getSkillCategory(skillCategoryId) {
    return new Promise((resolve, reject) => {
        skillCategories.findOne({ _id: mongoose.Types.ObjectId(skillCategoryId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addSkillCategory(skillCategoryData) {
    return new Promise((resolve, reject) => {
        skillCategoryObj = new skillCategories(skillCategoryData);
        skillCategoryObj.save(function (error, data) {
            if (error) {
                reject({ error: error.errmsg });
            }
            resolve(data);
        });
    });
}


function updateSkillCategory(skillCategoryId, skillCategory) {
    return new Promise((resolve, reject) => {
        skillCategories.updateOne({ _id: mongoose.Types.ObjectId(skillCategoryId) }, skillCategory).exec().then((data) => {
            console.log(data);
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function delSkillCategory(skillCategoryId) {
    return new Promise((resolve, reject) => {
        skillCategories.deleteOne({ _id: mongoose.Types.ObjectId(skillCategoryId) }).lean().exec().then((data) => {
            console.log(data);
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}