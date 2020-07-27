var config = require('config.json');
var express = require('express');
var _ = require('lodash');
var router = express.Router();
var builder = require('botbuilder');

// routes
router.get('/', function (req, res) {
    var users = {
        "name": "L B Sastry"
    }
    res.json(users);
});
router.get('/messages', function (req, res) {
    var users = {
        "name": "L B Sastry"
    }
    res.json(users);
});

module.exports = router;
