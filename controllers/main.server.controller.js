'use strict';

var emailService = require('../services/mail.server.service'),
    logger = require('winston');

module.exports.sendContactForm = function(req, res) {

    logger.info('Main controller: Sending contact form..');
    emailService.contactEmail(req.body.contactName, req.body.contactEmail, req.body.message, function(err) {
        if(err) {
            res.status(500).send('');
        } else {
            res.status(200).send('');
        }
    });

};
