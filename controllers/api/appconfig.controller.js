var config = require('config.json');
var express = require('express');
var _ = require('lodash');
var router = express.Router();
var appConfigService = require('services/appconfig.service');

// routes
router.get('/settings', getSettings);
router.get('/setting/:key_name', getSetting);
router.post('/setting', saveSetting);
router.put('/setting', saveSetting);
router.delete('/setting', delSetting);

module.exports = router;

function getSettings(req, res){
    appConfigService.getSettings().then(function(data){
        res.send(data);
    }).catch(function(errors){
        res.status(400).send(errors);
    });
}

function getSetting(req, res){
    appConfigService.getSetting(req.params.key_name).then(function(data){
        res.send(data);
    }).catch(function(errors){
        res.status(400).send(errors);
    });
}

function saveSetting(req, res){
    var settings = req.body;
    var resultSettings = [];
    var keyNames = Object.keys(settings);
    var lastKeyName = keyNames[keyNames.length - 1];
    _.each(settings, function(item, key){
        appConfigService.saveSetting({"keyName": key, "keyVal": item}).then(function(data){
            if(lastKeyName == data.keyName){
                appConfigService.getSetting(req.params.key_name).then(function(data){
                    res.send(data);
                }).catch(function(errors){
                    res.status(400).send(errors);
                });
            }
        }).catch(function(errors){
            res.status(400).send(errors);
        });
    });
}

function delSetting(req, res){
    res.send([]);
}