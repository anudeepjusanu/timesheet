﻿var config = require('config.json');
var express = require('express');
var router = express.Router();
const metaSkills = require('../../services/metaSkills.service');
const skillCategories = require('../../services/skillCategories.service');
const userSkill = require('../../services/userSkills.service');

// routes
router.get('/allUserSkills', getAllUserSkills);
router.post('/userSkill', addUserSkill);
router.put('/userSkill/:_id', updateUserSkill);
router.delete('/userSkill/:_id', deleteUserSkill);

router.get('/metaSkills', getMetaSkills);
router.get('/metaSkill/:_id', getMetaSkill);
router.post('/metaSkill', addMetaSkill);
router.put('/metaSkill/:_id', updateMetaSkill);
router.delete('/metaSkill/:_id', delMetaSkill);

router.get('/skillCategories', getSkillCategories);
router.get('/skillCategory/:_id', getSkillCategory);
router.post('/skillCategory', addSkillCategory);
router.put('/skillCategory/:_id', updateSkillCategory);
router.delete('/skillCategory/:_id', delSkillCategory);

module.exports = router;

function getAllUserSkills(req, res) {
    userSkill.getAllUserSkills().then(data => {
        res.send({ users: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function addUserSkill(req, res) {
    userSkill.addUserSkill(req.body).then(data => {
        res.send({ userSkill: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateUserSkill(req, res) {
    userSkill.updateUserSkill(req.params._id, req.body).then(data => {
        res.send({ userSkill: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function deleteUserSkill(req, res) {
    userSkill.deleteUserSkill(req.params._id).then(data => {
        res.send({});
    }).catch(error => {
        res.status(400).send(error);
    });
}

/** Meta Skills */
function getMetaSkills(req, res) {
    metaSkills.getMetaSkills().then(data => {
        res.send({ metaSkills: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function getMetaSkill(req, res) {
    metaSkills.getMetaSkill(req.query._id).then(data => {
        res.send({ metaSkill: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function addMetaSkill(req, res) {
    metaSkills.addMetaSkill({ skillName: req.body.skillName }).then(data => {
        res.send({ metaSkill: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateMetaSkill(req, res) {
    metaSkills.updateMetaSkill(req.body._id, { skillName: req.body.skillName }).then(data => {
        res.send({ metaSkill: data, req: req.query });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function delMetaSkill(req, res) {
    metaSkills.delMetaSkill(req.params._id,).then(data => {
        res.send({ metaSkill: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

/** Skill Category */
function getSkillCategories(req, res) {
    skillCategories.getSkillCategories().then(data => {
        res.send({ skillCategories: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function getSkillCategory(req, res) {
    skillCategories.getSkillCategory(req.query._id).then(data => {
        res.send({ skillCategory: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function addSkillCategory(req, res) {
    skillCategories.addSkillCategory({ skillCategoryName: req.body.skillCategoryName }).then(data => {
        res.send({ skillCategory: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateSkillCategory(req, res) {
    skillCategories.updateSkillCategory(req.body._id, { skillCategoryName: req.body.skillCategoryName }).then(data => {
        res.send({ skillCategory: data, req: req.query });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function delSkillCategory(req, res) {
    skillCategories.delSkillCategory(req.params._id,).then(data => {
        res.send({ skillCategory: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}
