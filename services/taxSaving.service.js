var config = require(__dirname + '/../config.json');
var _ = require('lodash');
var mongoose = require("mongoose");
var TaxSavingModel = require("../models/taxSaving.model");
var UserModel = require("../models/user.model");
const fs = require('fs');

var service = {};

service.getMyTaxSavings = getMyTaxSavings;
service.getAccountTaxSavings = getAccountTaxSavings;
service.getTaxSaving = getTaxSaving;
service.getMyTaxSaving = getMyTaxSaving;
service.addTaxSaving = addTaxSaving;
service.updateTaxSaving = updateTaxSaving;
service.deleteTaxSaving = deleteTaxSaving;

service.getTaxSavingReceipts = getTaxSavingReceipts;
service.getTaxSavingReceipt = getTaxSavingReceipt;
service.addTaxSavingReceipt = addTaxSavingReceipt;
service.updateTaxSavingReceipt = updateTaxSavingReceipt;
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

function getAccountTaxSavings(financialYear) {
    return new Promise((resolve, reject) => {
        TaxSavingModel.aggregate([
            { $match: { financialYear: financialYear, status: { $in: ['Submitted','Approved','Rejected','Partially Approved'] } } },
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
            resolve(data[0]);
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function getMyTaxSaving(userId, financialYear) {
    return new Promise((resolve, reject) => {
        TaxSavingModel.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId), financialYear: financialYear } },
        ]).exec().then(async (data) => {
            if (data.length > 0) {
                resolve(data[0]);
            } else {
                var taxSavingObj = new TaxSavingModel({
                    userId: mongoose.Types.ObjectId(userId),
                    financialYear: financialYear
                });
                taxSavingObj.save(function (error, data) {
                    if (error) {
                        reject({ error: error, taxSaving: taxSavingObj });
                    } else {
                        resolve(data)
                    }
                });
            }
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addTaxSaving(taxSavingData) {
    return new Promise(async (resolve, reject) => {
        taxSavingData.userId = (taxSavingData.userId) ? mongoose.Types.ObjectId(taxSavingData.userId) : null;

        var taxSavingObj = new TaxSavingModel(taxSavingData);
        taxSavingObj.save(function (error, data) {
            if (error) {
                console.log("error", error)
                reject({ error: error, addTaxSaving: taxSavingObj });
            } else {
                resolve(data)
            }
        });
    });
}

function updateTaxSaving(taxSavingId, taxSavingData) {
    return new Promise(async (resolve, reject) => {
        if (taxSavingData.userId) {
            taxSavingData.userId = mongoose.Types.ObjectId(taxSavingData.userId);
        }
        TaxSavingModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(taxSavingId) }, { $set: taxSavingData }, { upsert: true }, function (err, taxSavingObj) {
            if (err) return reject(err);
            console.log("taxSavingObj", taxSavingObj)
            TaxSavingModel.findOne({ _id: mongoose.Types.ObjectId(taxSavingId) }, function (err, taxSavingObj) {
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
        TaxSavingModel.findOne({ _id: mongoose.Types.ObjectId(taxSavingId) }, function (err, taxSavingObj) {
            resolve(taxSavingObj.receipts);
        }).catch((error) => {
            console.log(error);
            reject({ error: (error.errmsg ? error.errmsg : "Unexpected error") });
        });
    });
}

/** Receipt */
function getTaxSavingReceipt(receiptId) {
    return new Promise((resolve, reject) => {
        TaxSavingModel.findOne({ 'receipts._id': mongoose.Types.ObjectId(receiptId) }).lean().exec().then((taxSavingObj) => {
            if (taxSavingObj.receipts) {
                _.each(taxSavingObj.receipts, function (receiptObj) {
                    if (receiptObj._id == receiptId) {
                        resolve(receiptObj);
                        return false;
                    }
                });
            }
            resolve({});
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function addTaxSavingReceipt(taxSavingId, receiptData) {
    return new Promise((resolve, reject) => {
        TaxSavingModel.findOne({ '_id': mongoose.Types.ObjectId(taxSavingId) }, function (err, taxSavingObj) {
            if (taxSavingObj) {
                if (!Array.isArray(taxSavingObj.receipts)) {
                    taxSavingObj.receipts = [];
                }
                taxSavingObj.receipts.push(receiptData);
                taxSavingObj.save((data) => {
                    resolve(taxSavingObj);
                });
            } else {
                reject({ error: "Please enter valid tax saving" });
            }
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function updateTaxSavingReceipt(receiptData, receiptId, _id = null) {
    return new Promise((resolve, reject) => {
        TaxSavingModel.findOne({ 'receipts._id': mongoose.Types.ObjectId(receiptId) }, function (err, taxSavingObj) {
            if (err) {
                reject({ error: err });
            }
            if (taxSavingObj && taxSavingObj.receipts) {
                var receiptDataObj = {};
                for (var i = 0; i < taxSavingObj.receipts.length; i++) {
                    if (taxSavingObj.receipts[i]._id == receiptId) {
                        receiptDataObj = taxSavingObj.receipts[i];
                        taxSavingObj.receipts[i].amount = (receiptData.hasOwnProperty('amount')) ? receiptData.amount : receiptDataObj.amount;
                        taxSavingObj.receipts[i].category = (receiptData.hasOwnProperty('category')) ? receiptData.category : receiptDataObj.category;
                        taxSavingObj.receipts[i].file = (receiptData.hasOwnProperty('file')) ? receiptData.file : receiptDataObj.file;
                        taxSavingObj.receipts[i].status = (receiptData.hasOwnProperty('status')) ? receiptData.status : receiptDataObj.status;

                        if (receiptDataObj.file && receiptData.hasOwnProperty('file')) {
                            try {
                                fs.unlinkSync(receiptDataObj.file);
                            } catch (err) {
                                console.error(err);
                            }
                        }
                        receiptDataObj = taxSavingObj.receipts[i];
                    }
                }
                taxSavingObj.save();
                resolve(receiptDataObj);
            } else {
                reject({ error: "Record not found!" });
            }
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}

function deleteTaxSavingReceipt(receiptId, _id = null) {
    return new Promise((resolve, reject) => {
        TaxSavingModel.findOne({ 'receipts._id': mongoose.Types.ObjectId(receiptId) }, function (err, taxSavingObj) {
            if (err) {
                reject({ error: err });
            }
            if (taxSavingObj && taxSavingObj.receipts) {
                var receiptDataObj = {};
                for (var i = 0; i < taxSavingObj.receipts.length; i++) {
                    if (taxSavingObj.receipts[i]._id == receiptId) {
                        if (taxSavingObj.receipts[i].file) {
                            try {
                                fs.unlinkSync(taxSavingObj.receipts[i].file);
                            } catch (err) {
                                console.error(err);
                            }
                        }
                        taxSavingObj.receipts.splice(i, 1);
                    }
                }
                taxSavingObj.save();
                resolve(taxSavingObj);
            } else {
                reject({ error: "Record not found!" });
            }
        }).catch((error) => {
            reject({ error: error.errmsg });
        });
    });
}
