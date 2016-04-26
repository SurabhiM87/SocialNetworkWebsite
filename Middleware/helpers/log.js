// add time to log

console.logCopy = console.log.bind(console);

module.exports = function(response, content) {
    if (arguments.length){
        var args = arguments;
        args[0] = '[' + new Date().toString() + '] ' + arguments[0];
        this.logCopy.apply(this, args);
    }
}