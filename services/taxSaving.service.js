var config = require(__dirname + '/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
var TaxSavingModel = require("../models/taxSaving.model");
var UserModel = require("../models/user.model");

var service = {};

service.getMyTaxSavings = getMyTaxSavings;
service.getAccountTaxSavings = getAccountTaxSavings;
service.getTaxSaving = getTaxSaving;
service.addTaxSaving = addTaxSaving;
service.updateTaxSaving = updateTaxSaving;
service.deleteTaxSaving = deleteTaxSaving;

service.getTaxSavingReceipts = getTaxSavingReceipts;
service.getTaxSavingReceipt = getTaxSavingReceipt;
service.addTaxSavingReceipt = addTaxSavingReceipt;
service.updateTaxSavingReceipt = updateTaxSavingReceipt;
//service.updateTaxSavingReceiptStatus = updateTaxSavingReceiptStatus;
//service.updateTaxSavingReceiptFile = updateTaxSavingReceiptFile;
service.deleteTaxSavingReceipt = deleteTaxSavingReceipt;

module.exports = service;

function getMyTaxSavings(userId) {
    return new Promise((resolve, reject) => {
        TaxSavingModel.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            { $sort: { createdOn: -1 } }
        ]).exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

function getAccountTaxSavings(userId) {
    return new Promise((resolve, reject) => {
        TaxSavingModel.aggregate([
            { $match: { status: { $in: ['Submitted'] } } },
            { $sort: { createdOn: -1 } }
        ]).exec().then(async (data) => {
            resolve(data);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

function getTaxSaving(taxSavingId) {
    return new Promise((resolve, reject) => {
        TaxSavingModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(taxSavingId) } },
        ]).exec().then(async (data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addTaxSaving(taxSavingData) {
    return new Promise(async (resolve, reject) => {
        taxSavingData.userId = (taxSavingData.userId) ? mongoose.Types.ObjectId(taxSavingData.userId) : null;
       
       console.log("taxSavingData",taxSavingData)
        taxSavingObj = new TaxSavingModel(taxSavingData);
        console.log("taxSavingObj",taxSavingObj)

        taxSavingObj.save(function (error, data) {
            console.log("error",error)
            console.log("data",data)

            if (error) {
                console.log("error",error)

                reject({ error: error, addTaxSaving: taxSavingObj });
            }else{
                resolve(data)
            }
        });
    });
}

function updateTaxSaving(taxSavingId, taxSavingData) {
    console.log("taxSavingData",taxSavingData)
    console.log("taxSavingId",taxSavingId)

    return new Promise(async (resolve, reject) => {
        TaxSavingModel.findById(taxSavingId, function (err, taxSavingObj) {
            if (err) return reject(err);
            console.log("taxSavingObj",taxSavingObj)
            if (taxSavingData.userId) {
                taxSavingObj.userId = taxSavingData.userId;
            }
            if (taxSavingData.employeeId) {
                taxSavingObj.employeeId = taxSavingData.employeeId;
            }
            if (taxSavingData.status) {
                taxSavingObj.status = taxSavingData.status;
            }
            taxSavingObj.save(function (error) {
                
                if (error) reject({ error });
                resolve(taxSavingObj);
            });
        });
    });
}

function deleteTaxSaving(taxSavingId) {
    return new Promise((resolve, reject) => {
        TaxSavingModel.deleteOne({ _id: mongoose.Types.ObjectId(taxSavingId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function getTaxSavingReceipts(taxSavingId) {
    return new Promise((resolve, reject) => {
        TaxSavingReciptModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(taxSavingId) } },
            { $sort: { createdOn: -1 } }
        ]).exec().then((data) => {
            resolve(data[0].receipts);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

/** Receipt */
function getTaxSavingReceipt(receiptId) {
    return new Promise((resolve, reject) => {
        TaxSavingReciptModel.findOne({ '_id': mongoose.Types.ObjectId(receiptId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addTaxSavingReceipt(receiptData) {
    return new Promise((resolve, reject) => {
        var receiptDataObj = {
            receiptDate: receiptData.receiptDate,
            receiptCategory: receiptData.receiptCategory,
            receiptNumber: receiptData.receiptNumber,
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
        var receiptObj = new TaxSavingReciptModel(receiptDataObj);
        receiptObj.save(function (error, data) {
            if (error) {
                reject({ error: error });
            } else {
                resolve(data);
            }
        });
    });
}

function updateTaxSavingReceipt(receiptId, receiptData) {
    return new Promise((resolve, reject) => {
        var receiptDataObj = {};
        var receiptDataObj = {
            receiptDate: receiptData.receiptDate,
            receiptCategory: receiptData.receiptCategory,
            receiptNumber: receiptData.receiptNumber,
            receiptDescription: receiptData.receiptDescription,
            receiptAmount: receiptData.receiptAmount
        };
        if (receiptData.receiptFile) {
            receiptDataObj.receiptFile = receiptData.receiptFile;
        }
        if (receiptData.status) {
            receiptDataObj.receiptFile = receiptData.status;
        }
        TaxSavingReciptModel.updateOne({ '_id': mongoose.Types.ObjectId(receiptId) },
            { $set: receiptDataObj }).exec().then((data) => {
                resolve(data);
            }).catch((error) => {
                reject({ error: error.errmsg });
            });
    });
}

function deleteTaxSavingReceipt(receiptId) {
    return new Promise((resolve, reject) => {
        TaxSavingReciptModel.deleteOne({ _id: mongoose.Types.ObjectId(receiptId) }).lean().exec().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

