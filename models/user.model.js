'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    address: {},
    admin: {
        type: Boolean,
        default: false,
        required: true
    },
    userId: String,
    name: String,
    firstName: String,
    lastName: String,
    skillCategory: String,
    username: String,
    hash: String,
    projects: {
        type: Array
    },
    designation: String,
    userResourceType: String,
    employeeId: String,
    profileImgUrl: String,
    userRole: String,
    reportingTo: String,
    employeeType: String,
    practice: String,
    joinDate: String,
    pushToken: String,
    isActive: Boolean,
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);