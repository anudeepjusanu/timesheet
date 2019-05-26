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

appConfigService.getSettings().then(function(response){
    _.each(response, function(item){
        if(item.keyName == "acquire_leaves_month"){
            acquire_leaves_month = item.keyVal;
        }
    });
    
    db.users.find({isActive: true}).toArray(function(err, users) {
        _.each(users, function (userObj) {
            var leaveWalletData = {
                userId: userObj._id,
                yearMonth: yearMonth,
                yearMonthNumber: yearMonthNumber,
                accruedLeaves: acquire_leaves_month
            };
            leaveWalletService.saveMonthlyLeaves(leaveWalletData).then(function(response){
               
            }).catch(function(errors){
                console.log(errors);
            });
        });
    });


}).catch(function(errors){
    
});

