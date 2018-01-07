/**
* @description		Includes all costum Javascripts
* @version			0.9
* @autor			Jan Oswald GP92
* @modification		24.05.11(JanOswald) // created
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
    WebVisuConnect.init();
});

/**==============================================================================================================================
* @description		Class for WebVisu
* @version			0.9
* @autor			Jan Oswald GP92
* @modification		19.08.10(JanOswald) // created
*
**/
var WebVisuConnect = {

    "CurDrawing": "",                      // This is the currently showing drawing
    "HttpVisuUpdatePath": "/visuUpdate",

    /**
    * @description		Initialize all viewing-processes
    * @version			0.05
    * @autor			Jan Oswald GP92
    * @modification		19.08.10(JanOswald)	/created
    *
    **/
    "init": function() {
        // init local variables
    this.HttpVisuUpdatePath = "/" + SessionServerParam.UrlPath + "/visuUpdate";

        // hide rightclick-menu
        $('#svgView').bind('contextmenu', function(e) {
            return false;
        });

        // Mouse-Position: register document events
        // needed for Detail-Window Position
        document.onmousemove = function(e) {
            this.mousePosX = document.all ? window.event.clientX : e.pageX;
            this.mousePosY = document.all ? window.event.clientY : e.pageY;
        }

        // starts updateprogress if svg is loaded
        this.visuUpdate();
    },

    "visuUpdate": function() {
        // starts updateprogress if svg is loaded
        // Ajax request
        $.getJSON(
            this.HttpVisuUpdatePath,
            {
                "random": Math.random()
            },
            function(response) {

                if (response != null) {

                    if (response.error == null) {

                        // create the new drawing
                        WebVisuConnect.CurDrawing = new WebVisuFile();

                        WebVisuConnect.CurDrawing.Background = response.background;

                        WebVisuConnect.CurDrawing.DrawingOID = response.drawingoid;
                        WebVisuConnect.CurDrawing.DrawingKey = response.drawingkey;
                        WebVisuConnect.CurDrawing.Language = response.language;

                        WebVisuConnect.CurDrawing.ViewerFileName = response.viewerfilename;
                        WebVisuConnect.CurDrawing.ViewerBaseFileName = response.viewerbasefilename;

                        WebVisuConnect.CurDrawing.Height = response.height;
                        WebVisuConnect.CurDrawing.Width = response.width;

                        WebVisuConnect.CurDrawing.LineId = response.lineid;
                        
                        WebVisuConnect.CurDrawing.Position = response.position;
                        WebVisuConnect.CurDrawing.ZoomStep = response.zoomstep;

                        WebVisuConnect.CurDrawing.setBackgroundColor();
                            
                    } // if (response.error == null)
                } // if (response != null)
            } // function(response)
        ); // $.getJSON(
    }
};
