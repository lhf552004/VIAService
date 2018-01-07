/**
 * Created by pi on 8/10/16.
 */
var DEBUG, PusherClient, child_process, dotenv, easypost, fs, pres, pusher_client, request;

dotenv = require('dotenv');

dotenv.load();

PusherClient = require('pusher-node-client').PusherClient;

easypost = require('node-easypost')(process.env.EASYPOST_SECRET_KEY);

child_process = require('child_process');

fs = require('fs');

request = require('request');

DEBUG = process.argv[2] === 'debug';

if (DEBUG) {
    console.log("Running in debug mode");
}

pusher_client = new PusherClient({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET
});

pres = null;

pusher_client.on('connect', function() {
    pres = pusher_client.subscribe("shipments");
    return pres.on('new', function(data) {
        console.log("shipment " + data.easypost_shipment_id + " with tracking number " + data.tracking_code);
        return easypost.Shipment.retrieve(data.easypost_shipment_id, function(err, shipment) {
            if (err) {
                console.log("ERROR: " + err);
            }
            return shipment.label({
                file_format: 'zpl'
            }, function(err, shipment) {
                var lpr;
                if (err) {
                    console.log("ERROR: " + err);
                }
                if (DEBUG) {
                    console.log("Fetching " + shipment.postage_label.label_zpl_url);
                }
                if (DEBUG) {
                    lpr = child_process.spawn("bash", ['-c', "cat > " + data.easypost_shipment_id]);
                } else {
                    lpr = child_process.spawn("lpr", ['-P', process.env.ZEBRA_PRINT_QUEUE_NAME, '-o', 'raw']);
                }
                request(shipment.postage_label.label_zpl_url, function(error, response, body) {
                    if (error) {
                        return console.log(error);
                    }
                }).pipe(lpr.stdin);
                return lpr.on('close', function(code) {
                    if (DEBUG) {
                        return console.log("Child process exit with code " + code);
                    }
                });
            });
        });
    });
});

pusher_client.connect();