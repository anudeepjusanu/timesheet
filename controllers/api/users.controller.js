var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');
var leaveWalletService = require('services/leaveWallet.service');
const InventoryService = require('../../services/inventory.service');

var builder = require('botbuilder');
var connector = new builder.ChatConnector({
    appId: config.botId,
    appPassword: config.botPassword
});
var bot = new builder.UniversalBot(connector);

// routes
router.post('/authenticate', authenticateUser);
router.post('/loginAsUser', loginAsUser);
router.post('/register', registerUser);
router.get('/current', getCurrentUser);
router.get('/admin/:_id', getUser);
router.put('/:_id', updateUser);
router.delete('/:_id', deleteUser);
router.put('/grantAdmin/:_id', adminAccess);
router.get('/all', getAllUsers);
router.get('/getUsers', getUsers);
router.put('/adminUpdate/:_id', adminUpdate);
router.post('/releaseToPool/:_id', releaseToPool);
router.post('/releaseFromPool/:_id', releaseFromPool);
router.get('/userPoolLogs/:_id', userPoolLogs);
router.get('/createPassword/:_id', createPassword);
router.put('/updatePushToken/:_id', updatePushToken);
router.post('/remind/user/:_id', remindByMessage);
router.get('/myLeaveWallet/:financeYear', getMyLeaveWallet);
router.get('/myLeaveWalletBalance', getMyLeaveWalletBalance);
router.get('/bot', getBotMigration);
router.post('/bot', postBotMigration);
router.get('/myInventory', getMyInventories);


module.exports = router;

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

function loginAsUser(req, res) {
    delete req.session.token;
    delete req.session.success;
    userService.loginAsUser(req.body.username)
        .then(function (token) {
            if (token) {
                req.session.token = token;
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

async function getCurrentUser(req, res) {
    userService.getById(req.user.sub).then(function (user) {
        if (user) {
            res.send(user);
        } else {
            res.sendStatus(404);
        }
    }).catch(function (err) {
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

function getUsers(req, res) {
    userService.getUsers()
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

function adminUpdate(req, res) {
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

function releaseToPool(req, res) {
    userService.releaseToPool(req.params._id, req.body).then(function (response) {
        if (response) {
            res.send(response);
        } else {
            res.sendStatus(404);
        }
    }).catch(function (err) {
        res.status(400).send(err);
    });
}

function releaseFromPool(req, res) {
    userService.releaseFromPool(req.params._id, req.body).then(function (response) {
        if (response) {
            res.send(response);
        } else {
            res.sendStatus(404);
        }
    }).catch(function (err) {
        res.status(400).send(err);
    });
}

function userPoolLogs(req, res) {
    userService.userPoolLogs(req.params._id).then(function (response) {
        if (response) {
            res.send(response);
        } else {
            res.sendStatus(404);
        }
    }).catch(function (err) {
        res.status(400).send(err);
    });
}

function createPassword(req, res) {
    var obj = {
        "password": "1234"
    }
    userService.createPassword(req.params._id, obj).then(function (response) {
        res.send("ok");
    }).catch(function (err) {
        res.status(400).send(err);
    });
};


function updatePushToken(req, res) {
    var userId = req.user.sub;
    userService.updatePushToken(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
};

function remindByMessage(req, res) {
    userService.getById(req.params._id)
        .then(function (user) {
            if (user) {
                var msg = new builder.Message()
                    .address(user.address)
                    .text("Hi " + user.name + " " + req.body.message);
                bot.send(msg, function (err) {
                    // Return success/failure
                    res.sendStatus(200);
                });
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getMyLeaveWallet(req, res) {
    var userId = req.user.sub;
    leaveWalletService.getUserLeaveWallet(userId, req.params.financeYear).then(function (response) {
        if (response) {
            res.send(response);
        } else {
            res.sendStatus(404);
        }
    }).catch(function (err) {
        res.status(400).send(err);
    });
}

function getMyLeaveWalletBalance(req, res) {
    var userId = req.user.sub;
    leaveWalletService.getUserLeaveWalletBalance(userId).then(function (response) {
        if (response) {
            res.send(response);
        } else {
            res.sendStatus(404);
        }
    }).catch(function (err) {
        res.status(400).send(err);
    });
}


function getBotMigration(req, res) {
    userService.botMigration(req.query.migrate).then(function (response) {
        if (response) {
            res.send(response);
        } else {
            res.sendStatus(404);
        }
    }).catch(function (err) {
        res.status(400).send(err);
    });
}

function postBotMigration(req, res) {
    userService.getById(req.query.userId)
        .then(function (user) {
            if (user) {
                var msg = new builder.Message()
                    .address(user.address)
                    .text("Hi " + user.name + ", Please migrate to MS teams ");
                bot.send(msg, function (err) {
                    // Return success/failure
                    res.sendStatus(200);
                });
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getMyInventories(req, res) {
    InventoryService.getMyInventories(req.user.sub).then(data => {
        res.send({ inventories: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}