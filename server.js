require('rootpath')();
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
var builder = require('botbuilder');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));
app.use(express.static(__dirname + '/public'));


var connector = new builder.ChatConnector({
    appId: "03d79ab1-9dce-411e-8a3c-80244fad94ac",
    appPassword: "jdvF9Byk9xOL8EvqextZuxb"
});
var bot = new builder.UniversalBot(connector);

// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register', '/api/messages'] }));

app.post('/api/messages', connector.listen());

bot.on('contactRelationUpdate', function(message) {
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

bot.on('typing', function(message) {
    // User is typing
});

bot.on('deleteUserData', function(message) {
    // User asked to delete their data
});

bot.dialog('/', function(session) {
	session.sendTyping();
	if(session.message.text.toLowerCase().indexOf('hello') == 0){
		session.send(`Hey, How are you? Here's some random trivia. \n\n`);
	}
});

// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));

// make '/app' default route
app.get('/', function(req, res) {
    return res.redirect('/app');
});

// start server
var server = app.listen(3000, function() {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});