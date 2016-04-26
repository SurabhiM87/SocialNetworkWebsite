//Logout Form
function initLogoutForm(){
    var scope = $('.logoutForm');

    $.each(scope, function(k, elem){
        var self = $(elem);

        // check instance
        if (checkInstance(self, 'logoutForm')) return;

        // add callbacks
        self.data('successCallback', function(data){
            history.go(-history.length); // Return at the beginning
            window.location.replace('/welcome.html');
        });

        self.data('failCallback', function(e){
            alert('failed to logout')
        });
    });
}

// Login Form
function initLoginForm(){
    var scope = $('.loginForm');

    $.each(scope, function(k, elem){
        var self = $(elem);

        // check instance
        if (checkInstance(self, 'loginForm')) return;

        // add validator
        self.data('validator', function(){
            //replace with plugin
            if (self.find('input[name="username"]').val() == ''){
                alert('name missing');
                return false;
            }
            if (self.find('input[name="password"]').val() == ''){
                alert('pass missing');
                return false;
            }

            return true;
        });

        // add callbacks
        self.data('successCallback', function(data){
            window.location.href = '/home.html';
        });

        self.data('failCallback', function(e){
            alert('failed to login')
        });
    });
}

// auto init on page loads
$(document).ready(function(){
    initLogoutForm();
    initLoginForm();
});
