var config = require(__dirname+'/../config.json');
var _ = require('lodash');
var Q = require('q');
var leaveWalletService = require('../services/leaveWallet.service');
var appConfigService = require('../services/appconfig.service');
var leaveWalletService = require('../services/leaveWallet.service');
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
    
    db.users.find({isActive: true}).toArray(function(err, users) {
        _.each(users, function (userObj) {
            if(userObj.joinDate){
                updateUserAcquireLeaves(userObj, acquire_leaves_month);
            }
        });
    });
}).catch(function(errors){
    
});

let updateUserAcquireLeaves = async function(userObj, acquire_leaves_month){
    var acquire_leaves = 0.00;
    joinDate = new Date(userObj.joinDate);
    var middleDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), 15);

    //joinDate = new Date(joinDate.getTime() + (60000 * 330));
    if(nowDate>joinDate && (month == 10 || (month == 4 && nowDate.getFullYear()>joinDate.getFullYear())) ){
        acquire_leaves = 1.00;
    }else if(nowDate.getFullYear()==joinDate.getFullYear() && month <= 9 && month == (joinDate.getMonth()+1) ){
        acquire_leaves = 1.00;
    }else if(nowDate.getFullYear()==joinDate.getFullYear() && month <= 9 && month == (joinDate.getMonth()+2) && joinDate.getDate()>=15){
        acquire_leaves = 1.00;
    }
    acquire_leaves += parseFloat(acquire_leaves_month);
    
    if(middleDate>joinDate){
        var leaveWalletData = {
            userId: userObj._id,
            yearMonth: yearMonth,
            yearMonthNumber: yearMonthNumber,
            accruedLeaves: acquire_leaves
        };

        await leaveWalletService.saveMonthlyLeaves(leaveWalletData).then(function(response){
            console.log("EMP ID", userObj.employeeId, " ", acquire_leaves);
        }).catch(function(errors){
            console.log(errors);
        });
    }else if(joinDate > nowDate){
        await leaveWalletService.delMonthlyLeaves(userObj._id, yearMonth).then(function(response){
            console.log("Del EMP ID", userObj.employeeId);
        }).catch(function(errors){
            console.log(errors);
        });
    }
}

function userTakenLeaveBalance(userId, financialYear=null) {
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
        userId: mongo.helper.toObjectID(userId),
        weekDate: {
            $gte: startDate,
            $lt: endDate
        },
        timeoffHours: {
            $gt: 0
        }
    };
    var userSheetBalance = {
        sickLeaveHours: 0.00,
        sickLeaveDays: 0.00,
        timeoffHours: 0.00,
        timeoffDays: 0.00,
        totalTimeoffHours: 0.00,
        totalTimeoffDays: 0.00
    };
    db.timesheets.find(queryStr).toArray(function(err, sheets) {
        _.each(sheets, function(sheetObj) {
            _.each(sheetObj.projects, function(projectObj) {
                userSheetBalance.sickLeaveHours += projectObj.sickLeaveHours;
                userSheetBalance.timeoffHours += projectObj.timeoffHours;
            });
            userSheetBalance.totalTimeoffHours += sheetObj.timeoffHours;
        });
        userSheetBalance.sickLeaveDays = parseFloat(userSheetBalance.sickLeaveHours/8).toFixed(2);
        userSheetBalance.timeoffDays = parseFloat(userSheetBalance.timeoffHours/8).toFixed(2);
        userSheetBalance.totalTimeoffDays = parseFloat(userSheetBalance.totalTimeoffHours/8).toFixed(2);
        deferred.resolve(userSheetBalance);
    });
    return deferred.promise;
}
