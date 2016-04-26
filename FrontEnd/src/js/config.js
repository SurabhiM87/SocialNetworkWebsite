// Global AJAX Settings
$.ajaxSetup({
    xhrFields: {
        withCredentials: true
    },
    crossDomain: true,
    error:function(e){
        //REDIRECT HOME ON 403
        if (e.status === 403){
            window.location.href = '/welcome.html';
        }
    }
});
