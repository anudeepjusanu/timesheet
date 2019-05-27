var config = require(__dirname+'/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
var ObjectId = require('mongoose').Types.ObjectId; 
var leaveWallet = require("../models/leaveWallet.model");
mongoose.connect(config.connectionString);

var service = {};

service.saveMonthlyLeaves = saveMonthlyLeaves;
service.getUserLeaveWallet = getUserLeaveWallet;
service.getUserLeaveWalletBalance = getUserLeaveWalletBalance;

module.exports = service;

function saveMonthlyLeaves(leaveWalletData){
    var deferred = Q.defer();
    leaveWallet.findOneAndUpdate({userId: leaveWalletData.userId, yearMonth: leaveWalletData.yearMonth}, 
        {$set: leaveWalletData}, 
        {upsert: true}).exec(function(error, response){
        if (error) deferred.reject(error);
        deferred.resolve(response);
    });
    return deferred.promise;
}

function getUserLeaveWallet(userId){
    var startYearMonth = 201904;
    var endYearMonth = 202003;
    var deferred = Q.defer();
    leaveWallet.find({userId: new ObjectId(userId), yearMonthNumber: {$gte: startYearMonth, $lte: endYearMonth}}, function(error, response){
        if (error) deferred.reject(error);
        deferred.resolve(response);
    });
    return deferred.promise;
}

function getUserLeaveWalletBalance(userId){
    var startYearMonth = 201904;
    var endYearMonth = 202003;
    var leaveWalletBalance = {
        accruedLeaves: 0.00,
        creditedLeaves: 0.00,
        deductedLOP: 0.00
    };
    var deferred = Q.defer();
    leaveWallet.find({userId: new ObjectId(userId), yearMonthNumber: {$gte: startYearMonth, $lte: endYearMonth}}, function(error, response){
        if (error) deferred.reject(error);
        if(response && response.length>0){
            _.each(response, function(item){
                leaveWalletBalance.accruedLeaves += item.accruedLeaves;
                leaveWalletBalance.creditedLeaves += item.creditedLeaves;
                leaveWalletBalance.deductedLOP += item.deductedLOP;
            });
        }
        deferred.resolve(leaveWalletBalance);
    });
    return deferred.promise;
}