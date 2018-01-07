/**
 * Created by pi on 7/21/16.
 */
var JobLog = require('../models/pr/JobLog');
module.exports = function (app) {
    app.get('/job/jobLogList/:lineIdent', function(req, res){
        var lineIdent = req.params.lineIdent.substring(1);
        console.log(lineIdent);

        var jobLogs = JobLog.findAll({
            where: {
                LineIdent : lineIdent,
            }
        });
        res.render('job/JobLogList',
            {
                jobs : jobLogs

            });
    });
    app.get('/job/jobLogDetail/:Ident', function(req, res){
        var Ident = req.params.Ident.substring(1);
        var theJobLog = JobLog.findone({
            where :{Ident: Ident}
        });
        res.render('job/JobLogDetail',
            {
                joblog : theJobLog

            });
    });
}