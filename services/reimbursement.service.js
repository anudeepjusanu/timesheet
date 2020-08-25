var config = require(__dirname + '/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
var ReimbursementModel = require("../models/reimbursement.model");
var ReimbursementReciptModel = require("../models/reimbursementReceipt.model");
var ProjectModel = require("../models/project.model");
var UserModel = require("../models/user.model");
const { async } = require('q');
const { find } = require('lodash');
mongoose.connect(config.connectionString);

var service = {};

service.getMyReimbursements = getMyReimbursements;
service.getTeamReimbursements = getTeamReimbursements;
service.getAccountReimbursements = getAccountReimbursements;
service.getReimbursement = getReimbursement;
service.addReimbursement = addReimbursement;
service.updateReimbursement = updateReimbursement;
service.deleteReimbursement = deleteReimbursement;

service.getMyReceipts = getMyReceipts;

service.getReimbursementReceipt = getReimbursementReceipt;
service.addReimbursementReceipt = addReimbursementReceipt;
service.updateReimbursementReceipt = updateReimbursementReceipt;
service.updateReimbursementReceiptStatus = updateReimbursementReceiptStatus;
service.updateReimbursementReceiptFile = updateReimbursementReceiptFile;
service.deleteReimbursementReceipt = deleteReimbursementReceipt;

service.getApproveUsersList = getApproveUsersList;
service.getActiveProjectsList = getActiveProjectsList;

module.exports = service;

function getMyReimbursements(userId) {
    return new Promise((resolve, reject) => {
        ReimbursementModel.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "users", localField: "approveUserId", foreignField: "_id", as: "approveUser" } },
            { $unwind: { path: "$approveUser", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "projects", localField: "projectId", foreignField: "_id", as: "project" } },
            { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userId: 1, approveUserId: 1, projectId: 1, reimbursementMonth: 1, purpose: 1, status: 1, totalAmount: 1,
                    createdBy: 1, createdOn: 1, receipts: 1, comment: 1, approveUserName: '$approveUser.name', userName: '$user.name',
                    employeeId: '$user.employeeId', projectName: '$project.projectName'
                }
            },
            { $sort: { createdOn: -1 } }
        ]).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

