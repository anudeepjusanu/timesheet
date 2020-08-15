var config = require('config.json');
var express = require('express');
var router = express.Router();
const DailyTrackerService = require('../../services/dailyTracker.service');
const DailyTaskCategoryService = require('../../services/dailyTaskCategories.service');

// routes
router.get('/myDailyTrackerTasks', getMyDailyTrackerTasks);
router.get('/dailyTrackerTask/:_id', getDailyTrackerTask);
router.post('/dailyTrackerTask', addDailyTrackerTask);
router.put('/dailyTrackerTask/:_id', updateDailyTrackerTask);
router.delete('/dailyTrackerTask/:_id', deleteDailyTrackerTask);

router.get('/dailyTaskCategories', getDailyTaskCategories);
router.get('/dailyTaskCategory/:_id', getDailyTaskCategory);
router.post('/dailyTaskCategory', addDailyTaskCategory);
router.put('/dailyTaskCategory/:_id', updateDailyTaskCategory);
router.delete('/dailyTaskCategory/:_id', delDailyTaskCategory);

module.exports = router;

/** Daily Tracker Task */
function getMyDailyTrackerTasks(req, res) {
    var query = { trackerDate: req.query.trackerDate };
    DailyTrackerService.getMyDailyTrackerTasks(req.user.sub, query).then(data => {
        res.send({ dailyTrackerTasks: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function getDailyTrackerTask(req, res) {
    DailyTrackerService.getDailyTrackerTask(req.params._id).then(data => {
        res.send({ dailyTrackerTasks: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function addDailyTrackerTask(req, res) {
    req.body.userId = req.user.sub;
    DailyTrackerService.addDailyTrackerTask(req.body).then(data => {
        res.send({ dailyTrackerTask: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateDailyTrackerTask(req, res) {
    DailyTrackerService.updateDailyTrackerTask(req.params._id, req.body).then(data => {
        res.send({ dailyTrackerTask: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function deleteDailyTrackerTask(req, res) {
    DailyTrackerService.deleteDailyTrackerTask(req.params._id).then(data => {
        res.send({ dailyTrackerTask: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

/** Daily Task Category */
function getDailyTaskCategories(req, res) {
    DailyTaskCategoryService.getDailyTaskCategories().then(data => {
        res.send({ dailyTaskCategories: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function getDailyTaskCategory(req, res) {
    DailyTaskCategoryService.getDailyTaskCategory(req.query._id).then(data => {
        res.send({ dailyTaskCategory: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function addDailyTaskCategory(req, res) {
    DailyTaskCategoryService.addDailyTaskCategory({
        taskCategoryShortName: req.body.taskCategoryShortName,
        taskCategoryName: req.body.taskCategoryName
    }).then(data => {
        res.send({ dailyTaskCategory: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateDailyTaskCategory(req, res) {
    DailyTaskCategoryService.updateDailyTaskCategory(req.body._id, {
        taskCategoryShortName: req.body.taskCategoryShortName,
        taskCategoryName: req.body.taskCategoryName
    }).then(data => {
        res.send({ dailyTaskCategory: data, req: req.query });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function delDailyTaskCategory(req, res) {
    DailyTaskCategoryService.delDailyTaskCategory(req.params._id,).then(data => {
        res.send({ dailyTaskCategory: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}
