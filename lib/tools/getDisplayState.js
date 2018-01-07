/**
 * Created by pi on 8/5/16.
 */


module.exports = function (StateEnum, stateValue) {
    var displayState ='';
    for(var stateName in StateEnum){
        if(StateEnum.hasOwnProperty(stateName)){
            if(StateEnum[stateName]==stateValue){
                // displayState = i18n.__(stateName);
                console.log('stateName: ' + stateName);
                displayState = stateName;
                return displayState;
            }
        }

    }
    if(displayState ==''){
        return stateValue;
    }
};