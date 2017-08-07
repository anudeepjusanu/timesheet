var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');
var timesheetService = require('services/timesheet.service');
var builder = require('botbuilder');
var connector = new builder.ChatConnector({
    appId: "c8fc3ad9-72cb-46ff-b5f1-09432ed9b7db",
    appPassword: "Y1A0xm40NNkm1XpR0MNV3sz"
});
var bot = new builder.UniversalBot(connector);

// routes
router.post('/', create);
router.get('/week/mine', getMyReport);
router.get('/week/:weekId', getReportbyWeek);
router.get('/remind/:id/:week', remind);
router.get('/remindAll', remindAll);

module.exports = router;

function create(req, res) {
    userService.getById(req.user.sub)
        .then(function(user) {
            if (user) {
                createTimeSheet(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function(err) {
            res.status(400).send(err);
        });

    function createTimeSheet(user) {
        timesheetService.create(user, req.body)
            .then(function() {
                res.sendStatus(200);
            })
            .catch(function(err) {
                res.status(400).send(err);
            });
    }
}

function getMyReport(req, res) {
    timesheetService.getMine(req.user.sub)
        .then(function(reports) {
            res.send(reports);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function getReportbyWeek(req, res) {
    timesheetService.getByWeek(req.params.weekId)
        .then(function(reports) {
            res.send(reports);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function remind(req, res) {
    userService.getById(req.params.id)
        .then(function(user) {
            if (user) {
                var msg = new builder.Message()
                    .address(user.address)
                    .text("Hi, Please update your weekly hours for "+req.params.week);
                bot.send(msg, function(err) {
                    // Return success/failure
                    res.sendStatus(200);
                });
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function remindAll(req, res) {
    userService.getAll()
        .then(function(users) {
            if (users) {
                for (var i = 0, len = users.length; i < len; i++) {
                    var msg = new builder.Message()
                        .address(users[i].address)
                        .text("Please update your weekly hours for current week, Ignore if already updated");
                    bot.send(msg, function(err) {
                        // Return success/failure
                        
                    });
                }
                res.sendStatus(200);

            } else {
                res.sendStatus(404);
            }
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}