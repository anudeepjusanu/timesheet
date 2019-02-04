var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rohinikumard@wavelabs.in',
        pass: 'kyenxwjbygkosjkd'
    }
});

let registrationEmail = async function (userParam) {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: 'Admin, <admin@wavelabs.in>', // sender address
            to: 'keystroke99@gmail.com', // list of receivers
            subject: 'TEST MESSAGE - PLS IGONRE - New user registered - TIMESHEET', // Subject line
            html: '<p>Hi!!</p>\n<p>New User registered with Timesheet. It\'s time to allocate a project. <br> <b>User details:</b>\n <br> Name:' +
            userParam.name + '\n <br> Email: ' + userParam.username
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err)
                console.log(err)
            else
                console.log(info);
        });
    })
}
module.exports.registrationEmail = registrationEmail;