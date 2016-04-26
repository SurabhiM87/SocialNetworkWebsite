$(document).ready(function(){
    //Load menu
    var scope = $('.formAjax');

    //bind submit button
    $.each(scope, function(k, elem){
        var self = $(elem).attr('id', 'formNumber'+k);

        //Parsley validation combined with jquery tooltip functionality
        var parsley = $(self).parsley({
            errorsContainer: function (ParsleyField) {
                return ParsleyField.$element.attr("title");
            },
            errorsWrapper: false
        }).on('field:error', function(field){
            var messages = this.getErrorsMessages(field);

            if (field.$element.tooltip('instance') == undefined) {
                field.$element.tooltip({
                    content: messages.join('<br />'),
                    items: field.$element,
                    position: {
                        my: "center top",
                        at: "center top-38",
                        collision: "none"
                    },
                    tooltipClass: "parsley__tooltip",
                    open: function (e, o) {
                        $(window).on("resize.tooltips" + o.tooltip[0].id, function () {
                            repositionTooltip(e.target, o);
                        });
                    },
                    close: function (e, o) {
                        $(window).unbind("resize.tooltips" + o.tooltip[0].id);
                    }
                }).on('focusin', function () {
                    if (field.$element.tooltip('instance') != undefined) {
                        field.$element.tooltip('open');
                    }
                }).on('focusout', function (e) {
                    e.stopImmediatePropagation();
                }).on('mouseleave', function (e) {
                    if (field.$element.is(':focus') && field.$element.tooltip('instance') != undefined) {
                        e.stopImmediatePropagation();
                        field.$element.tooltip('open');
                    }
                }).tooltip('open');
            } else {
                field.$element.tooltip('option', 'content', messages.join('<br />'));

                for (var tip in field.$element.tooltip('instance').tooltips) {
                    repositionTooltip(field.$element, field.$element.tooltip('instance').tooltips[tip]);
                }
            }
        }).on('field:success', function(field, tooltip){
            if(field.$element.tooltip('instance') != undefined){
                field.$element.tooltip('destroy');
            }
        });

        //bind autogrow
        self.find('textarea').textareaAutoSize();

        //bind datepicker
        self.find('.datePicker').datepicker({
            prevText: '<svg><use xlink:href="../images/icons.svg#arrowLeft"></use></svg>',
            nextText: '<svg><use xlink:href="../images/icons.svg#arrowRight"></use></svg>'
        });

        //bind timepicker
        self.find('.timePicker').timepicker();

        //bind datepair for starttime and endtime
        self.find('.datepair').datepair();

        // setup success
        var success = function(extraParams){
            //vars
            var action = self.attr('action'),
                method = self.attr('method');

            var data = {"ajax":action};
            var bodyData = {};

            if (method === 'GET') {
                self.serializeArray().map(function(x){
                    data[x.name] = x.value;
                });
                //append extra fields
                if (typeof extraParams !== 'undefined'){
                    $.extend(data, extraParams);
                }
            } else if (method === 'POST') {
                bodyData = self.serialize();
                //append extra fields
                if (typeof extraParams !== 'undefined'){
                    bodyData += '&' + $.param(extraParams);
                }
            }

            $.ajax({
                method: method,
                url: app.jsonUrl + JSON.stringify(data),
                data: bodyData,
                dataType: "json"
            }).done(function( data ) {
                if (data[0].status == 'OK'){
                    self.data('successCallback')(data);
                } else {
                    self.data('failCallback')(data);
                }
            });
        };

        // piggy back off of form submit (however they submit it)
        self.unbind('submit').on('submit', function(e){
            e.preventDefault();

            //validate
            parsley.validate();
            if (!parsley.isValid()){
                return;
            }

            // confirm
            if (typeof self.data('confirm') === 'object'){
                var confirmConfig = self.data('confirm');

                var modalConfirm = $('<div/>', {'class':'modalConfirm'});
                modalConfirm.css('top', confirmConfig.offsetTop);
                modalConfirm.append($('<p/>').html(confirmConfig.message));

                $.each(confirmConfig.options, function(name, opt){
                    modalConfirm.append($('<input/>', {'type':'submit', 'value':name}).on('click', function(e){
                        if (opt.continue){
                            success(opt.append);
                        }
                        modalConfirm.remove();
                        self.closest(confirmConfig.appendTo).find(confirmConfig.hide.toString(', ')).show();
                    }).attr('class', opt.class));
                })

                self.closest(confirmConfig.appendTo).find(confirmConfig.hide.toString(', ')).hide();

                modalConfirm.appendTo(self.closest(confirmConfig.appendTo));

                return false;
            } else {
                success();
            }
        });
    });
});

//Parsley custom validator to check if start time is less than the end time
window.Parsley.addValidator('timeLt', {
    validateString: function (startTime, endTimeName, field) {
        startTime = moment(startTime,["h:mm A"]);
        var endTime = moment((field.parent.$element.find(endTimeName).val()),["h:mm A"]);

        return (startTime).isBefore(endTime);
    },
    messages:{
        en: 'Start time should be less than end time.'
    },
    priority: 256
});
//Parsley custom validator to check if start time is less than the end time
window.Parsley.addValidator('timeGt', {
    validateString: function (endTime, startTimeName, field) {
        endTime = moment(endTime,["h:mm A"]);
        var startTime = moment((field.parent.$element.find(startTimeName).val()),["h:mm A"]);

        return (startTime).isBefore(endTime);
    },
    messages:{
        en: 'Start time should be less than end time.'
    },
    priority: 256
});

//Sets the position of the validation tooltip on resizing the browser window
function repositionTooltip(target,o){
    o.tooltip.css({
        top: $(target).offset().top - 38,
        left: $(target).offset().left + $(target).width() / 2 - o.tooltip.width() / 2
    })
}

//add fill function
$.fn.extend({
    "populate" : function(data){
        var self = $(this);

        $.each(data, function(name, val){
            var field = self.find('[name="'+name+'"]'),
                type = field.attr('type');

            switch(type){
                case 'checkbox':
                    field.attr('checked', 'checked');
                    break;
                case 'radio':
                    field.removeProp('checked').filter('[value="'+val+'"]').prop('checked', 'checked');
                    break;
                default:
                    if (typeof val ==='string') val = val.replace(/<br\/>/g, '\n');
                    field.val(val);
            }
        });

        return this;
    }
});
