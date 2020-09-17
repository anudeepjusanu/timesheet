var config = require('config.json');
var express = require('express');
var router = express.Router();
const JobOpeningService = require('../../services/jobOpenings.service');

// routes
router.get('/activeJobOpenings', getActiveJobOpenings);
router.get('/referJobOpening', referJobOpening);

router.get('/jobOpenings', getJobOpenings);
router.get('/jobOpening/:_id', getJobOpening);
router.post('/jobOpening', addJobOpening);
router.put('/jobOpening/:_id', updateJobOpening);
router.delete('/jobOpening/:_id', delJobOpening);

module.exports = router;

/** Active Job Openings */
function getActiveJobOpenings(req, res) {
    JobOpeningService.getActiveJobOpenings().then(data => {
        res.send({ jobOpenings: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function referJobOpening(req, res) {
    JobOpeningService.referJobOpening(req.body).then(data => {
        res.send({ jobOpening: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

/** Manage Job Openings */
function getJobOpenings(req, res) {
    JobOpeningService.getAllJobOpenings().then(data => {
        res.send({ jobOpenings: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function getJobOpening(req, res) {
    JobOpeningService.getJobOpening(req.query._id).then(data => {
        res.send({ jobOpening: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function addJobOpening(req, res) {
    JobOpeningService.addJobOpening(req.body).then(data => {
        res.send({ jobOpening: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateJobOpening(req, res) {
    JobOpeningService.updateJobOpening(req.body._id, req.body).then(data => {
        res.send({ jobOpening: data, req: req.query });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function delJobOpening(req, res) {
    JobOpeningService.deleteJobOpening(req.params._id,).then(data => {
        res.send({ jobOpening: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}
