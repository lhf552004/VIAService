/**
 * Created by pi on 8/24/16.
 */

module.exports.centuralAuth = function (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){

        console.log('is Authenticated!!!');
        return next();
    }


    // if they aren't redirect them to the home page
    res.redirect('/');
};
module.exports.adminAuth = function (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){

        console.log('is Authenticated!!!');
        return next();
    }


    // if they aren't redirect them to the home page
    res.redirect('/');
};
module.exports.handtakeAuth = function (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){

        console.log('is Authenticated!!!');
        return next();
    }


    // if they aren't redirect them to the home page
    res.redirect('/');
};
module.exports.intakeAuth = function (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){

        console.log('is Authenticated!!!');
        return next();
    }


    // if they aren't redirect them to the home page
    res.redirect('/');
};
module.exports.packerAuth = function (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){

        console.log('is Authenticated!!!');
        return next();
    }


    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports.warehouseAuth = function (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){

        console.log('is Authenticated!!!');
        return next();
    }


    // if they aren't redirect them to the home page
    res.redirect('/');
};
module.exports.dispatchAuth = function (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){

        console.log('is Authenticated!!!');
        return next();
    }


    // if they aren't redirect them to the home page
    res.redirect('/');
};