var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');
var timesheetService = require('services/timesheet.service');

// routes
router.post('/', create);
router.get('/week/mine', getMyReport);
router.get('/week/:weekId', getReportbyWeek);

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