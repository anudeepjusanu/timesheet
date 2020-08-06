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
service.updateReimbursementItemFile = updateReimbursementItemFile;
service.deleteReimbursementItem = deleteReimbursementItem;

service.getApproveUsersList = getApproveUsersList;

module.exports = service;

function getMyReimbursements(userId) {
    return new Promise((resolve, reject) => {
        ReimbursementModel.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "users", localField: "approveUserId", foreignField: "_id", as: "approveUser" } },
            { $unwind: { path: "$approveUser", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userId: 1, approveUserId: 1, department: 1, reimbursementFrom: 1, reimbursementTo: 1, purpose: 1,
                    status: 1, totalAmount: 1, status: 1, createdBy: 1, createdOn: 1, items: 1, approveUserName: '$approveUser.name',
                    userName: '$user.name',
                }
            }
        ]).exec().then((data) => {
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

function addReimbursement(reimbursementData) {
    return new Promise((resolve, reject) => {
        if (reimbursementData.userId) {
            reimbursementData.userId = mongoose.Types.ObjectId(reimbursementData.userId);
        }
        reimbursementObj = new ReimbursementModel(reimbursementData);
        reimbursementObj.save(function (error, data) {
            if (error) {
                reject({ error: error, reimbursementObj: reimbursementObj });
            } else {
                resolve(data);
                // ReimbursementModel.updateOne({ _id: mongoose.Types.ObjectId(ReimbursementModel._id) }, {
                //     $set: { "totalCost": { $sum: "$items.billAmount" } }
                // }).exec().then((response) => {
                //     resolve(data);
                // }).catch((error) => {
                //     reject({ error: error.errmsg });
                // });
            }
        });
    });
}

function updateReimbursement(ReimbursementId, ReimbursementData) {
    return new Promise((resolve, reject) => {
        if (ReimbursementData.userId) {
            ReimbursementData.userId = mongoose.Types.ObjectId(ReimbursementData.userId);
        }
        ReimbursementModel.updateOne({ _id: mongoose.Types.ObjectId(ReimbursementId) }, { $set: ReimbursementData }).exec().then((data) => {
            resolve(data);
            // ReimbursementModel.updateOne({ _id: mongoose.Types.ObjectId(ReimbursementId) }, {
            //     $set: { "totalCost": { $sum: "$items.billAmount" } }
            // }).exec().then((response) => {
            //     resolve(data);
            // }).catch((error) => {
            //     reject({ error: error.errmsg });
            // });
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
        var itemUpdate = {
            'items.$.billDate': itemData.billDate,
            'items.$.billCategory': itemData.billCategory,
            'items.$.billDescription': itemData.billDescription,
            'items.$.billAmount': itemData.billAmount,
            'items.$.updatedOn': new Date()
        }
        if (itemData.billFile) {
            itemUpdate['items.$.billFile'] = itemData.billFile;
        }
        ReimbursementModel.updateOne({ 'items._id': mongoose.Types.ObjectId(itemId) },
            { $set: itemUpdate }).exec().then((data) => {
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

function updateReimbursementItemFile(itemId, fileData) {
    return new Promise((resolve, reject) => {
        ReimbursementModel.findOneAndUpdate({ 'items._id': mongoose.Types.ObjectId(itemId) },
            { $set: { 'items.$.billFile': fileData.filename } }).exec().then((itemData) => {
                resolve(itemData);
            }).catch((error) => {
                reject({ error: error.errmsg });
            });
    });
}

function getApproveUsersList() {
    return new Promise((resolve, reject) => {
        UserModel.aggregate([
            { $match: { isActive: true } },
            { $project: { name: 1, employeeId: true } }
        ]).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}