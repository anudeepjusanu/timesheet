var config = require('config.json');
var express = require('express');
var router = express.Router();
const InventoryService = require('../../services/inventory.service');

// routes
router.get('/inventories', getInventories);
router.get('/inventory/:_id', getInventory);
router.post('/inventory/', addInventory);
router.put('/inventory/:_id', updateInventory);
router.delete('/inventory/:_id', delInventory);
router.put('/assignUser/:_id', assignUser);
router.put('/changeStatus/:_id', changeStatus);

module.exports = router;

/** Inventory */
function getInventories(req, res) {
    InventoryService.getInventories().then(data => {
        res.send({ inventories: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function getInventory(req, res) {
    InventoryService.getInventory(req.query._id).then(data => {
        res.send({ inventory: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function addInventory(req, res) {
    InventoryService.addInventory(req.body).then(data => {
        res.send({ inventory: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function updateInventory(req, res) {
    InventoryService.updateInventory(req.body._id, req.body).then(data => {
        res.send({ inventory: data, req: req.query });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function delInventory(req, res) {
    InventoryService.delInventory(req.params._id,).then(data => {
        res.send({ inventory: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function assignUser(req, res) {
    InventoryService.assignUser(req.params._id, req.body).then(data => {
        res.send({ inventory: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}

function changeStatus(req, res) {
    InventoryService.changeStatus(req.params._id, req.body).then(data => {
        res.send({ inventory: data });
    }).catch(error => {
        res.status(400).send(error);
    });
}
