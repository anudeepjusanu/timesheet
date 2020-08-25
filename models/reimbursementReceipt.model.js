'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReimbursementReceiptSchema = new Schema({
    userId: {
        type: mongoose.ObjectId,
        required: true
    },
    receiptDate: { type: Date, default: null },
    receiptCategory: { type: String },
    receiptDescription: { type: String },
    receiptFile: { type: String },
    receiptAmount: { type: Number },
    approvedAmount: { type: Number },
    status: { type: String, default: 'New' },
    reimbursementId: { type: String, default: null },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('reimbursementReceipt', ReimbursementReceiptSchema);