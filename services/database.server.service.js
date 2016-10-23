'use strict';

var MongoClient = require('mongodb').MongoClient,
	logger  = require('winston');

module.exports.init = function(connetionString, callback) {
	MongoClient.connect(connetionString, function(err, db) {
		if(err) {
			logger.error('Database service: Unable to connect due to ['+err+']');
			callback(err);
		} else {
			logger.info('Database service: Connected to database');
			global.db = db;
			callback();
		}
	});
};
