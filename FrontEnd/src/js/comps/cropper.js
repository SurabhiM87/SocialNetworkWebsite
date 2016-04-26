function initCropper(){
    //Load menu
    var scope = $('.cropper');

    //bind submit button
    $.each(scope, function(k, elem){
        var self = $(elem);

        // check instance
        if (checkInstance(self, 'cropper')) return;

        var eventState = {};
        var minWidth = 20;
        var minHeight = 20;
        var maxWidth = 1200;
        var maxHeight = 1200;
        var origSrc = self.data('cropperurl');
        var origImage = new Image();
            origImage.src = origSrc;
        var origWidth = 1;
        var origHeight = 1;
        var overlayWidth = self.data('cropperwidth');
        var overlayHeight = self.data('cropperheight');
        var overlayBorderRadius= self.data('croppercornerradius');
        var resizeCanvas = document.createElement('canvas');
        var constrain = true;


        //setup DOM
        var container = $(Handlebars.compile(
            '<div class="cropper__container" >'+
            '    <img src="{{origSrc}}"/>'+
            '    <span class="cropper__handle cropper__handle--nw"></span>'+
            '    <span class="cropper__handle cropper__handle--ne"></span>'+
            '    <span class="cropper__handle cropper__handle--se"></span>'+
            '    <span class="cropper__handle cropper__handle--sw"></span>'+
            '</div>'
        )({origSrc:origSrc})).appendTo(self).on('mousedown touchstart', '.cropper__handle', startResize)
            .on('mousedown touchstart', 'img', startMoving);

        var overlay = $(Handlebars.compile(
            '<div class="cropper__overlay">'+
            '    <div class="cropper__overlayInner">'+
            '    </div>'+
            '</div>'
        )()).appendTo(self).css({
            'width': overlayWidth+'px',
            'height': overlayHeight+'px',
            'margin-left': (-overlayWidth/2)+'px',
            'margin-top': (-overlayHeight/2)+'px',
            'border-radius': overlayBorderRadius+'px'
        });

        var imageTarget = container.find('img').on('load', function(){
            setupContainer();
        });

        //functions
        function setupContainer(){
            var containerWidth = 1, containerHeight = 1, aspectRatio = 1;

            if (origImage.height < origImage.width){
                containerWidth = self.width() * .9;
                aspectRatio = origImage.width / origImage.height;
                containerHeight = containerWidth*aspectRatio;
            } else {
                containerHeight = self.height() * .9;
                aspectRatio = origImage.width / origImage.height;
                containerWidth = containerHeight*aspectRatio;
            }

            container.css({
                'width': containerWidth+'px',
                'height': containerHeight+'px'
            });
        }

        function startResize(e){
            e.preventDefault();
            e.stopPropagation();
            saveEventState(e);
            $(document).on('mousemove touchmove', resizing);
            $(document).on('mouseup touchend', endResize);
        };

        function endResize(e){
            e.preventDefault();
            $(document).off('mouseup touchend', endResize);
            $(document).off('mousemove touchmove', resizing);
        };

        function saveEventState(e){
            // Save the initial event details and container state
            eventState.container_width = container.width();
            eventState.container_height = container.height();
            eventState.container_left = container.offset().left;
            eventState.container_top = container.offset().top;
            eventState.mouse_x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft();
            eventState.mouse_y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();

            // This is a fix for mobile safari
            // For some reason it does not allow a direct copy of the touches property
            if(typeof e.originalEvent.touches !== 'undefined'){
                eventState.touches = [];
                $.each(e.originalEvent.touches, function(i, ob){
                  eventState.touches[i] = {};
                  eventState.touches[i].clientX = 0+ob.clientX;
                  eventState.touches[i].clientY = 0+ob.clientY;
                });
            }
            eventState.evnt = e;
        };

        function resizing(e){
            var mouse={},width,height,left,top,offset=container.offset();
            mouse.x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft();
            mouse.y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();

            // Position image differently depending on the corner dragged and constraints
            if( $(eventState.evnt.target).hasClass('cropper__handle--se') ){
                width = mouse.x - eventState.container_left;
                height = mouse.y  - eventState.container_top;
                left = eventState.container_left;
                top = eventState.container_top;
            } else if($(eventState.evnt.target).hasClass('cropper__handle--sw') ){
                width = eventState.container_width - (mouse.x - eventState.container_left);
                height = mouse.y  - eventState.container_top;
                left = mouse.x;
                top = eventState.container_top;
            } else if($(eventState.evnt.target).hasClass('cropper__handle--nw') ){
                width = eventState.container_width - (mouse.x - eventState.container_left);
                height = eventState.container_height - (mouse.y - eventState.container_top);
                left = mouse.x;
                top = mouse.y;
                if(constrain || e.shiftKey) {
                    top = mouse.y - ((width / origWidth * origHeight) - height);
                }
            } else if($(eventState.evnt.target).hasClass('cropper__handle--ne') ){
                width = mouse.x - eventState.container_left;
                height = eventState.container_height - (mouse.y - eventState.container_top);
                left = eventState.container_left;
                top = mouse.y;
                if(constrain || e.shiftKey) {
                    top = mouse.y - ((width / origWidth * origHeight) - height);
                }
            }

            // Optionally maintain aspect ratio
            if(constrain || e.shiftKey){
                height = width / origWidth * origHeight;
            }

            if(width > minWidth && height > minHeight && width < maxWidth && height < maxHeight){
                // To improve performance you might limit how often resizeImage() is called
                resizeImage(width, height);
                // Without this Firefox will not re-calculate the the image dimensions until drag end
                container.offset({'left': left, 'top': top});
            }
        }

        function resizeImage(width, height){
            resizeCanvas.width = width;
            resizeCanvas.height = height;
            resizeCanvas.getContext('2d').drawImage(origImage, 0, 0, width, height);
            $(imageTarget).attr('src', resizeCanvas.toDataURL("image/png"));
        };

        function startMoving(e){
            e.preventDefault();
            e.stopPropagation();
            saveEventState(e);
            $(document).on('mousemove touchmove', moving);
            $(document).on('mouseup touchend', endMoving);
        };

        function endMoving(e){
            e.preventDefault();
            $(document).off('mouseup touchend', endMoving);
            $(document).off('mousemove touchmove', moving);
        };

        function moving(e){
            var  mouse={}, touches;
            e.preventDefault();
            e.stopPropagation();

            touches = e.originalEvent.touches;

            mouse.x = (e.clientX || e.pageX || touches[0].clientX) + $(window).scrollLeft();
            mouse.y = (e.clientY || e.pageY || touches[0].clientY) + $(window).scrollTop();
            container.offset({
                'left': mouse.x - ( eventState.mouse_x - eventState.container_left ),
                'top': mouse.y - ( eventState.mouse_y - eventState.container_top )
            });

            // Watch for pinch zoom gesture while moving
            if(eventState.touches && eventState.touches.length > 1 && touches.length > 1){
                var width = eventState.container_width, height = eventState.container_height;
                var a = eventState.touches[0].clientX - eventState.touches[1].clientX;
                a = a * a;
                var b = eventState.touches[0].clientY - eventState.touches[1].clientY;
                b = b * b;
                var dist1 = Math.sqrt( a + b );

                a = e.originalEvent.touches[0].clientX - touches[1].clientX;
                a = a * a;
                b = e.originalEvent.touches[0].clientY - touches[1].clientY;
                b = b * b;
                var dist2 = Math.sqrt( a + b );

                var ratio = dist2 /dist1;

                width = width * ratio;
                height = height * ratio;

                // To improve performance you might limit how often resizeImage() is called
                // resizeImage(width, height);
            }
        };

        function crop(){
            //Find the part of the image that is inside the crop box
            var crop_canvas,
            left = $('.overlay').offset().left - container.offset().left,
            top =  $('.overlay').offset().top - container.offset().top,
            width = $('.overlay').width(),
            height = $('.overlay').height();

            crop_canvas = document.createElement('canvas');
            crop_canvas.width = width;
            crop_canvas.height = height;

            crop_canvas.getContext('2d').drawImage(origImage, left, top, width, height, 0, 0, width, height);
            window.open(crop_canvas.toDataURL("image/png"));
        }

    });
}

$(document).ready(function(){
    initCropper()
});
