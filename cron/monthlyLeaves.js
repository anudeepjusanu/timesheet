var config = require(__dirname+'/../config.json');
var _ = require('lodash');
var Q = require('q');
var leaveWalletService = require('../services/leaveWallet.service');
var appConfigService = require('../services/appconfig.service');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('users');

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
                var acquire_leaves = parseFloat(acquire_leaves_month);
                joinDate = new Date(userObj.joinDate);
                var middleDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), 15);
                
                if(middleDate>joinDate){
                    if(month == 4 || month == 10){
                        acquire_leaves += 1.00;
                    }
                    var leaveWalletData = {
                        userId: userObj._id,
                        yearMonth: yearMonth,
                        yearMonthNumber: yearMonthNumber,
                        accruedLeaves: acquire_leaves
                    };
                    leaveWalletService.saveMonthlyLeaves(leaveWalletData).then(function(response){
                    console.log(acquire_leaves);
                    }).catch(function(errors){
                        console.log(errors);
                    });
                }
            }
            
        });
    });


}).catch(function(errors){
    
});

