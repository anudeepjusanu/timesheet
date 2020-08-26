'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReimbursementReceiptSchema = new Schema({
    userId: {
        type: mongoose.ObjectId,
        required: true
    },
    receiptDate: { type: Date, required: true },
    receiptCategory: { type: String, required: true },
    receiptNumber: { type: String, required: true },
    receiptFile: { type: String },
    receiptAmount: { type: Number },
    approvedAmount: { type: Number },
    status: { type: String, default: 'New' },
    receiptDescription: { type: String },
    reimbursementId: { type: String, default: null },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('reimbursementReceipt', ReimbursementReceiptSchema);