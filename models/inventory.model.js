'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InventrySchema = new Schema({
    deviceId: {
        type: String,
        unique: true
    },
    deviceType: { type: String },
    deviceName: { type: String },

    location: { type: String },
    hostname: { type: String },
    client: { type: String },
    userId: {
        type: mongoose.ObjectId,
        default: null
    },

    deviceStatus: { type: String, default: 'Available' },
    deviceBrand: { type: String },
    deviceModel: { type: String },
    deviceSerial: { type: String },
    deviceOS: { type: String },
    deviceCPU: { type: String },
    deviceRAM: { type: String },
    purchaseDate: { type: String },

    description: { type: String },
    isActive: { type: Boolean, default: true },
    latestComment: { type: String },
    createdBy: { type: mongoose.ObjectId },
    createdOn: { type: Date, default: Date.now },
    history: [{
        inventoryAction: String,
        prevValue: String,
        newValue: String,
        affectedDate: { type: Date, default: Date.now },
        comment: String,
        updatedBy: { type: mongoose.ObjectId },
        updatedOn: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('inventry', InventrySchema);