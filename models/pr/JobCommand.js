/**
 * Created by pi on 8/2/16.
 */
//TODO: change codeing style
var Job = require('Job');
var JobCommand = function () {
    this._weight = 0.0;
    this._job = null;

};
JobCommand.prototype={
    //
    get Weight() {
        return this._weight;
    },
    set Weight( value ) {
        this._weight = value;
    },
    //
    get Job() {
        return this._job;
    },
    set Job( value ) {
        this._job = value;
    },
    //
    get IngredientComponent() {
        return this._ingredientComponent;
    },
    set IngredientComponent( value ) {
        this._ingredientComponent = value;
    },
    //
    get SpecialBin() {
        return this._specialBin;
    },
    set SpecialBin( value ) {
        this._specialBin = value;
    },
    //
    get TargetSection() {
        return this._targetSection;
    },
    set TargetSection( value ) {
        this._targetSection = value;
    },
    get FinalDestinationSection() {
        return this._finalDestinationSection;
    },
    set FinalDestinationSection( value ) {
        this._finalDestinationSection = value;
    },
    get LineToAssign() {
        return this._lineToAssign;
    },
    set LineToAssign( value ) {
        this._lineToAssign = value;
    },

};


module.exports = JobCommand;