var config = require(__dirname + '/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
var JobOpeningModel = require("../models/jobOpening.model");
const JobOpeningReferModel = require("../models/jobOpeningRefer.model");
var nodemailer = require("nodemailer");

var service = {};

service.getActiveJobOpenings = getActiveJobOpenings;
service.referJobOpening = referJobOpening;
service.getAllJobOpenings = getAllJobOpenings;
service.getJobOpening = getJobOpening;
service.addJobOpening = addJobOpening;
service.updateJobOpening = updateJobOpening;
service.deleteJobOpening = deleteJobOpening;

module.exports = service;

function getActiveJobOpenings() {
    return new Promise((resolve, reject) => {
        JobOpeningModel.find({ isActive: true }).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

function referJobOpening(JobOpeningReferData) {
    return new Promise((resolve, reject) => {
        JobOpeningReferObj = new JobOpeningReferModel(JobOpeningReferData);
        JobOpeningReferObj.save(async function (error, data) {
            let transporter = nodemailer.createTransport({
                host: "outlook.office365.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: "lbsastry@wavelabs.ai", // generated ethereal user
                    pass: "Dev@1982", // generated ethereal password
                },
            });
            var messageObj = {
                from: '"Refer Program" <lbsastry@wavelabs.ai>', // sender address
                to: "hr@wavelabs.ai", // list of receivers
                subject: JobOpeningReferData.subject, // Subject line
                text: JobOpeningReferData.body, // plain text body
            }
            if (JobOpeningReferData.resume) {
                messageObj.attachments = [
                    { "path": "public/data/jobOpeningResumes/" + JobOpeningReferData.resume }
                ];
            }
            let info = await transporter.sendMail(messageObj);
            if (error) {
                reject({ error: error });
            }
            resolve(data);
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

function addJobOpening(jobOpening) {
    return new Promise((resolve, reject) => {
        var jobOpeningData = {
            jobCode: jobOpening.jobCode ? jobOpening.jobCode : null,
            jobTitle: jobOpening.jobTitle,
            jobExperience: jobOpening.jobExperience,
            jobPositions: jobOpening.jobPositions ? jobOpening.jobPositions : 1,
            jobDescription: jobOpening.jobDescription ? jobOpening.jobDescription : "",
            isActive: jobOpening.isActive === false ? false : true
        };
        JobOpeningObj = new JobOpeningModel(jobOpeningData);
        JobOpeningObj.save(function (error, data) {
            if (error) {
                reject({ error: error });
            }
            resolve(data);
        });
    });
}

function updateJobOpening(JobOpeningId, jobOpening) {
    return new Promise((resolve, reject) => {
        var jobOpeningData = {
            jobCode: jobOpening.jobCode ? jobOpening.jobCode : null,
            jobTitle: jobOpening.jobTitle,
            jobExperience: jobOpening.jobExperience,
            jobPositions: jobOpening.jobPositions ? jobOpening.jobPositions : 1,
            jobDescription: jobOpening.jobDescription ? jobOpening.jobDescription : "",
            isActive: jobOpening.isActive === false ? false : true
        };
        JobOpeningModel.updateOne({ _id: mongoose.Types.ObjectId(JobOpeningId) }, { $set: jobOpeningData }).exec().then((data) => {
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