function getTeamReimbursements(userId) {
    return new Promise((resolve, reject) => {
        ReimbursementModel.aggregate([
            { $match: { approveUserId: mongoose.Types.ObjectId(userId), /*status: 'Submitted'*/ } },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "users", localField: "approveUserId", foreignField: "_id", as: "approveUser" } },
            { $unwind: { path: "$approveUser", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "projects", localField: "projectId", foreignField: "_id", as: "project" } },
            { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userId: 1, approveUserId: 1, projectId: 1, reimbursementMonth: 1, purpose: 1, status: 1, totalAmount: 1,
                    createdBy: 1, createdOn: 1, receipts: 1, comment: 1, approveUserName: '$approveUser.name', userName: '$user.name',
                    employeeId: '$user.employeeId', projectName: '$project.projectName'
                }
            },
            { $sort: { createdOn: -1 } }
        ]).exec().then(async (data) => {
            for (var i = 0; i < data.length; i++) {
                data[i].receipts = await ReimbursementReciptModel.find({ _id: { $in: data[i].receipts } }).exec();
            }
            resolve(data);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

function getAccountReimbursements(userId) {
    return new Promise((resolve, reject) => {
        ReimbursementModel.aggregate([
            { $match: { status: { $in: ['Approved', 'Expenses Approved', 'Payment Rejected'] } } },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "users", localField: "approveUserId", foreignField: "_id", as: "approveUser" } },
            { $unwind: { path: "$approveUser", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "projects", localField: "projectId", foreignField: "_id", as: "project" } },
            { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userId: 1, approveUserId: 1, projectId: 1, reimbursementMonth: 1, purpose: 1, status: 1, totalAmount: 1,
                    createdBy: 1, createdOn: 1, receipts: 1, comment: 1, approveUserName: '$approveUser.name', userName: '$user.name',
                    employeeId: '$user.employeeId', projectName: '$project.projectName'
                }
            },
            { $sort: { createdOn: -1 } }
        ]).exec().then(async (data) => {
            for (var i = 0; i < data.length; i++) {
                data[i].receipts = await ReimbursementReciptModel.find({ _id: { $in: data[i].receipts } }).exec();
            }
            resolve(data);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

function getReimbursement(ReimbursementId) {
    return new Promise((resolve, reject) => {
        ReimbursementModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(ReimbursementId) } },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            {
                $project: {
                    userId: 1, approveUserId: 1, projectId: 1, reimbursementMonth: 1, purpose: 1, status: 1, totalAmount: 1, createdBy: 1, comment: 1,
                    createdOn: 1, receipts: 1, userName: '$user.name', employeeId: '$user.employeeId', projectName: '$project.projectName'
                }
            }
        ]).exec().then(async (data) => {
            data = data[0];
            data.receipts = await ReimbursementReciptModel.find({ _id: { $in: data.receipts } }).exec();
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addReimbursement(reimbursementData) {
    return new Promise(async (resolve, reject) => {
        reimbursementData.userId = (reimbursementData.userId) ? mongoose.Types.ObjectId(reimbursementData.userId) : null;
        reimbursementData.projectId = (reimbursementData.projectId) ? mongoose.Types.ObjectId(reimbursementData.projectId) : null;
        reimbursementData.approveUserId = (reimbursementData.approveUserId) ? mongoose.Types.ObjectId(reimbursementData.approveUserId) : null;
        for (var i = 0; i < reimbursementData.receipts.length; i++) {
            reimbursementData.receipts[i] = mongoose.Types.ObjectId(reimbursementData.receipts[i]);
        }
        var receiptSum = await ReimbursementReciptModel.aggregate([
            { $match: { "_id": { "$in": reimbursementData.receipts } } },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$receiptAmount"
                    }
                }
            }
        ]).exec();
        reimbursementData.totalAmount = (receiptSum[0]) ? receiptSum[0].total : 0.0;
        reimbursementObj = new ReimbursementModel(reimbursementData);
        reimbursementObj.save(function (error, data) {
            if (error) {
                reject({ error: error, reimbursement: reimbursementObj });
            } else {
                ReimbursementReciptModel.updateMany({ _id: { $in: reimbursementData.receipts } }, { $set: { reimbursementId: reimbursementObj._id, status: "Submitted" } }).exec().then((data) => {
                    resolve(reimbursementObj);
                }).catch((error) => {
                    reject({ error: error.errmsg });
                });
            }
        });
    });
}

function updateReimbursement(ReimbursementId, reimbursementData) {
    return new Promise(async (resolve, reject) => {
        if (reimbursementData.status == 'Approved') {
            var totalApprovedAmount = 0;
            for (var i = 0; i < reimbursementData.receipts.length; i++) {
                var receiptObj = reimbursementData.receipts[i];
                await ReimbursementReciptModel.updateOne({ '_id': mongoose.Types.ObjectId(receiptObj._id) },
                    { $set: { approvedAmount: receiptObj.approvedAmount } }).exec();
                totalApprovedAmount += parseFloat(receiptObj.approvedAmount);
            }
            reimbursementData = {
                status: reimbursementData.status,
                totalAmount: totalApprovedAmount,
                comment: reimbursementData.comment
            }
        }
        if (reimbursementData.userId) {
            reimbursementData.userId = mongoose.Types.ObjectId(reimbursementData.userId);
        }
        ReimbursementModel.updateOne({ _id: mongoose.Types.ObjectId(ReimbursementId) }, { $set: reimbursementData }).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function deleteReimbursement(ReimbursementId) {
    return new Promise((resolve, reject) => {
        ReimbursementModel.deleteOne({ _id: mongoose.Types.ObjectId(ReimbursementId), status: 'Submitted' }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function getMyReceipts(userId) {
    return new Promise((resolve, reject) => {
        ReimbursementReciptModel.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            { $sort: { createdOn: -1 } }
        ]).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

/** Receipt */
function getReimbursementReceipt(receiptId) {
    return new Promise((resolve, reject) => {
        ReimbursementReciptModel.findOne({ '_id': mongoose.Types.ObjectId(receiptId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addReimbursementReceipt(receiptData) {
    return new Promise((resolve, reject) => {
        var receiptDataObj = {
            receiptDate: receiptData.receiptDate,
            receiptCategory: receiptData.receiptCategory,
            receiptDescription: receiptData.receiptDescription,
            receiptAmount: receiptData.receiptAmount
        };
        receiptDataObj.userId = mongoose.Types.ObjectId(receiptData.userId)
        if (receiptData.receiptFile) {
            receiptDataObj.receiptFile = receiptData.receiptFile;
        }
        if (receiptData.status) {
            receiptDataObj.receiptFile = receiptData.status;
        }
        var receiptObj = new ReimbursementReciptModel(receiptDataObj);
        receiptObj.save(function (error, data) {
            if (error) {
                reject({ error: error });
            } else {
                resolve(data);
            }
        });
    });
}

function updateReimbursementReceipt(receiptId, receiptData) {
    return new Promise((resolve, reject) => {
        var receiptDataObj = {};
        var receiptDataObj = {
            receiptDate: receiptData.receiptDate,
            receiptCategory: receiptData.receiptCategory,
            receiptDescription: receiptData.receiptDescription,
            receiptAmount: receiptData.receiptAmount
        };
        if (receiptData.receiptFile) {
            receiptDataObj.receiptFile = receiptData.receiptFile;
        }
        if (receiptData.status) {
            receiptDataObj.receiptFile = receiptData.status;
        }
        ReimbursementReciptModel.updateOne({ '_id': mongoose.Types.ObjectId(receiptId) },
            { $set: receiptDataObj }).exec().then((data) => {
                resolve(data);
            }).catch((error) => {
                reject({ error: error.errmsg });
            });
    });
}

function updateReimbursementReceiptStatus(receiptId, receiptData) {
    return new Promise((resolve, reject) => {
        ReimbursementReciptModel.updateOne({ '_id': mongoose.Types.ObjectId(receiptId) },
            { $set: receiptData }).exec().then((data) => {
                resolve(data);
            }).catch((error) => {
                reject({ error: error.errmsg });
            });
    });
}

function deleteReimbursementReceipt(receiptId) {
    return new Promise((resolve, reject) => {
        ReimbursementReciptModel.deleteOne({ _id: mongoose.Types.ObjectId(receiptId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function updateReimbursementReceiptFile(receiptId, fileData) {
    return new Promise((resolve, reject) => {
        ReimbursementReciptModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(receiptId) },
            { $set: { 'receiptFile': fileData.filename } }).exec().then((itemData) => {
                resolve(itemData);
            }).catch((error) => {
                reject({ error: error.errmsg });
            });
    });
}

// Get Active users
function getApproveUsersList() {
    return new Promise((resolve, reject) => {
        ProjectModel.aggregate([
            { $match: { isActive: true } },
            { $project: { "ownerId": { "$toObjectId": "$ownerId" }, "reimbursementApproverId": { "$toObjectId": "$reimbursementApproverId" } } },
            //{ $lookup: { from: "users", localField: "ownerId", foreignField: "_id", as: "user" } },
            {
                $lookup: {
                    from: "users", let: { ownerId: "$ownerId", reimbursementApproverId: "$reimbursementApproverId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        {
                                            $eq: [
                                                "$_id",
                                                "$$ownerId"
                                            ]
                                        },
                                        {
                                            $eq: [
                                                "$_id",
                                                "$$reimbursementApproverId"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "user"
                }
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            { $project: { _id: '$user._id', ownerId: 1, name: '$user.name', employeeId: '$user.employeeId' } }
        ]).exec().then((data) => {
            var finalData = [];
            for (var i = 0; i < data.length; i++) {
                if (_.findIndex(finalData, { _id: data[i]._id }) === -1) {
                    finalData.push(data[i]);
                }
            }
            resolve(finalData);
        }).catch((error) => {
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

function getActiveProjectsList() {
    return new Promise((resolve, reject) => {
        ProjectModel.aggregate([
            { $match: { isActive: true } },
            { $project: { projectName: 1, projectType: 1, clientId: 1, ownerId: 1, reimbursementApproverId: 1, ownerName: 1 } }
        ]).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

// service.getReimbursementItem = getReimbursementItem;
// service.addReimbursementItem = addReimbursementItem;
// service.updateReimbursementItem = updateReimbursementItem;
// service.updateReimbursementItemFile = updateReimbursementItemFile;
// service.deleteReimbursementItem = deleteReimbursementItem;
/** Reimbursement Item */
// function getReimbursementItem(itemId) {
//     return new Promise((resolve, reject) => {
//         ReimbursementModel.findOne({ 'items._id': mongoose.Types.ObjectId(itemId) }, { 'items.$': 1 }).lean().exec().then((data) => {
//             resolve(data);
//         }).catch((error) => {
//             reject({ error: error.errmsg });
//         });
//     });
// }

// function addReimbursementItem(reimbursementId, itemData) {
//     return new Promise((resolve, reject) => {
//         ReimbursementModel.updateOne({ '_id': mongoose.Types.ObjectId(reimbursementId) }, { $push: { "items": itemData } }).exec().then((data) => {
//             resolve(data);
//         }).catch((error) => {
//             reject({ error: error.errmsg });
//         });
//     });
// }

// function updateReimbursementItem(itemId, itemData) {
//     return new Promise((resolve, reject) => {
//         itemData._id = mongoose.Types.ObjectId(itemId);
//         var itemUpdate = {
//             'items.$.billDate': itemData.billDate,
//             'items.$.billCategory': itemData.billCategory,
//             'items.$.billDescription': itemData.billDescription,
//             'items.$.billAmount': itemData.billAmount,
//             'items.$.updatedOn': new Date()
//         }
//         if (itemData.billFile) {
//             itemUpdate['items.$.billFile'] = itemData.billFile;
//         }
//         ReimbursementModel.updateOne({ 'items._id': mongoose.Types.ObjectId(itemId) },
//             { $set: itemUpdate }).exec().then((data) => {
//                 resolve(data);
//             }).catch((error) => {
//                 reject({ error: error.errmsg });
//             });
//     });
// }

// function deleteReimbursementItem(itemId) {
//     return new Promise((resolve, reject) => {
//         ReimbursementModel.updateOne({ 'items._id': mongoose.Types.ObjectId(itemId) },
//             { $pull: { 'items': { _id: mongoose.Types.ObjectId(itemId) } } }).exec().then((data) => {
//                 resolve(data);
//             }).catch((error) => {
//                 reject({ error: error.errmsg });
//             });
//     });
// }

// function updateReimbursementItemFile(itemId, fileData) {
//     return new Promise((resolve, reject) => {
//         ReimbursementModel.findOneAndUpdate({ 'items._id': mongoose.Types.ObjectId(itemId) },
//             { $set: { 'items.$.billFile': fileData.filename } }).exec().then((itemData) => {
//                 resolve(itemData);
//             }).catch((error) => {
//                 reject({ error: error.errmsg });
//             });
//     });
// }
