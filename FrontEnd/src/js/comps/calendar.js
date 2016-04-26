function initCalendar(){
    var scope = $('.calendar');

    $.each(scope, function(k, elem){
        var self = $(elem);

        // check instance
        if (checkInstance(self, 'calendar')) return;

        self.createEvent = self.find('.createEvent');
        self.editEvent = self.find('.editEvent');
        self.viewEvent = self.find('.viewEvent');

        self.fullCalendar({
            customButtons: {
                addEvent: {
                    text: 'New Event',
                    click: function(e) {
                        addEvent(self);
                    }
                }
            },
            header: {
                left: 'prev,next today addEvent',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },
            lazyFetching: true,
            editable: true,
            eventLimit: true,
            dayClick: function(date, jsEvent, view) {
                addEvent(self, date);
            },
            eventClick: function(calEvent, jsEvent, view) {
                if (calEvent.editable){
                    editEvent(self, calEvent);
                } else {
                    viewEvent(self, calEvent);
                }
            },
            events: function(start, end, timezone, callback) {
                $.ajax({
                    method:'POST',
                    url: app.jsonUrl + JSON.stringify({'ajax': 'getEvents'}),
                    dataType: 'json',
                    data: {
                        start: start.format(),
                        end: end.format()
                    },
                    success: function(events) {
                        callback(events);
                    }
                });
            },
            eventDrop: function(event, delta, revertFunc) {
                setTimeout(function(){
                    if (!confirm("Are you sure you want to move '"+event.title+"' to " + event.start.format('MM/DD/YYYY'))) {
                        revertFunc();
                    } else {
                        changeDate(event, revertFunc);
                    }
                }, 0);
            },
            eventResize: function(event, delta, revertFunc) {
                setTimeout(function(){
                    if (!confirm("Are you sure you want to change the time of '"+event.title+"'?")) {
                        revertFunc();
                    } else {
                        changeDate(event, revertFunc);
                    }
                }, 0);
            }
        });

        // add event form callbacks
        self.createEvent.find('form').data('successCallback', function(data){
            self.createEvent.dialog("close");
            //add to calendar
            delete data[0].status;
            data[0].editable = 1;
            self.fullCalendar( 'renderEvent', data[0])
        }).data('failCallback', function(e){
            console.log(e)
        });

        self.editEvent.find('form').eq(0).data('successCallback', function(data){
            self.editEvent.dialog("close");
            //edit event instance
            var event = self.fullCalendar( 'clientEvents', data[0].eventId )[0];
            delete data[0].status;
            delete data[0].eventId;
            $.extend(event, data[0]);
            self.fullCalendar('updateEvent', event);
        }).data('failCallback', function(e){
            console.log(e)
        }).data('confirm', {
            message: 'Do you want to notify attendees about edits to this game?',
            hide: [
                '.ui-dialog-titlebar-close'
            ],
            appendTo: '.ui-dialog',
            offsetTop: '40px',
            options:{
                'Save and notify':{
                    continue:true,
                    append: {
                        notify:true
                    },
                    class: 'calendar__button calendar__button--add'
                },
                'Save and do not notify':{
                    continue: true,
                    class: 'calendar__button calendar__button--add'
                },
                'Cancel':{
                    continue: false,
                    class: 'calendar__button calendar__button--cancel'
                }
            }
        });


        self.editEvent.find('form').eq(1).data('successCallback', function(data){
            self.editEvent.dialog("close");
            self.fullCalendar( 'removeEvents', data[0].eventId );
        }).data('failCallback', function(e){
            console.log(e)
        }).data('confirm', {
            message: 'Do you want to notify attendees when you delete this game?',
            hide: [
                '.ui-dialog-titlebar-close'
            ],
            appendTo: '.ui-dialog',
            offsetTop: '40px',
            options:{
                'Delete and notify':{
                    continue:true,
                    append: {
                        notify:true
                    },
                    class: 'calendar__button calendar__button--delete'
                },
                'Delete and do not notify':{
                    continue: true,
                    class: 'calendar__button calendar__button--delete'
                },
                'Cancel':{
                    continue: false,
                    class: 'calendar__button calendar__button--cancel'
                }
            }
        });

        //switch form label and colors for types
        self.createEvent.find('input[name="type"]').on('change', function(){
            setupType(self.createEvent, $(this).val());
        });

        //mirror start date for now
        self.createEvent.find('input[name="start"]').on('change', function(){
            self.createEvent.find('input[name="end"]').val($(this).val());
        });
        self.editEvent.find('input[name="start"]').on('change', function(){
            self.editEvent.find('input[name="end"]').val($(this).val());
        });

        //setup modals
        var dialogOptions = {
            autoOpen: false,
            modal: true,
            minWidth: 310,
            dialogClass: 'calendar__dialog',
            closeText : '<svg><use xlink:href="../images/icons.svg#x"></use></svg>',
            position: {
                my: "center",
                at: "center",
                of: self[0]
            },
            create: function(event, ui) {
                $("body").addClass("body--noScroll"); 
            }, 
            beforeClose: function(event, ui) { 
                $("body").removeClass("body--noScroll");
            }
        };

        // add event dialog
        self.createEvent.dialog($.extend( true, {
            close: function() {
                self.createEvent.find('form').unwatch();
                self.createEvent.find('form').trigger("reset");
                if(self.createEvent.find('input[name="title"]').tooltip('instance') != undefined){
                    self.createEvent.find('input[name="title"]').tooltip('instance').destroy();
                }
            },
            buttons: [{
                text: "Cancel",
                click:  function() {
                    self.createEvent.dialog('close');
                },
                class: 'calendar__button calendar__button--cancel'
            },{
                text: "Add",
                click:  function() {
                    self.createEvent.find('form').submit();
                },
                class: 'calendar__button calendar__button--add'
            }]
        }, dialogOptions ));

        // edit event dialog
        self.editEvent.dialog($.extend( true, {
            close: function() {
                self.editEvent.find('form').unwatch();
                self.editEvent.find('form').trigger("reset");
                if(self.editEvent.find('input[name="title"]').tooltip('instance') != undefined){
                    self.editEvent.find('input[name="title"]').tooltip('instance').destroy();
                }
            },
            open: function( e, ui ) {
                self.editEvent.find('textarea').trigger('input');
            },
            buttons: [{
                text: "Cancel",
                click:  function() {
                    self.editEvent.dialog('close');
                },
                class: 'calendar__button calendar__button--cancel'
            },{
                text: "Save",
                click:  function() {
                    self.editEvent.find('form').eq(0).submit();
                },
                class: 'calendar__button calendar__button--add'
            },{
                text: "Delete this event?",
                click:  function() {
                   self.editEvent.find('form').eq(1).submit();
                },
                class: 'calendar__button calendar__button--deleteLink'
            }]
        }, dialogOptions ));

        // view event dialog
        self.viewEvent.dialog($.extend( true, {}, dialogOptions ));
    });

    //functions
    function changeDate(event, revertFunc) {
        var data = {
            "id" : event.id,
            "start" : event.start.format(),
            "end" : (event.end == null) ? event.start.format() : event.end.format()
        }

        $.post( app.jsonUrl + JSON.stringify({'ajax': 'setEventDate'}) , data, function( data ) {
            if (data.status != 'OK'){
                revertFunc();
            }
        }, "json").error(function(e){
            revertFunc();
        });
    }

    function setupType(form, type, prefix){
        var eventTypes = ['',
            {name:'Event', color:'#33ACE0', titlePrefix:'&nbsp;'},
            {name:'Opponent', color:'#FC413E', titlePrefix:'Game vs.'}
        ];

        form.find('input[name="title"]').attr('placeholder', 'New ' + eventTypes[type].name)
            .end().find('label[for="title"]').html(eventTypes[type].titlePrefix)
            .end().siblings('.ui-dialog-titlebar').css('background', eventTypes[type].color);
    }

    function addEvent(self, date){
        var now = new moment(date);
        var today =  now.format("MM/DD/YYYY");
        var todayFriendly =  moment.utc(new Date(now)).format("ddd, MMM DD, YYYY");
        var startTime = new moment('2000-01-01 12:00').format('h:mma');
        var endTime = new moment('2000-01-01 13:00').format('h:mma');

        //reset form
        setupType(self.createEvent, 1);

        self.createEvent.find('form').populate({
            start: today,
            end: today,
            startTime: startTime,
            endTime: endTime
        }).end().dialog( "option", "title", todayFriendly ).dialog( "open" );
    }

    function editEvent(self, event){
        var dateFriendly = event.start.format("ddd, MMM DD, YYYY");

        //set form
        setupType(self.editEvent, event.type, event.titlePrefix);

        self.editEvent.find('form').populate({
            id: event.id,
            type: event.type,
            titlePrefix: event.titlePrefix,
            title: (''+event.title).replace(new RegExp('^'+event.titlePrefix, 'g'), ''),
            start: event.start.format('MM/DD/YYYY'),
            startTime: event.start.format('h:mma'),
            endTime: ((event.end == null) ? event.start : event.end).format('h:mma'),
            location: event.location,
            notes:event.notes
        }).end().dialog( "option", "title", dateFriendly ).dialog( "open" );
    }

    function viewEvent(self, event){
        var dateFriendly = event.start.format("ddd, MMM DD, YYYY");

        //set form
        setupType(self.viewEvent, event.type, event.titlePrefix);

        //fill fields
        self.viewEvent.find('span[data-field="title"]').html((''+event.title).replace(new RegExp('^'+event.titlePrefix, 'g'), ''));
        self.viewEvent.find('span[data-field="location"]').html(event.location);
        self.viewEvent.find('span[data-field="start"]').html(event.start.format('MM/DD/YYYY'));
        self.viewEvent.find('span[data-field="startTime"]').html(event.start.format('h:mma'));
        self.viewEvent.find('span[data-field="endTime"]').html(event.end.format('h:mma'));
        self.viewEvent.find('span[data-field="notes"]').html(event.notes);

        self.viewEvent.dialog( "option", "title", dateFriendly ).dialog( "open" );
    }
}

$(document).ready(function(){
    initCalendar()
});
