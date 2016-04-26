$(document).ready(function(){
    //Load menu
    var scope = $('.left-menu');

    $.each(scope, function(k, elem){
        var self = $(elem);
        var data = {ajax:"getlmenu"};

        $.get(app.jsonUrl + JSON.stringify(data), function(data) {

            //Compile the actual Template file
            var Template = Handlebars.compile(
                '{{#each data}} ​'+
                '<li class="triggerNext {{#if intopen}}initialOpen {{else}} removeBottomPadding{{/if}}">{{descr}}'+
                '    <a href="{{url}}" class="more finalTrigger" style="display: {{#if intopen}}block{{else}}hidden{{/if}};">more</a>'+
                '    {{#if plus.length}}<a href="{{plus}}" class="add"><i class="fa fa-plus-circle"></i></a>{{/if}}'+
                '    <ul style="display: {{#if intopen}}block{{else}}hidden{{/if}};">'+
                '        {{#each submenu}}'+
                '            <li class="triggerNext {{#if intopen}}initialOpen {{else}} removeBottomPadding{{/if}}" data-image="{{iconimage}}">'+
                '                <a href="{{url}}" class="{{#if submenu.length }}acceptableTrigger{{else}}finalTrigger{{/if}}">{{descr}}</a>'+
                '                <ul style="display: hidden;">'+
                '                    {{#each submenu}}'+
                '                        <li style="background: url({{iconimage}}); background-size: 18px 26px; background-repeat: no-repeat">'+
                '                            <a href="{{url}}" class="finalTrigger">{{descr}}</a>'+
                '                        </li>'+
                '                   {{/each}}'+
                '                </ul>'+
                '            </li>'+
                '        {{/each}}'+
                '    </ul>'+
                '</li>'+
                '{{/each}}'
            );

            //Generate some HTML code from the compiled Template
            self.append(Template({data:data}));

            //Bind events
            self.find(".triggerNext").on('click', function(e) {
                var self = $(this);
                var nextList = $(this).children('ul').first();

                $(this).children('a.more').toggle();

                $(nextList).slideToggle(200, function() {
                    if ($(nextList).is(":visible")) {
                        $(self).addClass('removeBottomPadding');
                    } else {
                        $(self).removeClass('removeBottomPadding');
                    }
                });

                return $(e.target).hasClass('finalTrigger');
            });
        });

    });
});