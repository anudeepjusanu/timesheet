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
router.post('/', createTimesheet);
router.put('/:id', updateTimesheet);
router.get('/:id', getTimesheet);
router.get('/week/mine', getMyReport);
router.get('/week/:weekId', getReportbyWeek);
router.get('/remind/:id/:week', remind);
router.get('/remind/all', remindAll);
router.put('/admin/:id', adminUpdate);
router.post('/month/report', getReportbyMonth);
router.get('/allUserHoursByWeek/:weekId', allUserHoursByWeek);
router.get('/projectUserHoursByWeek/:weekId/:projectId', projectUserHoursByWeek);
router.get('/clientUserHoursByWeek/:weekId/:clientId', clientUserHoursByWeek);
router.get('/allUserHoursByMonth/:monthId/:yearId', allUserHoursByMonth);
router.get('/projectUserHoursByMonth/:monthId/:yearId/:projectId', projectUserHoursByMonth);
router.get('/timesheetBetweenDates/:startDate/:endDate', timesheetBetweenDates);

module.exports = router;

function createTimesheet(req, res) {
    userService.getById(req.user.sub)
        .then(function(user) {
            if (user) {
                timesheetService.createTimesheet(user, req.body)
                    .then(function() {
                        res.sendStatus(200);
                    }).catch(function(err) {
                        res.status(400).send(err);
                    });
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function updateTimesheet(req, res){
    var userId = req.user.sub;
    timesheetService.updateTimesheet(userId, req.params.id, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getTimesheet(req, res){
    timesheetService.getTimesheet(req.params.id)
        .then(function (response) {
            res.send(response);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
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
                    .text("Hi, Please update your weekly hours for "+req.params.week +" at http://timesheet.wavelabs.in");
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
                        .text("Please update your weekly hours for current week at http://timesheet.wavelabs.in , Ignore if already updated");
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

function adminUpdate(req, res){
    var userId = req.user.sub;
    timesheetService.adminUpdate(req.params.id, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getReportbyMonth(req, res){
    timesheetService.getByMonth(req.body.weekArr)
        .then(function (reports) {
            res.send(reports);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function allUserHoursByWeek(req, res) {
    timesheetService.allUserHoursByWeek(req.params.weekId)
        .then(function(reports) {
            res.send(reports);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function projectUserHoursByWeek(req, res) {
    timesheetService.projectUserHoursByWeek(req.params.weekId, req.params.projectId)
        .then(function(reports) {
            res.send(reports);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function clientUserHoursByWeek(req, res) {
    timesheetService.clientUserHoursByWeek(req.params.weekId, req.params.clientId)
        .then(function(reports) {
            res.send(reports);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function allUserHoursByMonth(req, res) {
    var year = req.params.yearId || new Date().getFullYear();
    var month = req.params.monthId || new Date().getMonth();
    timesheetService.allUserHoursByMonth(month, year)
        .then(function(result) {
            res.send(result);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function projectUserHoursByMonth(req, res) {
    var year = req.params.yearId || new Date().getFullYear();
    var month = req.params.monthId || new Date().getMonth();
    timesheetService.allUserHoursByMonth(month, year, req.params.projectId)
        .then(function(result) {
            res.send(result);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function timesheetBetweenDates(req, res) {

    Date.prototype.getWeek = function() {
        var onejan = new Date(this.getFullYear(), 0, 1);
        return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    }
    var resultData = [];
    var weeks = [];
    var startDate = new Date(params.startDate);
    var endDate = new Date(params.endDate);
    var loop = 1;
    while (startDate < endDate && loop++ < 50){
        weeks.push(startDate.getFullYear()+"-W"+startDate.getWeek());
        startDate.setDate(startDate.getDate() + 7);
    }
    _.each(weeks, function (weekVal) {
        var report = {
            week: weekVal,
            sheets: []
        } ;
        report.sheets = getByWeek(weekVal);;
        resultData.push(report);
        deferred.resolve(resultData);
        /*db.timesheets.find({ week: weekVal }).toArray(function(err, sheets) {
            var report = {
                week: weekVal,
                sheets: []
            } ;
            if (sheets) {
                report.sheets = sheets;
            }
            resultData.push(report);
            if(resultData.length == weeks.length){
                deferred.resolve(resultData);
            }
        });*/
    });
    timesheetService.timesheetBetweenDates(req.params)
        .then(function (result) {
            res.send(result);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}