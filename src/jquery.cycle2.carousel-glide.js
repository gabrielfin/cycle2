(function($) {
"use strict";

$.extend($.fn.cycle.defaults, {
    carouselGlide: false,
    carouselGlideThreshold: 2
});

$(document).on( 'cycle-initialized', function(e, opts) {
    if ( !opts.carouselGlide )
        return;

    var vert = opts.carouselVertical;

    opts.container.on( 'touchstart', function(e) {

        if ( opts.busy )
            return;

        clearTimeout(opts.timeoutId);
        opts.timeoutId = 0;

        opts.busy = true;

        var data = e.originalEvent.touches ? e.originalEvent.touches[ 0 ] : e;
        var startCoords = vert ? data.pageY : data.pageX;

        var left = opts._carouselWrap.position()[vert ? 'top' : 'left'];

        var containerW = opts.container[vert ? 'height' : 'width']();
        var wrapperW = opts._carouselWrap[vert ? 'height' : 'width']();
        var maxDelta = -left;
        var minDelta = -(wrapperW - containerW + left);

        function _moveHandler(e){

            var data = e.originalEvent.touches ? e.originalEvent.touches[ 0 ] : e;
            var coords = vert ? data.pageY : data.pageX;

            var delta = coords - startCoords;

            // "Resistance" when reaching beginning or end
            if(opts.allowWrap === false){
                if( delta > maxDelta) delta = maxDelta + (delta-maxDelta) / 5;
                else if( delta < minDelta) delta = minDelta + (delta-minDelta) / 5;
            }

            var newPos = left + delta;

            opts._carouselWrap.css(vert ? 'top' : 'left', newPos);

        }
        _moveHandler(e);

        opts.container.on( 'touchmove', _moveHandler);

        var maxSlide = opts.slideCount - opts.carouselVisible;

        opts.container.one( 'touchend', function(e) {
            opts.container.unbind( 'touchmove', _moveHandler );

            var scroll = opts._carouselWrap.position()[vert ? 'top' : 'left'] * -1;
            var bestChild;
            var bestSlide;
            var bestDist = Number.POSITIVE_INFINITY;

            var children = opts._carouselWrap.children();
            if(!opts.allowWrap)
                children = children.filter(":lt(" + ( maxSlide + 1 ) + ")");

            children.each(function(slideIndex){
                var slideNum = slideIndex % opts.slideCount;
                var dim = $.fn.cycle.transitions.carousel.getDim(opts, slideNum, vert);
                var left = $(this).position()[vert ? 'top' : 'left'];

                var dist = Math.abs(scroll - left);
                if(opts.currSlide == slideNum)
                    dist *= opts.carouselGlideThreshold;
                if( dist < bestDist){
                    bestChild = slideIndex;
                    bestSlide = slideNum;
                    bestDist = dist;
                }
            });

            opts.currSlide = bestSlide;
            opts.nextSlide = bestSlide + 1;

            if(!opts.allowWrap && opts.nextSlide > maxSlide)
                opts.nextSlide = 0;

            var slideOpts = opts.API.getSlideOpts( opts.currSlide );
            var speed = slideOpts.manualSpeed || slideOpts.speed;

            var props = {};
            props[vert ? 'top' : 'left'] = $(children[bestChild]).position()[vert ? 'top' : 'left'] * - 1;

            var after = function(){
                opts.API.queueTransition( slideOpts );
                opts.API.updateView( true );
                opts.busy = false;
            }

            if(opts.allowWrap){
                slideOpts.nextSlide = opts.currSlide; // Because of issue with genCallback
                opts._carouselWrap.animate(props, speed,
                    $.fn.cycle.transitions.carousel.genCallback( slideOpts, null, vert, after)
                );
            } else {
                opts._carouselWrap.animate(props, speed, after());
            }


        });

    });

});

})(jQuery);
