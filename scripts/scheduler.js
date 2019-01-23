var config = require('config.json');
var cron = require('node-cron');
var userService = require('services/user.service');
var timesheetService = require('services/timesheet.service');
var moment = require('moment');
var builder = require('botbuilder');
var connector = new builder.ChatConnector({
    appId: config.botId,
    appPassword: config.botPassword
});
var bot = new builder.UniversalBot(connector);
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('timesheets');


// Run a service on every 5th day of the week (Friday)
var task = cron.schedule('00 11 * * 5', async () => {
    let allActiveUsers = await userService.getUsers();
    if (allActiveUsers.length > 0) {
        let monday = moment().day('Monday').format('MMM Do')
        let friday = moment().day('Friday').format('MMM Do')
        allActiveUsers.forEach(async (user) => {
            let currentWeekWithYear = moment().format('YYYY[-W]ww');
            // check wether timesheet exists
            let checkTimesheet = await timesheetService.checkUserFilledTimesheet(currentWeekWithYear, user._id);
            if (checkTimesheet.success == true) {
                // No Message will be sent as the user already filled the timesheet
            } else {
                var msg = new builder.Message()
                    .address(user.address)
                    .text("Hi " + user.name + ". " + "please update your weekly hours for the week " + monday + " - " + friday + " at http://timesheet.wavelabs.in");
                bot.send(msg, function (err) {
                    // Return success/failure
                    // If logging requires, we can use this area
                });
            }
        });
    }
});

// Run a service on every 6th day of the week (Saturday)
var finalReminders = cron.schedule('00 09 * * 6', async () => {
    let allActiveUsers = await userService.getUsers();
    if (allActiveUsers.length > 0) {
        let monday = moment().day('Monday').format('MMM Do')
        let friday = moment().day('Friday').format('MMM Do')
        allActiveUsers.forEach(async (user) => {
            let currentWeekWithYear = moment().format('YYYY[-W]ww');
            // check wether timesheet exists
            let checkTimesheet = await timesheetService.checkUserFilledTimesheet(currentWeekWithYear, user._id);
            if (checkTimesheet.success == true) {
                // No Message will be sent as the user already filled the timesheet
            } else {
                var msg = new builder.Message()
                    .address(user.address)
                    .text("Hi " + user.name + ". " + "please update your weekly hours for the week " + monday + " - " + friday + " at http://timesheet.wavelabs.in");
                bot.send(msg, function (err) {
                    //.text("FINAL REMINDER: " + "\n" +"Hi " + user.name + ". " + "please update your weekly hours for the week " + monday + " - " + friday + " at http://timesheet.wavelabs.in");
                    // Return success/failure
                    // If logging requires, we can use this area
                });
            }
        });
    }
});


module.exports = {
    task: task,
    finalReminders: finalReminders
};