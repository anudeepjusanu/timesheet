require('rootpath')();
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
var builder = require('botbuilder');
var mongoose = require("mongoose");
mongoose.connect(config.connectionString, { useNewUrlParser: true });
var userService = require('services/user.service');


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));
app.use(express.static(__dirname + '/public'));


var connector = new builder.ChatConnector({
    appId: "c8fc3ad9-72cb-46ff-b5f1-09432ed9b7db",
    appPassword: "Y1A0xm40NNkm1XpR0MNV3sz"
});

var bot = new builder.UniversalBot(connector);

// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register', '/api/messages', '/api/users/bot', '/api/chatbot'] }));

app.post('/api/messages', connector.listen());
app.get('/api/messages', function (req, res) {
    var users = {
        "name": "Anudeep"
    }
    res.json(users);
});

bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
            .address(message.address)
            .text("Hello %s... Thanks for adding me. Say 'hello' to see some great demos.", name || 'there');
        bot.send(reply);
    } else {
        // delete their data
    }
});

bot.on('typing', function (message) {
    // User is typing
});

bot.on('deleteUserData', function (message) {
    // User asked to delete their data
});

bot.dialog('/', function (session) {
    session.sendTyping();
    //console.log(session.message);
    console.log(session.message.text.toLowerCase());
    if (session.message.text.toLowerCase().indexOf('migrate') == 0) {
        console.log("MIGRATION START")
        session.beginDialog('/migrateAccount');
    } else if (session.message.text.toLowerCase().indexOf('hello') == 0) {
        session.send(`Hey, How are you?. \n\n`);
    } else if (session.message.text.toLowerCase().indexOf('register') == 0) {
        session.beginDialog('/registerEmail');
    } else if (session.message.text.toLowerCase().indexOf('help') == 0) {
        session.send(`Available commands:\n\n register (first command to run) \n\n register \n\n password \n\n`);
    } else if (session.message.text.toLowerCase().indexOf('password') == 0) {
        var addressObj = session.message.address;
        var obj = {
            "password": Math.random().toString(36).substring(7)
        }
        userService.createPassword(addressObj.user.id, obj)
            .then(function (response) {
                session.send("Here is your new password: " + obj.password);
                session.endDialog();
            })
            .catch(function (err) {
                session.send(err);
                session.endDialog();
            });
    } else if (session.message.text.toLowerCase().indexOf('wliobot') == 0) {
        var notification = session.message.text.replace('wliobot', '');
        userService.getAll()
            .then(function (users) {
                if (users) {
                    for (var i = 0, len = users.length; i < len; i++) {
                        var msg = new builder.Message()
                            .address(users[i].address)
                            .text(notification);
                        bot.send(msg, function (err) {
                            // Return success/failure
                        });
                    }

                }
            })
            .catch(function (err) {

            });
    } else if (session.message.text.toLocaleLowerCase().indexOf('survey') == 0) {
        session.beginDialog('/postSurvey');
    } else {
        session.send(`Sorry, no donuts for you!`);
        //session.beginDialog('/postSurvey');
    }
});

bot.dialog('/registerEmail1', [function (session) {
    builder.Prompts.text(session, "Please enter your wavelabs email");
}, function (session, results) {
    if (results.response) {
        var addressObj = session.message.address;
        var regex = /\S+@\S+\.\S+/;
        if (regex.exec(results.response) && regex.exec(results.response)[0]) {
            var obj = {
                "username": results.response
            }
            obj.password = Math.random().toString(36).substring(7);
            userService.updateEmail(addressObj.user.id, obj)
                .then(function () {
                    session.send("Email Registered Successfully, \n\n Here are your login details \n\n username:" + obj.username + "\n\n Password:" + obj.password + "\n\n login at http://timesheet.wavelabs.in You can change your password under my account tab");
                    session.endDialog();
                })
                .catch(function (err) {
                    session.send(err);
                    session.endDialog();
                });
        } else {
            session.send("This is not a valid email id try again by giving the command email");
            session.endDialog();
        }
    } else {
        session.send("Thank you!!");
        session.endDialog();
    }
}]);

