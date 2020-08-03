var config = require('config.json');
var express = require('express');
var router = express.Router();
const path = require('path');

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./data/image.png"));
});

module.exports = router;
