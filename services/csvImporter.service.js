'use strict';

let ObjectID = require('mongodb').ObjectID;
let csv = require('csvtojson');
let config = require('../config');
let databaseService = require('./database.server.service');

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function start() {
    validateInput((csvFilePath, campaignId) => {
        processCSV(csvFilePath, (err, propositions) => {
            if(err) {
                console.error('Error in reading from CSV', err)
            } else if(propositions.length > 0){
                savePropositions(campaignId, propositions)
            } else {
                console.error('No propositions generated');
            }
        });
    });
}

function validateInput(callback) {

    if(!process.argv[2] || process.argv[2] === '') {
        console.error('No CSV file path was supplied');
    } else if(!process.argv[3] || process.argv[3] === '') {
        console.error('No campaign id was supplied');
    } else {
        return callback(process.argv[2], process.argv[3]);
    }
}

function savePropositions(campaignId, propositions) {

        var campaignsCollection = global.db.collection('campaigns');
        var propositionQuery = {'campaigns._id': ObjectID(campaignId)};

        //Update
        var propositionsUpdateQuery = {
            $set: {
                'campaigns.$.propositions': propositions
            }
        };

        campaignsCollection.updateOne(propositionQuery, propositionsUpdateQuery, function (err, result) {
            if (err) {
                console.error('Error in setting propositions on [' + campaignId + ']', err);
                callback(err);
            } else {
               console.log(`[${propositions.length}] propositions where added to campaign [${campaignId}]`)
            }
        });
}

function processCSV(csvFilePath, callback) {
    let propositions = [];

    csv()
        .fromFile(csvFilePath)
        .on('json',(jsonObj)=>{
            let titleMatch = jsonObj.Domain.match(/(https?:\/\/)?(www\.)?(.*\.)?(.*)(\..*)?\.(com|net|org|info|coop|int|co\.uk|org\.uk|ac\.uk|uk).*$/);
            let title = (titleMatch && titleMatch[4]) ? titleMatch[4] : jsonObj.Price;
            propositions.push({
                '_id' : new ObjectID(),
                'title' :  capitalizeFirstLetter(title),
                'url' : jsonObj.Domain,
                'traffic' : jsonObj.Traffic,
                "price" : '$' + jsonObj.Price.replace(',', '').match(/\d+/)[0],
                "isBooked" : false
            })
        })
        .on('done',(err)=>{
            callback(err, propositions);
        });
}

databaseService.init(config.connectionString, function(err) {
    if(err) {
        console.error('App: aborting due to database connection failure');
    } else {
        console.log(`Connected to [${config.connectionString}]`);
        start();
    }
});