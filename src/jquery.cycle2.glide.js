(function($) {
"use strict";

$.extend($.fn.cycle.defaults, {
    glide: false
});

$(document).on( 'cycle-initialized', function(e, opts) {
    if ( !opts.glide )
        return;

    var vert = opts.glide == 'vertical';

    opts.container.on( 'touchstart', function(e) {

        if ( opts.busy )
            return;

        clearTimeout(opts.timeoutId);
        opts.timeoutId = 0;

        opts.busy = true;

        var data = e.originalEvent.touches ? e.originalEvent.touches[ 0 ] : e;
        var startCoords = vert ? data.pageY : data.pageX;

        var currSlide = opts.currSlide;
        var prevSlide = _prevSlide();
        var nextSlide = _nextSlide();
        var $curr = $(opts.slides[opts.currSlide]);
        var $prev = prevSlide !== null ? $(opts.slides[prevSlide]) : $();
        var $next = nextSlide !== null ? $(opts.slides[nextSlide]) : $();

        $curr.add($prev).add($next).css('visibility', 'visible');

        var w, posPrev, posCurr, posNext;
        function _moveHandler(e){

            var data = e.originalEvent.touches ? e.originalEvent.touches[ 0 ] : e;
            var coords = vert ? data.pageY : data.pageX;

            var delta = coords - startCoords;

            w = opts.container.css('overflow','hidden')[vert ? 'height' : 'width']();

            var minDelta = -w;
            var maxDelta = w;

            // "Resistance" when reaching beginning or end
            if(prevSlide === null) maxDelta = 0;
            if(nextSlide === null) minDelta = 0;
            if(delta > maxDelta) delta = maxDelta + (delta-maxDelta) / 5;
            if(delta < minDelta) delta = minDelta + (delta-minDelta) / 5;

            posPrev = -w + delta;
            posCurr = 0 + delta;
            posNext = w + delta;

            $prev.css(vert ? 'top' : 'left', posPrev);
            $curr.css(vert ? 'top' : 'left', posCurr);
            $next.css(vert ? 'top' : 'left', posNext);

        }
        _moveHandler(e);

        opts.container.on( 'touchmove', _moveHandler);

        opts.container.one( 'touchend', function(e) {
            opts.container.unbind( 'touchmove', _moveHandler );

            var $reset = $();
            if(nextSlide !== null && posCurr < -$curr[vert ? 'height' : 'width']()/2){ /* move forwards */
                posCurr = -w;
                posNext = 0;
                opts.currSlide = nextSlide;
                opts.nextSlide = nextSlide + 1;
                $reset.add($prev, $curr);

                if (opts.nextSlide >= opts.slides.length)
                    opts.nextSlide = 0;

                opts.API.trigger('cycle-next', [ opts ]).log('cycle-next');
            } else if(prevSlide !== null && posCurr > $curr[vert ? 'height' : 'width']()/2){ /* move backwards */
                posCurr = w;
                posPrev = 0;
                opts.currSlide = prevSlide;
                opts.nextSlide = currSlide;
                $reset.add($curr, $next);

                opts.API.trigger('cycle-prev', [ opts ]).log('cycle-prev');
            } else { /* stay put */
                posPrev = -w;
                posCurr = 0;
                posNext = w;
                $reset.add($prev, $next);
            }

            var slideOpts = opts.API.getSlideOpts( opts.currSlide );
            var speed = slideOpts.manualSpeed || slideOpts.speed;

            var props1 = {}; var props2 = {}; var props3 = {};
            props1[vert ? 'top' : 'left'] = posPrev;
            props2[vert ? 'top' : 'left'] = posCurr;
            props3[vert ? 'top' : 'left'] = posNext;

            $.when(
                $prev.animate(props1, speed),
                $curr.animate(props2, speed),
                $next.animate(props3, speed)
            ).then(function(){
                $reset.css(vert ? 'top' : 'left',  0);
                opts.API.queueTransition( slideOpts );
                opts.API.updateView( true );
                opts.busy = false;
            });

        });

    });

    function _prevSlide() {
        if( opts.currSlide - 1 < 0 ){
            if( opts.allowWrap === false ) return null;
            else return opts.slideCount - 1;
        }
        else return opts.currSlide - 1;
    }

    function _nextSlide() {
        if( opts.currSlide + 1 >= opts.slideCount ){
            if( opts.allowWrap === false ) return null;
            else return 0;
        }
        else return opts.currSlide + 1;
    }
});

})(jQuery);
