'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSkillSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    skillName: {
        type: String,
        required: true
    },
    skillVersion: {
        type: String,
        required: false
    },
    skillLevel: {
        type: String,
        enum: ['Basic', 'Intermediate', 'Advanced', 'Expert'],
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('UserSkill', UserSkillSchema);