/**
 * Created by pi on 8/8/16.
 */
var _ = require('underscore'),
    names = require('./name');

findSuperman(names());

function findSuperman(values) {
    _.find(values, function(name) {
        if (name === 'Clark Kent') {
            console.log('It\'s Superman!');
        } else {
            console.log('... No superman!');
        }
    });
}