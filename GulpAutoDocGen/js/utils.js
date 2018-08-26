module.exports = {
    stringFormat: function () {
        a = this;
        for (k in arguments) {
            a = a.replace("{" + k + "}", arguments[k]);
        }
        return a;
    }
    , formalMemberType: function (abbrMemberType) {
        switch (abbrMemberType) {
            case 'F':
                return 'Field';
            case 'M':
                return 'Method';
            case 'P':
                return 'Property';
            case 'E':
                return 'Event';
            default:
                return 'Undefined';
        }
    }
    , cscValidPath: function (path) {
        return '"' + path + '"';
    }
    , values: function (obj) {
        var values = [];
        for (var key in obj)
            values.push(obj[key]);
        return values;
    }
    , args: (argList) => {
        let args = {}, opt, optTrimmed, optCurrent;
        for (var ndx = 0; ndx < argList.length; ++ndx) {
            optTrimmed = argList[ndx].trim();
            opt = optTrimmed.replace(/^\-+/, '');

            // argument value
            if (opt === optTrimmed) {
                if (optCurrent)
                    args[optCurrent] = opt;
                optCurrent = null;
            }
            // argument name
            else {
                optCurrent = opt;
                args[optCurrent] = true;
            }
        }
        return args;
    }
    , min : function(/*args*/) {
        var min = arguments[0];
        for (var i = 1; i < arguments.length; ++i)
            if (arguments[i] < min)
                min = arguments[i];
        return min;
    }
}
