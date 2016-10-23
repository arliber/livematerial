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

module.exports = router;
