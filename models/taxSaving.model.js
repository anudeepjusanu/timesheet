'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaxSavingSchema = new Schema({
    userId: {
        type: mongoose.ObjectId,
        required: true
    },
    employeeId: { type: String },
    financialYear: { type: String },
    status: { type: String },
    receipts: [{
        category: { type: String },
        file: { type: String },
        amount: { type: Number, default: 0.00 },
        createdOn: { type: Date, default: Date.now }
    }],
    totalAmount: {
        type: Number,
        default: 0.00
    },
    comment: { type: String },
    createdBy: { type: mongoose.ObjectId },
    createdOn: { type: Date, default: Date.now }
},{ strict: false });

module.exports = mongoose.model('taxSavings', TaxSavingSchema);