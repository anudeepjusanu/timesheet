'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProjectsSchema = new Schema({
    projectName: { type: String },
    projectType: { type: String },
    clientId: { type: String },
    clientName: { type: String },

    ownerId: { type: String },
    ownerName: { type: String },
    
    businessUnit: { type: String },
    estimatedCost: { type: String },
    estimatedHours: { type: String },
    projectBillType: { type: String },
    startDate: { type: String },
    visibility: { type: String },

    description: { type: String },
    isActive: { type: Boolean },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('projects', ProjectsSchema);