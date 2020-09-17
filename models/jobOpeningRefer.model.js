'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var JobOpeningReferSchema = new Schema({
    jobId: {
        type: mongoose.ObjectId,
        default: null
    },
    jobTitle: {
        type: String
    },
    description: {
        type: String
    },
    resume: {
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

module.exports = mongoose.model('JobOpeningRefer', JobOpeningReferSchema);