'use strict';

var databaseService = require('./database.server.service'),
	logger = require('winston');

function isValidCampaignData(fields, files) {
	return true; //TODO: Implement validation
}

function createCampaignObject(fields, files) {
	var campaignObject = {
		title: fields.title,
		description: fields.description,
		userName: fields.name,
		userEmail: fields.email,
		createArticles: fields.createArticles
	};

	if(Array.isArray(fields.categories)) {
		campaignObject.categories = fields.categories;
	} else {
		campaignObject.categories = [fields.categories];
	}

	if(Array.isArray(fields.languages)) {
		campaignObject.languages = fields.languages;
	} else {
		campaignObject.languages = [fields.languages];
	}


	//Process files

	return campaignObject;
}

module.exports.saveCampaign = function(fields, files, callback) {

	var campaignsCollection = global.db.collection('campaigns');

	if(isValidCampaignData(fields, files)) {

		var campaignObject = createCampaignObject(fields, files);

		campaignsCollection.insert(campaignObject, function(err, result) {
			logger.info('Campaign service: new campaign saved');
			callback(null, result);
		});

	}
};