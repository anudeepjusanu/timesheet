var config = require(__dirname+'/../config.json');
var _ = require('lodash');
var Q = require('q');
var appConfigService = require('../services/appconfig.service');
var leaveWalletService = require('../services/leaveWallet.service');
var timesheet = require("../models/timesheet.model");
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('users');
db.bind('timesheets');

var acquire_leaves_month = 0;
var nowDate = new Date();
var month = nowDate.getMonth() + 1;
var yearMonth = nowDate.getFullYear()+"-"+String(month<10?"0"+month:month);
var yearMonthNumber = nowDate.getFullYear()+String(month<10?"0"+month:month);
var financialYear = (month>=4)?nowDate.getFullYear():nowDate.getFullYear()-1;

appConfigService.getSettings().then(function(response){
    _.each(response, function(item){
        if(item.keyName == "acquire_leaves_month"){
            acquire_leaves_month = item.keyVal;
        }
    });

    db.users.find({isActive: true}).toArray(function(err, users){
        users.forEach((userObj) => {
            if(userObj.joinDate){
                console.log("EMP ID: ", userObj.employeeId);
                
                var acquire_leaves = 0.00;
                joinDate = new Date(userObj.joinDate);
                var middleDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), 15);
                var financeYearStart = new Date(nowDate.getFullYear(), 3, 1);

                if(middleDate>joinDate){
                    //joinDate = new Date(joinDate.getTime() + (60000 * 330));
                    if(nowDate>joinDate && (month == 10 || (month == 4 && financeYearStart>joinDate)) ){
                        acquire_leaves = 1.00;
                    }else if(nowDate.getFullYear()==joinDate.getFullYear() && month <= 9 && month == (joinDate.getMonth()+1) ){
                        acquire_leaves = 1.00;
                    }else if(nowDate.getFullYear()==joinDate.getFullYear() && month <= 9 && month == (joinDate.getMonth()+2) && joinDate.getDate()>=15){
                        acquire_leaves = 1.00;
                    }
                    acquire_leaves += parseFloat(acquire_leaves_month);
                    
                    var leaveWalletData = {
                        userId: userObj._id,
                        yearMonth: yearMonth,
                        yearMonthNumber: yearMonthNumber,
                        accruedLeaves: acquire_leaves
                    };

                    if(month == 4){
                        var lastFinanceYear = (nowDate.getFullYear()-1)+"-"+nowDate.getFullYear();
                        userTakenLeaveBalance(leaveWalletData, lastFinanceYear, userObj).then(function(response){
                            console.log("EMP ID", response.employeeId);
                        }).catch(function(errors){
                            reject(errors);
                        });
                    }else{
                        leaveWalletService.saveMonthlyLeaves(leaveWalletData).then(function(employeeId, leaveWalletData){
                            console.log("EMP ID", employeeId);
                        }).catch(function(errors){
                            reject(errors);
                        });
                    }
                }
            }
        });
    });
    
}).catch(function(errors){
    
});

function userTakenLeaveBalance(leaveWalletData, financialYear=null, userObj) {
    var deferred = Q.defer();
    if(financialYear){
        var financialYearArr = financialYear.split("-");
        var startDate = new Date(financialYearArr[0], 3, 1);
        var endDate = new Date(financialYearArr[1], 3, 1);
    }else{
        var now = new Date();
        var startYear = (now.getMonth()>=3)?now.getFullYear():now.getFullYear()-1; 
        var startDate = new Date(startYear, 3, 1);
        var endDate = new Date((startYear+1), 3, 1);
    }
    var queryStr = {
        userId: mongo.helper.toObjectID(leaveWalletData.userId),
        weekDate: {
            $gte: startDate,
            $lt: endDate
        },
        timeoffHours: {
            $gt: 0
        }
    };
    var userSheetBalance = {
        totalTimeoffHours: 0.00,
        totalTimeoffDays: 0.00
    };
    timesheet.aggregate([
        {$match: queryStr},
        {$lookup: {from: 'users', localField: 'userId', foreignField: '_id', as: 'user_info'}},
        {$unwind:"$user_info"},
        {$project: {week: 1, userId: 1, weekDate: 1, userResourceType: 1, totalHours: 1, totalBillableHours: 1, timeoffHours: 1, sickLeaveHours: 1, userJoinDate: "$user_info.joinDate"} }
    ]).exec(function(err, sheets){
        _.each(sheets, function(sheetObj) {
            var weekDate = new Date(sheetObj.weekDate);
            var userJoinDate = new Date(sheetObj.userJoinDate);
            if(weekDate > userJoinDate && sheetObj.userResourceType != "Intern"){
                userSheetBalance.totalTimeoffHours += sheetObj.timeoffHours;
            }
        });
        userSheetBalance.totalTimeoffDays = parseFloat(userSheetBalance.totalTimeoffHours/8);

        leaveWalletService.getUserLeaveWalletBalance(leaveWalletData.userId, financialYear).then(function(lastLeaveWallet){
            var userLeaveBalance = lastLeaveWallet.accruedLeaves + lastLeaveWallet.creditedLeaves + lastLeaveWallet.deductedLOP - userSheetBalance.totalTimeoffDays;
            userLeaveBalance = userLeaveBalance>0?(userLeaveBalance>=5?5.00:userLeaveBalance):0.00;

            leaveWalletData.creditedLeaves = parseFloat(parseFloat(userLeaveBalance).toFixed(2));
            leaveWalletService.saveMonthlyLeaves(leaveWalletData).then(function(response){
                deferred.resolve(leaveWalletData.userId, leaveWalletData);
            }).catch(function(errors){
                deferred.reject(errors);
            });
        }).catch(function(errors){
            deferred.reject(errors);
        });
    });
    return deferred.promise;
}
