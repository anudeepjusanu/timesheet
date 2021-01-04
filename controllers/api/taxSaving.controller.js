var config = require('config.json');
var express = require('express');
var router = express.Router();
const path = require('path');
const TaxSavingService = require('../../services/taxSaving.service');
var multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/data/taxsavings/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
var upload = multer({
    storage: storage
});

// routes
router.get('/', getMyTaxSavings);
router.get('/:_id', getTaxSaving);
router.post('/', addTaxSaving);
router.put('/:_id', updateTaxSaving);
router.delete('/:_id', deleteTaxSaving);

module.exports = router;

/** tax saving */
function getMyTaxSavings(req, res) {
    TaxSavingService.getMyTaxSavings(req.user.sub).then(data => {
        res.send({ reimbursements: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function getTaxSaving(req, res) {
    TaxSavingService.getTaxSaving(req.params._id).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function addTaxSaving(req, res) {
    req.body.userId = req.user.sub;
    TaxSavingService.addTaxSaving(req.body).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateTaxSaving(req, res) {
    TaxSavingService.updateTaxSaving(req.params._id, req.body, req.user.sub).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function deleteTaxSaving(req, res) {
    TaxSavingService.deleteTaxSaving(req.params._id).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function getAccountTaxSavings(req, res) {
    TaxSavingService.getAccountTaxSavings(req.user.sub).then(data => {
        res.send({ reimbursements: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function approveTaxSaving(req, res) {
    var dataObj = {
        status: "Approved",
        comment: req.body.comment,
        receipts: req.body.receipts
    }
    TaxSavingService.updateTaxSaving(req.params._id, dataObj, req.user.sub).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function rejectTaxSaving(req, res) {
    var dataObj = {
        status: "Rejected",
        comment: req.body.comment
    }
    TaxSavingService.updateTaxSaving(req.params._id, dataObj, req.user.sub).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

// Files
function getTaxSavingReceipt(req, res) {
    TaxSavingService.getTaxSavingReceipt(req.params.receiptId).then(data => {
        res.send({ reimbursement: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function addTaxSavingReceipt(req, res) {
    req.body.userId = req.user.sub;
    if (req.file && req.file.filename) {
        req.body.receiptFile = req.file.filename;
    }
    TaxSavingService.addTaxSavingReceipt(req.body).then(data => {
        res.send({ receipt: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateTaxSavingReceipt(req, res) {
    if (req.file && req.file.filename) {
        req.body.receiptFile = req.file.filename;
    }
    TaxSavingService.updateTaxSavingReceipt(req.params.receiptId, req.body).then(data => {
        res.send({ receipt: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function approveTaxSavingReceipt(req, res) {
    var objData = {
        status: "Approved"
    }
    TaxSavingService.updateTaxSavingReceiptStatus(req.params.receiptId, objData).then(data => {
        res.send({ receipt: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function rejectTaxSavingReceipt(req, res) {
    var objData = {
        status: "Rejected"
    }
    TaxSavingService.updateTaxSavingReceiptStatus(req.params.receiptId, objData).then(data => {
        res.send({ receipt: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function deleteTaxSavingReceipt(req, res) {
    TaxSavingService.deleteTaxSavingReceipt(req.params.receiptId).then(data => {
        res.send({ receipt: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateTaxSavingReceiptFile(req, res) {
    TaxSavingService.updateTaxSavingReceiptFile(req.params._id, req.file).then(data => {
        res.send({ receipt: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}