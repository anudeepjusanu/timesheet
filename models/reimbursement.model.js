'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReimbursementSchema = new Schema({
    userId: {
        type: mongoose.ObjectId,
        required: true
    },
    approveUserId: { type: mongoose.ObjectId },
    projectId: { type: mongoose.ObjectId },
    reimbursementMonth: { type: String },
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
    comment: { type: String },
    history: [{
        actionName: { type: String },
        comment: { type: String },
        updatedBy: { type: mongoose.ObjectId },
        updatedOn: { type: Date, default: Date.now }
    }],
    createdBy: { type: mongoose.ObjectId },
    createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('reimbursement', ReimbursementSchema);