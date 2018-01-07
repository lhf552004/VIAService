/**
 * Created by pi on 8/9/16.
 */

module.exports = function (theType, i18n) {
    var options = [];
    for (var pro in theType) {
        if (theType.hasOwnProperty(pro)) {
            var option = {};
            option.name = i18n.__(pro);
            option.value = theType[pro];
            options.push(option);
            console.log('option: ' + JSON.stringify(option));
        }
    }
    return options;
};
