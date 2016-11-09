'use strict';

var log = require('winston'),
	Mailgun = require('mailgun-js'),
	config = require('../config');

var mailgun = Mailgun({
				apiKey: config.mailgun.apiKey,
				domain: config.mailgun.domain
			});

module.exports.contactEmail = function (name, email, message, callback) {
    log.info('Mail service: Sending contact email from ['+name+'] at ['+email+'] with message ['+message+']');

    var data = {
        from: 'LiveMaterial User <contactform@livematerial.io>',
        to: 'contact@livematerial.io',
        subject: 'Contact details from LiveMaterial!',
        html: `<p>Hi,</p>     
                <p>Please get back to:</p>
                <p>
                    <b>Name:</b> ${name} <br/>
                    <b>Email:</b> ${email} <br />
                    <b>Message:</b><br /> 
                    ${name}
                </p>`
    };

    mailgun.messages().send(data, function (err, body) {
        if(err) {
            log.error('Mail service: Error in sending mail', err);
            callback(err);
        } else {
            log.info('mail service: Mail sent successfully', body);
            callback(null);
        }
    });
};


module.exports.NotifyAdminsOnNewCampaign = function () {
    log.info('Mail service: Sending contact email from ['+name+'] at ['+email+'] with message ['+message+']');

    var data = {
        from: 'LiveMaterial User <contactform@livematerial.io>',
        to: 'contact@livematerial.io',
        subject: 'Contact details from LiveMaterial!',
        html: `<p>Hi,</p>     
                <p>Please get back to:</p>
                <p>
                    <b>Name:</b> ${name} <br/>
                    <b>Email:</b> ${email} <br />
                    <b>Message:</b><br /> 
                    ${name}
                </p>`
    };

    mailgun.messages().send(data, function (err, body) {
        if(err) {
            log.error('Mail service: Error in sending mail', err);
            callback(err);
        } else {
            log.info('mail service: Mail sent successfully', body);
            callback(null);
        }
    });
};

module.exports.notifyOnNewCampaign = function (userId) {


	log.info('Mail service: Notification on new campaign for user ['+userId+']');

	var data = {
		from: 'LiveMaterial User <postmaster@livematerial.io>',
		to: 'contact@livematerial.io',
		subject: 'New campaign on LiveMaterial!',
		html: `<h1>Someone created a new campaign!</h1>               
                <p>
                    <b>User ID:</b> ${userId}
                </p>`
	};

	mailgun.messages().send(data, function (err, body) {
		if(err) {
			log.error('Mail service: Error in sending mail', err);
		} else {
			log.info('Mail service: Mail sent successfully', body);
		}
	});

};