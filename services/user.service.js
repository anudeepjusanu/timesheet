var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var mongoose = require("mongoose");
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('users');
db.bind('poolLogs');
var UserModel = require("../models/user.model");

var service = {};

service.authenticate = authenticate;
service.loginAsUser = loginAsUser;
service.getById = getById;
service.getCurrentUser = getCurrentUser;
service.getUserById = getUserById;
service.getAll = getAll;
service.getUsers = getUsers;
service.createUser = createUser;
service.update = update;
service.updateEmail = updateEmail;
service.createPassword = createPassword;
service.delete = _delete;
service.adminAccess = adminAccess;
service.adminUpdate = adminUpdate;
service.releaseToPool = releaseToPool;
service.releaseFromPool = releaseFromPool;
service.userPoolLogs = userPoolLogs;
service.updatePushToken = updatePushToken;
service.migrateAccount = migrateAccount;
service.getUserbyName = getUserbyName;
service.botMigration = botMigration;
service.getPractices = getPractices;
module.exports = service;

function authenticate(username, password) {
    var deferred = Q.defer();
    db.users.findOne({ username: username, "isActive": true }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user && user.hash && password && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
            deferred.resolve(jwt.sign({ sub: user._id }, config.secret));
        } else {
            // authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function loginAsUser(username) {
    var deferred = Q.defer();
    db.users.findOne({ username: username }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(jwt.sign({ sub: user._id }, config.secret));
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();

    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getCurrentUser(_id) {
    var deferred = Q.defer();
    var weekDate = new Date();

    UserModel.findOne({ _id: mongoose.Types.ObjectId(_id) }).lean().exec().then(async (user) => {
        if (user) {
            // var activeProjects = [];
            // var userProjects = await UserModel.aggregate([
            //     { $match: { _id: mongoose.Types.ObjectId(_id) } },
            //     { $project: { projects: 1 } },
            //     { $unwind: { path: "$projects", preserveNullAndEmptyArrays: true } }
            // ]);
            // for (var i = 0; i < userProjects.length; i++) {
            //     var projectObj = userProjects[i].projects;
            //     var isActiveProject = false;
            //     if (projectObj.billDates) {
            //         for (var j = 0; j < projectObj.billDates.length; j++) {
            //             var billObj = projectObj.billDates[j];
            //             if (billObj.start && billObj.end) {
            //                 var billStartDate = new Date(billObj.start);
            //                 var billEndDate = new Date(billObj.end);
            //                 if (billStartDate <= weekDate && billEndDate >= weekDate) {
            //                     isActiveProject = true
            //                 }
            //             } else if (billObj.start) {
            //                 var billStartDate = new Date(billObj.start);
            //                 if (billStartDate <= weekDate) {
            //                     isActiveProject = true
            //                 }
            //             } else if (billObj.end) {
            //                 var billEndDate = new Date(billObj.end);
            //                 if (billEndDate >= weekDate) {
            //                     isActiveProject = true
            //                 }
            //             }
            //             if (isActiveProject) {
            //                 break;
            //             }
            //         }
            //     }
            //     if (isActiveProject) {
            //         activeProjects.push(projectObj);
            //     }
            // }
            // user.activeProjects = activeProjects;

            // return user (without hashed password)
            //resolve(_.omit(user, 'hash'));
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            deferred.resolve();
        }
    }).catch((error) => {
        console.log(error);
        deferred.reject(error);
        //reject({ error: error.errmsg });
    });
    return deferred.promise;
    // return true;
    // db.users.findById(_id, async function (err, user) {
    //     if (err) deferred.reject(err.name + ': ' + err.message);
    //     if (user) {
    //         var activeProjects = [];
    //         var userProjects = await UserModel.aggregate([
    //             { $match: { _id: mongoose.Types.ObjectId(_id) } },
    //             { $project: { projects: 1 } },
    //             { $unwind: { path: "$projects", preserveNullAndEmptyArrays: true } }
    //         ]);
    //         for (var i = 0; i < userProjects.length; i++) {
    //             var projectObj = userProjects[i].projects;
    //             var isActiveProject = false;
    //             if (projectObj.billDates) {
    //                 for (var j = 0; j < projectObj.billDates.length; j++) {
    //                     var billObj = projectObj.billDates[j];
    //                     if (billObj.start && billObj.end) {
    //                         var billStartDate = new Date(billObj.start);
    //                         var billEndDate = new Date(billObj.end);
    //                         if (billStartDate <= weekDate && billEndDate >= weekDate) {
    //                             isActiveProject = true
    //                         }
    //                     } else if (billObj.start) {
    //                         var billStartDate = new Date(billObj.start);
    //                         if (billStartDate <= weekDate) {
    //                             isActiveProject = true
    //                         }
    //                     } else if (billObj.end) {
    //                         var billEndDate = new Date(billObj.end);
    //                         if (billEndDate >= weekDate) {
    //                             isActiveProject = true
    //                         }
    //                     }
    //                     if (isActiveProject) {
    //                         break;
    //                     }
    //                 }
    //             }
    //             if (isActiveProject) {
    //                 activeProjects.push(projectObj);
    //             }
    //         }
    //         user.activeProjects = activeProjects;

    //         // return user (without hashed password)
    //         deferred.resolve(_.omit(user, 'hash'));
    //     } else {
    //         // user not found
    //         deferred.resolve();
    //     }
    // });

    // return deferred.promise;
}

function getUserById(_id) {
    var deferred = Q.defer();

    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();

    db.users.find().toArray(function (err, users) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (users) {
            var usersList = _.map(users, function (e) {
                return _.omit(e, 'hash');
            });
            // return user (without hashed password)
            deferred.resolve(usersList);
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getUsers() {
    var deferred = Q.defer();

    db.users.find({ "isActive": true }).toArray(function (err, users) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (users) {
            var usersList = _.map(users, function (e) {
                return _.omit(e, 'hash');
            });
            // return user (without hashed password)
            deferred.resolve(usersList);
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function createUser(userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findOne({ userId: userParam.userId },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                // username already exists
                deferred.reject('You have already Registered');
            } else {
                createUser();
            }
        });

    function createUser() {
        if (userParam.password) {
            userParam.hash = bcrypt.hashSync(userParam.password, 10);
        }
        db.users.insert(
            userParam,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user.username !== userParam.username) {
            // username has changed so check if the new username is already taken
            db.users.findOne({ username: userParam.username },
                function (err, user) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (user) {
                        // username already exists
                        deferred.reject('Username "' + req.body.username + '" is already taken')
                    } else {
                        updateUser();
                    }
                });
        } else {
            updateUser();
        }
    });

    function updateUser() {
        // fields to update
        var set = {
            name: userParam.name
        };

        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        db.users.update({ _id: mongo.helper.toObjectID(_id) }, { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function updateEmail(id, userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findOne({ 'userId': id }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (user && user.username) {
            deferred.reject('Username is already mapped for you');
        } else if (user) {
            updateUser(user._id);
        } else {
            deferred.reject('You may have to register first by using the command register');
        }
    });

    function updateUser(id) {
        // fields to update
        var set = {
            username: userParam.username,
        };

        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        db.users.update({ _id: mongo.helper.toObjectID(id) }, { $set: set }, { upsert: true, multi: true },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve();
            });
    }

    return deferred.promise;
}

function createPassword(_id, userParam) {
    var deferred = Q.defer();

    // validation

    db.users.findOne({ 'userId': _id, "isActive": true }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (user) {
            updateUser(user._id);
        } else {
            deferred.reject('You seems to be inactive. Please contact HR team');
        }
    });

    // update password if it was entered

    function updateUser(id) {
        var set = {};
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }
        db.users.update({ _id: mongo.helper.toObjectID(id) }, { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.users.remove({ _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function adminAccess(_id) {
    var deferred = Q.defer();
    var set = {
        admin: true
    }
    db.users.update({ _id: mongo.helper.toObjectID(_id) }, { $set: set },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function adminUpdate(id, userId, userParam) {
    var deferred = Q.defer();
    db.users.findById(id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (user && user.admin) {
            update_user(userId, userParam);
        } else {
            deferred.reject('You dont have prvilage to update the user');
        }
    });

    function update_user(userId, userParam) {
        if (userParam.joinDate) {
            userParam.joinDate = new Date(userParam.joinDate);
        }
        db.users.update({ _id: mongo.helper.toObjectID(userId) }, { $set: userParam },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve(doc);
            },
            function (err) {
                deferred.reject('something went wrong');
            });
    }

    return deferred.promise;
}

function releaseToPool(userId, userParam) {
    var deferred = Q.defer();
    db.users.findById(userId, function (err, userObj) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (userObj && userObj.isActive === true) {
            var poolSinceDate = new Date(userParam.poolSinceDate);
            db.users.update({ _id: userObj._id }, { $set: { resourceInPool: true, poolName: userParam.poolName, poolSinceDate: poolSinceDate } }, function (err, response) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                var logData = {
                    userId: userObj._id,
                    poolName: userParam.poolName,
                    poolSinceDate: poolSinceDate,
                    createdDate: new Date()
                }
                db.poolLogs.insert(logData, function (err, log) {
                    deferred.resolve(response);
                });
            }, function (err) {
                deferred.reject('something went wrong');
            });
        } else {
            deferred.reject('You dont have prvilage to update the user');
        }
    });
    return deferred.promise;
}

function releaseFromPool(userId, userParam) {
    var deferred = Q.defer();
    db.users.findById(userId, function (err, userObj) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (userObj && userObj.isActive === true) {
            db.users.update({ _id: userObj._id }, { $set: { resourceInPool: false, poolName: "", poolSinceDate: "" } }, function (err, response) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                db.poolLogs.find({ userId: userObj._id }).sort({ _id: -1 }).limit(1).toArray(function (err, logs) {
                    if (logs && logs[0]) {
                        var logObj = logs[0];
                        db.poolLogs.update({ _id: logObj._id }, { $set: { endDate: new Date() } }, function (err, logResponse) {
                            deferred.resolve(response);
                        });
                    } else {
                        deferred.resolve(response);
                    }
                });
            }, function (err) {
                deferred.reject('something went wrong');
            });
        } else {
            deferred.reject('You dont have prvilage to update the user');
        }
    });
    return deferred.promise;
}

function userPoolLogs(userId) {
    var deferred = Q.defer();

    db.poolLogs.find({ 'userId': mongo.helper.toObjectID(userId) }).toArray(function (err, logs) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (logs) {
            deferred.resolve(logs);
        } else {
            deferred.resolve([]);
        }
    });

    return deferred.promise;
}

function updatePushToken(id, userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findById(id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (user && user.username) {
            updateToken(user._id);
        } else {
            deferred.reject('something went wrong');
        }
    });

    function updateToken(id) {
        // fields to update
        var set = {
            pushToken: userParam.pushToken
        };
        db.users.update({ _id: mongo.helper.toObjectID(id) }, { $set: set }, { upsert: true, multi: true },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve();
            });
    }

    return deferred.promise;
}

function migrateAccount(id, userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findOne({ 'username': id }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (user && user.migrated) {
            deferred.reject('You are already migrated to MS Teams');
        } else if (user) {
            updateUser(user._id);
        } else {
            deferred.reject('You may have to register first by using the command register');
        }
    });

    function updateUser(id) {
        // fields to update
        var set = {
            "address": userParam.address,
            "userId": userParam.userId,
            "migrated": true
        };

        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        db.users.update({ _id: mongo.helper.toObjectID(id) }, { $set: set }, { upsert: true, multi: true },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve();
            });
    }

    return deferred.promise;
}

function getUserbyName(name) {
    var deferred = Q.defer();
    // validation
    db.users.findOne({ 'name': name }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (user && user.migrated) {
            deferred.reject('You are already migrated to MS Teams');
        } else if (user) {
            deferred.resolve(user);
        } else {
            console.log("name  :" + name);
            deferred.reject('Please contact admin for the migration');
        }
    });
    return deferred.promise;
}


function botMigration(migrated) {
    var deferred = Q.defer();
    db.users.find({ 'isActive': true }).toArray(function (err, users) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (users) {
            var usersList;

            if (migrated === 'true') {
                usersList = _.filter(users, function (e) {
                    return e.migrated;
                });
            } else {
                usersList = _.filter(users, function (e) {
                    return !e.migrated;
                });
            }
            deferred.resolve(usersList);
        } else {
            // user not found
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function getPractices() {
    var deferred = Q.defer();

    var list_practice = [
        'AI & Data',
        'Digital',
        'Design & Digital',
        'TES',
        'Managed Services',
        'Industry 4.0 & connectivity'
    ];
    deferred.resolve(list_practice);

    return deferred.promise;
}