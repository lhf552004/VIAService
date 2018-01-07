/**
 * Created by pi on 8/24/16.
 */
var Element = function () {
    this.Commands = {};
    this.HardwareIO = {};
    this.Information = {};
    this.Parameter = {};
    this.States = {};
};
Element.prototype ={};

var Unit = function () {
    this.Commands = {};
    this.Information = {};
    this.Parameter = {};
    this.States = {};
};
Unit.prototype={};


var BeltMonitor = function () {
 this.Commands = {
     CmdFaultReset: false,
     CmdMonitoringEnable: false,
     CmdUsebyUnitIdent: '',
     CmdUsebyUnitType: ''
 };
 this.HardwareIO = {
     ValInput1: false
 };
 this.Information = {
     InfListIdent: '',
     InfType: ''
 };
 this.Parameter = {
     ParAdrInput1: '',
     ParMonitoringTime: ''
 };
 this.States = {
     StaFaulted: '',
     StaHealty: ''
 };
};
BeltMonitor.prototype = {};


var FilterControl = function () {
this.Commands = {
    CmdEnable: false,
    CmdEnableIdling: false,
    CmdFaultReset: false,
    CmdInterlock: false,
    CmdManual: false,
    CmdService: false,
    CmdUseByUnitIdent: '',
    CmdUseByUnitType: ''
};
this.HardwareIO = {
    ValInput1: false,
    ValOutput1: false
};
this.Information = {
    InfListIdent: '',
    InfType: ''
};
this.Parameter = {
    ParAdrInput1: '',
    ParAdrOutput1: '',
    ParRelatedToUnitIdent1: '',
    ParRelatedToUnitIdent2: '',
    ParRelatedToUnitIdent3: '',
    ParRelatedToUnitIdent4: '',
    ParRelatedToUnitType1: '',
    ParRelatedToUnitType2: '',
    ParRelatedToUnitType3: '',
    ParRelatedToUnitType4: '',
    ParTimeOut: '',
    ParWithInputFeedback: ''
};
this.States = {
    StaFault: false,
    StaStarted: false,
    StaStarting: false,
    StaStopped: false,
    StaStopping: false
};

};
FilterControl.prototype = {};

var HighLevel = function () {
this.Commands = {
    CmdFaultReset: false,
    CmdUsebyUnitIdent: false,
    CmdUsebyUnitType: false
};
this.HardwareIO = {
    ValInput1: false,
    ValInput2: false
};
this.Information = {
    InfListIdent: '',
    InfType: ''
};
this.Parameter = {
    ParAdrInput1: '',
    ParAdrInput2: '',
    ParCoverTime: '',
    ParUncoverTime: ''
};
this.States = {
    StaCover: false,
    StaCovered: false,
    StaFaulted: false,
    StaUncover: false,
    StaUncovered: false
};
};
HighLevel.prototype = {};


var LowLevel = function () {
    this.Commands = {
        CmdFaultReset: false,
        CmdUsebyUnitIdent: false,
        CmdUsebyUnitType: false
    };
    this.HardwareIO = {
        ValInput1: false,
        ValInput2: false
    };
    this.Information = {
        InfListIdent: '',
        InfType: ''
    };
    this.Parameter = {
        ParAdrInput1: '',
        ParAdrInput2: '',
        ParCoverTime: '',
        ParUncoverTime: ''
    };
    this.States = {
        StaCover: false,
        StaCovered: false,
        StaFaulted: false,
        StaUncover: false,
        StaUncovered: false
    };
};
LowLevel.prototype = {};

//=====================================

var SimpleMotor = function () {
    this.Commands = {
        CmdEnable: false,
        CmdEnableIdling: false,
        CmdFaultReset: false,
        CmdInterlock: false,
        CmdManual: false,
        CmdService: false,
        CmdUseByUnitIdent: '',
        CmdUseByUnitType: ''
    };
    this.HardwareIO = {
        ValInput1: false,
        ValOutput1: false
    };
    this.Information = {
        InfListIdent: '',
        InfType: ''
    };
    this.Parameter = {
        ParAdrInput1: '',
        ParAdrOutput1: '',
        ParRelatedToUnitIdent1: '',
        ParRelatedToUnitIdent2: '',
        ParRelatedToUnitIdent3: '',
        ParRelatedToUnitIdent4: '',
        ParRelatedToUnitType1: '',
        ParRelatedToUnitType2: '',
        ParRelatedToUnitType3: '',
        ParRelatedToUnitType4: '',
        ParTimeOut: ''
    };
    this.States = {
        StaFault: false,
        StaStarted: false,
        StaStarting: false,
        StaStopped: false,
        StaStopping: false
    };
};
SimpleMotor.prototype = {};

var SpeedMonitor = function () {
 this.Commands = {
     CmdFaultReset: false,
     CmdMonitoringEnable: false,
     CmdUsebyUnitIdent: '',
     CmdUsebyUnitType: ''
 };
 this.HardwareIO = {
     ValInput1: false
 };
 this.Information = {
     InfListIdent: '',
     InfType: ''
 };
 this.Parameter = {
     ParAdrInput1: '',
     ParMonitoringTime: ''
 };
 this.States = {
     StaFaulted: false,
     StaHealty: false
 };

};

SpeedMonitor.prototype = {};

