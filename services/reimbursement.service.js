var config = require(__dirname + '/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
var ReimbursementModel = require("../models/reimbursement.model");
var UserModel = require("../models/user.model");
mongoose.connect(config.connectionString);

var service = {};

service.getMyReimbursements = getMyReimbursements;
service.getReimbursement = getReimbursement;
service.addReimbursement = addReimbursement;
service.updateReimbursement = updateReimbursement;
service.deleteReimbursement = deleteReimbursement;

service.getReimbursementItem = getReimbursementItem;
service.addReimbursementItem = addReimbursementItem;
service.updateReimbursementItem = updateReimbursementItem;
service.deleteReimbursementItem = deleteReimbursementItem;

module.exports = service;

function getMyReimbursements(userId) {
    return new Promise((resolve, reject) => {
        ReimbursementModel.find({ userId: mongoose.Types.ObjectId(userId) }).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

function getReimbursement(ReimbursementId) {
    return new Promise((resolve, reject) => {
        ReimbursementModel.findOne({ _id: mongoose.Types.ObjectId(ReimbursementId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addReimbursement(ReimbursementData) {
    return new Promise((resolve, reject) => {
        if (ReimbursementData.userId) {
            ReimbursementData.userId = mongoose.Types.ObjectId(ReimbursementData.userId);
        }
        ReimbursementObj = new ReimbursementModel(ReimbursementData);
        ReimbursementObj.save(function (error, data) {
            if (error) {
                reject({ error: error });
            } else {
                resolve(data);
            }
        });
    });
}

function updateReimbursement(ReimbursementId, ReimbursementData) {
    return new Promise((resolve, reject) => {
        if (ReimbursementData.userId) {
            ReimbursementData.userId = mongoose.Types.ObjectId(ReimbursementData.userId);
        }
        ReimbursementModel.updateOne({ _id: mongoose.Types.ObjectId(ReimbursementId) }, ReimbursementData).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function deleteReimbursement(ReimbursementId) {
    return new Promise((resolve, reject) => {
        ReimbursementModel.deleteOne({ _id: mongoose.Types.ObjectId(ReimbursementId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function getReimbursementItem(itemId) {
    return new Promise((resolve, reject) => {
        ReimbursementModel.findOne({ 'items._id': mongoose.Types.ObjectId(itemId) }, { 'items.$': 1 }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addReimbursementItem(reimbursementId, itemData) {
    return new Promise((resolve, reject) => {
        ReimbursementModel.updateOne({ '_id': mongoose.Types.ObjectId(reimbursementId) }, { $push: { "items": itemData } }).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function updateReimbursementItem(itemId, itemData) {
    return new Promise((resolve, reject) => {
        itemData._id = mongoose.Types.ObjectId(itemId);
        ReimbursementModel.updateOne({ 'items._id': mongoose.Types.ObjectId(itemId) },
            { $set: { 'items.$': itemData } }).exec().then((data) => {
                resolve(data);
            }).catch((error) => {
                reject({ error: error.errmsg });
            });
    });
}

function deleteReimbursementItem(itemId) {
    return new Promise((resolve, reject) => {
        ReimbursementModel.updateOne({ 'items._id': mongoose.Types.ObjectId(itemId) },
            { $pull: { 'items': { _id: mongoose.Types.ObjectId(itemId) } } }).exec().then((data) => {
                resolve(data);
            }).catch((error) => {
                reject({ error: error.errmsg });
            });
    });
}

function deleteReimbursementItem(itemId) {
    return new Promise((resolve, reject) => {
        ReimbursementModel.updateOne({ 'items._id': mongoose.Types.ObjectId(itemId) },
            { $pull: { 'items': { _id: mongoose.Types.ObjectId(itemId) } } }).exec().then((data) => {
                resolve(data);
            }).catch((error) => {
                reject({ error: error.errmsg });
            });
    });
}