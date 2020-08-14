'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DailyTrackerSchema = new Schema({
    userId: {
        type: mongoose.ObjectId,
        required: true
    },
    trackerDate: { type: Date, default: null },
    taskCategoryId: { type: mongoose.ObjectId, required: true },
    taskShortName: { type: String },
    taskDescription: { type: String },
    taskStartTime: { type: Date, default: null },
    taskEndTime: { type: Date, default: null },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('dailyTracker', DailyTrackerSchema);