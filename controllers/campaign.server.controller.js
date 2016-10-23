'use strict';

var campaignService = require('../services/campaign.server.service');

module.exports.saveCampaign = function(req, res) {

    return campaignService.saveCampaign(req.body, req.files, function(err, result){
        if(err) {
            res.status(500).json(result);
        } else {
            res.status(200).json(result);
        }
    });

};

