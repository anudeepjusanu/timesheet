var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');
var surveyService = require('services/surveys.service');
var builder = require('botbuilder');
var connector = new builder.ChatConnector({
    appId: config.botId,
    appPassword: config.botPassword
});
var bot = new builder.UniversalBot(connector);
// routes
router.get('/all', getAllSurveys);
router.post('/', createSurvey);

module.exports = router;


function getAllSurveys(req, res) {
    surveyService.getAll(req.body)
        .then(function(response) {
            console.log(response);
            res.send(response);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function createSurvey(req, res) {
    surveyService.create(req.body)
        .then(function(response) {
            res.sendStatus(200).send(response);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
};

function remindAll(req, res) {
    userService.getAll()
        .then(function(users) {
            if (users) {
                for (var i = 0, len = users.length; i < len; i++) {
                    postSurvey(users[i]);
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

function postSurvey() {

}