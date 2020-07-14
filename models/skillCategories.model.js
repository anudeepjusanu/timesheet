'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SkillCategorySchema = new Schema({
    skillCategoryName: {
        type: String,
        required: true,
        unique: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SkillCategory', SkillCategorySchema);