bot.dialog('/registerEmail', [function (session) {
    builder.Prompts.text(session, "Please enter your wavelabs email");
}, function (session, results) {
    if (results.response) {
        var addressObj = session.message.address;
        var regex = /\S+@\S+\.\S+/;
        if (regex.exec(results.response) && regex.exec(results.response)[0]) {
            var obj = {
                "username": results.response,
                "address": addressObj,
                "admin": false,
                "userId": addressObj.user.id,
                "name": addressObj.user.name,
                "isActive": true
            }
            obj.password = Math.random().toString(36).substring(7);
            userService.createUser(obj)
                .then(function (response) {
                    session.send("Welcome to Wavelabs! You have been Successfully Registered \n\n Here are your login details \n\n username:" + obj.username + "\n\n Password:" + obj.password + "\n\n login at http://timesheet.wavelabs.in You can change your password under my account tab");
                    session.endDialog();
                })
                .catch(function (err) {
                    session.send(err);
                    session.endDialog();
                });
        } else {
            session.send("This is not a valid email id try again by giving the command email");
            session.endDialog();
        }
    } else {
        session.send("Thank you!!");
        session.endDialog();
    }
}]);

bot.dialog('/migrateAccount', [function (session) {
    userService.getUserbyName(session.message.address.user.name)
        .then(function (user) {
            session.userData.wl = user;
            builder.Prompts.choice(session, "Please confirm your Email address -- " + user.username, "yes|no", { listStyle: builder.ListStyle.button });
        })
        .catch(function (err) {
            session.send(err);
            session.endDialog();
        });
}, function (session, results) {
    if (results.response) {
        if (results.response.entity == 'yes') {
            var addressObj = session.message.address;
            var obj = {
                "address": addressObj,
                "userId": addressObj.user.id
            }
            //obj.password = Math.random().toString(36).substring(7);
            userService.migrateAccount(session.userData.wl.username, obj)
                .then(function () {
                    session.send("Migrated Successfully, \n\n Have a good day");
                    session.endDialog();
                })
                .catch(function (err) {
                    session.send(err);
                    session.endDialog();
                });
        } else {
            session.send("Please contact admin team for the change of email address, \n\n Have a good day");
        }
    } else {
        session.send("Thank you!!");
        session.endDialog();
    }
}]);


var salesData = {
    "veg": {
        id: "123"
    },
    "non-veg": {
        id: "123"
    }
};
bot.dialog('/postSurvey', [function (session) {
    session.surveyId = "123";
    builder.Prompts.choice(session, "Food preference?", salesData, { listStyle: 3 });
}, function (session, results) {
    if (results.response) {
        console.log(results.response);
        var region = salesData[results.response.entity];
        console.log(region);
        session.endDialog();
    } else {
        session.send("Thank you!!");
        session.endDialog();
    }
}]);

// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));
app.use('/api/timesheet', require('./controllers/api/timesheet.controller'));
app.use('/api/projects', require('./controllers/api/projects.controller'));
app.use('/api/surveys', require('./controllers/api/surveys.controller'));
app.use('/api/appconfig', require('./controllers/api/appconfig.controller'));
app.use('/api/leaves', require('./controllers/api/leaves.controller'));
app.use('/api/skills', require('./controllers/api/skills.controller'));
app.use('/api/inventory', require('./controllers/api/inventory.controller'));
app.use('/api/chatbot', require('./controllers/api/chatbot.controller'));
app.use('/data', require('./controllers/api/fileData.controller'));
app.use('/api/reimbursement', require('./controllers/api/reimbursement.controller'));
app.use('/api/dailyTracker', require('./controllers/api/dailyTracker.controller'));
app.use('/api/jobOpening', require('./controllers/api/jobOpening.controller'));
app.use('/api/taxSaving', require('./controllers/api/taxSaving.controller'));

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});

// start server
var server = app.listen(3010, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});