var config = require(__dirname + '/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
var UserModel = require("../models/user.model");
var DailyTrackerModel = require("../models/dailyTracker.model");
mongoose.connect(config.connectionString);

var service = {};

service.getMyDailyTrackerTasks = getMyDailyTrackerTasks;
service.getDailyTrackerTask = getDailyTrackerTask;
service.addDailyTrackerTask = addDailyTrackerTask;
service.updateDailyTrackerTask = updateDailyTrackerTask;
service.deleteDailyTrackerTask = deleteDailyTrackerTask;

module.exports = service;

function getMyDailyTrackerTasks(userId) {
    return new Promise((resolve, reject) => {
        DailyTrackerModel.find({ userId: mongoose.Types.ObjectId(userId) }).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

function getDailyTrackerTask(DailyTrackerModelId) {
    return new Promise((resolve, reject) => {
        DailyTrackerModel.findOne({ _id: mongoose.Types.ObjectId(DailyTrackerModelId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addDailyTrackerTask(DailyTrackerModelData) {
    return new Promise((resolve, reject) => {
        DailyTrackerModelData.userId = mongoose.Types.ObjectId(DailyTrackerModelData.userId);
        DailyTrackerModelData.taskCategoryId = mongoose.Types.ObjectId(DailyTrackerModelData.taskCategoryId);
        DailyTrackerModelData.trackerDate = new Date(DailyTrackerModelData.trackerDate);
        DailyTrackerModelData.taskStartTime = new Date(DailyTrackerModelData.taskStartTime);
        DailyTrackerModelData.taskEndTime = new Date(DailyTrackerModelData.taskEndTime);
        DailyTrackerModelObj = new DailyTrackerModel(DailyTrackerModelData);
        DailyTrackerModelObj.save(function (error, data) {
            if (error) {
                reject({ error: error });
            }
            resolve(data);
        });
    });
}

function updateDailyTrackerTask(DailyTrackerModelId, DailyTrackerModelData) {
    return new Promise((resolve, reject) => {
        DailyTrackerModelData.userId = mongoose.Types.ObjectId(DailyTrackerModelData.userId);
        DailyTrackerModel.updateOne({ _id: mongoose.Types.ObjectId(DailyTrackerModelId) }, DailyTrackerModelData).exec().then((data) => {
            console.log(data);
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function deleteDailyTrackerTask(DailyTrackerModelId) {
    return new Promise((resolve, reject) => {
        DailyTrackerModel.deleteOne({ _id: mongoose.Types.ObjectId(DailyTrackerModelId) }).lean().exec().then((data) => {
            console.log(data);
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}