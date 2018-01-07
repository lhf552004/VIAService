/**
 * Created by pi on 8/2/16.
 */

/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 *
 * @param {function} proto is the prototype of the function which needs to inherit.
 * @param {function} superProto the prototype of the function to inherit from.
 * @throws {TypeError} Will error if either constructor is null, or if
 *     the super constructor lacks a prototype.
 *
 */
exports.inherits = function (proto, superProto) {

    if (proto === undefined || proto === null)
        throw new TypeError('The prototype to `inherits` must not be ' +
            'null or undefined.');

    if (superProto === undefined || superProto === null)
        throw new TypeError('The super prototype to `inherits` must not ' +
            'be null or undefined.');

    for (var p in superProto) {
        // console.log('try to inherits p: ' + p);
        // console.log('type p: ' + typeof (superProto[p]) );
        if (typeof (superProto[p]) === 'function') {
            // console.log('inherits p: ' + p);
            proto[p] = superProto[p];
        }

    }
};
exports.pad = function (num, size) {
    var s = "000000000" + num;
    return s.substr(s.length - size);
};
exports.getDisplayState = function (StateEnum, stateValue) {
    var displayState ='';
    for(var stateName in StateEnum){
        if(StateEnum.hasOwnProperty(stateName)){
            if(StateEnum[stateName]==stateValue){
                // displayState = i18n.__(stateName);
                console.log('stateName: ' + stateName);
                displayState = stateName;
                return displayState;
            }
        }

    }
    if(displayState ==''){
        return stateValue;
    }
};
