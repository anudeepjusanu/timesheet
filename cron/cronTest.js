var builder = require('botbuilder');
var connector = new builder.ChatConnector({
    appId: "c8fc3ad9-72cb-46ff-b5f1-09432ed9b7db",
    appPassword: "Y1A0xm40NNkm1XpR0MNV3sz"
});
var bot = new builder.UniversalBot(connector);
var _ = require('lodash');

var myTestAddress = {
    "useAuth" : true,
    "serviceUrl" : "https://smba.trafficmanager.net/apis/",
    "bot" : {
        "name" : "Wavelabs Bot",
        "id" : "28:c8fc3ad9-72cb-46ff-b5f1-09432ed9b7db"
    },
    "conversation" : {
        "id" : "29:1rJ0cAsaQqgabXbAZXEGeHNKhWV4fWT9NWOsHZVIYGhc"
    },
    "user" : {
        "name" : "Lal Bahadur Sastry Chintaluri",
        "id" : "29:1rJ0cAsaQqgabXbAZXEGeHNKhWV4fWT9NWOsHZVIYGhc"
    },
    "channelId" : "skype",
    "id" : "1487824461927"
};
var now = new Date();
var message = "Now : "+now.toLocaleDateString(now.getTimezoneOffset());
console.log(message);
/*var msg = new builder.Message().address(myTestAddress).text(message);
    bot.send(msg, function(res) {
        // Return success/failure
    });*/
