/**
* @description		Drawing Class (possibility to create instances)
* @version			0.9
* @autor			Jan Oswald GP92
* @modification		24.05.11(JanOswald) // created
*                   27.06.11(JanOswald) // created
*                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
*
**/
var WebVisuFile = function() {
    // Properties
    this.DrawingOID = 0;                                // IIS: SessionParamWkst.DrawingOID : OID from this drawing
    this.DrawingKey = 0;                                // IIS: SessionParamWkst.DrawingKey : Key from this drawing; need to get the correct svg within the whole html string.
    this.DrawingHash = 0;                               // IIS: SessionParamWkst.DrawingHash : HashCode of this drawing; need to get the newest svg from the browser cache.

    this.Language = "";                                 // IIS: SessionParamWkst.Language : Language of this file

    this.LastElementUpdate = "00.00.0000 00:00:00";     // RTValue: LastElementUpdate on Client Site

    this.LineId = "";                                   // IIS: SvgVisuFile.LineID
    this.Position = 0;                                  // IIS: SvgVisuFile.Position
    this.Background = "#000000";                        // RTValue: current background color, depending on WebVisu setup

    this.ViewerFileName = "";                           // IIS: SvgVisuFile.FileName
    this.ViewerBaseFileName = "";                       // IIS: SessionParamWkst.SvgViewerBaseFileNam

    this.SvgUrl = "";                                   // IIS: CentralConfigParam.WebSiteSvgUrl & "/" & SvgVisuFile.FileName

    this.Height = 0;                                    // IIS: Origin Image height
    this.ScaleHeight = 0;                               // RTValue: current scaled height, depending on the scale factor

    this.Width = 0;                                     // IIS: Origin Image width
    this.ScaleWidth = 0;                                // RTValue: current scaled width, depending on the scale factor

    this.scaleFactor = 1;                               // RTValue: current scale factor, calculated from window size, mouse wheel, operating scale factor
    this.scaleFactorAutoResize = 1;                     // RTValue: current scale factor for auto resize, calculated from window size. -> fits into the screen
    this.scalePercentage = 100;                         // RTValue: current scale percentage. Needed only for displaying issues.

    this.Selected = false;                              // RTValue:*

    /**
    * @description		update items on svg
    * @version			0.05
    * @autor			Jan Oswald GP92
    * @modification		09.09.10(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    this.updateElements = function(visuItems, debugMode, addProcessLog) {
        var visuItem = 0;
        var counterItems = 0;
        var counterAttributes = 0;

        if (frames['svgFrame'] != null) {

            $.each(visuItems, function(visuId, newAttributes) {
                counterItems++;

                if (visuId != 0 && frames['svgFrame'].document != null) {
                    visuItem = frames['svgFrame'].document.getElementById(visuId);

                    if (visuItem != null) {
                        $.each(newAttributes, function(index, newAttribute) {
                            counterAttributes++;
                            if (newAttribute.Key == 'text') {
                                if (visuItem.textContent != newAttribute.Value) {
                                    visuItem.textContent = newAttribute.Value;
                                }
                            }
                            else if (newAttribute.Key != '') {
                                visuItem.setAttribute(newAttribute.Key, newAttribute.Value);
                            }
                        });
                    }
                    else {
                        if (debugMode == true) {
                            addProcessLog(false, "item with ID: " + visuId + " doesn't exist.", false);
                        }
                    }
                }
            });
        }
    };

    /**
    * @description		set Background Color
    * @version			0.09
    * @autor			Jan Oswald GP92
    * @modification		28.06.11(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    this.setBackgroundColor = function() {
        $('body').css("background-color", this.Background);
    };

    /**
    * @description		add to DebugList
    * @version			0.09
    * @autor			Jan Oswald GP92
    * @modification		27.06.11(JanOswald)	/created
    *                   25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    *
    **/
    this.svgFileDebugInfo = function() {

        var TabId = "'svgFileDebugInfo_" + this.SvgId + "'";

        // add to List
        $('#svgSelection').append('<div class="svgButton" onclick="svgView.selectTab(this, ' + TabId + ');">' + this.LineId + '</div>');

        // add DetailWindow
        var DetailWindowCode = ""
        DetailWindowCode += '<div class="list svgItem" style="float:left;width:380px;" id="' + TabId + '">';
        DetailWindowCode += '<h3>Line Ident: ' + this.LineId + '</h3><ul>';
        DetailWindowCode += '<li>Drawing Ident:<span>' + this.DrawingOID + '</span></li>';
        DetailWindowCode += '<li>Drawing Key:<span>' + this.DrawingKey + '</span></li>';
        DetailWindowCode += '<li>Drawing Hash:<span>' + this.DrawingHash + '</span></li>';
        DetailWindowCode += '<li>Drawing Language:<span>' + this.Language + '</span></li>';
        DetailWindowCode += '<li>Last ElementUpdate:<span>' + this.LastElementUpdate + '</span></li>';
        DetailWindowCode += '<li>Line Id:<span>' + this.LineId + '</span></li>';
        DetailWindowCode += '<li>Position:<span>' + this.Position + '</span></li>';
        DetailWindowCode += '<li>Selected/Displayed:<span class="svgSelected">' + this.Selected + '</span></li>';
        DetailWindowCode += '<li>Svg File Name:<span>' + this.ViewerFileName + '</span></li>';
        DetailWindowCode += '<li>Svg File Name Base:<span>' + this.ViewerBaseFileName + '</span></li>';
        DetailWindowCode += '<li>Svg Width:<span>' + this.Width + '</span></li>';
        DetailWindowCode += '<li>Svg Width scaled:<span>' + this.ScaleWidth + '</span></li>';
        DetailWindowCode += '<li>Svg Height:<span>' + this.Height + '</span></li>';
        DetailWindowCode += '<li>Svg Height scaled:<span>' + this.ScaleHeight + '</span></li>';
        DetailWindowCode += '<li>Scale Factor:<span>' + this.scaleFactor + '</span></li>';
        DetailWindowCode += '<li>Scale Percentage:<span>' + this.scalePercentage + '</span></li>';
        DetailWindowCode += '</ul></div>';
        $('#svgfiledebuginfo').html(DetailWindowCode);
    };

    /**
    * @description		Set the width of the current Svg Drawing
    * @param            newWidth
    * @version			2.05
    * @autor			Sven Schmiedel GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    this.setWidth = function(newWidth) {
        if ($('svg', frames['svgFrame'].document) != undefined) {
            $('svg', frames['svgFrame'].document).attr('width', newWidth);
        }
    };

    /**
    * @description		Set the height of the current Svg Drawing
    * @param            newHeight
    * @version			2.05
    * @autor			Sven Schmiedel GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    this.setHeight = function(newHeight) {
        if ($('svg', frames['svgFrame'].document) != undefined) {
            $('svg', frames['svgFrame'].document).attr('height', newHeight);
        }
    };

    /**
    * @description		Set the width and height of the current Svg Drawing
    * @version			2.05
    * @autor			Sven Schmiedel GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    this.setSize = function() {
        this.setWidth(this.ScaleWidth);
        this.setHeight(this.ScaleHeight);
    };

    /**
    * @description		Reset the width and height of the current Svg Drawing to origin value
    * @version			2.05
    * @autor			Sven Schmiedel GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    this.resetSize = function() {
        this.setWidth(this.Width);
        this.setHeight(this.Height);
    };

    /**
    * @description		Set the scale factor of the current Svg Drawing
    * @param            newScaleFactor
    * @version			2.05
    * @autor			Sven Schmiedel GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    this.setScale = function(newScaleFactor) {
        if ($('svg', frames.svgFrame.document) != undefined) {
            $('svg', frames.svgFrame.document).attr('currentScale', newScaleFactor);

            this.scaleFactor = (Math.round(newScaleFactor * 1000)) / 1000;
            this.scalePercentage = (Math.round(newScaleFactor * 100 * 1000)) / 1000; // Only for display issues

            this.ScaleWidth = Math.round(this.Width * newScaleFactor);
            this.ScaleHeight = Math.round(this.Height * newScaleFactor);
        }
    };

    /**
    * @description		Set the scale factor of the current Svg Drawing regarding to the Frame Size
    * @param            newScaleFactor
    * @version			2.05
    * @autor			Sven Schmiedel GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    this.setScaleAutoResize = function() {
        this.scaleFactorAutoResize = (WebVisu.frameHeight - WebVisu.frameBarOffset) / WebVisu.curDrawingRef.Height;
        this.setScale(this.scaleFactorAutoResize);
    };

    /**
    * @description		Add the scale factor to the fitting scale factor of the drawing
    * @param            newScaleFactor
    * @version			2.05
    * @autor			Sven Schmiedel GP92
    * @modification		25.10.11(SvenSchmiedel) // redesign for upgrade to WebVisu v2.0
    **/
    this.addScale = function(newScaleFactor) {
        this.setScale(newScaleFactor * this.scaleFactorAutoResize);
    };
};
