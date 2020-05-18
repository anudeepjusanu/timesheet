require('rootpath')();
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
var builder = require('botbuilder');
var userService = require('services/user.service');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));
app.use(express.static(__dirname + '/public'));


var mstemasConnector = new builder.ChatConnector({
    appId: "c8fc3ad9-72cb-46ff-b5f1-09432ed9b7db",
    appPassword: "8-ac-D7Y3~w-dN5dI8t0YlFL9fST_~.0au"
});
var msbot = new builder.UniversalBot(mstemasConnector);

// use JWT auth to secure the api
//app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register', '/api/messages', , '/msteams'] }));

app.post('/msteams', mstemasConnector.listen());
app.get('/msteams', function(req, res) {
    var users = {
        "name": "L B Sastry"
    }
    res.json(users);
});

msbot.on('contactRelationUpdate', function(message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
            .address(message.address)
            .text("Hello %s... Thanks for adding me. Say 'hello' to see some great demos.", name || 'there');
            msbot.send(reply);
    } else {
        // delete their data
    }
});

msbot.on('typing', function(message) {
    // User is typing
});


// routes
// app.use('/login', require('./controllers/login.controller'));
// app.use('/register', require('./controllers/register.controller'));
// app.use('/app', require('./controllers/app.controller'));
// app.use('/api/users', require('./controllers/api/users.controller'));
// app.use('/api/timesheet', require('./controllers/api/timesheet.controller'));
// app.use('/api/projects', require('./controllers/api/projects.controller'));
// app.use('/api/surveys', require('./controllers/api/surveys.controller'));
// app.use('/api/appconfig', require('./controllers/api/appconfig.controller'));
// app.use('/api/leaves', require('./controllers/api/leaves.controller'));

// make '/app' default route
app.get('/', function(req, res) {
    return res.redirect('/app');
});

// start server
var server = app.listen(3022, function() {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});