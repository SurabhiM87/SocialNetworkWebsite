var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

// replace all QS vars on page
function initQueryStringVars(){
    for (var param in qs) {
        if(!qs.hasOwnProperty(param)) continue;
        $('.qs-' + param).text(qs[param]).parent('a[href="mailto:"]').attr('href', 'mailto:'+qs[param]);
    }
}

$(document).ready(function(){
    initQueryStringVars();
});