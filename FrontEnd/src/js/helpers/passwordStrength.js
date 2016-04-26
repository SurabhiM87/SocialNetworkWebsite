function addPasswordStrength(passwordField, strengthBar){
    // listen to keyup
    passwordField.on('keyup', function(){
        strengthBar.empty();
        var strength = passwordStrength(passwordField.val());
        for (var i =0; i < strength.score; i++){
            strengthBar.append($('<div>', {"class":"confirmSignupForm__bar"}).html('X'));
        }
        strengthBar.append($('<div>', {"class":"confirmSignupForm__strengthMessage"}).html(strength.msg));
    })
}

function passwordStrength(password) {
    var score = 0;
    var textValues = ['', 'weak', 'medium', 'strong'];

    // +1 length over 6
    if (password.length > 6) {
        score++;
    }

    // +1 letter
    if ((password.match(/[a-z]/)) && (password.match(/[A-Z]/))) {
        score++;
    }

    // +1 number
    if (password.match(/\d+/)) {
        score++;
    }

    // +1 symbol
    if (password.match(/[^a-z\d]+/)) {
        score++;
    };

    // +1 length over 12
    if (password.length > 12) {
        score++;
    }

    var roundedScore = Math.floor(score * 3 / 5);
    return {"score": roundedScore, "msg":textValues[roundedScore]};
}