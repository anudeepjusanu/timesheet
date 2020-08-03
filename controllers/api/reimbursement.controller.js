var config = require('config.json');
var express = require('express');
var router = express.Router();
const ReimbursementService = require('../../services/reimbursement.service');
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })

// routes
router.get('/', getMyReimbursements);
router.get('/:_id', getReimbursement);
router.post('/', addReimbursement);
router.put('/:_id', updateReimbursement);
router.delete('/:_id', deleteReimbursement);

router.get('/item/:itemId', getReimbursementItem);
router.post('/item/:_id', addReimbursementItem);
router.put('/item/:itemId', updateReimbursementItem);
router.delete('/item/:itemId', deleteReimbursementItem);
router.post('/itemFile/:_id', upload.single('file'), updateReimbursementItemFile);

module.exports = router;

/** Reimbursement */
function getMyReimbursements(req, res) {
    ReimbursementService.getMyReimbursements(req.user.sub).then(data => {
        res.send({ reimbursements: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function getReimbursement(req, res) {
    ReimbursementService.getReimbursement(req.params._id).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function addReimbursement(req, res) {
    req.body.userId = req.user.sub;
    ReimbursementService.addReimbursement(req.body).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateReimbursement(req, res) {
    ReimbursementService.updateReimbursement(req.params._id, req.body).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function deleteReimbursement(req, res) {
    ReimbursementService.deleteReimbursement(req.params._id).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

// Items
function getReimbursementItem(req, res) {
    ReimbursementService.getReimbursementItem(req.params.itemId).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function addReimbursementItem(req, res) {
    ReimbursementService.addReimbursementItem(req.params._id, req.body).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateReimbursementItem(req, res) {
    ReimbursementService.updateReimbursementItem(req.params.itemId, req.body).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function deleteReimbursementItem(req, res) {
    ReimbursementService.deleteReimbursementItem(req.params.itemId).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateReimbursementItemFile(req, res) {
    console.log(req);
    res.send({ data: req.file });
    // ReimbursementService.updateReimbursementItemFile(req.params._id, req.body).then(data => {
    //     res.send({ reimbursement: data });
    // }).catch(error => {
    //     res.status(400).send(error);
    // });
}