var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');
var projectService = require('services/project.service');

var builder = require('botbuilder');
var connector = new builder.ChatConnector({
    appId: config.botId,
    appPassword: config.botPassword
});
var bot = new builder.UniversalBot(connector);

// routes
router.post('/sendMsgToUser/:userId', sendMsgToUser);
router.post('/sendMsgToAllActiveUsers', sendMsgToAllActiveUsers);
router.post('/sendMsgToAllProjectUsers/:projectId', sendMsgToAllProjectUsers);
router.post('/sendMsgToSelectedUsers', sendMsgToSelectedUsers);
module.exports = router;

async function sendMsgToUser(req, res) {
    // Check for isActive Condition
    let User = await userService.getUserById(req.params.userId);
    if (User) {
        if (User.isActive === true) {
            var msg = new builder.Message()
                .address(User.address)
                .text(req.body.message);
            bot.send(msg, function (err) {
                if (err) {
                    res.status(422).json({
                        success: false,
                        message: "Bot configuration error"
                    });
                } else {
                    res.status(200).json({
                        success: true,
                        message: "Message sent successfully!"
                    });
                }
            });
        } else {
            res.status(422).json({
                success: false,
                message: "User inactive"
            });
        }
    } else {
        res.status(422).json({
            success: false,
            message: "Invalid user id"
        });
    }


}

async function sendMsgToAllActiveUsers(req, res) {
    // Check for isActive Condition
    let allActiveUsers = await userService.getUsers();
    if (allActiveUsers.length > 0) {
        await allActiveUsers.forEach(async (user) => {
            if (user.isActive === true) {
                var msg = new builder.Message()
                    .address(user.address)
                    .text(req.body.message);
                bot.send(msg, function (err) {

  
app.use('/api/bot', require('./controllers/api/bot.controller'));              });
            } else {
                console.log('User inactive');
            }
        });
        res.status(200).json({
            success: true,
            message: "Message sent successfully!"
        });
    } else {
        res.status(422).json({
            success: false,
            message: 'No users found!'
        });
    }

}

async function sendMsgToAllProjectUsers(req, res) {
    // Check for isActive Condition
    let allActiveUsers = await projectService.getAssignedUsers(req.params.projectId);
    if (allActiveUsers.length > 0) {
        await allActiveUsers.forEach(async (user) => {
            if (user.isActive === true) {
                var msg = new builder.Message()
                    .address(user.address)
                    .text(req.body.message);
                bot.send(msg, function (err) {

                });
            } else {
                console.log('User inactive');
            }
        });
        res.status(200).json({
            success: true,
            message: "Message sent successfully!"
        });
    } else {
        res.status(422).json({
            success: false,
            message: 'No users found!'
        });
    }
}

async function sendMsgToSelectedUsers(req, res) {
    // Check for isActive Condition
    let allActiveUsers = await userService.getByUserIds(req.db, req.body.userIds);
    if (allActiveUsers.length > 0) {
        await allActiveUsers.forEach(async (user) => {
            if (user.isActive == true) {
                var msg = new builder.Message()
                    .address(user.address)
                    .text(req.body.message);
                bot.send(msg, function (err) {

                });
            } else {
                console.log('User inactive');
            }
        });
        res.status(200).json({
            success: true,
            message: "Message sent successfully!"
        });
    } else {
        res.status(422).json({
            success: false,
            message: 'No users found!'
        });
    }
}