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
    totalAmount: {
        type: Number,
        default: () => {
            var totalAmount = 0;
            if (this.items && this.items.length > 0) {
                for (var i = 0; i < this.items.length; i++) {
                    totalAmount += parseFloat(this.items[i].billAmount);
                }
            }
            return parseFloat(totalAmount).toFixed(2);
        }
    },
    createdBy: { type: mongoose.ObjectId },
    createdOn: { type: Date, default: Date.now },
    items: [{
        billDate: { type: Date, default: null },
        billCategory: { type: String },
        billDescription: { type: String },
        billFile: { type: String },
        billAmount: { type: Number },
        createdOn: { type: Date, default: Date.now },
        updatedOn: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('reimbursement', ReimbursementSchema);