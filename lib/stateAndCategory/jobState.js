/**
 * Created by pi on 7/21/16.
 */
var JobState = {
    Undefined: 0,
    Waiting: 10,
    Error: 15,
    WaitingForRoute: 20,

    /*
    * Job has been started and is waiting for a project specific start condition
    * */
    WaitingForStartCondition: 25,
    /*
     The job is loading down to the PLC.
    * */
    Loading: 30,

    ModifyingRoute: 35,

    ReroutingOtherLine: 36,

    Active: 40,

    HandAdd: 41,

    Mixing: 42,

    Packing: 43,

    Palleting: 44,

    Suspended: 50,

    Interrupted: 60,

    ManualOperation: 70,

    Interrupting: 72,

    ManualRegistration: 75,

    Done: 80,

    Created: 120,

    Released: 121,

    Scheduled: 122,

    App01: 10001,

    App02: 10002,

    App03: 10003,

    App04: 10004,

    App05: 10005,

    App06: 10006,

    App07: 10007,

    App08: 10008,

    App09: 10009,

    App10: 10010
};

module.exports = JobState;