'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MetaSkillsSchema = new Schema({
    skillName: {
        type: String,
        required: true,
        unique: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MetaSkills', MetaSkillsSchema);