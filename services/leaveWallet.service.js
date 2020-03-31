var config = require(__dirname+'/../config.json');
var _ = require('lodash');
var Q = require('q');
var mongoose = require("mongoose");
var ObjectId = require('mongoose').Types.ObjectId; 
var leaveWallet = require("../models/leaveWallet.model");
var timesheet = require("../models/timesheet.model");
mongoose.connect(config.connectionString);
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('timesheets');
db.bind('users');

var service = {};

service.saveMonthlyLeaves = saveMonthlyLeaves;
service.delMonthlyLeaves = delMonthlyLeaves;
service.getUserLeaveWallet = getUserLeaveWallet;
service.getUserLeaveWalletBalance = getUserLeaveWalletBalance;
service.updateUserLeaveBalance = updateUserLeaveBalance;
service.usersLeaveBalance = usersLeaveBalance;

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

function delMonthlyLeaves(userId, yearMonth){
    var deferred = Q.defer();
    leaveWallet.findOneAndRemove({userId: userId, yearMonth: yearMonth}).exec(function(error, response){
        if (error) deferred.reject(error);
        deferred.resolve(response);
    });
    return deferred.promise;
}

function getUserLeaveWallet(userId, fananceYear = null){
    var nowDate = new Date();
    if(fananceYear !== null){
        fananceYear = fananceYear.split("-");
        fananceYear = parseInt(fananceYear[0]);
        var startYearMonth = fananceYear + "04";
        var endYearMonth = (fananceYear+1) + "03";
    }else{
        var startYearMonth = ((nowDate.getMonth()>=3)?nowDate.getFullYear():(nowDate.getFullYear()-1)) + "04";
        var endYearMonth = ((nowDate.getMonth()>=3)?(nowDate.getFullYear()-1):nowDate.getFullYear()) + "03";
    }
    var deferred = Q.defer();
    leaveWallet.find({userId: new ObjectId(userId), yearMonthNumber: {$gte: startYearMonth, $lte: endYearMonth}}, function(error, response){
        if (error) deferred.reject(error);
        deferred.resolve(response);
    });
    return deferred.promise;
}

