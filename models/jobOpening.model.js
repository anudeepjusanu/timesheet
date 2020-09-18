'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var JobOpeningSchema = new Schema({
    jobCode: {
        type: String
    },
    jobTitle: {
        type: String,
        required: true
    },
    jobExperience: {
        type: String,
        required: true
    },
    jobPositions: {
        type: Number,
        default: 1,
        required: true
    },
    jobDescription: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('JobOpening', JobOpeningSchema);