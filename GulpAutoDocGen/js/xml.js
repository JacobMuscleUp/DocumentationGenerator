const fs = require('fs');
const utils = require('./utils');

module.exports = {
    genFileXML: function (path, callback) {
        fs.writeFile(path, this.toString(), (err) => {
            if (err) throw err;
            callback(path);
        });
    }
};