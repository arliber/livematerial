$(function () {
    'use strict';

    $('#categories').select2({
          placeholder: 'Select categories',
          allowClear: true
    });

    $('#languages').select2({
          placeholder: 'Select languages',
          allowClear: true
    });

    $("#campaign-wizard-overlay button").click(function(){
        var $elm = $("#campaign-wizard-overlay");
        $elm.fadeTo('slow', 0, function() {
            $elm.css('display', 'none');
        });
    });

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

    Dropzone.options.campaignWizardForm = {
        maxFiles: 8,
        //acceptedFiles: 'image/*',
        autoProcessQueue: false,
        uploadMultiple: true,
        clickable: false,
        parallelUploads: 100,
        previewTemplate: '<div class="file-attachment"><button data-dz-remove><span data-dz-name></span></button></div>',
        previewsContainer: '#files-container',
        createImageThumbnails: false,

        init: function() {
            var myDropzone = this;

            this.element.querySelector("button[type=submit]").addEventListener("click", function(e) {
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

                $("#campaign-wizard-overlay").css('display', 'flex').fadeTo('slow', 1);
                var container = $('body'),
                    scrollTo = $('#overlay-anchor');
                container.animate({
                    scrollTop: scrollTo.offset().top - container.offset().top});
        });
      },
        drop: function() {
          $('#files-container').removeClass('empty').addClass('full');
        },

        reset: function() {
            $('#files-container').addClass('empty').removeClass('full');
        }
    };

});
