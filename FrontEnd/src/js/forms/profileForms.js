//Logout Form
function initUserSportsForm(){
    var scope = $('.userSportsForm');

    $.each(scope, function(k, elem){
        var self = $(elem);

        // check instance
        if (checkInstance(self, 'userSportsForm')) return;

        // add callbacks
        self.data('successCallback', function(data){
            alert('yay');
        });

        self.data('failCallback', function(e){
            alert('failed set sports')
        });
    });
}

// auto init on page loads
$(document).ready(function(){
    initUserSportsForm();
});
