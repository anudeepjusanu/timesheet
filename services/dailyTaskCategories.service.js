var config = require(__dirname + '/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
const DailyTaskCategory = require("../models/dailyTaskCategories.model");
mongoose.connect(config.connectionString);

var service = {};

service.getDailyTaskCategories = getDailyTaskCategories;
service.getDailyTaskCategory = getDailyTaskCategory;
service.addDailyTaskCategory = addDailyTaskCategory;
service.updateDailyTaskCategory = updateDailyTaskCategory;
service.delDailyTaskCategory = delDailyTaskCategory;

module.exports = service;

function getDailyTaskCategories() {
    return new Promise((resolve, reject) => {
        DailyTaskCategory.find().lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function getDailyTaskCategory(taskCategoryId) {
    return new Promise((resolve, reject) => {
        DailyTaskCategory.findOne({ _id: mongoose.Types.ObjectId(taskCategoryId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addDailyTaskCategory(categoryData) {
    return new Promise((resolve, reject) => {
        console.log(categoryData);
        skillCategoryObj = new DailyTaskCategory(categoryData);
        skillCategoryObj.save(function (error, data) {
            if (error) {
                console.log(error);
                reject({ error: error.errmsg });
            } else {
                resolve(data);
            }
        });
    });
}


function updateDailyTaskCategory(taskCategoryId, categoryData) {
    return new Promise((resolve, reject) => {
        DailyTaskCategory.updateOne({ _id: mongoose.Types.ObjectId(taskCategoryId) }, { $set: categoryData }).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function delDailyTaskCategory(taskCategoryId) {
    return new Promise((resolve, reject) => {
        DailyTaskCategory.deleteOne({ _id: mongoose.Types.ObjectId(taskCategoryId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}