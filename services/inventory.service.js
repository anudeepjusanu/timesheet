var config = require(__dirname + '/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
var InventoryModel = require("../models/inventory.model");
var UserModel = require("../models/user.model");
mongoose.connect(config.connectionString);

var service = {};

service.getInventories = getInventories;
service.getInventory = getInventory;
service.addInventory = addInventory;
service.updateInventory = updateInventory;
service.deleteInventory = deleteInventory;
service.assignUser = assignUser;

module.exports = service;

function getInventories() {
    return new Promise((resolve, reject) => {
        var aggregateQuery = [
            { $match: {} },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "assignedUser" } },
            { $unwind: { path: "$assignedUser", preserveNullAndEmptyArrays: true } },
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
        console.log(InventoryData);
        InventoryObj = new InventoryModel(InventoryData);
        InventoryObj.save(function (error, data) {
            console.log(error);
            console.log(data);
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
        InventoryModel.updateOne({ _id: mongoose.Types.ObjectId(InventoryId) }, InventoryData).exec().then((data) => {
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
        if (assignData.userId) {
            pdata.userId = mongoose.Types.ObjectId(assignData.userId);
            pdata.currentStatus = "Assigned";
        } else {
            pdata.currentStatus = "Available";
        }
        InventoryModel.updateOne({ _id: mongoose.Types.ObjectId(InventoryId) }, pdata).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
        // InventoryModel.findById(assignData.userId, function (err, InventoryObj) {
        //     if (err) return handleError(err);
        //     // InventoryObj.history.push({
        //     //     inventoryAction: "Assign",
        //     //     prevValue: InventoryObj.userId,
        //     //     newValue: pdata.userId,
        //     //     comment: pdata.userId
        //     // });
        //     InventoryObj.userId = pdata.userId;
        //     InventoryObj.save(function (error) {
        //         if (error) reject({ error });
        //         resolve(InventoryObj);
        //     });
        // });
    });
}