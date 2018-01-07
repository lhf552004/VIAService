/**
 * Created by Operator on 8/4/2016.
 */
var ConfigureMenus = require('../../config/menu');
var translateMenuName = function (theMenus, i18n) {
    theMenus.forEach(function (curMenu) {
        curMenu.name = i18n.__(curMenu.name);
        if (curMenu.SubMenus) {
            translateMenuName(curMenu.SubMenus, i18n);
        }
    });
};
var copyPlainArray = function (theArray) {
    var newArray = new Array(theArray.length);
    for (var index in theArray) {
        var newItem = {};
        var item = theArray[index];
        for(var p in item){
            if(Array.isArray(item[p])){
                newItem['SubMenus'] = copyPlainArray(item[p]);
            }else if(p === 'navigation'){
                newItem[p] = item[p];
                newItem['index'] = item.name;
            }else {
                newItem[p] = item[p];
            }
        }
        // if (item) {
        //     if (item.name) {
        //         newItem['name'] = item.name;
        //     }
        //     if (item.url) {
        //         newItem['url'] = item.url;
        //     }
        //     if (item.keepPage) {
        //         newItem['keepPage'] = item.keepPage;
        //     }
        //     if (item.navigation) {
        //         newItem['navigation'] = item.navigation;
        //         newItem['index'] = item.name;
        //     }
        //     if (item.SubMenus) {
        //         newItem['SubMenus'] = copyPlainArray(item.SubMenus);
        //     }
        // }
        if(newItem.name)
        {
            newArray[index] =newItem;
        }

    }
    return newArray;
};

module.exports = function ( i18n) {
    //console.log('Warehouse from original ConfigureMenus: ' + ConfigureMenus[0].name);
    var translatedMenus = copyPlainArray(ConfigureMenus);
    // if (translatedMenus === ConfigureMenus) {
    //     console.log('new array is the same with old array');
    // }
    // else {
    //     console.log('new array is different with old array');
    // }
    //console.log('translatedMenus: ' + translatedMenus.length);
    //console.log('TranslatedMenus type: ' + typeof(translatedMenus));
    translateMenuName(translatedMenus, i18n);
    //console.log('Warehouse from original ConfigureMenus: ' + ConfigureMenus[0].name);
    //console.log('Warehouse from translated ConfigureMenus: ' + translatedMenus[0].name);
    return translatedMenus;
};