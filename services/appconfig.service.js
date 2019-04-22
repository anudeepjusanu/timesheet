var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
//var mongo = require('mongoskin');
//var db = mongo.db(config.connectionString, { native_parser: true });
//db.bind("appsettings");
var mongoose = require("mongoose");
var appSetting = require("../models/appsetting.model");
mongoose.connect(config.connectionString);

var service = {};

service.getSettings = getSettings;
service.getSetting = getSetting;
service.saveSetting = saveSetting;
service.deleteSetting = deleteSetting;

module.exports = service;

function getSettings() {
    var deferred = Q.defer();
    appSetting.find({}).exec(function(error, response){
        if (error) deferred.reject(error);
        if(response){
            deferred.resolve(response);
        }else{
            deferred.resolve([]);
        }
    });
    return deferred.promise;
}

function getSetting() {
    var deferred = Q.defer();
    appSetting.find({}).exec(function(error, response){
        if (error) deferred.reject(error);
        if(response){
            deferred.resolve(response);
        }else{
            deferred.resolve([]);
        }
    });
    return deferred.promise;
}

function saveSetting(settingData) {
    var deferred = Q.defer();
    appSetting.findOneAndUpdate({"keyName": settingData.keyName}, 
        {$set:{keyName: settingData.keyName, keyVal: settingData.keyVal}}, 
        {upsert: true}).exec(function(error, response){
        if (error) deferred.reject(error);
        deferred.resolve(response);
    });
    return deferred.promise;
}

function deleteSetting(params) {
    var deferred = Q.defer();
    var appSettingObj = new appSetting();
    appSettingObj.keyName = params.keyName;
    appSettingObj.keyVal = params.keyVal;
    appSettingObj.save(function(error, response){
        if (error) deferred.reject(error);
        if(response){
            deferred.resolve(response);
        }else{
            deferred.resolve([]);
        }
    });
    return deferred.promise;
}