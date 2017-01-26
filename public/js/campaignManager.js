$(function(){

    var client = null;

    function generateCampaignContent(campaign) {

        var $campaignContent = $('<div>', {'class': 'card-content'});

        var $campaignCategories = $('<ul>', {'class':'categories'});
        if(campaign.categories && campaign.categories.length > 0) {
            for(var i = 0; i < campaign.categories.length; i++) {
                $campaignCategories.append('<li><i class="fa fa-tag" aria-hidden="true"></i> ' + campaign.categories[i] + '</li>');
            }
        } else {
            $campaignCategories.append('<li><i class="fa fa-tag" aria-hidden="true"></i> No categories</li>');
        }

        var $creationDate = $('<div class="creation-date"><i class="fa fa-clock-o" aria-hidden="true"></i> ' + campaign.createDate.substring(0, 10) + '</div>');

        $campaignContent
            .append('<h2>' + (campaign.title === '' ? 'Untitled' : campaign.title) + '</h2>')
            .append($campaignCategories)
            .append($creationDate);

        return $campaignContent;
    }

    function generateCampaignFooter(campaign) {
        var $campaignFooter = $('<div>', {'class': 'card-footer'});
        if(campaign.propositions && campaign.propositions.length > 0) {
            $campaignFooter.addClass('has-propositions');
            $campaignFooter.text(campaign.propositions.length + ' Propositions');
        } else {
            $campaignFooter.text('No propositions yet');
        }

        return $campaignFooter;

    }

    function generateCampaignList(campaigns) {
        var $campaigns = $('ul#campaigns');
        for(var i = 0; i < campaigns.length; i++) {
            var $li = $('<li>', {'class': 'card', 'data-id': campaigns[i]._id});

            var $campaignContent = generateCampaignContent(campaigns[i]);
            var $campaignFooter = generateCampaignFooter(campaigns[i]);

            $li.append($campaignContent)
                .append($campaignFooter);

            $campaigns.append($li);
        }
    }

    function setUserName(data) {
        $('#userName').text(data.userName === '' ? data.email : data.userName);
    }

    function loadUserData(data) {
        client = data;
        generateCampaignList(data.campaigns);
        setUserName(data);
    }

    function notifyOnError(message) {
        return function() {
            console.log(message);
        };
    }

    function getCampaignById(campaignId) {
        for(var i = 0; i < client.campaigns.length; i++) {
            if(client.campaigns[i]._id === campaignId) {
                return client.campaigns[i];
            }
        }
    }

    function getPropositionUrl(proposition) {
        var url = 'http://api.screenshotlayer.com/api/capture?access_key=2eb3463320df86892a4e5ff2a3c33f09&url='+proposition.url+'&width=250';
        return $('<img src="'+url+'" class="card-header" />');
    }

    function getPropositionContent(proposition) {
        var $propositionContent = $('<div>', {class:'card-content'});

        var $sietLink = $('<div class="site-link"><a href="'+ proposition.url +'" target="_blank">'+ proposition.title +'</a> <i class="fa fa-external-link" aria-hidden="true"></i></div>');

        var $meta = $('<ul>', {class:'site-meta'});
        $meta.append('<li><i class="fa fa-line-chart" aria-hidden="true"></i> Traffic: '+proposition.traffic+'</li>')
             .append('<li><i class="fa fa-credit-card" aria-hidden="true"></i> Price: '+proposition.price+'</li>');

        $propositionContent.append($sietLink)
                           .append($meta);

        return $propositionContent;
    }

    function getPropositionFooter(proposition) {
        var buttonValue = (proposition.isBooked === true);
        var buttonText = buttonValue ? 'Unbook' : 'Book now!';
        return $('<div class="card-footer"><button class="bttn-fill bttn-sm bttn-primary bttn-block bttn-no-outline" data-isBooked="'+buttonValue+'">'+buttonText+'</button></div>');
    }

    function bookingUpdated($button) {
        return function(data) {
            var buttonValue = (data.isBooked === true);
            var buttonText = buttonValue ? 'Unbook' : 'Book now!';
            $button.text(buttonText)
                    .attr('data-isBooked', buttonValue);
        };
    }

    function bookProposition() {
        $(this).blur();
        var propositionId = $(this).parents('li.card').attr('data-id');
        var isBooked = $(this).attr('data-isBooked') === 'true';

        $.ajax({
            url: '/api/proposition/' + propositionId,
            method: 'PATCH',
            data: {
                isBooked: !isBooked
            },
            success: bookingUpdated($(this)),
            error: notifyOnError('Unable to update proposition booking')
        });
    }

    function getProposition(proposition) {
        var $li = $('<li>', {class: 'card', 'data-id': proposition._id});

        $li.append(getPropositionUrl(proposition))
            .append(getPropositionContent(proposition))
            .append(getPropositionFooter(proposition));

        $li.on('click', 'button', bookProposition)

        return $li;
    }

    function loadPropositions(campaign) {
        $propositions = $('#propositions');
        $propositions.empty();
        $('#select-campaign').fadeOut();
        if(campaign.propositions && campaign.propositions.length > 0) {
            $('#no-propositions').hide();
            $('#propositions').slideUp();
            for(var i = 0; i < campaign.propositions.length; i++) {
                $propositions.append(getProposition(campaign.propositions[i]));
            }
            $('#propositions').slideDown();
        } else {
            $('#propositions').slideUp();
            $('#no-propositions').fadeIn('slow');
        }
    }

    function loadCampaign() {
        var campaignId = $(this).attr('data-id');
        $('#campaigns li').removeClass('selected');
        $(this).addClass('selected');

        var selectedCampaign = getCampaignById(campaignId);
        loadPropositions(selectedCampaign);
    }

    var urlSegments = window.location.pathname.split( '/' );
    if(urlSegments.length > 0 && urlSegments[urlSegments.length - 1] !== '') {

        $.ajax({
            url: '/api/campaign/' + urlSegments[urlSegments.length - 1],
            success: loadUserData,
            error: notifyOnError('Error in loading campaigns')
        });

        $('ul#campaigns').on('click', 'li', loadCampaign);

    } else {
        window.location = 'http://livematerial.io';
    }

});
