/**
 * Created by pi on 8/8/16.
 */
var LineCategory = {
    // This line is a batch mixing line
    BatchMixingLine: 0,
    //This line is a continuous transport line
    ContinuousTransportLine: 1,
    //This line is a continuous mixing line
    ContinuousMixingLine: 2,
    //not one of the other types
    Other: 5,
    //This line is a pseudo line for the warehouse handling
    Warehouse: 6
};

module.exports = LineCategory;