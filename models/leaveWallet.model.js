'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LeaveWalletSchema = new Schema({
    userId: {
        type: Object,
        required: true
    },
    yearMonth: {
        type: String,
        required: true
    },
    yearMonthNumber: {
        type: Number,
        required: true
    },
    accruedLeaves: {
        type: Number,
        default: 0
    },
    earnedLevaes: {
        type: Number,
        default: 0
    },
    deductedLOP: {
        type: Number,
        default: 0
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LeaveWallet', LeaveWalletSchema);