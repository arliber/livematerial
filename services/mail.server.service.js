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

module.exports.NotifyAdminsOnNewCampaign =  function (name, email, userToken, campaignTitle) {

    log.info('Mail service: Sending email to ['+email+'] about new campaign ['+campaignTitle+'] with token ['+userToken+']');

    var data = {
        from: 'LiveMaterial User <postmaster@livematerial.io>',
        to: email,
        subject: 'Your new campaign at LiveMaterial',
        /*text: "Hi, Thanks for checking out LiveMaterial for "+campaignTitle+"! Go to the following link to approve the publication we suggest and also to see your campaign's performance. You'll be notified once we have a list of publications for you." + link,
         html: "<h2>Hi, Thanks for checking out LiveMaterial for <b>"+campaignTitle+"</b>!</h2> <p>Go to <a href=\""+link+"\">this link</a> to approve the publication we suggest and also to see your campaign's performance.</p> <p>You'll be notified once we have a list of publications for you.</p>"*/
        html: `<h1>Hi ${name}, welcome to LiveMaterial! </h1>               
                <p>We have accepted your material & soon we will update you with available publishers, you will get an additional email notification for that.</p>
                <p>For any further questions or assistance, do not hesitate to contact us at hi@livematerial.io</p>
                <p>Best, <br />
                LiveMaterial team</p>`
    };

    mailgun.messages().send(data, function (err, body) {
        if(err) {
            log.error('Mail service: Error in sending mail', err);
        } else {
            log.info('Mail service: Mail sent successfully', body);
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