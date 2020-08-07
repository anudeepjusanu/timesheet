'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReimbursementSchema = new Schema({
    userId: {
        type: mongoose.ObjectId,
        required: true
    },
    approveUserId: {
        type: mongoose.ObjectId
    },
    department: { type: String },
    reimbursementFrom: { type: String },
    reimbursementTo: { type: String },
    purpose: { type: String },
    status: { type: String, default: 'Draft' },
    receipts: [{
        type: mongoose.ObjectId,
        required: true
    }],
    totalAmount: {
        type: Number,
        default: 0.00
    },
    createdBy: { type: mongoose.ObjectId },
    createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('reimbursement', ReimbursementSchema);