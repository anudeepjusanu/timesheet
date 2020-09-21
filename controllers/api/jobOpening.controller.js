var config = require('config.json');
var express = require('express');
var router = express.Router();
const JobOpeningService = require('../../services/jobOpenings.service');
const path = require('path');
var multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/data/jobOpeningResumes/');
    },
    filename: function (req, file, cb) {
        cb(null, 'resume-' + Date.now() + path.extname(file.originalname));
    }
});
var upload = multer({
    storage: storage
});

// routes
router.get('/activeJobOpenings', getActiveJobOpenings);
router.post('/referJobOpening', upload.single('file'), referJobOpening);

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
    if (req.file) {
        req.body.resume = req.file.filename;
    }
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
    JobOpeningService.getJobOpening(req.params._id).then(data => {
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
    JobOpeningService.updateJobOpening(req.params._id, req.body).then(data => {
        res.send({ jobOpening: data, req: req.query });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function delJobOpening(req, res) {
    JobOpeningService.deleteJobOpening(req.params._id).then(data => {
        res.send({ jobOpening: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}
