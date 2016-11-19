$(function () {
    'use strict';

    $('#categories').select2({
          placeholder: 'Categories',
          allowClear: true
    });

    $('#languages').select2({
          placeholder: 'Languages',
          allowClear: true
    });

    $("#campaign-wizard-overlay button").click(function(){
        var $elm = $("#campaign-wizard-overlay");
        $elm.fadeTo('slow', 0, function() {
            $elm.css('display', 'none');
        });
    });

    //Smooth scrolling using links
    $('a[href*="#"]:not([href="#"])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });

    function isEmail(email) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    }

    function resetCampaignWizard(dropzone) {
        $('#categories').val('').trigger('change');
        $('#languages').val('').trigger('change');
        $('#content input, #content textarea').val('');
        dropzone.removeAllFiles();
        $('button[type=submit]').text('Get proposals');
    }

    function resetContactForm() {
        $('form[name=contactForm] textarea').val('');
        $('form[name=contactForm] button[type=submit]').text('Send');
        swal(
            'Sent!',
            'Thanks for contacting us, we\'ll reply shortly',
            'success'
        );
        /*setTimeout(function() {
            $('form[name=contactForm] button[type=submit]').text('Send');
        }, 5000);*/
    }

    //Contact form
    $('form[name=contactForm]').submit(function(e) {

        if(isEmail($('input[name=contactEmail]').val())) {
            $('form[name=contactForm] button[type=submit]').text('Sending..');
            $.ajax({
                type: 'POST',
                url: '/api/contact',
                data: $('form[name=contactForm]').serialize(),
                success: function() {
                    resetContactForm()
                },
                error: function() {
                    swal(
                        'Apologies!',
                        'There was an error submitting your contact form. Please try again or email us at hi@livematerial.io',
                        'error'
                    );
                }
            });
        } else {
            swal(
                'Oops..',
                'Please provide a valid email address',
                'warning'
            );
        }

        e.preventDefault();
    });

    //Campaign wizard submission
    Dropzone.options.campaignWizardForm = {
        maxFiles: 8,
        //acceptedFiles: 'image/*',
        autoProcessQueue: false,
        uploadMultiple: true,
        /*clickable: false,*/
        parallelUploads: 100,
        previewTemplate: '<div class="file-attachment"><button data-dz-remove><span data-dz-name></span></button></div>',
        previewsContainer: '#files-container',
        createImageThumbnails: false,

        init: function() {
            var myDropzone = this;
            this.on('addedfile', function(){
                $('#files-container').removeClass('empty').addClass('full');
            });
            this.element.querySelector("button[type=submit]").addEventListener("click", function(e) {

                if(isEmail($('input[name=email]').val())) {
                    console.log('Submitting form..');

                    e.preventDefault();
                    e.stopPropagation();

                    if (myDropzone.getQueuedFiles().length > 0) {
                        console.log('Sending with files..');
                        myDropzone.processQueue();
                    } else {
                        console.log('Sending with NO files..');
                        var mockFile =   {
                            name: "mock",
                            size: 1,
                            type: 'image/jpeg',
                            status: Dropzone.ADDED
                        };
                        myDropzone.uploadFiles([mockFile]); //send empty
                    }

                    $('button[type=submit]').text('Sending..');
                } else {
                    swal(
                        'Oops..',
                        'Please provide a valid email address',
                        'warning'
                    );
                    e.preventDefault();
                }

        });
      },
        drop: function() {
          $('#files-container').removeClass('empty').addClass('full');
        },
        reset: function() {
            $('#files-container').addClass('empty').removeClass('full');
        },
        success: function(file, response) {
            console.log('Success');
            $("#campaign-wizard-overlay").css('display', 'flex').fadeTo('slow', 1);
            var container = $('body'),
                scrollTo = $('#overlay-anchor');
            container.animate({scrollTop: scrollTo.offset().top - container.offset().top});
            resetCampaignWizard(this);
        },
        error: function(file, response) {
            console.log('Error submitting form');
            swal(
                'Apologies!',
                'There was an error submitting your campaign. Please try again or contact us',
                'error'
            );
        }
    };

});
