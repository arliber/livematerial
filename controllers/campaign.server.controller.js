'use strict';

var campaignService = require('../services/campaign.server.service'),
    logger = require('winston');

module.exports.saveCampaign = function(req, res) {

    logger.info('Router: Saving campaign..');
    return campaignService.saveCampaign(req.body, req.files, function(err, result){
        if(err) {
            res.status(500).json(result);
        } else {
            res.status(200).json(result);
        }
    });

};

module.exports.getCampaigns = function(req, res) {

    logger.info('Router: Getting campaigns..');
    return campaignService.getCampaigns(req.params.userId, function(err, result){
        if(err) {
            res.status(500).json(result);
        } else {
            res.status(200).json(result);
        }
    });

};

module.exports.updateCampaign = function(req, res) {

    logger.info('Router: Updating campaign..');
    return campaignService.updateCampaign(req.params.userId, req.params.campaignId, req.body, function(err, result){
        if(err) {
            res.status(500).json(result);
        } else {
            res.status(200).json(result);
        }
    });

};

module.exports.deleteCampaign = function(req, res) {

    logger.info('Router: Deleting campaign..');
    return campaignService.deleteCampaign(req.params.userId, req.params.campaignId, function(err, result){
        if(err) {
            res.status(500).json(result);
        } else {
            res.status(200).json(result);
        }
    });

};

module.exports.updateProposition = function(req, res) {
    logger.info('Router: Updating booking..');
    return campaignService.updateProposition(req.params.propositionId, req.body.isBooked === true, function(err, result){
        if(err) {
            res.status(500).json(result);
        } else {
            res.status(200).json(result);
        }
    });
};
