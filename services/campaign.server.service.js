'use strict';

var logger = require('winston'),
	ObjectID = require('mongodb').ObjectID;

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

module.exports.saveCampaign = function(fields, files, callback) {

	var campaignsCollection = global.db.collection('campaigns');
	var validationErrors = isValidCampaignData(fields, files)

	if(validationErrors.length === 0) {

		var campaignObject = createCampaignObject(fields, files);

		campaignsCollection.find({email: fields.email}).limit(1).toArray(function(err, docs) {

			if(err) {
				logger.error('Campaign service: Unable to find user for saving campaign');
				callback(err);
			} else {
				if(docs.length === 0) {
					var newCampaignWithUser = {
						email: fields.email,
						userName: fields.name,
						campaigns: [campaignObject]
					};
					campaignsCollection.insert(newCampaignWithUser, function(err, result) {
						logger.info('Campaign service: new campaign saved');
						callback(null, result);
					});
				} else {
					campaignsCollection.updateOne({email: fields.email}, {$push: {campaigns: campaignObject}}, function(err, result){
						if(err) {
							logger.error('Campaign service: Unable to add new campaign for user');
							callback(err);
						} else {
							logger.info('Campaign service: Added campaign to existing user ['+docs[0].email+']');
							callback(null, result);
						}
					});
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
			logger.error('Campaign service: Unable to get campaigns for user ['+userId+']');
			callback(err);
		} else if(!users[0]) {
			logger.error('Campaign service: No user with id ['+userId+']');
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
			logger.error('Campaign service: Unable to update campaign ['+campaignId+'] for user ['+userId+']');
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
			logger.error('Campaign service: Unable to update campaign ['+campaignId+'] for user ['+userId+']');
			callback(err);
		} else {
			callback(null, result);
		}
	});

};