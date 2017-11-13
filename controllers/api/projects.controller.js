var config = require('config.json');
var express = require('express');
var router = express.Router();
var projectService = require('services/project.service');

// routes
router.get('/all', getAllProjects);
router.get('/:_id', getProjectById);
router.post('/', addProject);
router.put('/:_id', updateProject);
router.delete('/:_id', deleteProject);
router.get('/assignedUsers/:_id', getAssignedUsers);
router.post('/assignedUsers/:_id', assignedUsers);
router.post('/assignUser/:_id', addAssignUser);
router.delete('/assignUser/:_id/:_userId', unassignUser);

module.exports = router;

function getAllProjects(req, res) {
    projectService.getAllProjects()
        .then(function (projects) {
            if (projects) {
                res.send(projects);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function addProject(req, res) {
    projectService.create(req.body)
     .then(function (response) {
         res.sendStatus(200).send(response);
     })
     .catch(function (err) {
     res.status(400).send(err);
     });
}

function updateProject(req, res) {
    projectService.update(req.params._id, req.body)
        .then(function (response) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteProject(req, res) {
    projectService.delete(req.params._id)
        .then(function (response) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getProjectById(req, res) {
    projectService.getProjectById(req.params._id)
        .then(function (project) {
            if (project) {
                res.send(project);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAssignedUsers(req, res) {
    projectService.getAssignedUsers(req.params._id)
        .then(function (users) {
            if (users) {
                res.send(users);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function assignedUsers(req, res) {
    projectService.assignUsers(req.params._id, req.body)
        .then(function (response) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function addAssignUser(req, res) {
    projectService.assignUser(req.params._id, req.body)
        .then(function (response) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function unassignUser(req, res) {
    projectService.unassignUser(req.params._id, req.params._userId)
        .then(function (response) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}