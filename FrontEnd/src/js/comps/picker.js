function initPicker(){
    var scope = $('.picker');

    //bind submit button
    $.each(scope, function(k, elem){
        var self = $(elem);

        // check instance
        if (checkInstance(self, 'picker')) return;

        var selectFieldName = self.data('selectname');
        var url = {'ajax':self.data('optionsurl')}
        var selectedUrl = {'ajax':self.data('selectedurl')}

        var itemsContainer = $(Handlebars.compile(
            '<div class="picker__itemsContainer"></div>'
        )()).appendTo(self);

        // get data
        $.get(app.jsonUrl + JSON.stringify({"ajax":self.data('optionsurl')}), function(data) {
            //take first
            data = data[0];

            // searchbox
            var search = $(Handlebars.compile(
                '<div class="picker__search" >'+
                '<input type="text" placeholder="Search {{fieldName}}"/>'+
                '<svg><use xlink:href="/images/icons.svg#magnifier"></use></svg>'+
                '</div>'
            )({fieldName:selectFieldName})).find('input[type="text"]').on('keyup', function(e){
                var searchTerm = $(this).val().toLowerCase().replace(/\s*/g, '');
                var hiddenClass = 'picker__option--hiddenSearch';

                $.each(options.find('li'), function(k, option){
                    $(option).toggleClass(hiddenClass, $(option).text().toLowerCase().indexOf(searchTerm) == -1);
                });
            }).end().appendTo(itemsContainer);

            // types
            var types = $(Handlebars.compile(
                '<ul class="picker__types">'+
                '{{#each types}}'+
                '<li class="picker__type" data-pickertypeid="{{id}}">'+
                '{{name}}'+
                '</li>'+
                '{{/each}}'+
                '</ul>'
            )({types:data.types})).find('.picker__type').on('click', function(e){
                var type = $(this);
                var typeId = type.data('pickertypeid');
                var selectedClass = 'picker__type--selected';
                var hiddenClass = 'picker__option--hiddenType';

                type.toggleClass(selectedClass).siblings('li').removeClass(selectedClass);
                $.each(options.find('li'), function(k, option){
                    $(option).removeClass(hiddenClass);
                    if (type.hasClass(selectedClass)){
                        $(option).addClass(function(index, currentClass){
                            return ($(option).data('pickeroptiontypes').toString().split(',').map(Number).indexOf(typeId)==-1)?hiddenClass:'';
                        });
                    }
                });
            }).end().appendTo(itemsContainer);

            //options
            var options = $(Handlebars.compile(
                '<ul class="picker__options">'+
                '{{#each options}}'+
                '<li class="picker__option" data-pickeroptionid="{{id}}" data-pickeroptiontypes="{{#each types}}{{id}}{{#unless @last}},{{/unless}}{{/each}}">'+
                '<svg class="picker__icon"><use xlink:href="/images/icons.svg#{{svg}}"></use></svg>'+
                '{{name}}'+
                '<svg class="picker__checkbox"><use xlink:href="/images/icons.svg#checkbox"></use></svg>'+
                '<svg class="picker__checkboxChecked"><use xlink:href="/images/icons.svg#checkboxChecked"></use></svg>'+
                '</li>'+
                '{{/each}}'+
                '</ul>'
            )({options:data.options})).find('.picker__option').on('click', function(e){
                var option = $(this);
                var optionId = option.data('pickeroptionid');
                var selectedClass = 'picker__option--selected';

                option.toggleClass(selectedClass);
                selections.find('li[data-pickeroptionid="'+optionId+'"]')
                    .toggleClass('picker__selection--selected', option.hasClass(selectedClass))
                    .insertBefore(selections.children().eq(1));
                selections.find('option[data-pickeroptionid="'+optionId+'"]').prop('selected', function(i, attr){
                    return attr ? false : true;
                }).insertBefore(selections.find('select').children().eq(1));
                selections.find('span').html(selections.children('.picker__selection--selected').length);

            }).end().appendTo(itemsContainer);

            //selection
            var selections = $(Handlebars.compile(
                '<ul class="picker__selections">'+
                '<li class="picker__count">Your {{fieldName}} (<span>0</span>) </li>'+
                '{{#each options}}'+
                '<li class="picker__selection" data-pickeroptionid="{{id}}">'+
                '<svg class="picker__icon"><use xlink:href="/images/icons.svg#{{svg}}"></use></svg>'+
                '{{name}}'+
                '<svg class="picker__remove"><use xlink:href="/images/icons.svg#remove"></use></svg>'+
                '</li>'+
                '{{/each}}'+
                '</ul>'+
                '<select name="{{fieldName}}[]" class="picker__selected" multiple>'+
                '{{#each options}}'+
                '<option value="{{id}}" data-pickeroptionid="{{id}}"/>'+
                '{{/each}}'+
                '</select>'
            )({options:data.options, fieldName:selectFieldName})).find('.picker__remove').on('click', function(e){
                var selection = $(this).parent();
                var optionId = selection.data('pickeroptionid');
                var selectedClass = 'picker__selection--selected';

                selection.removeClass(selectedClass);
                selections.find('option[data-pickeroptionid="'+optionId+'"]').removeAttr('selected');
                options.find('li[data-pickeroptionid="'+optionId+'"]').removeClass('picker__option--selected');
                selections.find('span').html(selections.children('.picker__selection--selected').length);
            }).end().appendTo(self);

            if (typeof selectedUrl.ajax !== 'undefined'){
                $.get(app.jsonUrl + JSON.stringify(selectedUrl), function(data) {
                    data = data[0];
                    $.each(data[selectFieldName].reverse(), function(k, item){
                        options.find('li[data-pickeroptionid="'+item.id+'"]').trigger('click');
                    });
                });
            }
        });
    });
}

$(document).ready(function(){
    initPicker();
});
