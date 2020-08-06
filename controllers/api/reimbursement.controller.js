var config = require('config.json');
var express = require('express');
var router = express.Router();
const path = require('path');
const ReimbursementService = require('../../services/reimbursement.service');
var multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'data/reimbursements/');
    },

    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
var upload = multer({
    storage: storage
});

// routes
router.get('/approveUsersList', getApproveUsersList);

router.get('/', getMyReimbursements);
router.get('/:_id', getReimbursement);
router.post('/', upload.array('files'), addReimbursement);
router.put('/:_id', upload.array('files'), updateReimbursement);
router.delete('/:_id', deleteReimbursement);

router.get('/item/:itemId', getReimbursementItem);
router.post('/item/:_id', upload.single('file'), addReimbursementItem);
router.put('/item/:itemId', upload.single('file'), updateReimbursementItem);
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
    if (req.file && req.file.filename) {
        req.body.billFile = req.file.filename;
    }
    ReimbursementService.addReimbursementItem(req.params._id, req.body).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateReimbursementItem(req, res) {
    if (req.file && req.file.filename) {
        req.body.billFile = req.file.filename;
    }
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
    ReimbursementService.updateReimbursementItemFile(req.params._id, req.file).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function getApproveUsersList(req, res) {
    ReimbursementService.getApproveUsersList().then(data => {
        res.send({ users: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}