'use strict';

var log = require('winston'),
	Mailgun = require('mailgun-js'),
	config = require('../config');

var mailgun = Mailgun({
				apiKey: config.mailgun.apiKey,
				domain: config.mailgun.domain
			});

module.exports.notifyOnNewCampaign = function (email, userToken, campaignTitle) {

	var link = config.baseUrl + 'user/' + userToken;

	log.info('Mail service: Sending email to ['+email+'] about new campaign ['+campaignTitle+'] with token ['+userToken+']');

	var data = {
		from: 'LiveMaterial User <postmaster@marketingcontent.design>',
		to: email,
		subject: 'Your new campaign at LiveMaterial',
		text: "Hi, Thanks for checking out LiveMaterial for "+campaignTitle+"! Go to the following link to approve the publication we suggest and also to see your campaign's performance. You'll be notified once we have a list of publications for you." + link,
		html: "<h2>Hi, Thanks for checking out LiveMaterial for <b>"+campaignTitle+"</b>!</h2> <p>Go to <a href=\""+link+"\">this link</a> to approve the publication we suggest and also to see your campaign's performance.</p> <p>You'll be notified once we have a list of publications for you.</p>"
	};

	mailgun.messages().send(data, function (err, body) {
		if(err) {
			log.error('Main service: Error in sending mail', err);
		} else {
			log.info('Main service: Mail sent successfully', body);
		}
	});

};