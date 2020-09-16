var config = require(__dirname + '/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
var UserModel = require("../models/user.model");
var DailyTrackerModel = require("../models/dailyTracker.model");

var service = {};

service.getMyDailyTrackerTasks = getMyDailyTrackerTasks;
service.getDailyTrackerTask = getDailyTrackerTask;
service.addDailyTrackerTask = addDailyTrackerTask;
service.updateDailyTrackerTask = updateDailyTrackerTask;
service.deleteDailyTrackerTask = deleteDailyTrackerTask;

module.exports = service;

function getMyDailyTrackerTasks(userId, queryData) {
    return new Promise((resolve, reject) => {
        var nowDate = new Date();
        nowDate = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) + "-" + nowDate.getDate() + " 00:00:00.000Z";
        queryData.trackerDate = (queryData.trackerDate && queryData.trackerDate.length > 0) ? new Date(queryData.trackerDate) : new Date(nowDate);
        DailyTrackerModel.find({ userId: mongoose.Types.ObjectId(userId), trackerDate: queryData.trackerDate }).exec().then((data) => {
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

function addDailyTrackerTask(dailyTrackerModelData) {
    return new Promise((resolve, reject) => {
        dailyTrackerModelData.userId = mongoose.Types.ObjectId(dailyTrackerModelData.userId);
        dailyTrackerModelData.taskCategoryId = mongoose.Types.ObjectId(dailyTrackerModelData.taskCategoryId);
        dailyTrackerModelData.trackerDate = new Date(dailyTrackerModelData.trackerDate);
        dailyTrackerModelData.taskStartTime = new Date(dailyTrackerModelData.taskStartTime);
        dailyTrackerModelData.taskEndTime = new Date(dailyTrackerModelData.taskEndTime);
        DailyTrackerModelObj = new DailyTrackerModel(dailyTrackerModelData);
        DailyTrackerModelObj.save(function (error, data) {
            if (error) {
                reject({ error: error });
            }
            resolve(data);
        });
    });
}

function updateDailyTrackerTask(dailyTrackerId, dailyTrackerModelData) {
    return new Promise((resolve, reject) => {
        var dailyTrackerData = {
            taskCategoryId: mongoose.Types.ObjectId(dailyTrackerModelData.taskCategoryId),
            taskShortName: dailyTrackerModelData.taskShortName,
            trackerDate: new Date(dailyTrackerModelData.trackerDate),
            taskStartTime: new Date(dailyTrackerModelData.taskStartTime),
            taskEndTime: new Date(dailyTrackerModelData.taskEndTime),
            updatedOn: new Date()
        };
        DailyTrackerModel.updateOne({ _id: mongoose.Types.ObjectId(dailyTrackerId) }, { $set: dailyTrackerData }).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function deleteDailyTrackerTask(DailyTrackerModelId) {
    return new Promise((resolve, reject) => {
        DailyTrackerModel.deleteOne({ _id: mongoose.Types.ObjectId(DailyTrackerModelId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}