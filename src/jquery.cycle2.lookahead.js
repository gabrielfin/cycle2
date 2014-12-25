/*! Cycle2 lookahead plugin; Copyright (c) M.Alsup, 2013; version: 20130317 */
(function($) {
"use strict";

$(document).on( 'cycle-initialized', function(e, opts) {
    var key = 'cycle-look-ahead';

    opts.API.lookahead = function(opts, index){
        var slide = $( opts.slides[ index ] );
        if ( slide.length && ! slide.data( key ) ) {
            slide.data( key, true );
            // handle both cases: 1) slide is an image, 2) slide contains one or more images
            var images = slide.is( 'img[data-cycle-src]' ) ? slide : slide.find( 'img[data-cycle-src]' );
            slide.removeClass("cycle-defer-load");
            var loading = [];
            images.each(function() {
                var img = $(this);
                var deferred = $.Deferred();
                loading.push(deferred);
                img.on('load error', function(){
                    deferred.resolve();
                });
                img.attr( 'src', img.attr('data-cycle-src') );
                img.removeAttr( 'data-cycle-src' );
            });
            slide.data( key + '-loading', loading);
        }
    }

    opts.API.lookahead(opts, opts.startingSlide);
    opts.API.lookahead(opts, opts.nextSlide);

    var index = opts.startingSlide;
    _updateLoadingStatus(opts, opts.API.getSlideOpts(index), opts.slides[index]);

    opts.container.on( 'cycle-before', function( e, opts ) {
        opts.API.lookahead(opts, opts.nextSlide);
    });
    opts.container.on( 'cycle-update-view-after', function( e, opts ) {
        opts.API.lookahead(opts, opts.nextSlide);
    });
    opts.container.on( 'cycle-update-view-before', function( e, opts, slideOpts, slide ) {
        _updateLoadingStatus(opts, slideOpts, slide);
    });

    function _updateLoadingStatus(opts, slideOpts, slide){
        opts.container.removeClass('cycle-loading');
        var loading = $(slide).data(key + '-loading');
        if(!loading) return;
        
        opts.container.addClass('cycle-loading');
        $.when.apply($, loading).then(function(){
            $(slide).removeData(key + '-loading');
            console.log(opts.currSlide);
            if(opts.currSlide == slideOpts.currSlide)
                opts.container.removeClass('cycle-loading');
        });
    }
});

})(jQuery);
