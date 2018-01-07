/**
 * Created by pi on 8/8/16.
 */
var SectionCategory = {
    // This line is a batch mixing line
    Undefined: 0,
    //This line is a continuous transport line
    DataHolding: 1,
    //This line is a continuous mixing line
    Dosing: 2,
    //not one of the other types
    Mixing: 3,
    //Packing
    Packing: 4,
    //Palleting
    Palleting:5,
    //App01
    App01: 50,
    //App02
    App02: 51,
    //App03
    App03: 53
};

module.exports = SectionCategory;