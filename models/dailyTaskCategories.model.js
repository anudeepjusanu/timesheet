'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DailyTaskCategorySchema = new Schema({
    taskCategoryShortName: {
        type: String,
        required: true,
        unique: true
    },
    taskCategoryName: {
        type: String,
        required: true,
        unique: true
    },
    taskColorCode: {
        type: String,
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DailyTaskCategory', DailyTaskCategorySchema);