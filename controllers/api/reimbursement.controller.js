var config = require('config.json');
var express = require('express');
var router = express.Router();
const path = require('path');
const ReimbursementService = require('../../services/reimbursement.service');
var multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/data/reimbursements/');
    },

    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
var upload = multer({
    storage: storage
});

// routes
router.get('/teamReimbursements', getTeamReimbursements);
router.get('/accountReimbursements', getAccountReimbursements);
router.get('/approveUsersList', getApproveUsersList);
router.get('/activeProjectsList', getActiveProjectsList);

router.get('/myReceipts/', getMyReceipts);
router.get('/receipt/:receiptId', getReimbursementReceipt);
router.post('/receipt', upload.single('file'), addReimbursementReceipt);
router.put('/receipt/:receiptId', upload.single('file'), updateReimbursementReceipt);
router.put('/approveReimbursementReceipt/:receiptId', approveReimbursementReceipt);
router.put('/rejectReimbursementReceipt/:receiptId', rejectReimbursementReceipt);
router.delete('/receipt/:receiptId', deleteReimbursementReceipt);
router.post('/receiptFile/:_id', upload.single('file'), updateReimbursementReceiptFile);

router.put('/approveReimbursement/:_id', approveReimbursement);
router.put('/rejectReimbursement/:_id', rejectReimbursement);
router.put('/payReimbursement/:_id', payReimbursement);
router.put('/paymentRejectedReimbursement/:_id', payReimbursement);

router.get('/', getMyReimbursements);
router.get('/:_id', getReimbursement);
router.post('/', upload.array('files'), addReimbursement);
router.put('/:_id', upload.array('files'), updateReimbursement);
router.delete('/:_id', deleteReimbursement);

module.exports = router;

/** Reimbursement */
function getMyReimbursements(req, res) {
    ReimbursementService.getMyReimbursements(req.user.sub).then(data => {
        res.send({ reimbursements: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function getTeamReimbursements(req, res) {
    ReimbursementService.getTeamReimbursements(req.user.sub).then(data => {
        res.send({ reimbursements: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function getAccountReimbursements(req, res) {
    ReimbursementService.getAccountReimbursements(req.user.sub).then(data => {
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

function approveReimbursement(req, res) {
    var dataObj = {
        status: "Approved"
    }
    ReimbursementService.updateReimbursement(req.params._id, dataObj).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function rejectReimbursement(req, res) {
    var dataObj = {
        status: "Rejected"
    }
    ReimbursementService.updateReimbursement(req.params._id, dataObj).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function payReimbursement(req, res) {
    var dataObj = {
        status: "Paid",
        paymentMode: req.body.paymentMode ? req.body.paymentMode : null
    }
    ReimbursementService.updateReimbursement(req.params._id, dataObj).then(data => {
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

// Receipts
function getMyReceipts(req, res) {
    ReimbursementService.getMyReceipts(req.user.sub).then(data => {
        res.send({ receipts: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function getReimbursementReceipt(req, res) {
    ReimbursementService.getReimbursementReceipt(req.params.receiptId).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function addReimbursementReceipt(req, res) {
    req.body.userId = req.user.sub;
    if (req.file && req.file.filename) {
        req.body.receiptFile = req.file.filename;
    }
    ReimbursementService.addReimbursementReceipt(req.body).then(data => {
        res.send({ receipt: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateReimbursementReceipt(req, res) {
    if (req.file && req.file.filename) {
        req.body.receiptFile = req.file.filename;
    }
    ReimbursementService.updateReimbursementReceipt(req.params.receiptId, req.body).then(data => {
        res.send({ receipt: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function approveReimbursementReceipt(req, res) {
    var objData = {
        status: "Approved"
    }
    ReimbursementService.updateReimbursementReceiptStatus(req.params.receiptId, objData).then(data => {
        res.send({ receipt: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function rejectReimbursementReceipt(req, res) {
    var objData = {
        status: "Rejected"
    }
    ReimbursementService.updateReimbursementReceiptStatus(req.params.receiptId, objData).then(data => {
        res.send({ receipt: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function deleteReimbursementReceipt(req, res) {
    ReimbursementService.deleteReimbursementReceipt(req.params.receiptId).then(data => {
        res.send({ receipt: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateReimbursementReceiptFile(req, res) {
    ReimbursementService.updateReimbursementReceiptFile(req.params._id, req.file).then(data => {
        res.send({ receipt: data });
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

function getActiveProjectsList(req, res) {
    ReimbursementService.getActiveProjectsList().then(data => {
        res.send({ projects: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}