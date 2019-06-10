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
    creditedLeaves: {
        type: Number,
        default: 0
    },
    deductedLOP: {
        type: Number,
        default: 0
    },
    creditedLeavesComment: {
        type: String
    },
    deductedLOPComment: {
        type: String
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LeaveWallet', LeaveWalletSchema);