var config = require('config.json');
var express = require('express');
var _ = require('lodash');
var router = express.Router();
var leaveWalletService = require('services/leaveWallet.service');


// routes
router.get('/userLeaves/:_userId', userLeaves);
router.get('/myLeaveBalance/', myLeaveBalance);
router.get('/usersLeaveBalance/:financialYear', usersLeaveBalance);
router.post('/updateUserLeaveBalance/:userId', updateUserLeaveBalance);

module.exports = router;

function userLeaves(req, res){
    appConfigService.getSettings().then(function(data){
        res.send(data);
    }).catch(function(errors){
        res.status(400).send(errors);
    });
}

function myLeaveBalance(req, res){

}

function usersLeaveBalance(req, res){
    leaveWalletService.usersLeaveBalance(req.params.financialYear).then(function(data){
        res.send(data);
    }).catch(function(errors){
        res.status(400).send(errors);
    });
}

function updateUserLeaveBalance(req, res){
    leaveWalletService.updateUserLeaveBalance(req.params.userId, req.body).then(function(response) {
        if (response) {
            res.send(response);
        } else {
            res.sendStatus(404);
        }
    }).catch(function(err) {
        res.status(400).send(err);
    });
}
