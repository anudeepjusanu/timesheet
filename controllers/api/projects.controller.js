var config = require('config.json');
var express = require('express');
var _ = require('lodash');
var router = express.Router();
var projectService = require('services/project.service');
var userService = require('services/user.service');

// routes
router.get('/all', getAllProjects);
router.get('/clients', getClients);
router.get('/projectsWithUserCount', getProjectsWithUserCount);
router.get('/projectUsers', getProjectUsers);
router.get('/:_id', getProjectById);
router.post('/', addProject);
router.put('/:_id', updateProject);
router.delete('/:_id', deleteProject);
router.get('/assignedUsers/:_id', getAssignedUsers);
router.post('/assignedUsers/:_id', assignedUsers);
router.post('/assignUser/:_id', addAssignUser);
router.delete('/assignUser/:_id/:_userId', unassignUser);
router.get('/client/:_id', getClientById);
router.post('/client/', addClient);
router.put('/client/:_id', updateClient);
router.delete('/client/:_id', deleteClient);

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

function getClients(req, res) {
    projectService.getClients()
        .then(function (clients) {
            if (clients) {
                res.send(clients);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getClientById(req, res) {
    projectService.getClientById(req.params._id)
        .then(function (client) {
            if (client) {
                res.send(client);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function addClient(req, res) {
    projectService.createClient(req.body)
        .then(function (response) {
            res.sendStatus(200).send(response);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateClient(req, res) {
    projectService.updateClient(req.params._id, req.body)
        .then(function (response) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteClient(req, res) {
    projectService.deleteClient(req.params._id)
        .then(function (response) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getProjectUsers(req, res) {
    projectService.getAllProjects()
        .then(function (projects) {
            if (projects) {
                _.each(projects, function (projectObj) {
                    projectObj.users = [];
                    projectObj._id = projectObj._id+"";
                });
                userService.getAll().then(function (users) {
                    if(users){
                        _.each(users, function (userObj) {
                            _.each(userObj.projects, function (assignPrj) {
                                var projectObj = _.find(projects, {_id: assignPrj.projectId+""});
                                console.log(projectObj);
                                if(projectObj){
                                    projectObj.users.push({
                                        name: userObj.name,
                                        username: userObj.username,
                                        allocatedHours: assignPrj.allocatedHours,
                                        billDates: assignPrj.billDates
                                    });
                                }
                            });
                        });
                    }
                    res.send(projects);
                }).catch(function (err) {
                    res.status(400).send(err);
                });
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getProjectsWithUserCount(req, res) {
    projectService.getAllProjects().then(function (projectData) {
        if (projectData) {
            var projects = [];
            _.each(projectData, function (projectObj) {
                projects.push({
                    projectId: projectObj._id+"",
                    projectName: projectObj.projectName,
                    clientName: projectObj.clientName,
                    userCount: 0
                });
            });
            userService.getAll().then(function (users) {
                if(users){
                    _.each(users, function (userObj) {
                        _.each(userObj.projects, function (assignPrj) {
                            var projectObj = _.find(projects, {projectId: assignPrj.projectId});
                            if(projectObj){
                                projectObj.userCount++;
                            }
                        });
                    });
                }
                res.send(projects);
            }).catch(function (err) {
                res.status(400).send(err);
            });
        } else {
            res.sendStatus(404);
        }
    }).catch(function (err) {
        res.status(400).send(err);
    });
}

