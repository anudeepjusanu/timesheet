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










function authenticateUser(req, res) {
    userService.authenticate(req.body.username, req.body.password)
        .then(function (token) {
            if (token) {
                // authentication successful
                res.send({ token: token });
            } else {
                // authentication failed
                res.status(401).send('Username or password is incorrect');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function registerUser(req, res) {
    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentUser(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getUser(req, res) {
    userService.getUserById(req.params._id)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only update own account
        return res.status(401).send('You can only update your own account');
    }

    userService.update(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteUser(req, res) {
    userService.delete(req.params._id)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function adminAccess(req, res) {
    userService.adminAccess(req.params._id)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function getAllUsers(req, res) {
    userService.getAll()
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function adminUpdate(req, res){
    console.log(req.user.sub);
    userService.adminUpdate(req.user.sub, req.params._id, req.body)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}