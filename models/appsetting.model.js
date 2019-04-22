'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AppSettingSchema = new Schema({
    keyName: {
        type: String,
        required: true,
        unique: true
    },
    keyVal: String,
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AppSetting', AppSettingSchema);