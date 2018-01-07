/**
* @description		Includes all costum Javascripts
* @version			2.0
* @autor			Jan Oswald GP92
* @modification		24.05.11(JanOswald) // created
*                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
*
**/

/**==============================================================================================================================
* @description		Main Init, execute if page is loaded
* @version			0.8
* @autor			Jan Oswald GP92
*
**/
$(document).ready(function() {

    // show loading screen
    WebVisu.showLoading();

    // Initialize all viewing-processes
    WebVisu.init();

    // load debug-mode
    if (WebVisu.DebugMode == true) {
        tabView.init();
        svgView.init();
    }

    // Needed only once at the beginning. After that, the object is not used.
    this.winLoadTimer = window.setTimeout("WebVisu.hideLoading()", WebVisu.forceFadeOutTime)
});

/**==============================================================================================================================
* @description		Class for WebVisu
* @version			0.9
* @autor			Jan Oswald GP92
* @modification		19.08.10(JanOswald) // created
*                   09.09.10(JanOswald)	// add comments
*                   16.05.11(JanOswald) // add ie9 support and add Config-Properties
*                   24.06.11(JanOswald) // add function for global comunication in Viewer
*                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
*
**/
var WebVisu = {

    "updateActive": false,                              // RTValue: Toggle to prevent multiple function calls for update
    "eventActive": false,                               // RTValue: Toggle to prevent multiple function calls for clickevent on element

    "eventMouseMoveCount": 0,                           // RTValue: Event Counter for Mouse Movement
    "eventMouseMoveSensitivity": 3,                    // Const: Sensitivity of the Mouse Movement

    "eventMouseWheelCount": 0,                          // RTValue: Event Counter for Mouse Wheel
    "eventMouseWheelSensitivity": 5,                    // Const: Sensitivity of the Mouse Wheel

    "eventKeyPressedCount": 0,                          // RTValue: Event Counter for Key pressed
    "eventKeyPressedSensitivity": 5,                    // Const: Sensitivity of the Key pressed

    "mouseDown": false,                                 // RTValue: Mouse button is down

    "mouseDownPosX": 0,                                 // RTValue: Mouse down click position X
    "mouseDownPosY": 0,                                 // RTValue: Mouse down click position Y

    "mouseUpPosX": 0,                                   // RTValue: Mouse up click position X
    "mouseUpPosY": 0,                                   // RTValue: Mouse up click position Y

    "scrollPosX": 0,                                    // RTValue: Scrollbar position X
    "scrollPosY": 0,                                    // RTValue: Scrollbar position Y
    "scrollPosMouseDownUpX": 0,                         // RTValue: Scrollbar position X if mouse down
    "scrollPosMouseDownUpY": 0,                         // RTValue: Scrollbar position Y if mouse down

    "frameHeight": 0,                                   // RTValue: $('#svgFrame').innerHeight();
    "frameWidth": 0,                                    // RTValue: $('#svgFrame').innerWidth();
    "frameBarOffset": 25,                               // Const: Frame Bar Offset to the border
    "frameOffset": 1,                                   // Const: Frame Offset to the border

    "cursorStep": 3,                                    // Const: Moving steps if using cursor

    "fadeOutTime": 800,                                 // Const: Fade Out timer to hide waiting sign
    "forceFadeOutTime": 10000,                          // Const: Fade Out timer to force hideing wait sign

    "DebugMode": false,                                 // IIS: SessionServerParam.DebugMode -> CentralConfigParam.DebugMode
    "AutoResize": false,                                // IIS: CentralConfigParam.AutoResize -> CentralConfigParam.DebugMode

    "ScalePercentage": 100,                             // IIS: SessionParamWkst.ScalePercentage -> From Operating
    "ShowAllIdent": true,                               // IIS: SessionParamWkst.ShowAllIdent -> From Operating
    "ShowAllInfoElement": true,                         // IIS: SessionParamWkst.ShowAllInfoElement -> From Operating

    "ZoomSteps": new Array,                             // IIS: Possible Zoom Factors for runtime zooming the pictures
    "ZoomIndex": 0,                                     // RTValue: Current Zoom Index regarding to the ZoomSteps array
    "ZoomInOut": 0,                                     // IIS: SessionParamWkst.ZoomInOut -> From Touch Operating

    "CounterLog": 1,                                    // Not used yet
    "CounterProcessLog": 1,                             // RTValue: Counter for Process Log Listing in Log Category
    "CounterUpdConfirm": 0,                             // RTValue: Count only update
    "CounterEvent": 0,                                  // RTValue: Count only event
    "CounterError": 0,                                  // RTValue: Count the total errors while running
    "CounterTriggerJava": 0,                            // RTValue: Count the total update trigger from Java
    "CounterTriggerRequest": 0,                         // RTValue: Count the total update trigger for Requests
    "CounterLineChange": 0,                             // RTValue: Count the total line change calls
    "CounterUpdateTries": 0,                            // RTValue: Counter before stop updateing

    "counterProcLogOffsetStart": 35,                    // Const: CounterProcessLogOffsetStart Index
    "counterProcLogOffsetEnd": 20,                      // Const: CounterProcessLogOffsetEnd Index

    "stopUpdate": false,                                // RTValue: Switch to active / deactivate update routine
    "stopLineChange": false,                            // RTValue: Switch to active / deactivate line change routine

    "maxUpdateTries": 20,                               // RTValue: Max tries to update the visualisation.

    "needHandlerAttach": 5,                             // RTValue: After showing new Svg, scaling is necessary that many times
    "needScaling": 5,                                   // RTValue: After showing new Svg, scaling is necessary that many times
    "needRefresh": 0,                                   // RTValue: Refresh this page that many times -> Need for optimised fit of drawing in frame

    "SvgFileArray": new Object(),                       // RTValue: This is the list of the latest 10 drawing been showed
    "curDrawingRef": undefined,                         // RTValue: This is the currently showing drawing Reference

    "HttpVisuUpdatePath": "/visuUpdate",                // Const: Http Path to the update request
    "HttpVisuEventPath": "/visuEvent",                  // Const: Http Path to the event / click request

    "startTime": 'undefined',                           // RTValue: Calculates the statistic processing one request
    "endTime": 'undefined',                             // RTValue: Calculates the statistic processing one request

    "winUpdTimer": 0,                                   // RTValue: Timer Object
    "winLoadTimer": 0,                                  // RTValue: Timer Object -> To hide the loading after a long while

    "lastControllerHeartBeat": 0,                       // RTValue: Heart beat from VOC controller

    /**
    * @description		Initialize all viewing-processes
    * @version			0.05
    * @autor			Jan Oswald GP92
    * @modification		19.08.10(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    "init": function() {
        // init local variables
        if (SessionServerParam.DebugMode == 'True') {
            this.DebugMode = true;
        }
        this.HttpVisuUpdatePath = "/" + SessionServerParam.UrlPath + "/visuUpdate";
        this.HttpVisuEventPath = "/" + SessionServerParam.UrlPath + "/visuEvent";

        if (SessionServerParam.AutoResize == 'True') {
            this.AutoResize = true;
        }

        this.frameHeight = $('#svgFrame').innerHeight();
        this.frameWidth = $('#svgFrame').innerWidth();

        var mySplitResult = SessionServerParam.ZoomSteps.split(";");

        if (mySplitResult != undefined && mySplitResult.length > 0) {
            WebVisu.ZoomSteps = new Array;
            for (i = 0; i < mySplitResult.length; i++) {
                if (mySplitResult[i] > 0.1 && mySplitResult[i] < 5) {
                    WebVisu.ZoomSteps.push(mySplitResult[i]);
                }
            }
        }
        else {
            // Default zoom factors
            this.ZoomSteps.push(0.7);
            this.ZoomSteps.push(0.8);
            this.ZoomSteps.push(0.9);
            this.ZoomSteps.push(1);
            this.ZoomSteps.push(1.1);
            this.ZoomSteps.push(1.2);
            this.ZoomSteps.push(1.3);
            this.ZoomSteps.push(1.4);
            this.ZoomSteps.push(1.5);
            this.ZoomSteps.push(1.6);
            this.ZoomSteps.push(1.7);
        }

        // Needed to prevent jumps while zooming with mouse wheel
        WebVisu.ZoomSteps.sort();

        WebVisu.ZoomIndex = 0;
        for (i = 0; i < WebVisu.ZoomSteps.length; i++) {
            if (WebVisu.ZoomSteps[i] >= 1) {
                WebVisu.ZoomIndex = i;
                i = WebVisu.ZoomSteps.length;
            }
        }

        $('#zoomstepminmax').html('Min: ' + WebVisu.ZoomSteps[0] + ' / Max: ' + WebVisu.ZoomSteps[WebVisu.ZoomSteps.length - 1]);

        // starts updateprogress if svg is loaded
        this.visuUpdate();
    },

    /**
    * @description		Display WebVisuFile
    * @version			0.09
    * @autor			Jan Oswald GP92
    * @modification		28.06.11(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    "showSvg": function() {
        if (WebVisu.curDrawingRef != undefined) {
            $('#svgFrame').attr('src', WebVisu.curDrawingRef.SvgUrl);

            WebVisu.curDrawingRef.setBackgroundColor();

            // update scale of svg file
            WebVisu.needScaling = 2;
        };
    },

    /**
    * @description		add to DebugList
    * @version			0.09
    * @autor			Jan Oswald GP92
    * @modification		27.06.11(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    "svgFileListDebugInfo": function() {

        var TabId = "'svgFileListDebugInfo_" + this.SvgId + "'";

        // add DetailWindow
        var DetailWindowCode = "";
        DetailWindowCode += '<div class="list svgItem" style="float:left;width:380px;" id="' + TabId + '">';
        DetailWindowCode += '<h3>Cached Svg files</h3><ul>';
        if (WebVisu.SvgFileArray.length < 1) {
            DetailWindowCode += '<li><span style="float:right;">No file available</span></li>';
        } else {
            for (var key in WebVisu.SvgFileArray) {
                if (key != undefined) {
                    if (WebVisu.SvgFileArray[key] != undefined) {
                        DetailWindowCode += '<li><span style="float:left;">';
                        DetailWindowCode += WebVisu.SvgFileArray[key].DrawingKey + ': ';
                        DetailWindowCode += WebVisu.SvgFileArray[key].ViewerBaseFileName + '</span>';
                        DetailWindowCode += '<span style="float:right;">(';
                        DetailWindowCode += WebVisu.SvgFileArray[key].DrawingOID + ' / ' + WebVisu.SvgFileArray[key].Language;
                        DetailWindowCode += ')</span></li>';
                    }
                }
            }
        }
        DetailWindowCode += '</ul></div>';
        $('#svgfilelistdebuginfo').html(DetailWindowCode);
    },

    /**
    * @description		Initialize all viewing-processes
    * @version			0.05
    * @autor			Jan Oswald GP92
    * @modification		19.08.10(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    "ProcNoUpdate": function(response) {

        WebVisu.CounterUpdateTries = 0;

        // Nothing to do
        return;
    },

    /**
    * @description		Initialize all viewing-processes
    * @version			0.05
    * @autor			Jan Oswald GP92
    * @modification		19.08.10(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    "ProcSvgChange": function(response) {

        WebVisu.CounterLineChange++;
        WebVisu.CounterUpdateTries = 0;

        // Do we have this drawing already in list
        if (WebVisu.SvgFileArray[response.drawingkey] == undefined) {

            // Is the svg String present
            if (response.SvgUrl != "") {

                if (response.updateresult == 10 || response.updateresult == 30) {
                    // Show the loading animation
                    WebVisu.showLoading();
                }

                // create the new drawing
                var newSvgFile = new WebVisuFile();

                // UVKLogMessage
                newSvgFile.DrawingOID = response.drawingoid;
                newSvgFile.DrawingKey = response.drawingkey;
                newSvgFile.DrawingHash = response.drawinghash;
                newSvgFile.Language = response.language;

                // Did we get the startup screen
                if (newSvgFile.DrawingOID == 0) {
                    newSvgFile.Background = response.startupbgcolor;
                }
                else {
                    newSvgFile.Background = response.background;
                }

                newSvgFile.Height = response.height;
                newSvgFile.ScaleHeight = response.height;

                newSvgFile.Width = response.width;
                newSvgFile.ScaleWidth = response.width;

                newSvgFile.LineId = response.lineid;
                newSvgFile.Position = response.position;
                newSvgFile.SvgUrl = response.websitesvgurl;

                svgView.init();

                // add to Array -> This is the cache on clients side
                WebVisu.SvgFileArray[response.drawingkey] = newSvgFile;

                WebVisu.curDrawingRef = newSvgFile;

                WebVisu.ScalePercentage = response.scalepercentage;
                WebVisu.ShowAllIdent = response.showallident;
                WebVisu.ShowAllInfoElement = response.showallinfoelement;

                // Reset the zoom offset from Touch Operating
                // Will be used in ChangeUpdate and AllUpdate
                WebVisu.ZoomInOut = response.zoominout;
                WebVisu.ZoomInOutPrev = WebVisu.ZoomInOut;

                if (WebVisu.DebugMode == true) {
                    newSvgFile.ViewerFileName = response.viewerfilename;
                    newSvgFile.ViewerBaseFileName = response.viewerbasefilename;

                    WebVisu.svgFileListDebugInfo();
                }

                // Show the drawing now
                WebVisu.showSvg();

                // add to Main Log
                WebVisu.addProcessLog(false, response.lineid + " (" + response.drawingkey + ")" + " successfully displayed", false);

                if (response.updateresult == 10 || response.updateresult == 30) {
                    // Hide the loading animation
                    WebVisu.hideLoading();
                }
            }
            else {
                // add to Main Log
                WebVisu.addProcessLog(true, response.lineid + " (" + response.drawingkey + ")" + " SVG-File doesn't exist", false);
                this.CounterError++;
            } // if (response.svgstring != "")
        }
        else {

            if (response.updateresult == 10 || response.updateresult == 30) {
                // Show the loading animation
                WebVisu.showLoading();
            }

            // Drawing already exists. Show the drawing now
            WebVisu.curDrawingRef = WebVisu.SvgFileArray[response.drawingkey];
            WebVisu.curDrawingRef.Position = response.position;

            WebVisu.showSvg();

            if (response.updateresult == 10 || response.updateresult == 30) {
                // Hide the loading animation
                WebVisu.hideLoading();
            }
        }
    },

    /**
    * @description		Initialize all viewing-processes
    * @version			0.05
    * @autor			Jan Oswald GP92
    * @modification		19.08.10(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    "ProcValueUpdate": function(response) {

        WebVisu.CounterUpdateTries = 0;
        WebVisu.ScalePercentage = response.scalepercentage;
        WebVisu.ShowAllIdent = response.showallident;
        WebVisu.ShowAllInfoElement = response.showallinfoelement;

        // Only if it has been changed, do something
        if (WebVisu.ZoomInOut > response.zoominout) {
            // Zoom in
            if (WebVisu.ZoomIndex > 0) {
                WebVisu.ZoomIndex -= 1;
                WebVisu.curDrawingRef.addScale(WebVisu.ZoomSteps[WebVisu.ZoomIndex]);
                WebVisu.curDrawingRef.setSize();
            }
            // Get the new ZoomInOut Value
            WebVisu.ZoomInOut = response.zoominout;
        }
        else if (WebVisu.ZoomInOut < response.zoominout) {
            // Zoom out
            if (WebVisu.ZoomIndex < (WebVisu.ZoomSteps.length - 1)) {
                WebVisu.ZoomIndex += 1;
                WebVisu.curDrawingRef.addScale(WebVisu.ZoomSteps[WebVisu.ZoomIndex]);
                WebVisu.curDrawingRef.setSize();
            }
            // Get the new ZoomInOut Value
            WebVisu.ZoomInOut = response.zoominout;
        }

        if (response.rtvalueupdate != undefined) {
            if (WebVisu.SvgFileArray[response.drawingkey] != undefined) {
                WebVisu.SvgFileArray[response.drawingkey].updateElements(response.rtvalueupdate);

                if (response.rtvalueupdate != undefined && response.rtvalueupdate[0] != undefined && response.rtvalueupdate[0][0] != undefined) {
                    WebVisu.lastControllerHeartBeat = response.rtvalueupdate[0][0].Value;
                } else {
                    WebVisu.lastControllerHeartBeat = 0;
                }

                WebVisu.SvgFileArray[response.drawingkey].LastElementUpdate = formatDate(new Date(), "dd.MM.yyyy HH:mm:ss");
            } else {
                WebVisu.addProcessLog(true, "SVG-File " + response.lineid + " (" + response.drawingkey + ") doesn't exist in memory for update", false);
            }
        }
    },

    /**
    * @description		Attach all handlers
    * @version			0.05
    * @autor			Jan Oswald GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    "HandlerAttach": function() {

        if (WebVisu.needHandlerAttach > 0 && WebVisu.curDrawingRef != undefined) {
            WebVisu.needHandlerAttach = WebVisu.needHandlerAttach - 1;

            // Mouse Wheel handler
            $(frames.svgFrame).mousewheel(WebVisu.eventMouseWheel); // needed

            // Mouse Wheel handler -> Synonym
            //var mouseWheelIdent = "mousewheel";

            //if (document.attachEvent) { //if IE (and Opera depending on user setting)
            //    frames.svgFrame.document.attachEvent("on" + mouseWheelIdent, WebVisu.eventMouseWheel);
            //} else if (document.addEventListener) {//WC3 browsers
            //    frames.svgFrame.document.addEventListener(mouseWheelIdent, WebVisu.eventMouseWheel, false);
            //}

            // Mouse move handler
            $(frames.svgFrame).mousemove(WebVisu.eventMouseMove);

            // Mouse click handlers
            $(frames.svgFrame).click(WebVisu.eventMouseClick); // needed
            $(frames.svgFrame).mouseup(WebVisu.eventMouseUp); // needed
            $(frames.svgFrame).mousedown(WebVisu.eventMouseDown); // needed

            // Key Pressed handler
            $(frames.svgFrame).keypress(WebVisu.eventKeyPress);

            // Key Up handler
            //$(frames.svgFrame).keyup(WebVisu.eventKeyUp);

            // Key Down handler
            //$(frames.svgFrame).keydown(WebVisu.eventKeyDown);

            // Scrollbar handler            
            //$(frames.svgFrame).scroll(WebVisu.eventScrollBar);

            // contextmenu handler
            $(frames.svgFrame).bind('contextmenu', WebVisu.eventContext);

            // Window resize handler
            $(window).resize(WebVisu.eventWindowResize);

            // Window load handler
            //$(window).load(WebVisu.eventWindowLoad);
        }
    },

    /**
    * @description		Check scaling
    * @version			0.05
    * @autor			Jan Oswald GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    "CheckScaling": function() {

        if (WebVisu.needScaling > 0 && WebVisu.curDrawingRef != undefined) {
            WebVisu.needScaling = WebVisu.needScaling - 1;
            WebVisu.setFrameSize(window.innerWidth - WebVisu.frameOffset, window.innerHeight - WebVisu.frameOffset);

            if (WebVisu.AutoResize == true) {
                WebVisu.curDrawingRef.setScaleAutoResize();
            }
            else {
                WebVisu.curDrawingRef.setScale(1);
            }
            WebVisu.curDrawingRef.setSize();
            WebVisu.setScrollbarXY(WebVisu.curDrawingRef.Position * WebVisu.curDrawingRef.scaleFactor, 0);
        }
    },

    /**
    * @description		Check refresh
    * @version			0.05
    * @autor			Jan Oswald GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    "CheckRefresh": function() {
        if (WebVisu.needRefresh > 0) {
            WebVisu.needRefresh = WebVisu.needRefresh - 1;
            location.reload();
        }
    },

    /**
    * @description		Initialize all viewing-processes
    * @version			0.05
    * @autor			Jan Oswald GP92
    * @modification		19.08.10(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    "ProcDebugMode": function(response) {

        var test = new Date().getTime() - response.startTime;

        WebVisu.addProcessLog(false, response.logmessage, true, response.updateresultstr, new Date().getTime() - response.startTime, response.drawingkey);

        $('#lastconnection').html(response.lastupdate);
        $('#lastupdate').html(response.lastupdate);
        $('#lastupdateall').html(response.lastupdateall);
        $('#lastupdatechange').html(response.lastupdatechange);

        $('#language').html(response.language);

        $('#framewidth').html(WebVisu.frameWidth);
        $('#frameheight').html(WebVisu.frameHeight);

        if (WebVisu.SvgFileArray[response.drawingkey] != undefined) {
            WebVisu.SvgFileArray[response.drawingkey].svgFileDebugInfo();
        }
    },

    /**
    * @description		Initialize all viewing-processes
    * @version			0.05
    * @autor			Jan Oswald GP92
    * @modification		19.08.10(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    "visuUpdate": function() {

        WebVisu.CounterTriggerJava++;

        // Writes the Counter value to the html svgCntValue item
        $('#svgCntJavaValue').html(WebVisu.CounterTriggerJava);

        if (WebVisu.winUpdTimer != undefined) {
            window.clearInterval(WebVisu.winUpdTimer);
        }

        WebVisu.CheckRefresh();
        WebVisu.CheckScaling();

        WebVisu.HandlerAttach();

        try {
            if (WebVisu.updateActive == false && WebVisu.stopUpdate == false) {

                WebVisu.CounterTriggerRequest++;

                // Writes the Counter value to the html svgCntValue item
                $('#svgCntRequestValue').html(this.CounterTriggerRequest);

                WebVisu.updateActive = true;
                // Ajax request
                $.getJSON(
                        this.HttpVisuUpdatePath,
                        {
                            "counter": this.CounterTriggerJava,
                            "random": Math.random(),
                            "startTime": new Date().getTime()
                        },
                        function(response) {

                            if (response != null) {
                                if (response.state == 'OK') {

                                    switch (response.updateresult) {

                                        case 0: // UTNoUpdate = 0
                                            WebVisu.ProcNoUpdate(response);
                                            break;

                                        case 1: // UTNoUpdateDebug = 1
                                            WebVisu.ProcNoUpdate(response);
                                            WebVisu.ProcDebugMode(response);
                                            break;

                                        case 10: // UTSvgChange = 10
                                            WebVisu.ProcSvgChange(response);
                                            WebVisu.needHandlerAttach = 5;
                                            break;

                                        case 11: // UTValuesAll = 11
                                            WebVisu.ProcValueUpdate(response);
                                            break;

                                        case 12: // UTValuesChange = 12
                                            WebVisu.ProcValueUpdate(response);
                                            break;

                                        case 20: // UTSvgChangeError = 20
                                            // ToDo LFV -> Not finished yet
                                            WebVisu.ProcSvgChange(response);
                                            WebVisu.needHandlerAttach = 5;
                                            break;

                                        case 21: // UTSvgChangeStarting = 21
                                            // ToDo LFV -> Not finished yet
                                            WebVisu.ProcSvgChange(response);
                                            WebVisu.needHandlerAttach = 5;
                                            break;

                                        case 30: // UTSvgChangeDebug = 30
                                            WebVisu.ProcSvgChange(response);
                                            WebVisu.ProcDebugMode(response);
                                            WebVisu.needHandlerAttach = 5;
                                            break;

                                        case 31: // UTValuesAllDebug = 31
                                            WebVisu.ProcValueUpdate(response);
                                            WebVisu.ProcDebugMode(response);
                                            break;

                                        case 32: // UTValuesChangeDebug = 32
                                            WebVisu.ProcValueUpdate(response);
                                            WebVisu.ProcDebugMode(response);
                                            break;

                                        case 40: // UTSvgChangeDebugError = 4
                                            // ToDo LFV -> Not finished yet
                                            WebVisu.ProcSvgChange(response);
                                            WebVisu.ProcDebugMode(response);
                                            WebVisu.needHandlerAttach = 5;
                                            break;

                                        case 41: // UTSvgChangeDebugStarting = 41
                                            // ToDo LFV -> Not finished yet
                                            WebVisu.ProcSvgChange(response);
                                            WebVisu.ProcDebugMode(response);
                                            WebVisu.needHandlerAttach = 5;
                                            break;

                                        default:
                                            break;
                                    };

                                } else if (response.state == 'RELOAD') {
                                    WebVisu.CounterError++;

                                    // State of the Result is bad
                                    if (WebVisu.DebugMode == true) {
                                        var message = "";
                                        message = "There was an error on this page. Update could not be finished. State is false.";
                                        WebVisu.addProcessLog(true, message, false);
                                    }
                                    // -> Try to reload the page
                                    location.reload();

                                } else if (response.state == 'NOK') {
                                    // IIS Extention says: Stop
                                    WebVisu.stopUpdate = true;
                                }

                                // Need, to see, if cycle still works.
                                WebVisu.CounterUpdConfirm++;
                            }
                            else {
                                WebVisu.CounterError++;
                                // Stop update page -> fatal error
                                this.stopUpdate = false;

                            } // if (response != null)

                            WebVisu.updateActive = false;
                        } // function(response)
                ); // $.getJSON(
            } // if (this.updateActive == false && !this.stopUpdate)

            // Still doing the update cycle, but without processing any data
            this.winUpdTimer = window.setTimeout("WebVisu.visuUpdate()", SessionServerParam.UpdateInterval);
        }
        catch (err) {
            var message = "";
            message = "There was an error on this page. Error description: " + err.description + ". Click OK to continue.";
            WebVisu.addProcessLog(true, message, false);
            // Try next time to update the visualisation
            this.winUpdTimer = window.setTimeout("WebVisu.visuUpdate()", SessionServerParam.UpdateInterval);
        }
    },

    /**
    * @description		handle for events like onClick, etc.
    * @version			0.05
    * @autor			Jan Oswald GP92
    * @modification		19.08.10(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    "visuEvent": function(ident, type, call) {

        this.CounterEvent++;

        if (this.eventActive == false) {

            this.eventActive = true;

            // Ajax request
            $.getJSON(
                this.HttpVisuEventPath,
                {
                    "objectident": ident,
                    "objecttype": type,
                    "objectcall": call,
                    "counter": this.CounterEvent
                },
                function(response) {
                    delete response;
                    return false;
                });
            this.eventActive = false;
        }
    },


    /**
    * @description		Set the newPosition of the scrollbarX
    * @param            newPosition
    * @version			2.05
    * @autor			Sven Schmiedel GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "setScrollbarX": function(newPosition) {
        if ($(frames.svgFrame) != undefined) {
            $(frames.svgFrame).scrollLeft(newPosition);
            WebVisu.scrollPosX = newPosition;
        }
    },

    /**
    * @description		Set the newPosition of the scrollbarY
    * @param            newPosition
    * @version			2.05
    * @autor			Sven Schmiedel GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "setScrollbarY": function(newPosition) {
        if ($(frames.svgFrame) != undefined) {
            $(frames.svgFrame).scrollTop(newPosition);
            WebVisu.scrollPosY = newPosition;
        }
    },

    /**
    * @description		Set the newPosition of the scrollbarX and scrollbarY
    * @param            newPositionX, newPositionY
    * @version			2.05
    * @autor			Sven Schmiedel GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "setScrollbarXY": function(newPositionX, newPositionY) {
        if ($(frames.svgFrame) != undefined) {
            WebVisu.setScrollbarX(newPositionX);
            WebVisu.setScrollbarY(newPositionY);
        }
    },

    /**
    * @description		Set the frame width
    * @param            newWidth
    * @version			2.05
    * @autor			Sven Schmiedel GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "setFrameWidth": function(newWidth) {
        if ($('#svgFrame') != undefined) {
            WebVisu.frameWidth = newWidth;
            $('#svgFrame').attr('width', newWidth);
        }
    },

    /**
    * @description		Set the frame height
    * @param            newHeight
    * @version			2.05
    * @autor			Sven Schmiedel GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "setFrameHeight": function(newHeight) {
        if ($('#svgFrame') != undefined) {
            WebVisu.frameHeight = newHeight;
            $('#svgFrame').attr('height', newHeight);
        }
    },

    /**
    * @description		Set the frame width and frame height
    * @param            newWidth, newHeight
    * @version			2.05
    * @autor			Sven Schmiedel GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "setFrameSize": function(newWidth, newHeight) {
        this.setFrameWidth(newWidth);
        this.setFrameHeight(newHeight);
    },

    /**
    * @description		add Log message
    * @param            
    * @version			0.05
    * @autor			Jan Oswald GP92
    * @modification		09.09.10(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "addProcessLog": function(error, msg, updateWindow, mode, time, drawingid) {

        var className = "success";

        if (error == true) {
            className = "failed";
            this.CounterUpdateTries++;
            if (this.CounterUpdateTries >= this.maxUpdateTries) {
                if (this.DebugMode == true) {
                    this.addProcessLog(true, "Cancel updateprogress tries", false);
                }
                this.stopUpdate = true;
            }
        }

        if (updateWindow) {
            if (time > 500 && !error) {
                className = "warning";
            }
            var newRow = '<tr id="XX_LOG_XX-' + this.CounterProcessLog + '" class="logLine ' + className + '">'
                        + '<td class="logCell" >' + this.CounterProcessLog + '</td>'
                        + '<td class="logCell" >' + drawingid + '</td>'
                        + '<td class="logCell" >' + mode + '</td>'
                        + '<td class="logCell" >' + time + ' ms</td>'
                        + '<td class="logCell" >' + msg + '</td>'
                        + '</tr>';
            $('#logTable tbody>tr:first').after(newRow)
            this.CounterProcessLog++;
            for (var idx = this.CounterProcessLog - this.counterProcLogOffsetStart; idx < this.CounterProcessLog - this.counterProcLogOffsetEnd; idx++) {
                var elem = $('#XX_LOG_XX-' + idx);
                if (elem != null) {
                    elem.remove();
                }
            }
        }
        else {
            $('#logInit').append('<div class="logItem ' + className + '"><div>' + msg + '</div></div>');
        }
    },

    /**
    * @description		showLoading
    * @version			0.8
    * @autor			Jan Oswald GP92
    * @modification		19.05.11(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "showLoading": function() {
        $("#svgLoading").show();
    },

    /**
    * @description		hideLoading
    * @version			0.8
    * @autor			Jan Oswald GP92
    * @modification		19.05.11(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "hideLoading": function() {
        WebVisu.winLoadTimer = undefined;
        $("#svgLoading").fadeOut(WebVisu.fadeOutTime);
    },

    /**
    * @description		eventMouseMove
    * @version			0.8
    * @autor			Jan Oswald GP92
    * @modification		19.05.11(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "eventMouseMove": function(event) {

        // For debug
        //document.getElementById("debugInfoText").innerHTML = 'Mouse moved ' + event.pageX + ' / ' + event.pageY;

        if (WebVisu.mouseDown == true) {

            WebVisu.eventMouseMoveCount = WebVisu.eventMouseMoveCount + 1;

            if (WebVisu.eventMouseMoveCount > WebVisu.eventMouseMoveSensitivity) {
                WebVisu.eventMouseMoveCount = 0;

                // Difference between windowheight and scaled image height
                var heightDiff = Math.abs((WebVisu.frameHeight - WebVisu.frameBarOffset) - WebVisu.curDrawingRef.ScaleHeight);
                var widthDiff = Math.abs((WebVisu.frameWidth - WebVisu.frameBarOffset) - WebVisu.curDrawingRef.ScaleWidth);

                var scrollYOffset = WebVisu.scrollPosMouseDownUpY + WebVisu.mouseDownPosY - event.clientY;
                var scrollXOffset = WebVisu.scrollPosMouseDownUpX + WebVisu.mouseDownPosX - event.clientX;

                if (scrollYOffset < 0) {
                    scrollYOffset = 0;
                }
                else if (scrollYOffset > heightDiff) {
                    scrollYOffset = heightDiff;
                }
                if (scrollXOffset < 0) {
                    scrollXOffset = 0;
                }
                else if (scrollXOffset > widthDiff) {
                    scrollXOffset = widthDiff;
                }
                WebVisu.setScrollbarXY(scrollXOffset, scrollYOffset);
            }
        }
    },

    /**
    * @description		eventMouseClick
    * @version			0.8
    * @autor			Jan Oswald GP92
    * @modification		19.05.11(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "eventMouseClick": function(event) {

        // For debug
        //document.getElementById("debugInfoText").innerHTML = 'Mouse clicked';

        if (event.button == 0) {
            //document.getElementById("debugInfoText").innerHTML = 'Mouse clicked 0';
        }

        if (event.button == 1) {
            //document.getElementById("debugInfoText").innerHTML = 'Mouse clicked 1';
        }

        if (event.button == 2) {
            //document.getElementById("debugInfoText").innerHTML = 'Mouse clicked 2';
        }
    },

    /**
    * @description		eventMouseUp
    * @version			0.8
    * @autor			Jan Oswald GP92
    * @modification		19.05.11(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "eventMouseUp": function(event) {

        // For debug
        //document.getElementById("debugInfoText").innerHTML = 'Mouse up';

        if (event.button == 0) {
            //document.getElementById("debugInfoText").innerHTML = 'Mouse up 0';
        }

        if (event.button == 1) {
            //document.getElementById("debugInfoText").innerHTML = 'Mouse up 1';
        }

        if (event.button == 2) {
            //document.getElementById("debugInfoText").innerHTML = 'Mouse up 2';
            WebVisu.mouseUpPosX = event.clientX;
            WebVisu.mouseUpPosY = event.clientY;
            WebVisu.scrollPosMouseDownUpX = WebVisu.scrollPosX;
            WebVisu.scrollPosMouseDownUpY = WebVisu.scrollPosY;
            WebVisu.mouseDown = false;
        }
    },

    /**
    * @description		eventMouseDown
    * @version			0.8
    * @autor			Jan Oswald GP92
    * @modification		19.05.11(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "eventMouseDown": function(event) {

        // For debug
        //document.getElementById("debugInfoText").innerHTML = 'Mouse down';

        if (event.button == 0) {
            //document.getElementById("debugInfoText").innerHTML = 'Mouse down 0';
        }

        if (event.button == 1) {
            //document.getElementById("debugInfoText").innerHTML = 'Mouse down 1';
        }

        if (event.button == 2) {
            //document.getElementById("debugInfoText").innerHTML = 'Mouse down 2';
            if (WebVisu.mouseDown == false) {
                WebVisu.mouseDownPosX = event.clientX;
                WebVisu.mouseDownPosY = event.clientY;
                WebVisu.scrollPosMouseDownUpX = WebVisu.scrollPosX;
                WebVisu.scrollPosMouseDownUpY = WebVisu.scrollPosY;
                WebVisu.mouseDown = true;
            }
        }
    },

    /**
    * @description		eventMouseWheel
    * @version			0.8
    * @autor			Jan Oswald GP92
    * @modification		19.05.11(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "eventMouseWheel": function(event) {

        // For debug
        //document.getElementById("debugInfoText").innerHTML = 'Mouse Wheel ' + delta + ' / ' + event.wheelDelta + ' / ' + event.detail;

        // Only, if Ctrl key is pressed -> do something
        if (event.ctrlKey == true) {
            if (!event) {
                event = window.event;
            }

            WebVisu.eventMouseWheelCount = WebVisu.eventMouseWheelCount + 1;

            if (WebVisu.eventMouseWheelCount > WebVisu.eventMouseWheelSensitivity) {
                WebVisu.eventMouseWheelCount = 0;
                event.preventDefault();

                var delta = event.wheelDelta / 120;

                if (delta < 0) {    // Up
                    if (WebVisu.ZoomIndex > 0) {
                        WebVisu.ZoomIndex -= 1;
                        WebVisu.curDrawingRef.addScale(WebVisu.ZoomSteps[WebVisu.ZoomIndex]);
                        WebVisu.curDrawingRef.setSize();
                    }
                }
                else if (delta > 0) {   // Down
                    if (WebVisu.ZoomIndex < (WebVisu.ZoomSteps.length - 1)) {
                        WebVisu.ZoomIndex += 1;
                        WebVisu.curDrawingRef.addScale(WebVisu.ZoomSteps[WebVisu.ZoomIndex]);
                        WebVisu.curDrawingRef.setSize();
                    }
                }

                // Difference between windowheight and scaled image height
                var heightDiff = Math.abs((WebVisu.frameHeight - WebVisu.frameBarOffset) - WebVisu.curDrawingRef.ScaleHeight);
                var widthDiff = Math.abs((WebVisu.frameWidth - WebVisu.frameBarOffset) - WebVisu.curDrawingRef.ScaleWidth);

                // Position of mouse in image depending on scaling factor
                var clientPosInImgY = event.clientY / (WebVisu.frameHeight - WebVisu.frameBarOffset) * WebVisu.curDrawingRef.ScaleHeight;
                var clientPosInImgX = event.clientX / (WebVisu.frameWidth - WebVisu.frameBarOffset) * WebVisu.curDrawingRef.ScaleWidth;

                // Fraction of heightDifference depending on mouse position
                var scrollYOffset = clientPosInImgY - event.clientY;
                var scrollXOffset = clientPosInImgX - event.clientX;

                if (scrollYOffset < 0) {
                    scrollYOffset = 0;
                }
                else if (scrollYOffset > heightDiff) {
                    scrollYOffset = heightDiff;
                }
                if (scrollXOffset < 0) {
                    scrollXOffset = 0;
                }
                else if (scrollXOffset > widthDiff) {
                    scrollXOffset = widthDiff;
                }

                WebVisu.setScrollbarXY(scrollXOffset, scrollYOffset);
            }

            // Disable MouseWheel handler of the browser
            return false;
        }
    },

    /**
    * @description		eventKeyPress
    * @version			0.8
    * @autor			Jan Oswald GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "eventKeyPress": function(event) {

        // For debug
        //document.getElementById("debugInfoText").innerHTML = 'Key Pressed ' + event.charCode;

        WebVisu.eventKeyPressedCount = WebVisu.eventKeyPressedCount + 1;

        if (WebVisu.eventKeyPressedCount > WebVisu.eventKeyPressedSensitivity) {
            WebVisu.eventKeyPressedCount = 0;

            // Char +
            if (event.charCode == 45) {
                if (WebVisu.ZoomIndex > 0) {
                    WebVisu.ZoomIndex -= 1;
                    WebVisu.curDrawingRef.addScale(WebVisu.ZoomSteps[WebVisu.ZoomIndex]);
                    WebVisu.curDrawingRef.setSize();
                }
            }
            // Char -
            else if (event.charCode == 43) {
                if (WebVisu.ZoomIndex < (WebVisu.ZoomSteps.length - 1)) {
                    WebVisu.ZoomIndex += 1;
                    WebVisu.curDrawingRef.addScale(WebVisu.ZoomSteps[WebVisu.ZoomIndex]);
                    WebVisu.curDrawingRef.setSize();
                }
            }
            // Char 2 down
            else if (event.charCode == 50) {
                var heightDiff = Math.abs((WebVisu.frameHeight - WebVisu.frameBarOffset) - WebVisu.curDrawingRef.ScaleHeight);
                var scrollOffset = WebVisu.scrollPosY + WebVisu.cursorStep;
                if (scrollOffset > heightDiff) {
                    scrollOffset = heightDiff;
                }
                WebVisu.setScrollbarY(scrollOffset);
            }
            // Char 5 -> reload
            else if (event.charCode == 53) {
                // Show the loading animation
                WebVisu.showLoading();

                WebVisu.needRefresh = 1;
            }
            // Char 6 right
            else if (event.charCode == 54) {
                var widthDiff = Math.abs((WebVisu.frameWidth - WebVisu.frameBarOffset) - WebVisu.curDrawingRef.ScaleWidth);
                var scrollOffset = WebVisu.scrollPosX + WebVisu.cursorStep;
                if (scrollOffset > widthDiff) {
                    scrollOffset = widthDiff;
                }
                WebVisu.setScrollbarX(scrollOffset);
            }
            // Char 8 up
            else if (event.charCode == 56) {
                var scrollOffset = WebVisu.scrollPosY - WebVisu.cursorStep;
                if (scrollOffset < 0) {
                    scrollOffset = 0;
                }
                WebVisu.setScrollbarY(scrollOffset);
            }
            // Char 4 left
            else if (event.charCode == 52) {
                var scrollOffset = WebVisu.scrollPosX - WebVisu.cursorStep;
                if (scrollOffset < 0) {
                    scrollOffset = 0;
                }
                WebVisu.setScrollbarX(scrollOffset);
            }
        }
    },

    /**
    * @description		eventContext
    * @version			0.8
    * @autor			Jan Oswald GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    "eventContext": function(event) {

        // For debug
        //document.getElementById("debugInfoText").innerHTML = 'Context';

        // Disable Context handler of the browser
        return false;
    },

    /**
    * @description		Windows resize handler
    * @version			0.9
    * @autor			Sven Schmiedel GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    "eventWindowResize": function(event) {

        // For debug
        //document.getElementById("debugInfoText").innerHTML = 'Window resized';

        // Show the loading animation
        WebVisu.showLoading();

        WebVisu.needRefresh = 1;
        WebVisu.needHandlerAttach = 5;
    }
};

/**
* @description		Tab View
* @version			0.9
* @autor			Jan Oswald GP92
* @modification		24.06.11(JanOswald)	/created
*                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
*
**/
var tabView = {
    "init": function() {
        // remove all selection
        $("#tabSelection div").removeClass("selected");
        $("#tabItems div.tabItem").hide();

        // select first item
        $("#tabSelection div:first").addClass("selected");
        $("#tabItems div:first").show();
    },

    "selectTab": function(me, id) {
        // select clicked
        $("#tabSelection div").removeClass("selected");
        $("#tabItems div.tabItem").hide();
        
        $(me).addClass("selected");
        $("#" + id).show();
    }
};

/**
* @description		View All Svg Settings
* @version			0.9
* @autor			Jan Oswald GP92
* @modification		24.06.11(JanOswald)	/created
*                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
*
**/
var svgView = {
    "init": function() {
        // remove all selection
        $("#svgSelection div").removeClass("selected");
        $("#svgItems div.svgItem").hide();

        // select first item
        $("#svgSelection div:first").addClass("selected");
        $("#svgItems div:first").show();
    },

    "selectTab": function(me, tabid) {
        // select clicked
        $("#svgSelection div").removeClass("selected");
        $("#svgItems div.svgItem").hide();
        
        $(me).addClass("selected");
        $("#" + tabid).show();
    }
};
