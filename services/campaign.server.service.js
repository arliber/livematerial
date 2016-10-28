'use strict';

var log = require('winston'),
	ObjectID = require('mongodb').ObjectID,
	emailService = require('../services/mail.server.service');

function isValidCampaignData(fields, files) {
	return []; //TODO: Implement validation
}

function createCampaignObject(fields, files) {
	var campaignObject = {
		_id: new ObjectID(),
		title: fields.title,
		description: fields.description,
		createArticles: fields.createArticles
	};

	//Process selects
	if(fields.categories && Array.isArray(fields.categories)) {
		campaignObject.categories = fields.categories;
	} else if(fields.categories) {
		campaignObject.categories = [fields.categories];
	} else {
		campaignObject.categories = [];
	}

	if(fields.languages && Array.isArray(fields.languages)) {
		campaignObject.languages = fields.languages;
	} else if(fields.languages) {
		campaignObject.languages = [fields.languages];
	} else {
		campaignObject.languages = [];
	}

	//Process files
	if(files.length > 0) {
		campaignObject.files = [];
	}
	files.forEach(function(file){
		campaignObject.files.push({
			filename: file.filename,
			mimetype: file.mimetype,
			originalName: file.originalname
		});
	});

	return campaignObject;
}

function saveNewUserWithCampaign(email, userName, campaignObject, callback) {

	var campaignsCollection = global.db.collection('campaigns');

	var newCampaignWithUser = {
		email: email,
		userName: userName,
		campaigns: [campaignObject]
	};

	campaignsCollection.insert(newCampaignWithUser, function(err, result) {
		if(err) {
			log.error('Campaign service: Error in saving new user with campaign', err);
			callback(err);
		} else {
			log.info('Campaign service: New campaign saved');
			callback(null, result.insertedIds[0]);
		}
	});
}

function addNewCampaignToUser(userId, campaignObject, callback) {

	var campaignsCollection = global.db.collection('campaigns');

	var query = {
		_id: new ObjectID(userId)
	};

	var update = {
		$push: {
			campaigns: campaignObject
		}
	};

	campaignsCollection.updateOne(query, update, function(err, result){
		if(err) {
			log.error('Campaign service: Unable to add new campaign for user ['+userId+']');
		} else {
			log.info('Campaign service: Added campaign to existing user ['+userId+']');
		}
		callback(err, result);
	});
}

module.exports.saveCampaign = function(fields, files, callback) {

	var campaignsCollection = global.db.collection('campaigns');
	var validationErrors = isValidCampaignData(fields, files);

	if(validationErrors.length === 0) {

		var campaignObject = createCampaignObject(fields, files);

		campaignsCollection.find({email: fields.email}).limit(1).toArray(function(err, docs) {

			if(err) {
				log.error('Campaign service: Unable to find user for saving campaign');
				callback(err);
			} else {
				if(docs.length === 0) { //Create new user
					saveNewUserWithCampaign(fields.email, fields.name, campaignObject, function(err, userId){
						if(err) {
							callback(err);
						} else {
							emailService.notifyOnNewCampaign(fields.email, userId, campaignObject.title);
							callback(err, {message: 'New user created with id' + userId});
						}
					});
				} else { //Update existing user
					var userId = docs[0]._id;
					addNewCampaignToUser(userId, campaignObject, function(err, result) {
						if(err) {
							callback(err);
						} else {
							emailService.notifyOnNewCampaign(fields.email, userId, campaignObject.title);
							callback(err, {message: 'Added new campaign for existing user' + userId});
						}
					})
				}

			}

		});

	} else {
		callback(validationErrors);
	}
};

module.exports.getCampaigns = function (userId, callback) {

	var campaignsCollection = global.db.collection('campaigns');
	campaignsCollection.find({_id: new ObjectID(userId)}).limit(1).toArray(function(err, users) {

		if(err) {
			log.error('Campaign service: Unable to get campaigns for user ['+userId+']');
			callback(err);
		} else if(!users[0]) {
			log.error('Campaign service: No user with id ['+userId+']');
			callback(null, {error: 'No such user'});
		} else {
			callback(null, users[0].campaigns);
		}

	});

};

module.exports.updateCampaign = function (userId, campaignId, rawCampaign, callback) {

	//TODO: Validate campaign

	var campaignsCollection = global.db.collection('campaigns');
	var campaignFindQuery = {
		$and:[
			{_id: ObjectID(userId)},
			{'campaigns._id': ObjectID(campaignId)}
		]
	};

	var updatedCampaignObject = rawCampaign;
	updatedCampaignObject._id = new ObjectID(campaignId);

	var campaignUpdateQuery = {
		$set: {
			'campaigns.$': updatedCampaignObject
		}
	};

	campaignsCollection.updateOne(campaignFindQuery, campaignUpdateQuery, function(err, result) {
		if(err) {
			log.error('Campaign service: Unable to update campaign ['+campaignId+'] for user ['+userId+']');
			callback(err);
		} else {
			callback(null, result);
		}
	});

};

module.exports.deleteCampaign = function (userId, campaignId, callback) {

	var campaignsCollection = global.db.collection('campaigns');
	var campaignDeleteQuery = {
		$and:[
			{_id: ObjectID(userId)},
			{'campaigns._id': ObjectID(campaignId)}
		]
	};

	var campaignUpdateQuery = {
		$set: {
			'campaigns.$.deleted': true
		}
	};

	campaignsCollection.updateOne(campaignDeleteQuery, campaignUpdateQuery, function(err, result) {
		if(err) {
			log.error('Campaign service: Unable to update campaign ['+campaignId+'] for user ['+userId+']');
			callback(err);
		} else {
			callback(null, result);
		}
	});

};
