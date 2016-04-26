// Singup
function initSignupForm(){
    var scope = $('.signupForm');

    $.each(scope, function(k, elem){
        var self = $(elem);

        // check instance
        if (checkInstance(self, 'signupForm')) return;

        // add callbacks
        self.data('successCallback', function(data){
            window.location.href = '/signup/thanks.html?email='+self.find('input[name="email"]').val();
        });

        self.data('failCallback', function(data){
            for (var msg in data[0].msgs){
                alert(data[0].msgs[msg].msg)
            }
        });
    });
}

// Confirm Singup
function initConfirmSignupForm(){
    var scope = $('.confirmSignupForm');

    $.each(scope, function(k, elem){
        var self = $(elem);

        // check instance
        if (checkInstance(self, 'confirmSignupForm')) return;

        var passwordField = self.find('input[name="password"]');
        var strengthBar = self.find('.confirmSignupForm__passwordStrength');

        //check token
        var token = qs.token;
        if (typeof token === 'undefined'){
            window.location.href = '/welcome.html';
        } else {
            self.append($('<input/>', {"type":"hidden","name":"token", "value":token}));
        }

        //add password strength
        addPasswordStrength(passwordField, strengthBar);

        // add validator
        self.data('validator', function(){
            return true;
        });

        // add callbacks
        self.data('successCallback', function(data){
            window.location.href = '/welcome.html';
        });

        self.data('failCallback', function(e){
            alert('failed to confirm')
        });
    });
}

// Request Reset Password
function initRequestResetPasswordForm(){
    var scope = $('.requestResetPasswordForm');

    $.each(scope, function(k, elem){
        var self = $(elem);

        // check instance
        if (checkInstance(self, 'requestResetPasswordForm')) return;

        // add callbacks
        self.data('successCallback', function(data){
            window.location.href = '/resetPassword/thanks.html';
        });

        self.data('failCallback', function(data){
            for (var msg in data[0].msgs){
                alert(data[0].msgs[msg].msg)
            }
        });
    });
}

// Reset Password Form
function initResetPasswordForm(){
    var scope = $('.resetPasswordForm');

    $.each(scope, function(k, elem){
        var self = $(elem);

        // check instance
        if (checkInstance(self, 'resetPasswordForm')) return;

        self.append($('<input/>', {"type":"hidden","name":"token", "value":qs.token}))

        // add callbacks
        self.data('successCallback', function(data){
            window.location.href = '/welcome.html';
        });

        self.data('failCallback', function(data){
            for (var msg in data[0].msgs){
                alert(data[0].msgs[msg].msg)
            }
        });
    });
}

// auto init on page loads
$(document).ready(function(){
    initSignupForm();
    initConfirmSignupForm();
    initRequestResetPasswordForm();
    initResetPasswordForm();
});
