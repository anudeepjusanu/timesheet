var config = require('../config.json');
const fs = require('fs');
const csv = require('csv-parser');
var _ = require('lodash');
var mongoose = require("mongoose");
var InventoryModel = require("../models/inventory.model");
var UserModel = require("../models/user.model");
mongoose.connect(config.connectionString);

var devices = [];

fs.createReadStream('./wavelabs_hardware.csv').pipe(csv()).on('data', (row) => {
    devices.push(row);
}).on('end', () => {
    console.log('CSV file successfully processed');

    _.each(devices, function (deviceObj) {
        console.log(deviceObj);
        var devicedata = {
            deviceId: deviceObj.deviceId,
            deviceType: deviceObj.deviceType,
            deviceName: "",
            location: deviceObj.location,
            hostname: deviceObj.hostname,
            client: deviceObj.client,
            currentStatus: deviceObj.isAvailable,
            deviceBrand: deviceObj.brand,
            deviceModel: deviceObj.model,
            deviceSerial: deviceObj.serial,
            deviceOS: deviceObj.os,
            deviceCPU: deviceObj.cpu,
            deviceRAM: deviceObj.memory,
            purchaseDate: deviceObj.purhaseDate
        };

        InventoryModel.findOne({ deviceId: deviceObj.deviceId }).exec().then((response) => {
            if (response === null) {
                var inventoryObj = new InventoryModel(devicedata);
                inventoryObj.save(function (err, inventory) {
                    //if (err) console.log(err);
                    //console.log("New :", inventory);
                });
            } else {
                InventoryModel.updateOne({ deviceId: deviceObj.deviceId }, devicedata).exec().then((data) => {

                }).catch((error) => {

                });
            }

        }).catch((error) => {
            console.log(error);
        });
    });
});
