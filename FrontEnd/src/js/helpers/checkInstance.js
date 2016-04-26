// check if mmr plugin is already instantiated
function checkInstance(elem, instnace){
    if (typeof elem.data('mmr-' + instnace) === 'undefined'){
        elem.data('mmr-' + instnace, true);
        return false;
    } else {
        return true;
    }
}