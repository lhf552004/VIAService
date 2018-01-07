/**
 * Created by pi on 8/3/16.
 */
var fs = require('fs');
var path = require('path');
var navs = [];
function getNav(menus) {

    menus.forEach(function (curMenu) {
        if (curMenu.navigation && curMenu.navigation == true) {
            navs.push({
                name:curMenu.name,
                index: curMenu.index
            });
        }
        if (curMenu.SubMenus) {
            getNav(curMenu.SubMenus);
        }
    });
    return navs;
}
module.exports = function (menus) {
    navs = [];
    return getNav(menus);
};