var config = require(__dirname + '/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
var InventoryModel = require("../models/inventory.model");
var UserModel = require("../models/user.model");
mongoose.connect(config.connectionString, { useNewUrlParser: true });

var service = {};

service.getInventories = getInventories;
service.getInventory = getInventory;
service.addInventory = addInventory;
service.updateInventory = updateInventory;
service.deleteInventory = deleteInventory;
service.assignUser = assignUser;
service.changeStatus = changeStatus;
service.getMyInventories = getMyInventories;

module.exports = service;

function getInventories() {
    return new Promise((resolve, reject) => {
        var aggregateQuery = [
            { $match: {} },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "assignedUser" } },
            { $unwind: { path: "$assignedUser", preserveNullAndEmptyArrays: true } }
            //{ $project: {} }
        ];
        InventoryModel.aggregate(aggregateQuery).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

function getInventory(InventoryId) {
    return new Promise((resolve, reject) => {
        InventoryModel.findOne({ _id: mongoose.Types.ObjectId(InventoryId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addInventory(InventoryData) {
    return new Promise((resolve, reject) => {
        if (InventoryData.userId) {
            InventoryData.userId = mongoose.Types.ObjectId(InventoryData.userId);
        }
        InventoryObj = new InventoryModel(InventoryData);
        InventoryObj.save(function (error, data) {
            if (error) {
                reject({ error: error });
            } else {
                resolve(data);
            }
        });
    });
}

function updateInventory(InventoryId, InventoryData) {
    return new Promise((resolve, reject) => {
        if (InventoryData.userId) {
            InventoryData.userId = mongoose.Types.ObjectId(InventoryData.userId);
        }
        InventoryModel.updateOne({ _id: mongoose.Types.ObjectId(InventoryId) }, { $set: InventoryData }).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function deleteInventory(InventoryId) {
    return new Promise((resolve, reject) => {
        InventoryModel.deleteOne({ _id: mongoose.Types.ObjectId(InventoryId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function assignUser(InventoryId, assignData) {
    return new Promise((resolve, reject) => {
        var pdata = {
            userId: null
        }
        var inventoryAction = "Assign";
        if (assignData.userId) {
            pdata.userId = mongoose.Types.ObjectId(assignData.userId);
            pdata.deviceStatus = "Assigned";
        } else {
            pdata.deviceStatus = "Available";
            inventoryAction = "Unassign";
        }

        InventoryModel.findById(InventoryId, function (err, InventoryObj) {
            if (err) return reject(err);
            InventoryObj.history.push({
                inventoryAction: inventoryAction,
                prevValue: InventoryObj.userId,
                newValue: pdata.userId,
                comment: assignData.comment
            });
            InventoryObj.userId = pdata.userId;
            InventoryObj.deviceStatus = pdata.deviceStatus;
            InventoryObj.latestComment = assignData.comment;
            InventoryObj.save(function (error) {
                if (error) reject({ error });
                resolve(InventoryObj);
            });
        });
    });
}

function changeStatus(InventoryId, inventoryData) {
    return new Promise((resolve, reject) => {

        if (["Repair", "Repair Done", "Scrap"].includes(inventoryData.deviceStatus)) {
            InventoryModel.findById(InventoryId, function (err, InventoryObj) {
                if (err) return handleError(err);

                if (inventoryData.deviceStatus == "Repair Done") {
                    if (InventoryObj.userId && String(InventoryObj.userId).length > 0) {
                        inventoryData.deviceStatus = "Assigned";
                    } else {
                        inventoryData.deviceStatus = "Available";
                    }
                }
                InventoryObj.history.push({
                    inventoryAction: "Status Change",
                    prevValue: InventoryObj.deviceStatus,
                    newValue: inventoryData.deviceStatus,
                    affectedDate: inventoryData.affectedDate,
                    comment: inventoryData.comment
                });
                InventoryObj.deviceStatus = inventoryData.deviceStatus;
                InventoryObj.latestComment = inventoryData.comment;
                InventoryObj.save(function (error) {
                    if (error) reject(error);
                    resolve(InventoryObj);
                });
            });
        } else {
            reject({ message: "Invalid device status value!" });
        }
    });
}

function getMyInventories(userId) {
    return new Promise((resolve, reject) => {
        InventoryModel.find({ userId: mongoose.Types.ObjectId(userId) }).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}