var ValveOpenClose = function () {
 this.Commands = {
     CmdEnable: false,
     CmdEnableIdling: false,
     CmdFaultReset: false,
     CmdInterlock: false,
     CmdManual: false,
     CmdService: false,
     CmdUseByUnitIdent: '',
     CmdUseByUnitType: ''
 };
 this.HardwareIO = {
     ValInput1: false,
     ValInput2: false,
     ValOutput1: false,
     ValOutput2: false
 };
 this.Information = {
     InfListIdent: '',
     InfType: ''
 };
 this.Parameter = {
     ParAdrInput1: '',
     ParAdrInput2: '',
     ParAdrOutput1: '',
     ParAdrOutput2: '',
     ParRelatedToUnitIdent1: '',
     ParRelatedToUnitIdent2: '',
     ParRelatedToUnitIdent3: '',
     ParRelatedToUnitIdent4: '',
     ParRelatedToUnitType1: '',
     ParRelatedToUnitType2: '',
     ParRelatedToUnitType3: '',
     ParRelatedToUnitType4: '',
     ParTimeOut: ''
 };
this.States = {
    StaClosed: false,
    StaClosing: false,
    StaFault: false,
    StaOpened: false,
    StaOpening: false
};


};

ValveOpenClose.prototype={};

var LBCA = function () {
this.Commands = {
    CmdEnable: false,
    CmdEnableIdling: false,
    CmdFaultReset: false,
    CmdInterlock: false,
    CmdUseByUnitIdent: '',
    CmdUseByUnitType: ''

};
this.Information = {
    InfListIdent: '',
    InfType: ''
};
this.Parameter = {
    ParIdelingTime: '',
    ParRelatedToUnitIdent1: '',
    ParRelatedToUnitIdent2: '',
    ParRelatedToUnitIdent3: '',
    ParRelatedToUnitIdent4: '',
    ParRelatedToUnitType1: '',
    ParRelatedToUnitType2: '',
    ParRelatedToUnitType3: '',
    ParRelatedToUnitType4: '',
    ParStartDelay: '',
    ParStartingTime: '',
    ParStopDelay: '',
    ParStoppingTime: '',
    ParWithOverflowFlap: false,
    ParWithSpeedMonitor: false

};
this.States = {
    StaFault: false,
    StaIdeling: false,
    StaStarted: false,
    StaStarting: false,
    StaStopped: false,
    StaStopping: false
};

};

LBCA.prototype={};

var LBEA = function () {
this.Commands = {
    CmdEnable: false,
    CmdEnableIdling: false,
    CmdFaultReset: false,
    CmdInterlock: false,
    CmdUseByUnitIdent: '',
    CmdUseByUnitType: ''

};
this.Information = {
    InfListIdent: '',
    InfType: ''
};
this.Parameter = {
    ParIdelingTime: '',
    ParRelatedToUnitIdent1: '',
    ParRelatedToUnitIdent2: '',
    ParRelatedToUnitIdent3: '',
    ParRelatedToUnitIdent4: '',
    ParRelatedToUnitType1: '',
    ParRelatedToUnitType2: '',
    ParRelatedToUnitType3: '',
    ParRelatedToUnitType4: '',
    ParStartDelay: '',
    ParStartingTime: '',
    ParStopDelay: '',
    ParStoppingTime: '',
    ParWithBeltMonitor1: false,
    ParWithBeltMonitor2: false,
    ParWithBeltMonitor3: false,
    ParWithBeltMonitor4: false,
    ParWithSpeedMonitor: false

};
this.States = {
    StaFault: false,
    StaIdeling: false,
    StaStarted: false,
    StaStarting: false,
    StaStopped: false,
    StaStopping: false
};

};

LBEA.prototype ={};

var MVRW = function () {
this.Commands = {
    CmdEnable: false,
    CmdEnableIdling: false,
    CmdFaultReset: false,
    CmdInterlock: false,
    CmdUseByUnitIdent: '',
    CmdUseByUnitType: ''

};
this.Information = {
    InfListIdent: '',
    InfType: ''
};
this.Parameter = {
    ParIdelingTime: '',
    ParRelatedToUnitIdent1: '',
    ParRelatedToUnitIdent2: '',
    ParRelatedToUnitIdent3: '',
    ParRelatedToUnitIdent4: '',
    ParRelatedToUnitType1: '',
    ParRelatedToUnitType2: '',
    ParRelatedToUnitType3: '',
    ParRelatedToUnitType4: '',
    ParStartDelay: '',
    ParStartingTime: '',
    ParStopDelay: '',
    ParStoppingTime: '',
    ParWithFilterControl: false

};
this.States = {
    StaFault: false,
    StaIdeling: false,
    StaStarted: false,
    StaStarting: false,
    StaStopped: false,
    StaStopping: false
};

};

MVRW.prototype ={};

var Line = function () {
    this.Commands = {
        CmdEnable: false,
        CmdEnableIdling: false,
        CmdFaultReset: false,
        CmdInterlock: false,
        CmdManual: false,
        CmdService: false,
        CmdUseByUnitIdent: '',
        CmdUseByUnitType: ''
    };
    this.HardwareIO = {
        ValInput1: false,
        ValOutput1: false
    };
    this.Information = {
        InfListIdent: '',
        InfType: ''
    };
    this.Parameter = {
        ParIdelingTime: '',
        ParStartDelay: '',
        ParStartingTime: '',
        ParStopDelay: '',
        ParStoppingTime: '',
        ParWithFilterControl: false
    };
    this.States = {
        StaFault: false,
        StaStarted: false,
        StaStarting: false,
        StaStopped: false,
        StaStopping: false
    };
};
Line.prototype = {};
module.exports.Element = Element;
module.exports.Unit = Unit;
module.exports.BeltMonitor = BeltMonitor;
module.exports.FilterControl = FilterControl;
module.exports.HighLevel = HighLevel;
module.exports.LowLevel = LowLevel;
module.exports.SimpleMotor = SimpleMotor;
module.exports.SpeedMonitor = SpeedMonitor;
module.exports.ValveOpenClose = ValveOpenClose;
module.exports.LBCA = LBCA;
module.exports.LBEA = LBEA;
module.exports.MVRW = MVRW;
module.exports.Line = Line;