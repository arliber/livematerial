'use strict';

var express = require('express'),
	router = express.Router(),
	log = require('winston'),
	campaignController = require('./controllers/campaign.server.controller'),
	multer = require( 'multer' );

var upload   =  multer( { dest: 'uploads/' } );

//Home page
router.get('/', function(req, res, next) {
  log.info('GET request to /');
  res.redirect('public/index.html');
});

//API
router.post('/api/campaign', upload.any(), function(req, res) {
	return campaignController.saveCampaign(req, res);
});

router.get('/api/campaign/:userId', function(req, res) {
	return campaignController.getCampaigns(req, res);
});

router.patch('/api/campaign/:userId/:campaignId', function(req, res) {
	return campaignController.updateCampaign(req, res);
});

router.delete('/api/campaign/:userId/:campaignId', function(req, res) {
	return campaignController.deleteCampaign(req, res); //TODO
});

module.exports = router;
