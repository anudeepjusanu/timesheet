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
var _ = require('lodash');

// routes
router.post('/', createTimesheet);
router.post('/setTimesheetStatus/:id/project/:projectId/status/:sheetStatus', setTimesheetStatus);
router.put('/:id', updateTimesheet);
router.get('/:id', getTimesheet);
router.delete('/:id', deleteTimesheet);
router.get('/week/mine', getMyReport);
router.get('/week/:weekId', getReportbyWeek);
router.get('/remind/:id/:week', remind);
router.get('/remind/all', remindAll);
router.get('/teamRemind/all/:week', teamRemindAll);
router.put('/admin/:id', adminUpdate);
router.post('/month/report', getReportbyMonth);
router.get('/userTakenLeaves/:userId', userTakenLeaves);
router.get('/userTakenLeaves/:userId/:financeYear', userTakenLeaves);
router.get('/userTakenLeaveBalance/:userId', userTakenLeaveBalance);
router.get('/utilizationByMonth/:monthId/:yearId', utilizationByMonth);
router.get('/allUserHoursByWeek/:weekId', allUserHoursByWeek);
router.get('/projectUserHoursByWeek/:weekId/:projectId', projectUserHoursByWeek);
router.get('/clientUserHoursByWeek/:weekId/:clientId', clientUserHoursByWeek);
router.get('/allUserHoursByMonth/:monthId/:yearId', allUserHoursByMonth);
router.post('/timesheetBetweenDates/:startDate/:endDate', timesheetBetweenDates);
router.get('/projectUserHoursByMonth/:monthId/:yearId/:projectId', projectUserHoursByMonth);
router.get('/project/:projectId/week/:weekId', getTimesheetByProject)
router.get('/remind/user/:userId/project/:name/week/:weekId', remindByProject);


module.exports = router;

function createTimesheet(req, res) {
    userService.getById(req.user.sub).then(function(user) {
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
    }).catch(function(err) {
        res.status(400).send(err);
    });
}

function updateTimesheet(req, res) {
    userService.getById(req.user.sub).then(function(currentUser) {
        if (currentUser) {
            timesheetService.updateTimesheet(req.params.id, req.body, currentUser).then(function() {
                res.sendStatus(200);
            }).catch(function(err) {
                res.status(400).send(err);
            });
        } else {
            res.sendStatus(404);
        }
    }).catch(function(err) {
        res.status(400).send(err);
    });
}

function setTimesheetStatus(req, res) {
    timesheetService.setTimesheetStatus(req.params.id, req.params.projectId, req.params.sheetStatus).then(function() {
        res.sendStatus(200);
    }).catch(function(err) {
        res.status(400).send(err);
    });
}

function getTimesheet(req, res) {
    timesheetService.getTimesheet(req.params.id)
        .then(function(response) {
            res.send(response);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function deleteTimesheet(req, res) {
    var userId = req.user.sub;
    userService.getById(req.user.sub).then(function(currentUser) {
        if (currentUser && currentUser.admin === true) {
            timesheetService.adminDeleteTimesheet(req.params.id)
                .then(function(response) {
                    res.send(response);
                })
                .catch(function(err) {
                    res.status(400).send(err);
                });
        } else {
            timesheetService.deleteTimesheet(req.params.id, userId)
                .then(function(response) {
                    res.send(response);
                })
                .catch(function(err) {
                    res.status(400).send(err);
                });
        }
    }).catch(function(err) {
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
                    .text("Hi, Please update your weekly hours for " + req.params.week + " at http://timesheet.wavelabs.in");
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
                    if (users[0].isActive) {
                        var msg = new builder.Message()
                            .address(users[i].address)
                            .text("Please update your weekly hours for current week at http://timesheet.wavelabs.in , Ignore if already updated");
                        bot.send(msg, function(err) {
                            // Return success/failure

                        });
                    }

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

function teamRemindAll(req, res) {
    timesheetService.getTimesheetApproveProjectOwners(req.params.week).then(function(timesheets) {
        var output = [];
        var myTestAddress = {
            "useAuth" : true,
            "serviceUrl" : "https://smba.trafficmanager.net/apis/",
            "bot" : {
                "name" : "Wavelabs Bot",
                "id" : "28:c8fc3ad9-72cb-46ff-b5f1-09432ed9b7db"
            },
            "conversation" : {
                "id" : "29:1rJ0cAsaQqgabXbAZXEGeHNKhWV4fWT9NWOsHZVIYGhc"
            },
            "user" : {
                "name" : "Lal Bahadur Sastry Chintaluri",
                "id" : "29:1rJ0cAsaQqgabXbAZXEGeHNKhWV4fWT9NWOsHZVIYGhc"
            },
            "channelId" : "skype",
            "id" : "1487824461927"
        };
        _.each(timesheets, function(timesheetObj){
            var userObj = _.find(output, {userId: timesheetObj.user_info._id});
            if(userObj){
                if(!(userObj.projectName.indexOf(timesheetObj.projectName)>=0)){
                    userObj.projectName.push(timesheetObj.projectName);
                }
            }else{
                output.push({
                    week: timesheetObj.week,
                    userId: timesheetObj.user_info._id,
                    userName: timesheetObj.user_info.name,
                    address: timesheetObj.user_info.address,
                    projectName: [timesheetObj.projectName]
                });    
            }
        });
        _.each(output, function(userObj){
            var projectNames = "";
            _.each(userObj.projectName, function(item){ projectNames += item+', '; });
            var message = "Please approve weekly hours for "+userObj.week+" week ("+ projectNames +") at http://timesheet.wavelabs.in , Ignore if already updated";
            var msg = new builder.Message()
                        .address(userObj.address)
                        .text(message);
                bot.send(msg, function(err) {
                    // Return success/failure
                });
        });
        res.send(output);
    }).catch(function(err) {
        res.status(400).send(err);
    });
}

function adminUpdate(req, res) {
    var userId = req.user.sub;
    timesheetService.adminUpdate(req.params.id, req.body)
        .then(function() {
            res.sendStatus(200);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function getReportbyMonth(req, res) {
    timesheetService.getByMonth(req.body.weekArr)
        .then(function(reports) {
            res.send(reports);
        })
        .catch(function(err) {
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

function utilizationByMonth(req, res) {
    timesheetService.utilizationByMonth(req.params.monthId, req.params.yearId, req.body)
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

    timesheetService.timesheetBetweenDates(req.params.startDate, req.params.endDate, req.body)
        .then(function(report) {
            res.send(report);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function getTimesheetByProject(req, res) {
    timesheetService.getByProject(req.params.weekId, req.params.projectId)
        .then(function(reports) {
            res.send(reports);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function remindByProject(req, res) {
    userService.getById(req.params.userId)
        .then(function(user) {
            if (user) {
                var msg = new builder.Message()
                    .address(user.address)
                    .text("Hi " + user.name + ", Please update your weekly hours for the project " + req.params.name + " for week " + req.params.weekId + " at http://timesheet.wavelabs.in");
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

function userTakenLeaves(req, res) {
    timesheetService.userTakenLeaves(req.params.userId, req.params.financeYear)
        .then(function(response) {
            res.send(response);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function userTakenLeaveBalance(req, res) {
    timesheetService.userTakenLeaveBalance(req.params.userId)
        .then(function(response) {
            res.send(response);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}