'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReimbursementSchema = new Schema({
    userId: {
        type: mongoose.ObjectId,
        required: true
    },
    projectId: {
        type: mongoose.ObjectId
    },
    totalCost: {
        type: Number,
        default: 0.00
    },
    status: { type: String, default: 'Draft' },
    purpose: { type: String },
    createdBy: { type: mongoose.ObjectId },
    createdOn: { type: Date, default: Date.now },
    items: [{
        billDate: { type: Date, default: null },
        billCategory: { type: String },
        billDescription: { type: String },
        billAmount: { type: Number },
        createdOn: { type: Date, default: Date.now },
        updatedOn: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('reimbursement', ReimbursementSchema);