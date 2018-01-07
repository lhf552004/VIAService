/**
 * Created by pi on 9/12/16.
 */
var Job = require('../models/pr/Job');
var JobState = require('../lib/stateAndCategory/jobState');
Job.createJob({
    ident: 'Test001',
    name: 'INT1',
    lineIdent: 'INT1',
    visible: true,
    isTemplate: false,
    locked: true,
    targetWeight: 0.0,
    actualWeight: 0.0,
    state: JobState.Created,
    LineId: 1});