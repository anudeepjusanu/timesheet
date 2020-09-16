var config = require(__dirname + '/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
var JobOpeningModel = require("../models/userskill.model");

var service = {};

service.getJobOpenings = getJobOpenings;
service.getAllJobOpenings = getAllJobOpenings;
service.getJobOpening = getJobOpening;
service.addJobOpening = addJobOpening;
service.updateJobOpening = updateJobOpening;
service.deleteJobOpening = deleteJobOpening;

module.exports = service;

function getJobOpenings() {
    return new Promise((resolve, reject) => {
        JobOpeningModel.find({ isActive: true }).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

function getAllJobOpenings() {
    return new Promise((resolve, reject) => {
        JobOpeningModel.find().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

function getJobOpening(JobOpeningId) {
    return new Promise((resolve, reject) => {
        JobOpeningModel.findOne({ _id: mongoose.Types.ObjectId(JobOpeningId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addJobOpening(JobOpeningData) {
    return new Promise((resolve, reject) => {
        JobOpeningObj = new JobOpeningModel(JobOpeningData);
        JobOpeningObj.save(function (error, data) {
            if (error) {
                reject({ error: error });
            }
            resolve(data);
        });
    });
}

function updateJobOpening(JobOpeningId, JobOpeningData) {
    return new Promise((resolve, reject) => {
        JobOpeningModel.updateOne({ _id: mongoose.Types.ObjectId(JobOpeningId) }, { $set: JobOpeningData }).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function deleteJobOpening(JobOpeningId) {
    return new Promise((resolve, reject) => {
        JobOpeningModel.deleteOne({ _id: mongoose.Types.ObjectId(JobOpeningId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}