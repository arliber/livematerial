'use strict';

var express = require('express'),
	router = express.Router(),
	log = require('winston'),
	campaignController = require('./controllers/campaign.server.controller'),
    mainController = require('./controllers/main.server.controller'),
    aws = require('aws-sdk'),
    path = require('path'),
	multer = require( 'multer' ),
    multerS3 = require('multer-s3');

//Setup amazon file upload
var upload = multer({
    storage: multerS3({
        s3: new aws.S3(),
        bucket: 'livematerial',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            //cb(null, Date.now().toString());
            cb(null, Date.now().toString() + path.extname(file.originalname)); //Append file extension
        }
    })
});
//var upload = multer( { dest: 'uploads/' } );

//Home page
router.get('/campaign/:campaignId', function(req, res, next) {
  log.info('GET request to /');
  res.sendFile(path.join(__dirname+'/public/campaignManager.html'));
});

//Client area
router.get('/client', function(req, res, next) {
	log.info('GET request to /client');
	res.sendFile('public/client.html');
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

router.post('/api/contact', function(req, res) {
    return mainController.sendContactForm(req, res);
});

router.patch('/api/proposition/:propositionId', function(req, res) {
    return campaignController.updateProposition(req, res);
});

module.exports = router;
