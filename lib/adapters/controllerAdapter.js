/**
 * Created by pi on 8/2/16.
 */
var controllers = [];
module.exports = {
    getController: function (controllerName) {
        var controller = null;
        controllers.forEach(function (index) {
            if (controllers[index].LineIdent == lineIdent) {
                controller = controllers[index];
            }
        });
        if (!controller) {
            controller = require('../controllers/' + controllerName)();
            controller.initialize();
            controllers.push(controller);
        }
        return controller;
    }
}
