'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;

var TimesheetSchema = new Schema({
    userId: { type: ObjectId },
    week: { type: String },
    weekDate: { type: Date },
    userResourceType: { type: String },
    totalHours: { type: Number },
    totalBillableHours: { type: Number },
    timeoffHours: { type: Number },
    overtimeHours: { type: Number },
    projects: [{
        projectId: { type: ObjectId },
        projectName: { type: String },
        allocatedHours: { type: Number },
        billableMaxHours: { type: Number },
        projectHours: { type: Number },
        sickLeaveHours: { type: Number },
        timeoffHours: { type: Number },
        corpHolidayHours: { type: Number },
        overtimeHours: { type: Number },
        projectComment: { type: String },
        isAssigned: { type: Boolean },
        sheetStatus: { type: String },
        resourceStatus: { type: String },
        resourceType: { type: String },
        salesItemId: { type: String },
        billableHours: { type: Number },
        businessUnit: { type: String }
    }],
    reportingTo: { type: String },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now },
    timesheetStatus: { type: String }
});

module.exports = mongoose.model('timesheet', TimesheetSchema);