function getUserLeaveWalletBalance(userId, fananceYear = null){
    var nowDate = new Date();
    if(fananceYear !== null){
        fananceYear = fananceYear.split("-");
        fananceYear = parseInt(fananceYear[0]);
        var startYearMonth = fananceYear + "04";
        var endYearMonth = (fananceYear+1) + "03";
    }else{
        var startYearMonth = ((nowDate.getMonth()>=3)?nowDate.getFullYear():(nowDate.getFullYear()-1)) + "04";
        var endYearMonth = ((nowDate.getMonth()>=3)?(nowDate.getFullYear()-1):nowDate.getFullYear()) + "03";
    }
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

function updateUserLeaveBalance(userId, leaveWalletData){
    var deferred = Q.defer();
    var leaveData = {
        userId: new ObjectId(userId),
        yearMonth: leaveWalletData.yearMonth,
        yearMonthNumber: leaveWalletData.yearMonth.replace('-', '')
    };
    if(leaveWalletData.creditedLeaves || leaveWalletData.creditedLeaves===0){
        leaveData.creditedLeaves = leaveWalletData.creditedLeaves;
        leaveData.creditedLeavesComment = (leaveWalletData.creditedLeavesComment)?leaveWalletData.creditedLeavesComment:"";
    }else if(leaveWalletData.deductedLOP || leaveWalletData.deductedLOP===0){
        leaveData.deductedLOP = leaveWalletData.deductedLOP;
        leaveData.deductedLOPComment = (leaveWalletData.deductedLOPComment)?leaveWalletData.deductedLOPComment:"";
    }
    leaveWallet.findOneAndUpdate({userId: new ObjectId(leaveData.userId), yearMonth: leaveData.yearMonth}, 
        {$set: leaveData}, 
        {upsert: true}).exec(function(error, response){
        if (error) deferred.reject(error);
        deferred.resolve(response);
    });
    return deferred.promise;
}

function usersLeaveBalance(financialYear) {
    var deferred = Q.defer();
    var financialYearArr = financialYear.split("-");
    var startDate = new Date(financialYearArr[0], 3, 1);
    var endDate = new Date(financialYearArr[1], 3, 1);
    var queryStr = {
        weekDate: {
            $gte: startDate,
            $lt: endDate
        },
        timeoffHours: {
            $gt: 0
        }
    };
    var users = [];
    var startYearMonth = 201904;
    var endYearMonth = 202003;
    var deferred = Q.defer();
    leaveWallet.find({yearMonthNumber: {$gte: startYearMonth, $lte: endYearMonth}}, function(error, response){
        if (error) deferred.reject(error);
        if(response){
            var userGroups = _.groupBy(response, 'userId');
            _.each(userGroups, function(userLeavesInfo, userId){
                var totalAccruedLeaves = 0;
                var totalCreditedLeaves = 0;
                var totalDeductedLOP = 0;
                _.each(userLeavesInfo, function(userMonthLeave){
                    totalAccruedLeaves += userMonthLeave.accruedLeaves;
                    totalCreditedLeaves += userMonthLeave.creditedLeaves;
                    totalDeductedLOP += userMonthLeave.deductedLOP;
                });
                users.push({
                    userId: userId,
                    leavesInfo: userLeavesInfo,
                    totalAccruedLeaves: totalAccruedLeaves,
                    totalCreditedLeaves: totalCreditedLeaves,
                    totalDeductedLOP: totalDeductedLOP,
                    totalTimeOffHours: 0.00
                });
            });
        }
        timesheet.aggregate([
            {$match: queryStr},
            {$lookup: {from: 'users', localField: 'userId', foreignField: '_id', as: 'user_info'}},
            {$unwind:"$user_info"},
            {$project: {week: 1, userId: 1, weekDate: 1, userResourceType: 1, totalHours: 1, totalBillableHours: 1, timeoffHours: 1, sickLeaveHours: 1, userJoinDate: "$user_info.joinDate"} }
        ]).exec(function(err, sheets){
            var userGroupSheets = _.groupBy(sheets, 'userId');
            _.each(userGroupSheets, function(userSheets, userId){
                var userObj = _.find(users, {userId: userId});
                var userTimesheets = [];
                var totalTimeOffHours = 0.00;
                _.each(userSheets, function(userSheet){
                    var weekDate = new Date(userSheet.weekDate);
                    var userJoinDate = new Date(userSheet.userJoinDate);
                    if(weekDate > userJoinDate && userSheet.userResourceType != "Intern"){
                        totalTimeOffHours += userSheet.timeoffHours;
                        userTimesheets.push({
                            _id: userSheet._id,
                            week: userSheet.week,
                            weekDate: userSheet.weekDate,
                            userResourceType: userSheet.userResourceType,
                            timeoffHours: userSheet.timeoffHours,
                            totalHours: userSheet.totalHours,
                            totalBillableHours: userSheet.totalBillableHours,
                        });
                    }
                });
                if(userObj){
                    userObj.timesheets = userTimesheets;
                    userObj.totalTimeOffHours = totalTimeOffHours;
                }else{
                    users.push({
                        userId: userId,
                        leavesInfo: [],
                        totalAccruedLeaves: null,
                        totalCreditedLeaves: null,
                        totalDeductedLOP: null,
                        totalTimeOffHours: totalTimeOffHours,
                        timesheets: userTimesheets
                    });
                }
            });
            /*_.each(sheets, function(sheetObj) {
                var userObj = _.find(users, {_id: sheetObj.userId});
                if(userObj){
                    userObj.timesheets.push({
                        timeoffHours: sheetObj.timeoffHours,
                        week: sheetObj.week,
                        weekDate: sheetObj.weekDate,
                        totalHours: sheetObj.totalHours,
                        totalBillableHours: sheetObj.totalBillableHours 
                    });
                }else{
                    var userObj = {
                        _id: sheetObj.userId,
                        userResourceType: sheetObj.userResourceType,
                        timesheets: [{
                            timeoffHours: sheetObj.timeoffHours,
                            week: sheetObj.week,
                            weekDate: sheetObj.weekDate,
                            totalHours: sheetObj.totalHours,
                            totalBillableHours: sheetObj.totalBillableHours
                        }]
                    }
                    users.push(userObj);
                }
            });*/
            deferred.resolve(users);
        });
    });
    
    
    return deferred.promise;
}