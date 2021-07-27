/*
Class:
    df.WebApp
Extends:
    df.WebBaseContainer

This class is the main class of the DataFlex Engine that has the logic for loading application 
definitions of the server and creation of the Web Objects. An instance of this class should be 
created for every application within the page. It will act as the main API to initialize and render 
web applications and views. A lot of global logic like error handling and server actions are 
implemented in this class.

It inherits from df.WebBaseContainer because it can contain and manage visual controls (panels and 
mainly views). Views are a special case when rendering since they render to the center panel area by 
default.

@code
var oWebApp = new df.WebApp("WebService.wso");

oWebApp.displayApp("#viewport");
@code
The example above shows how to create a webapp object that will communicate with the 
'WebService.wso' web-service and it will render to the '#viewport' element within the page. This 
renders the entire webapp including global panels en menu's.

@code
var oWebApp = new df.WebApp("WebService.wso");

oWebApp.displayView("oOrderView", "#viewport");
@code
The example above shows how to create a webapp object but only render a single view.
    
Revision:
    2011/06/26  (HW, DAW) 
        Initial version.
*/
df.WebApp = function WebApp(sOptWebService, sOptCookieName, iOptCookieHours){
    df.WebApp.base.constructor.call(this, "oWebApp", null);
    
    //  Local properties
    this.prop(df.tString, "psWebService", sOptWebService || "WebServiceDispatcher.wso");
    this.prop(df.tString, "psCookieName", sOptCookieName || "dfWebApp");
    this.prop(df.tInt, "piCookieHours", iOptCookieHours || null);

    //  Server properties
    this.psTheme = "";
    this.prop(df.tString, "psTheme", "");
    
    //  Localization properties
    this.prop(df.tString, "psDecimalSeparator", ",");
    this.prop(df.tString, "psThousandsSeparator", ".");
    this.prop(df.tString, "psDateFormat", "dd/mm/yyyy");
    this.prop(df.tString, "psDateSeparator", "-");
    this.prop(df.tString, "psCurrencySymbol", "&euro;");

    
    this.pbMDI = false;
    
    this.OnError = new df.events.JSHandler();
    this.OnShowProgress = new df.events.JSHandler();
    this.OnShowWindow = new df.events.JSHandler();
    this.OnHideWindow = new df.events.JSHandler();
    this.OnHideProgress = new df.events.JSHandler();
    
    // @privates
    this._aSyncPropCache = []; //   Cache of synchronized property values for non existing objects
    
    this._oCurrentWindow = null;
    this._oCurrentView = null;
    this._oCurrentObj = null;
    this._aViews = [];
    this._aFocussed = [];
    
    this._bReady = false;           
    this._aLoadQueue = [];          //  Queue of functions to be called after initialization
    this._sStartupView = null;
    
    this._oLoadViewQueue = {};      //  Queue of functions to be called when a view is loaded
    
    this._oPendingCall = null;      //  Call waiting to be sent
    this._oSendingCall = null;      //  Call currently being sent / processed
    
    this._eStyleSystem = null;
    this._eStyleTheme = null;
    this._eStyleApplication = null;
    this._sRootPath = df.psRootPath;
    
    this._oTranslations = {};
    
    this._aModalQueue = [];     //  Queue of modal dialogs waiting for previous one to close
    
    //  Configure super classes
    this._bWrapDiv = true;
    this._sControlClass = "WebApp";
    this._bPanels = true;
    
    this._eViewPort = null;
    
    this.setActionMode("loadView", df.cCallModeWait);
    
    //  Start initialization
    this.initialize();
};
df.defineClass("df.WebApp", "df.WebBaseContainer", {


//  - - - - - - - - - Rendering - - - - - - - - -

afterRender : function(){
    this._eRegionCenter = df.dom.create('<div class="WebApp_ViewRegion"></div>');
    
    //  Make sure that we insert the viewregion before the clear div created by WebBaseContainer
    this._eMainArea.insertBefore(this._eRegionCenter, this._eMainArea.lastChild);

    df.events.addDomListener("resize", window, this.onResize, this);
    
    df.WebApp.base.afterRender.call(this);
    
    this.set_pbMDI(this.pbMDI);
    
    //  Add the theme name to the wrapping div
    if(this._eElem){
        df.dom.addClass(this._eElem, this.psTheme);
    }
},

/*
Child objects register themselves at their parents. Views are not considered to be regular children.

@private
*/
addChild : function(oChild){
    //  Filter out child components since they are not considered regular children
    if(!(oChild instanceof df.WebView)){
        if(oChild.peRegion === df.ciRegionCenter){
            throw new df.Error(999, "The 'oWebApp' object should not have panels set to the center region, this space is reserved for the WebView.", this, [oChild.getLongName()]);
        }
        
        df.WebApp.base.addChild.call(this, oChild);
    }else{
        this._aViews.push(oChild);
    }
},

renderViewPort : function(eRenderTo){
    //  Add the theme name to the wrapping div
    var eViewPort = df.dom.create('<div id="' + this.psHtmlId + '" class="' + this.psTheme + '"></div>');
    
    eRenderTo.appendChild(eViewPort);
    
    return eViewPort;
},

//  - - - - - - - - - Initialization - - - - - - - - -

/*
This method initializes the webapp by making the LoadWebApp call to the server. This will return the 
definition of the global objects including the webapp itself and the session key. Optionally there 
can be a startup view returned. After this call is returned the proper CSS is included and we wait 
for the DOM and the CSS to become finished. Finally the waiting handlers are called (usually 
displayView or displayApp). 

@private
*/
initialize : function(){
    var oCall;
    
    try{
        if(this.checkBrowser()){
            
            //  Send the AJAX Call that loads the global objects & properties
            oCall = new df.ajax.JSONCall("LoadWebApp");
            oCall.addParam("sSessionKey", this.getSessionKey());
            oCall.sUrl = this.psWebService;
            oCall.oSource = this;

            oCall.onFinished.addListener(function(oEvent){
                var tResult = oEvent.oSource.getResponseValue();
                
                //  Store new session key if provided
                if(tResult.sSessionKey){
                    this.setSessionKey(tResult.sSessionKey);
                }
                
                //  Store translations
                this.initTrans(tResult.aTranslations);
                
                //  Process headers
                this.handleHeader(tResult.Header);
                
                //  Check if we actually received something
                if(tResult.Header.aObjectDefs.length === 0){
                    throw new df.Error(999, "No application definition received", this);
                }
                
                //  Make sure the proper CSS is included
                this.updateCSS(false);
                
                //  Remember startupview
                this._sStartupView = tResult.sStartupView;
                
                //  Check if DOM is ready
                df.dom.ready(function(){
                    //  Check is CSS is ready
                    this.testCSS(function(){
                        var i;
                        
                        //  Do version check
                        this.checkVersion();
                                            
                        //  Mark ready
                        this._bReady = true;
                        
                        //  Call waiters
                        for(i = 0; i < this._aLoadQueue.length; i++){
                            this._aLoadQueue[i].fHandler.call(this._aLoadQueue[i].oEnv || this);
                        }
                    });
                }, this);
                
            }, this);
            oCall.send(true);
        }
    }catch(oErr){
        this.handleError(oErr);
    }
},

checkBrowser : function(){
    if(df.sys.isIE && df.sys.iVersion < 8){
        alert("Unfortunately the browser you are using is not supported by this framework. Please upgrade to a more modern browser.\n\r\n\rThe minimal version required is Internet Explorer 8. We advise to use the latest version of Google Chrome or Mozilla FireFox.");
        return false;
    }   

    return true;
},

checkVersion : function(){
    var aPartsServer, aPartsClient, i;

    if(this.psVersionID !== df.psVersionId){
        aPartsServer = (this.psVersionID || "").split(".");
        aPartsClient = (df.psVersionId || "").split(".");
        
        if(aPartsServer.length === aPartsClient.length){
            for(i = 0; i < aPartsServer.length; i++){
                if(parseInt(aPartsServer[i], 10) < parseInt(aPartsClient[i], 10)){
                    this.handleError(new df.Error(999, "The server application ('{{1}}') is running an older version than the client-engine ('{{0}}'). Consider recompiling the server application.", this, [ df.psVersionId, this.psVersionID ]));
                    return false;
                }
                
                if(parseInt(aPartsServer[i], 10) > parseInt(aPartsClient[i], 10)){
                    this.handleError(new df.Error(999, "The server application ('{{1}}') is running a newer version than the client-engine ('{{0}}'). This might be a caching issue, consider clearing your browser cache.", this, [ df.psVersionId, this.psVersionID ]));
                    return false;
                }
                
            }
        }else{
            throw new df.Error(999, "There is a version number mismatch between the client-engine ('{{0}}') and the server application ('{{1}}') version numbers.", this, [ df.psVersionId, this.psVersionID ]);
        }
    }
    
    return true;
},

/*
The method passed to this function will be called when the webapp is initialized. Initialization is 
an asynchronous process which requires other functionality to wait. Optionally the name of a view 
can be passed when waiting for a specific view to be synchronized.

The example below waits for the webapp to be synchronized before manipulating global objects.
@code
oWebApp.ready(function(){
    oWebApp.oCommandbar.oMenuBar.oDemoMenu.set("pbRender", false);
});
@code

The example below waits for the oWebCustomer view to be initialized before manipulating objects 
inside the view.
@code
oWebApp.ready("oWebCustomer", function(){
    oWebApp.oWebCustomer.oTabContainer.oBalancesTabPage.set('pbRender', false);
});
@code

@param  sOptView    (optional) Objects name of the view to wait for.
@param  fHandler    Function that needs to be called when ready.
@param  sOptEnv     (optional) Environment object when the handler is called.
*/
ready : function(sView, fHandler, oOptEnv){
    if(typeof(sView) === "string"){
        this.ready(function(){
            if(this[sView] instanceof df.WebView){
                fHandler.call(oOptEnv || this);
            }else{
                if(!this._oLoadViewQueue[sView]){
                    this._oLoadViewQueue[sView] = {
                        aWaiters : [],
                        bLoading : false
                    };
                }
                this._oLoadViewQueue[sView].aWaiters.push({
                    fHandler : fHandler,
                    oEnv : oOptEnv
                });
            }        
        });
    }else{
        oOptEnv = fHandler;
        fHandler = sView;
        
        
        if(!this._bReady){
            this._aLoadQueue.push({
                fHandler : fHandler,
                oEnv : oOptEnv
            });
        }else{
            fHandler.call(oOptEnv || this);
        }
    }
},

/*
This method should be called to render the application. It will render the application as soon as 
the initialization finished to the passed DOM element. The DOM element can be passed as an object 
reference or as a query selector string (like '#viewport'). Using a query selector string allows to 
call this method before the DOM is initialized. The application will render itself inside the 
provided DOM element. 

@code
var oWebApp = new df.WebApp('WebService.wso');
oWebApp.displayApp('#viewport');

...

<div id="viewport"></div>
@code

@param  oRenderTo   The DOM element to render to (object reference or query selector string).
*/
displayApp : function(oRenderTo){

    this.ready(function(){
        var eContent, eRenderTo;
        
        try{
            //  Get reference to element
            if(typeof(oRenderTo) === "string"){
                eRenderTo = df.dom.query(document.body, oRenderTo);
            }else{
                eRenderTo = oRenderTo;
            }
            if(!eRenderTo){
                throw new df.Error(999, "No proper element passed", this);
            }
            
            //  Start rendering the application
            this._eViewPort = eContent = this.render();
            this.afterRender();
            eContent.style.visibility = "hidden";
            eRenderTo.appendChild(eContent);
            this.afterShow();
            this.resize();
            eContent.style.visibility = "";
            
            //  Render the startup view
            if(this._sStartupView){
                this.showView(this._sStartupView);
            }
            
        }catch(oErr){
            this.handleError(oErr);
        }
    });
},

/*
This method should be called to render a single view of the application. It will make sure that the 
view is or gets loaded and render it to the passed DOM element. The DOM element can be passed as 
object reference or as a query selector string (like '#viewport'). This method should only be used 
when rendering a view separate of the rest of the application. The view will render itself inside 
the provided DOM element. This is the adviced method to integrate a single view inside an existing 
web page. To show a view within the rendered application please use the showView method.

@code
var oWebApp = new df.WebApp('WebService.wso');
oWebApp.displayView('oCustomerView', '#customerdiv');

...

<div id="customerdiv"></div>
@code

@param  sView       Name of the view.
@param  oRenderTo   DOM element to render to (object reference or query selector string).
*/
displayView : function(sView, oRenderTo){
    this.ready(function(){
        var eRenderTo;
        
        try{
            //  Get reference to element
            if(typeof(oRenderTo) === "string"){
                eRenderTo = df.dom.query(document.body, oRenderTo);
            }else{
                eRenderTo = oRenderTo;
            }
            if(!eRenderTo){
                throw new df.Error(999, "No proper element passed", this);
            }
            
            //  Create a viewport if we didn't have one already
            if(!this._eViewPort){
                eRenderTo = this._eViewPort = this.renderViewPort(eRenderTo);
            }
            
            //  Check if view is already loaded loaded (might be the default view)
            if(this[sView] && this[sView] instanceof df.WebView){
                this.renderView(this[sView], eRenderTo, true);
            }else{
                this.loadView(sView, null, function(){
                    this.renderView(this[sView], eRenderTo, true);
                });
            }
            
        }catch(oErr){
            this.handleError(oErr);
        }
    });
},

//  - - - - - - - - - View logic - - - - - - - - - - -

/*
This method renders a view onto the provided element. It is called by the several different ways to 
display a view.

@param  oView           The view object.
@param  eRenderTo       The DOM element to render the view into.
@param  bOptNoOnShow    If true the OnShow event won't be fired to the server separately.
@private
*/
renderView : function(oView, eRenderTo){
    if(!oView._bRendered){
        if(oView instanceof df.WebModalDialog){
            //  For a dialog the current view becomes the invoker
            oView._oInvokingView = this._oCurrentWindow || null;
            if(oView._oInvokingView){
                oView.addSync("psInvokingView");
            }
        }else{
            if(this.pbMDI){
                oView.pbFloating = true;
            }
        }
        oView._show(eRenderTo);
        this._oCurrentWindow = oView;
        
        this.resize();
    }
},

/*
This method shows a view or a dialog. It starts by making sure if the dialog is loaded and then it 
will render the view. It will hide the currently visible view if needed. The view is shown within 
the application. To render a view separately the displayView method should be used.

@param  sName   The object name of the view (case sensitive).

@client-action
*/
showView : function(sName){
    function doShow(oView){
        if(oView instanceof df.WebModalDialog){
        
            //  Modal dialogs are queued using the 'modal queue' to prevent them from showing on top of errors or info boxes displayed before the dialog.
            this._aModalQueue.push({
                fFunc : function(tDetails){
                    this.renderView(oView, this._eRegionCenter);
                    
                    //  We don't want to hold up other dialogs in the queue
                    tDetails.bFinished = true;
                    this.processModal();
                },
                bFinished : false,
                bDisplayed : false
            });
            
            this.processModal();
        }else{
            //  If its not MDI we need to close the current view
            if(!this.pbMDI && this._oCurrentView){
                this.hideView(this._oCurrentView);
            }
            this.renderView(oView, this._eRegionCenter);
            this._oCurrentView = oView;
        }
    }
    
    //  Check if it is already loaded
    if(this[sName] && this[sName] instanceof df.WebView){
        doShow.call(this, this[sName]);
    }else{
        this.loadView(sName, ((this._oCurrentWindow && this._oCurrentWindow._sName) || ""), doShow);
    }
},

/*
This function closes a view or a dialog. That means that it stops rendering the view and with MDI or 
a modal dialog it determines which view will be the new current view.

@param  sView   String with the name of the view.
@param  bOptNohide
@client-action
*/
hideView : function(sView){
    var oView;
    
    //  Param can be name or object
    oView = (typeof sView === "string" ? this[sView] : sView);
        
    //  Make sure we are dealing with a view here
    if(oView instanceof df.WebView){
        oView._hide();
        if(this._oCurrentWindow === oView){
            this._oCurrentWindow = null;
        }
        if(this._oCurrentView === oView){
            this._oCurrentView = null;
        }
        
        if(oView instanceof df.WebModalDialog){
            if(oView._oInvokingView){
                this._oCurrentWindow = oView._oInvokingView;
            }
        }else{
            if(this.pbMDI){
                while(!oView._bRendered){
                    oView = this._aFocussed.pop();
                }
                
                if(oView && oView._bRendered){
                    oView.bringFront();
                }
            }
        }
    }
},

/*
This method loads a view from the server by making an AJAX Call.

@param  sName       The name of the view.
@param  fHandler    Handler method that is called when the view is loaded.
@param  oEnv        (Optional) Object used as context when calling the handler method.
*/
loadView : function(sName, sOptInvoker, fHandler, oEnv){
    
    this.ready(function(){
        //  Load a view
        if(this[sName] && this[sName] instanceof df.WebView){
            if(fHandler){
                fHandler.call(oEnv || this, this[sName]);
            }
        }else{
            //  Register view loading
            if(!this._oLoadViewQueue[sName]){
                this._oLoadViewQueue[sName] = {
                    aWaiters : [],
                    bLoading : false
                };
            }
            if(this._oLoadViewQueue[sName].bLoading){
                return;
            }
            this._oLoadViewQueue[sName].bLoading = true;
            
            //  Add handler method to waiting queue
            if(fHandler){
                this._oLoadViewQueue[sName].aWaiters.push({
                    fHandler : fHandler,
                    oEnv : oEnv
                });
            }
            
            //  Fire the loadView action
            var oAction = new df.ServerAction();
            oAction.oWO     = this;
            oAction.sAction = "loadView";
            oAction.aParams = [ sName, sOptInvoker || "" ];
            
            oAction.eCallMode = df.cCallModeWait;
    
            oAction.fHandler = function(){
                var aWaiters, i, oView = this[sName];
                
                try{
                    if(oView instanceof df.WebView){
                    
                        //  Call handlers
                        aWaiters = this._oLoadViewQueue[sName].aWaiters;
                        for(i = 0; i < aWaiters.length; i++){
                            aWaiters[i].fHandler.call(aWaiters[i].oEnv || this, oView);
                        }
                        
                        //  Remove from registration
                        this._oLoadViewQueue[sName] = null;
                    }else{
                        this._oLoadViewQueue[sName].bLoading = false;
                        throw new df.Error(999, "No view definition received for '{{0}}'", this, [sName]);
                        
                    }
                }catch(oErr){
                    this.handleError(oErr);
                }
            };
            oAction.oHandlerEnv = this;
            
            oAction.aViews.push(sOptInvoker || null);
            oAction.aViews.push(sName);
            
            this.handleAction(oAction);
        }
    }, this);
},

/*
This method unloads a view completely by destroying the associated objects. It will make sure that 
the view has to be loaded freshly from the server when it is opened the next time.

@param  sView    The object name of the view to unload.

@client-action
*/
unloadView : function(sView){
    var oView, i;
    
    if(this[sView] && this[sView] instanceof df.WebView){
        //  Make sure it is hidden
        this.hideView(sView);
        
        //  Get reference
        oView = this[sView];
        
        //  Destroy
        if(oView.destroy){
            oView.destroy();
        }
        
        //  Remove from views array
        for(i = 0; i < this._aViews.length; i++){
            if(this._aViews[i] === oView){
                this._aViews.splice(i, 1);
            }
        }
        
        //  Remove reference
        delete this[sView];
    }        
},

//  - - - - - - - - - Window logic - - - - - - - - - - -

/*
This method is called by the window when it receives the focus. It allows the webapp to keep track 
of the focus.

@private
*/
windowFocus : function(oWin){
    var i;
    
    if(oWin instanceof df.WebView){
        if(oWin !== this._oCurrentWindow){
            if(this.pbMDI){
                //  Remove ourselve from the focus tree
                for(i = 0; i < this._aFocussed.length; i++){
                    if(this._aFocussed[i] === oWin){
                        this._aFocussed.splice(i, 1);
                        break;
                    }
                }
                
                //  Add ourselve to the end
                this._aFocussed.push(oWin);
            }
            
            this._oCurrentWindow = oWin;
        }
    }
},

objFocus : function(oObj){
    this._oCurrentObj = oObj;
},

objBlur : function(oObj){

},

returnFocus : function(){
    if(this._oCurrentObj){
        this._oCurrentObj.focus();
    }
},

getFocusObjName : function(){
    if(this._oCurrentObj instanceof df.WebBaseUIObject){
        return this._oCurrentObj.getLongName();
    }
    return "";
},

set_pbMDI : function(bVal){
    if(this._eRegionCenter){
        this._eRegionCenter.style.position = (bVal ? "relative" : "");
    }
},

//  - - - - - - - - - Object creation - - - - - - - - - - -

/*
Method that creates the instances of the JavaScript objects based on the JSON description. It will 
walk through the structure and instantiates all the objects. The resulting objects structure will be 
equal to the nested object structure on the server.

@param  tDef    JSON data objects containing object definitions.
@private
*/
initJSON : function(tDef){
    
    function initObj(tDef, oContext){
        var i, oObj, FConstructor;
        
        //  If no name is given it must be the global webapp object
        if(tDef.sType === "df.WebApp"){
            oObj = this;
        }else{
        
            //  Check for name conflict
            if(!oContext[tDef.sName]){
                
                //  Find constructor
                FConstructor = this.getConstructor(tDef.sType, tDef);
                if(typeof(FConstructor) === "function"){
                    
                    //  Create new instance
                    oContext[tDef.sName] = oObj = new FConstructor(tDef.sName, oContext);
                }else{
                    throw new df.Error(999, "Could not find class '{{0}}'", this, [tDef.sType]);
                }
            }else{
                throw new df.Error(999, "Naming conflict with child object '{{0}}'", this, [tDef.sName]);
            }
        }
        
        //  Set the published property values
        for(i = 0; i < tDef.aProps.length; i++){
            //  Check naming convention
            if(tDef.aProps[i].sN.charAt(0) !== "_"){
                //  Check if not conficting with child object or function
                if(!oObj[tDef.aProps[i].sN] || (typeof(oObj[tDef.aProps[i].sN]) !== "object" && typeof(oObj[tDef.aProps[i].sN]) !== "function")){
                    oObj._set(tDef.aProps[i].sN, tDef.aProps[i].sV, false, false);
                    //oObj[tDef.aProps[i].sN] =  tDef.aProps[i].sV; // df.castType(tDef.aProps[i].sN, tDef.aProps[i].sV);
                    //oObj.set(tDef.aProps[i].sN, tDef.aProps[i].sV);
                }else{
                    throw new df.Error(999, "Naming conflict with property '{{0}}' of object '{{1}}'", this, [ tDef.aProps[i].sN,  tDef.sName ] );
                }
            }else{
                throw new df.Error(999, "Published property '{{0}}' of object '{{1}}' properties should not start with an '_'", this, [tDef.aProps[i].sV, tDef.sName ]);
            }
        }
        
        //  Register the object
        this.newWebObject(oObj, oContext, tDef);
        
        //  Call create
        oObj.create(tDef);
        
        //  Create children
        for(i = 0; i < tDef.aObjs.length; i++){
            initObj.call(this, tDef.aObjs[i], oObj);
        }
        
        return oObj;
    }
        
    return initObj.call(this, tDef, this);
},

/*
Called whenever a new Web Object is created. Registers the Web Object with its parent.

@param  oObj    The newly created web object.
@param  oParent The parent of the new web object.
@param  tDef    The JSON definition received from the server.
*/
newWebObject : function(oObj, oParent, tDef){
    //  Register new child control
    if(oParent.addChild && oParent !== oObj){
        oParent.addChild(oObj);
    }
},

getConstructor : function(sType){
    return df.sys.ref.getNestedProp(sType);
},

findObj : function(sName){
    var i, aParts, oObj;
    
    if(sName === ""){
        return this;
    }

    aParts = sName.split(".");

    oObj = this;
    for(i = 0; i < aParts.length && oObj; i++){
        oObj = oObj[aParts[i]];
    }
    
    return (typeof oObj === "object" && oObj) || null;
},


//  - - - - - - - - - Server actions - - - - - - - - - - -

/*
Starts the processing of a server action (df.ServerAction). The actions are added to a pending call 
(df.ServerCall) that is waiting to be sent. Actions with call mode df.cCallModeWait or higher can be 
can be canceled if a call with df.cCallModeWait is already waiting or being processed. The 
processCall method will be called to send the call. This happens after a short timeout giving other 
actions a chance to be queued as well.

@param  oAction  (df.ServerAction).
@return True if succesfully queued. False if canceled!
@private
*/
handleAction : function(oAction){
    oAction.aViews.push(this._oCurrentWindow);
    
    if(this._oPendingCall){
        //  Only queue if call mode below wait or pending call is below wait
        if(this._oPendingCall.eCallMode < df.cCallModeWait || oAction.eCallMode < df.cCallModeWait){
            this._oPendingCall.aActions.push(oAction);
            
            if(this._oPendingCall.eCallMode < oAction.eCallMode){
                this._oPendingCall.eCallMode = oAction.eCallMode;
                if(oAction.eCallMode === df.cCallModeProgress){
                    this._oPendingCall.sProcessMessage = oAction.sProcessMessage;
                }
            }
            
            this.processCall();
            
            return true;
        }
    }else{
        if(!this._oSendingCall || !this._oSendingCall.pbSending || this._oSendingCall.eCallMode < df.cCallModeWait){
            this._oPendingCall = new df.ServerCall();
            
            this._oPendingCall.aActions.push(oAction);
            this._oPendingCall.sFocus = this.getFocusObjName();
            
            this._oPendingCall.eCallMode = oAction.eCallMode;
            if(oAction.eCallMode === df.cCallModeProgress){
                this._oPendingCall.sProcessMessage = oAction.sProcessMessage;
            }
            
            this.processCall();
        
            return true;
        }
    }
    
    return false;
},

/*
Registers a handler function that is called when the current server call is finished. If no call is 
pending or being sent the handler is called directly.

@param  fHandler    Handler function.
@param  oEn         Optional environment object.
@private
*/
waitForCall : function(fHandler, oEnv){
    if(this._oPendingCall){
        this._oPendingCall.aWaiters.push({ fHandler : fHandler, oEnv : oEnv });
    }else if(this._oSendingCall){
        this._oSendingCall.aWaiters.push({ fHandler : fHandler, oEnv : oEnv });
    }else{
        fHandler.call(oEnv || null);
    }
},

/*
Cancels an action based on its name of web object. It will remove all matching actions from the 
pending call and from the call that is being sent but didn't start processing yet.

@param  oWO     Web object.
@param  sAction Action name.
@private
*/
cancelAction : function(oWO, sAction){
    var aActions, i;
    
    //  For a pending call we remove the entire action if found and cancel the call if empty
    if(this._oPendingCall){
        aActions = this._oPendingCall.aActions;
        
        for(i = 0; i < aActions.length; i++){
            if(aActions[i].oWO === oWO && aActions[i].sAction === sAction){
                aActions.splice(i, 1);
                i--;
            }
            if(aActions.length === 0){
                this._oPendingCall = null;
                break;
            }
        }
    }
},

/*
Checks if a pending call is available and can be sent. This happens after a short timeout so that 
actions can still be added to the pending call from the current execution flow. This method is 
called after processing a call or when a new action is registered.

@private
*/
processCall : function(){
    var that = this;
    
    function process(){
        try{
            if(that._oPendingCall){
                if(!that._oSendingCall){
                    that.sendCall(that._oPendingCall);
                    that._oPendingCall = null;
                }
            }
        }catch(oErr){
            that.handleError(oErr);
        }
    }
    
    setTimeout(process, 10);
},

/*
This core method of the framework is responsible for sending calls with actions to the server. It 
contains the logic for the different call modes so it can render the waiting dialog, show the 
waiting cursor and it blocks the modal queue. It starts by preparing the UI, then it will gather the 
data, send the call and then handle the response. The inline function fHandler is responsible for 
handling the response. It will parse the JSON, call the handleHeader method and call the handlers. 
Then it will cleanup the UI and the data structures. Finally it will trigger a possible next call by 
calling processCall.

@param  oCall   Call data (df.ServerCall).
@private
*/
sendCall : function(oCall){
    var oRequest, oAction ,oData, oDialog = null, oDialogBlock = null, oLabel, eMask, tWait = null, aViews, aActions, i;
    
    //  Register as the call currently being sent
    this._oSendingCall = oCall;
    oCall.bSending = true;
    
    //  For calls of type 'wait' we add the dragmask to prevent clicks and show the wait cursor
    if(oCall.eCallMode === df.cCallModeWait){
        tWait = setTimeout(function(){
            eMask = df.gui.dragMask();
            eMask.style.cursor = "wait";
        }, 300);
    }
    
    //  For calls that are of the type progress we display a progress dialog
    if(oCall.eCallMode >= df.cCallModeProgress){
        if(this.OnShowProgress.fire(this, { })){
            //  Block the modal queue (due to focus issues)
            this._aModalQueue.push(oDialogBlock = {
                fFunc : null,
                bFinished : false,
                bDisplayed : true
            });
        
            oDialog = new df.WebModalDialog(null, this);
            oDialog.psCaption = "";
            oDialog.pbResizable = false;
            oDialog.pbShowClose = false;
            
            oLabel = new df.WebLabel(null, oDialog);
            oLabel.psCaption = oCall.sProcessMessage || this.getTrans("loading") + "..";
            oLabel.psCSSClass = "WebMsgBoxProgress";
            oDialog.addChild(oLabel);
            
            oDialog.show();
        }
    }
    
    //  Handler method called when a response is received
    function fHandler(oEvent){
        var tResponse, i;
    
        //  Unlock webapp
        oCall.bSending = false;
        
        try{
            //  Parse response
            tResponse = oEvent.oSource.getResponseValue();
            
            if(tResponse){
                //  Handle header
                oEvent.bError = this.handleHeader(tResponse.Header) || oEvent.bError;
                            
                //  Call handlers
                if(oCall.aActions.length === tResponse.asReturnValues.length){
                    for(i = 0; i < oCall.aActions.length; i++){
                        oEvent.sReturnValue = tResponse.asReturnValues[i];
                        
                        if(oCall.aActions[i].fHandler){
                            oCall.aActions[i].fHandler.call(oCall.aActions[i].oHandlerEnv || null, oEvent);
                        }
                    }
                }else{
                    //  Error?
                }
            }
        }catch(oErr){
            this.handleError(oErr);
        }finally{
            //  Finish call
            this._oSendingCall = null;
        
            //  Hide mask / wait cursor
            if(oCall.eCallMode === df.cCallModeWait){
                clearTimeout(tWait);
                
                if(eMask){
                    eMask.parentNode.removeChild(eMask);
                    eMask = null;
                }
            }
            
            // Hide the progress dialog
            if(oCall.eCallMode >= df.cCallModeProgress){
                this.OnHideProgress.fire(this, { });
                
                if(oDialog){
                    oDialog.hide();
                    oDialog = null;
                    oLabel = null;
                    
                    //  Unblock the modal queue
                    oDialogBlock.bFinished = true;
                    this.processModal();
                }
            }
            
            //  Call functions waiting for call to finish
            for(i = 0; i < oCall.aWaiters.length; i++){
                oCall.aWaiters[i].fHandler.call(oCall.aWaiters[i].oEnv || null, oEvent);
            }
            
            //  Intiate next call
            this.processCall();
        }
    }
    
    
    //  Generate request data
    aViews = [];
    aActions = [];
    for(i = 0; i < oCall.aActions.length; i++){
        oAction = oCall.aActions[i];
        
        aActions.push({
            sTarget : oAction.oWO.getLongName(),
            sAction : oAction.sAction,
            aParams : oAction.aParams,
            aData   : oAction.aData
        });
        
        aViews = aViews.concat(oAction.aViews);
    }
    
    //  Assemble request data
    oData = {
        ActionRequest : {
            Header : this.getHeader(aViews, oCall.sFocus),
            aActions : aActions
        }
    };
    
    //  Create & send the call
    oRequest = new df.ajax.JSONCall("CallAction", oData, this.psWebService, this);
    
    oRequest.onFinished.addListener(function(oEvent){
        oEvent.bError = false;
        
        fHandler.call(this, oEvent);
    }, this);
    
    oRequest.onError.addListener(function(oEvent){
        oEvent.bError = true;
        
        fHandler.call(this, oEvent);
    }, this);
    
    oRequest.send(true);
},

/*
This core method of the framework is responsible for generating the header of a call that is sent to 
the server. This header consists of the session key, name of the focused object, DDO definitions per 
view and the set of synchronized properties. It gets a list of views (or a single view) that 
determines which views are involved in the call. For each view it will add the DDO definitions and 
the synchronized properties.  To get the synchronized properties the recursive getSynched method is 
called.

@param  oView       The view(s) that need to be incorporated. Can be an array of views or a single 
                    view. A view can be passed as a string name or an object reference. May contian 
                    duplicates.
@param  sFocus      Name of the currently focussed object.
@private
*/
getHeader : function(oView, sFocus){
    var oDone = {}, tHead, i;
    
    tHead = {
        sSessionKey : this.getSessionKey(),
        sFocus : sFocus,
        aDDODefs : [],
        aSyncProps : []
    };
    
    //  Gather global synchronized properties
    this.getSynced(tHead.aSyncProps);
    
    function addView(oView){
        var oViewObj;
        
        //  Try to find the view object
        if(typeof(oView) === "string"){
            oViewObj = this.findObj(oView);
        }else{
            oViewObj = oView;
        }
    
        if(oViewObj instanceof df.WebView){
            if(!oDone[oViewObj._sName]){
                oDone[oViewObj._sName] = true; //  Make sure that we don't add views twice
                
                //  Add invoker view
                if(oViewObj._oInvokingView){
                    addView(oViewObj._oInvokingView);
                }
                
                //  Get synchonized props
                oViewObj.getSynced(tHead.aSyncProps);
                
                //  Add DDO details
                if(oViewObj._oDDData){
                    tHead.aDDODefs.push(oViewObj._oDDData);
                }else{
                    throw new df.Error(999, "View {{0}} doesn't have DDO data yet!", this, [ oViewObj._sName ]);
                }
            }
        }else if(typeof(oView) === "string"){
            //  This means that the view doesn't exist yet so we load synchronized properties from the cache
            if(!oDone[oView]){
                oDone[oView] = true;
                this.getCachedSyncProps(oView, tHead.aSyncProps);
            }
        }
    }
    
    if(oView instanceof Array){
        for(i = 0; i < oView.length; i++){
            addView.call(this, oView[i]);
        }
    }else{
        addView.call(this, oView);
    }
    
    return tHead;
},

/*
This is one of the most important methods of the framework as it handles the header section received 
back from the server after a call. This header section can contain object definitions of new 
objects, updates synchronized properties, updated DDO definitions, client actions that need to be 
executed and possible errors.

@param  oHeader     The header data.
@private
*/
handleHeader : function(oHeader){
    var i, tObj, x, oWO, oView, bErr = false, tAct;
    
    //  Create objects if a definition has returned
    for(i = 0; i < oHeader.aObjectDefs.length; i++){
        this.initJSON(oHeader.aObjectDefs[i]);
    }
    
    //  Loop through objects with synced props
    for(i = 0; i < oHeader.aSyncProps.length; i++){
        tObj = oHeader.aSyncProps[i];

        //  Find WebObject
        oWO = this.findObj(tObj.sO);
        if(oWO){
            //  Loop through props and set them
            for(x = 0; x < tObj.aP.length; x++){
                oWO._set(tObj.aP[x].sN, tObj.aP[x].sV, true, true);
            }
        
        }else{
            //  We place it in the cache
            this.cacheSyncProps(tObj);
        }
    }
    
    //  The response can have details on multiple views
    for(i = 0; i < oHeader.aDDODefs.length; i++){
        oView = this.findObj(oHeader.aDDODefs[i].sView);
        if(oView){
            //  Store DDO details
            oView._oDDData = oHeader.aDDODefs[i];
        }
    }
    
    //  Display the errors
    bErr = this.handleServerErrors(oHeader.aErrors);

    //  Call the action methods
    for(i = 0; i < oHeader.aActions.length; i++){
        tAct = oHeader.aActions[i];
        oWO = this.findObj(tAct.sTarget);
        if(oWO){
            if(typeof oWO[tAct.sName] === "function"){
                
                //  Pass on action data
                oWO._aActionData = tAct.aData;
                
                try{
                    oWO[tAct.sName].apply(oWO, tAct.aParams);
                }catch(oErr){
                    this.handleError(oErr);
                }
                
                //  Clear action data
                oWO._aActionData = null;
                
            }else{
                throw new df.Error(999, "Action method not found '{{0}}' on object '{{1}}'", this, [ tAct.sName, tAct.sTarget ]);
            }
        }else{
            throw new df.Error(999, "Could not find object '{{0}}'", this, [ tAct.sTarget ]);
        }
    }
    
    return bErr;
},

/*
This method puts new synchronized property values in the cache. This cache has the same structure as 
in which the synchronized properties are sent. If properties where already in the cache it will 
merge them and update to the new value. The cache is allows synchronized properties to be set on 
views before they are loaded. The synchronized loading of views creates a need for this. This method 
is called when synchronized properties are received for objects that don't exist.

@param  tObj    The struct / JSON object representing the synchronized properties.
@private
*/
cacheSyncProps : function(tObj){
    var i, x, y, tCacheObj, bFound;
    
    //  See if we already have this object in cache
    for(i = 0; i < this._aSyncPropCache.length; i++){
        if(this._aSyncPropCache[i].sO === tObj.sO){
            
            //  Now we need to merge the synced props into the existing cache object
            tCacheObj = this._aSyncPropCache[i];
            
            props:for(x = 0; x < tObj.aP.length; x++){
                bFound = false;
                
                for(y = 0; y < tCacheObj.aP.length && !bFound; y++){
                    if(tCacheObj.aP[y].sN === tObj.aP[x].sN){
                        tCacheObj.aP[y].sV = tObj.aP[x].sV;
                        
                        bFound = true;
                    }                
                }
                if(!bFound){
                    tCacheObj.aP.push(tObj.aP[x]);
                }
            }
        
            return;
        }
    }
    
    //  Else we can simply add the new object
    this._aSyncPropCache.push(tObj);
},

/*
This method gets cached synchronized properties for a specific view. It goes through the cache and 
returns and removes all the synchronized properties for that view. This happens when loading a view 
and the caching of synchronized properties allows developers to WebSet on views before they are on 
the client (the ASynchronized loading creates a need for this).

@param  sView       The object name of the view.
@param  aSyncProps  Reference to the synchronized properties array to which the result is added.
@private
*/
getCachedSyncProps : function(sView, aSyncProps){
    var i, sStart, iLen;
    
    sStart = sView + '.';
    iLen = sStart.length;
    for(i = 0; i < this._aSyncPropCache.length; i++){
        //  Check if part of the view
        if(this._aSyncPropCache[i].sO === sView || this._aSyncPropCache[i].sO.substr(0, iLen) === sStart){
            //  Add to result
            aSyncProps.push(this._aSyncPropCache[i]);
            
            //  Remove from cache
            this._aSyncPropCache.splice(i, 1);
            i--;
        }
    }
},


// - - - - - - -  Positioning and styling - - - - - - - - 

position : function(){

},

set_psTheme : function(sVal){
    if(this.psTheme !== sVal){
        //  Remove the old theme from the wrapping div
        if(this._eElem){
            df.dom.removeClass(this._eElem, this.psTheme);
        }else if(this._eViewPort){
            df.dom.removeClass(this._eViewPort, this.psTheme);
        }
    
        this.psTheme = sVal;
        this.updateCSS(true);
        
        //  Set the theme name to the wrapping div
        if(this._eElem){
            df.dom.addClass(this._eElem, this.psTheme);
        }else if(this._eViewPort){
            df.dom.addClass(this._eViewPort, this.psTheme);
        }
    }
},

updateCSS : function(bResize){
    var aStyles, i, eHead, that = this;
    
    
    if(!this._eStyleSystem || !this._eStyleTheme || !this._eStyleApplication){
        
        //  Get references to existing CSS elements
        aStyles = df.dom.query(document, "link", true);
        for(i = 0; i < aStyles.length; i++){
            if(aStyles[i].href.indexOf("DfEngine/system.css") > 0){
                this._eStyleSystem = aStyles[i];
            }
            if(aStyles[i].href.indexOf("CssThemes/") > 0 && aStyles[i].href.indexOf("theme.css") > 0){
                this._eStyleTheme = aStyles[i];
            }
            if(aStyles[i].href.indexOf("CssStyle/application.css") > 0){
                this._eStyleApplication = aStyles[i];
            }
        }
        
        //  Create system CSS include if needed
        if(!this._eStyleSystem){
            this._eStyleSystem = df.dom.createCSSElem(this._sRootPath + "DfEngine/system.css");
            
            eHead = document.head || document.getElementsByTagName("head")[0];
            if(eHead.firstChild){
                eHead.insertBefore(this._eStyleSystem, eHead.firstChild);
            }else{
                eHead.appendChild(this._eStyleSystem);
            }
        }
        
        //  Create theme CSS include if needed
        if(!this._eStyleTheme){
            this._eStyleTheme = df.dom.createCSSElem(this._sRootPath + "CssThemes/" + this.psTheme + "/theme.css");
            df.dom.insertAfter(this._eStyleTheme, this._eStyleSystem);
            // document.body.appendChild(this._eStyleTheme);
        }
        
        //  Create applciation CSS include if needed
        if(!this._eStyleApplication){
            this._eStyleApplication = df.dom.createCSSElem(this._sRootPath + "CssStyle/application.css");
            df.dom.insertAfter(this._eStyleApplication, this._eStyleTheme);
        }
    }
    
    //  Update theme path if needed
    if(this._eStyleTheme.href.indexOf(this._sRootPath + "CssThemes/" + this.psTheme + "/theme.css") < 0){
        this._eStyleTheme.href = this._sRootPath + "CssThemes/" + this.psTheme + "/theme.css";
    }
    
    //  Call resize method after 'CSS Test' has finished
    if(bResize){
        this.testCSS(function(){
            this.resize();
            
            setTimeout(function(){
				try{
					that.resize();
				}catch(oErr){
					that.handleError(oErr);
				}
            }, 200);
        });
    }
},

testCSS : function(fHandler){
    var eTest, that = this, iCount = 0;
    
    eTest = df.dom.create('<div id="df_load_test" style="position: absolute"></div>');
    document.body.appendChild(eTest);
    
    function check(){
        if((eTest && eTest.clientHeight >= 1) || iCount > 100){
            document.body.removeChild(eTest);
            fHandler.call(that);
        }else{
            setTimeout(check, 20);
            iCount++;
        }
    }
    
    check();
},

onResize : function(oEvent){
    var that = this;
    
    if(this._tResizeTimeout){
        clearTimeout(this._tResizeTimeout);
        this._tResizeTimeout = null;
    }
    
    this._tResizeTimeout = setTimeout(function(){
        try{
            that._tResizeTimeout = null;
            that.resize();
        }catch(oErr){
            that.handleError(oErr);
        }
    }, 100);
    // this.resize();
},


prepareSize : function(){
    var iRes = df.WebApp.base.prepareSize.call(this);
    
    this._bStretch = true;
    
    return iRes;
},

resize : function(){
    var iHeight, iWidth, i;

    //	Call standard resize procedures
    this.resizeHorizontal();
    this.resizeVertical();
	
    
    //  Resize the view(s)
    if(this._eElem){
        iHeight = this._iMiddleHeight - df.sys.gui.getVertBoxDiff(this._eRegionCenter, 0);
        iWidth = this._eRegionCenter.clientWidth - df.sys.gui.getHorizBoxDiff(this._eRegionCenter, 2);
        
        for(i = 0; i < this._aViews.length; i++){
            if(this._aViews[i]._bRendered){
				if(this._aViews[i].piWidth > 0){
					this._aViews[i].setOuterWidth(this._aViews[i].piWidth);
				}else{
					this._aViews[i].setOuterWidth(iWidth);
				}      
				
                this._aViews[i].prepareSize();
				
                if(this._aViews[i].piHeight > 0){
					this._aViews[i].setOuterHeight(this._aViews[i].piHeight);
				}else if(this._aViews[i]._bStretch){
					
					this._aViews[i].setOuterHeight(iHeight);
				}               
            
                this._aViews[i].resize();
            }
        }
    }else{
        for(i = 0; i < this._aViews.length; i++){
            if(this._aViews[i]._bRendered){
				this._aViews[i].prepareSize();
				this._aViews[i].resize();
            }
        }
    }
},

// - - - - - - -  Generic framework functions - - - - - - - - 

/*
This method shows an info box with a message and a title. It tempolary uses the alert but will use 
the WebModalDialog later.

@param  sMessage   The message to display.
@param  sCaption          Text displayed in the title bar.

@client-action
*/
showInfoBox : function(sMessage, sCaption){
    function showInfo(tDetails){
        var that = this, oDialog, oLabel, oCloseBtn, oContentPnl, oButtonPnl;
        
        oDialog = new df.WebModalDialog(null, this);
        oDialog.psCaption = sCaption;
        oDialog.piMinWidth = 400;
        oDialog.piMinHeight = 150;
        
        oDialog.OnSubmit.addListener(function(oEvent){
            oDialog.hide();
        }, this);
        
        oDialog.OnHide.addListener(function(oEvent){
            tDetails.bFinished = true;
            setTimeout(function(){
				try{
					that.processModal();
				}catch(oErr){
					that.handleError(oErr);
				}
            }, 20);
        }, this);
        
        oContentPnl = new df.WebPanel(null, oDialog);
        oContentPnl.peRegion = df.ciRegionCenter;

        oDialog.addChild(oContentPnl);
        
        oLabel = new df.WebLabel(null, oDialog);
        oLabel.psCaption = sMessage;
        oLabel.psCSSClass = "WebMsgBoxInfo";
        oContentPnl.addChild(oLabel);
        
        oButtonPnl = new df.WebPanel(null, oDialog);
        oButtonPnl.peRegion = df.ciRegionBottom;
        oButtonPnl.piColumnCount = 3;
        oDialog.addChild(oButtonPnl);
        
        oCloseBtn = new df.WebButton(null, oDialog);
        oCloseBtn.psCaption = this.getTrans("ok");
        oCloseBtn.piColumnIndex = 2;
        oCloseBtn.pbShowLabel = false;
        oCloseBtn.OnClick.addListener(function(oEvent){
            oDialog.hide();
        }, this);
        oButtonPnl.addChild(oCloseBtn);
        
        
        oDialog.show();
        
        this.ready(function(){
            oDialog.resize();
            oCloseBtn.focus();
        });
    }
    
    this._aModalQueue.push({
        fFunc : showInfo,
        bFinished : false,
        bDisplayed : false
    });
    
    this.processModal();
},

/*
This method shows a message box with a message, title and a set of buttons. After a button is 
clicked it will fire a server action to the provided object & message to handle the response. It 
receives the message, title and list of buttons from the server. Note that the message box will be 
queued in the alert queue so it will wait for other alerts to be closed before displaying. 

@param  sMessage   The message to display.
@param  sCaption   Text displayed in the title bar.

@client-action
*/
showMessageBox : function(sReturnObj, sReturnMsg, sMessage, sCaption, sLabelCSSClass, iDefaultButton){
    var oReturnObj, aButtons;
    
    //  Search for return object
    oReturnObj = this.findObj(sReturnObj);
    if(!oReturnObj){
        throw new df.Error(999, "Return WebObject not found '{{0}}'", this, [ sReturnObj ]);
    }
    
    //  Get reference to action data specifying the buttons
    aButtons = (this._aActionData && this._aActionData[0] && this._aActionData[0].aValues) || null;
    if(!aButtons){
        throw new df.Error(999, "No buttons specified", this);
    }
    
    //  Call the real message box function
    this.showMsgBox(sMessage, sCaption, sLabelCSSClass, aButtons, iDefaultButton, function(iBtn, oDialog){
        oReturnObj.serverAction(sReturnMsg, [ iBtn ], null, function(){ 
            oDialog.hide();
        });
    });
},

showMsgBox : function(sMessage, sCaption, sLabelCSSClass, aButtons, iDefaultButton, fHandler){
    
    

    function showInfo(tDetails){
        var that = this, oDialog, oLabel, oBtn,  oContentPnl, oButtonPnl, i, oDefaultBtn = null;
        
        //  Create dialog with panel
        oDialog = new df.WebModalDialog(null, this);
        oDialog.psCaption = sCaption;
        oDialog.piMinWidth = 400;
        oDialog.piMinHeight = 150;
        oDialog.pbShowClose = false;
        
        oDialog.OnHide.addListener(function(oEvent){
            tDetails.bFinished = true;
            setTimeout(function(){
				try{
					that.processModal();
				}catch(oErr){
					that.handleError(oErr);
				}
            }, 20);
        }, this);
        
        //  Create content panel with message
        oContentPnl = new df.WebPanel(null, oDialog);
        oContentPnl.peRegion = df.ciRegionCenter;

        oDialog.addChild(oContentPnl);
        
        oLabel = new df.WebLabel(null, oDialog);
        oLabel.psCaption = sMessage;
        oLabel.psCSSClass = sLabelCSSClass;
        oContentPnl.addChild(oLabel);
        
        //  Create button panel
        oButtonPnl = new df.WebPanel(null, oDialog);
        oButtonPnl.peRegion = df.ciRegionBottom;
        oButtonPnl.piColumnCount = aButtons.length + 2;
        oDialog.addChild(oButtonPnl);
        
        //  Handler executed when a button is clicked
        function handleBtnClick(oEvent){
            fHandler.call(this, oEvent.oSource._iConfirmId, oDialog);
        }
        
        //  Generate buttons
        iDefaultButton = parseInt(iDefaultButton, 10);
        
        for(i = 0; i < aButtons.length; i++){
            oBtn = new df.WebButton(null, oDialog);
            oBtn.psCaption = aButtons[i];
            oBtn.piColumnIndex = (i + 1);
            oBtn.pbShowLabel = false;
            oBtn._iConfirmId = (i + 1);
            oBtn.OnClick.addListener(handleBtnClick);
            oButtonPnl.addChild(oBtn);
            
            if(oBtn._iConfirmId === iDefaultButton){
                oDefaultBtn = oBtn;
            }
        }
        
        oDialog.show();
        
        //  Resize and give focus when application is ready
        this.ready(function(){
            oDialog.resize();
            if(oDefaultBtn){
                oDefaultBtn.focus();
            }
        });
            
    }
    
    this._aModalQueue.push({
        fFunc : showInfo,
        bFinished : false,
        bDisplayed : false
    });
    
    this.processModal();
},

/*
This method will process the next item in the modal queue. It starts by removing dialogs marked as 
finished from the queue. Then it will display the next dialog in the queue (if there is one and it 
isn't already displayed). The modal queue contains dialogs that need to be displayed modally. We 
don't want to display them on top of each other and since they are not really modal we will have to 
queue them. In practice the queue contains methods that will display the dialog.
*/
processModal : function(){
    if(this._aModalQueue.length > 0){
        //  Clear finished alerts from the queue
        while(this._aModalQueue[0] && this._aModalQueue[0].bFinished){
            this._aModalQueue.shift();
        }
        
        //  Display next (if needed)
        if(this._aModalQueue.length > 0 && !this._aModalQueue[0].bDisplayed){
            this._aModalQueue[0].bDisplayed = true;
            this._aModalQueue[0].fFunc.call(this, this._aModalQueue[0]);
        }
    }
},

/*
This method writes text to the console of JavaScript debuggers. This can be used for debugging 
purposes. A singleton method df.log is used to do this which adds timing and checks if the console 
is available. 

@param  sText   String with text to show on the console.
@client-action
*/
log : function(sText){
    df.log(sText);
},

/*
This method determines the translation based on a label.

@param  sLbl        The label of the translation.
@param  bOptNull    If true then null is returned if the translation is not found, else it returns
                    the label wrapped by {{ ... }}.
@return The translation.
@private
*/
getTrans : function(sLbl, bOptNull){
    if(this._oTranslations[sLbl]){
        return this._oTranslations[sLbl];
    }
    if(bOptNull){
        return null;
    }
    return "{{" + sLbl + "}}";
},

/*
Initializes the translation system. The translations are delivered as name value pairs and we store 
them as object properties for quick access. Translations for dates are stored globally because they 
are also accessed by some of the global date formatting functions in the system library.

@private
*/
initTrans : function(aTrans){
    var i;
    
    //  Store tanslations in quick access object
    for(i = 0; i < aTrans.length; i++){
        this._oTranslations[aTrans[i].sN] = aTrans[i].sV;
    }
    
    //  We store the dates globally
    df.lang = {
        monthsLong : [
            this.getTrans("january"),
            this.getTrans("february"),
            this.getTrans("march"),
            this.getTrans("april"),
            this.getTrans("may"),
            this.getTrans("june"),
            this.getTrans("july"),
            this.getTrans("august"),
            this.getTrans("september"),
            this.getTrans("october"),
            this.getTrans("november"),
            this.getTrans("december")
        ],
        monthsShort : [
            this.getTrans("jan"),
            this.getTrans("feb"),
            this.getTrans("mar"),
            this.getTrans("apr"),
            this.getTrans("mayShort"),
            this.getTrans("jun"),
            this.getTrans("jul"),
            this.getTrans("aug"),
            this.getTrans("sep"),
            this.getTrans("oct"),
            this.getTrans("nov"),
            this.getTrans("dec")
        ],
        daysShort : [
            this.getTrans("sun"),
            this.getTrans("mon"),
            this.getTrans("tue"),
            this.getTrans("wed"),
            this.getTrans("thu"),
            this.getTrans("fri"),
            this.getTrans("sat")
        ],
        daysLong : [
            this.getTrans("sunday"),
            this.getTrans("monday"),
            this.getTrans("tuesday"),
            this.getTrans("wednesda"),
            this.getTrans("thursday"),
            this.getTrans("friday"),
            this.getTrans("saturday")
        ]
    };
},

// - - - - - - -  Error handling - - - - - - - - 

/*
df.Error = function Error(iNumber, sText, bOptUsr, oOptSource, oOptTarget, bOptSrv){
    this.iNumber = iNumber;
    this.sText = sText;
    this.bUserError = !!bOptUsr;
    this.oSource = oOptSource || null;
    this.oTarget = oOptTarget || null;
    this.bServer = !!bOptSrv;
    this.iLine = iOptLine;
    this.sDetailHtml = sOptDetailHtml || null;
}
*/

/*
Handles a single error and displays it in a modal dialog unless it is a JavaScript error which it 
leaves to the JavaScript debuggers. The modal queue is used to make sure that we don't display 
dialogs on top of each other.

@param  oError  The error object.
*/
handleError : function(oError){
    function displayError(tDetails){
        var that = this, oLabel, oDialog, oCloseBtn, oContentPnl, oButtonPnl, aDetails = [], oDetailsBox, sCaption;
        
        //  Determine title
        if(!oError.bServer){
            sCaption = oError.sCaption || this.getTrans("error_title_client", true) || "Unhandled Program Error on the client";
        }else{
            sCaption = oError.sCaption || this.getTrans("error_title_server");
        }
            
        
        //  Create dialog
        oDialog = new df.WebModalDialog(null, this);
        oDialog.psCaption = sCaption;
        oDialog.piMinWidth = 500;
        oDialog.piMinHeight = (oError.bUserError ? 150 : 240);
        
        oDialog.OnSubmit.addListener(function(oEvent){
			try{
				oDialog.hide();
			}catch(oErr){
				that.handleError(oErr);
			}
        }, this);
        
        oDialog.OnHide.addListener(function(oEvent){
            tDetails.bFinished = true;
            setTimeout(function(){
                that.processModal();
            }, 20);
        }, this);
        
        oContentPnl = new df.WebPanel(null, oDialog);
        oContentPnl.peRegion = df.ciRegionCenter;

        oDialog.addChild(oContentPnl);
        
        //  Create label
        oLabel = new df.WebLabel(null, oContentPnl);
        oLabel.psCaption = oError.sText;
        oLabel.psCSSClass = (oError.bUserError ? "WebMsgBoxWarning" : "WebMsgBoxError");
        oContentPnl.addChild(oLabel);
        
        //  Create error details
        if(!oError.bUserError){
            oLabel = new df.WebLabel(null, oContentPnl);
            aDetails.push('Error:', oError.iNumber);
            
            if(oError.bServer){
                if(oError.iLine){
                    aDetails.push('\n\rLine:', oError.iLine);
                }
            }else{
                if(oError.oSource){
                    if(oError.oSource instanceof df.WebObject){
                        aDetails.push('\n\rObject:', oError.oSource.getLongName());
                    }
                }
            }   
            oLabel.psCaption = aDetails.join("");
            oContentPnl.addChild(oLabel);
            
            //  Add details field
            if(oError.sDetailHtml){
                oDialog.piMinHeight = 300;
                oDialog.piHeight = 300;
            
                oDetailsBox = new df.WebHtmlBox(null, oContentPnl);
                oDetailsBox.pbFillHeight = true;
                oDetailsBox.pbShowBox = true;
                oDetailsBox.pbScroll = true;
                oDetailsBox.psHtml = oError.sDetailHtml;
                
                oContentPnl.addChild(oDetailsBox);
            }
        }
        
        
        //  Create buttons
        oButtonPnl = new df.WebPanel(null, oDialog);
        oButtonPnl.peRegion = df.ciRegionBottom;
        oButtonPnl.piColumnCount = 3;
        oDialog.addChild(oButtonPnl);
        
        oCloseBtn = new df.WebButton(null, oDialog);
        oCloseBtn.psCaption = this.getTrans("ok", true) || "OK";
        oCloseBtn.piColumnIndex = 2;
        oCloseBtn.pbShowLabel = false;
        oCloseBtn.OnClick.addListener(function(oEvent){
            oDialog.hide();
        }, this);
        oButtonPnl.addChild(oCloseBtn);
        
        
        oDialog.show();
        this.ready(function(){
            oDialog.resize();
            oCloseBtn.focus();
        });
            
    }

    //  We only handle our own errors, we throw the others 
    if(oError instanceof df.Error){
       
        //  Fire user event for custom display
        if(this.OnError.fire(this, { oError : oError })){
            //  See if the object has custom error handling (usually DEO's)
            if(oError.oTarget && oError.oTarget.displayError && oError.oTarget.pbRender && oError.oTarget.pbVisible){
                oError.oTarget.displayError(oError.iNumber, oError.sText);
            }else{
                 // Queue a special alert
                this._aModalQueue.push({
                    fFunc : displayError,
                    bFinished : false,
                    bDisplayed : false
                });
                this.processModal();
            } 
        }
    }else{
        throw oError;
    }
},

/*
Struct tWebError
    Integer iNumber     // Error number
    Integer iLine       // Server app line number of the error
    String sText        // Error message
    String sTarget      // Name of control to apply the error to
    Boolean bUserError  // Is this a user error (like "find past end of file")
End_Struct

*/
handleServerErrors : function(aErrors, oOptSrc){
    var i, oTarget;
    
    for(i = 0; i < aErrors.length; i++){
        //  Some objects are bound to objects (usually data entry objects)
        oTarget = null;
        if(aErrors[i].sTarget){
            oTarget = this.findObj(aErrors[i].sTarget);
        }
        
        //  Create error object and call default handler function
        this.handleError(new df.Error(
            aErrors[i].iNumber, 
            aErrors[i].sText, 
            oOptSrc || this, 
            null,
            null,
            true,
            aErrors[i].bUserError, 
            aErrors[i].sCaption,
            oTarget || null,
            aErrors[i].iLine 
        ));
    }
    
    return (aErrors.length > 0);

},

// - - - - - - -  Generic web functionallity - - - - - - - - 

/*
Reads the session key from the cookie.

@return String containing the session key.
*/
getSessionKey : function(){
    return df.sys.cookie.get(this.psCookieName, "");
},

/*
Stores the session key in a cookie.

@param  sKey    The new session key.

@client-action
*/
setSessionKey : function(sKey){
    df.sys.cookie.set(this.psCookieName, sKey, this._iCookieHours);
},

/*
Lets the browser navigate to a different page. The mode determines if the page is opened in a new 
window / new tab or the current window.

@param  sUrl    The URL to open.
@param  eMode   The mode to upen the URL (df.ciOpenNewWindow, df.ciOpenNewTab or 
                df.ciOpenCurrentWindow).

@client-action
*/
navigateToPage : function(sUrl, eMode){
    var eWin;

    eMode = parseInt(eMode, 10); // Convert from string

    if(eMode === df.ciOpenSameWindow){
        window.location.href = sUrl;
    }else{
        if(eMode === df.ciOpenNewWindow){
            eWin = window.open(sUrl, '_blank_' + df.dom.piDomCounter++, 'width=700, height=500, resizable=yes');
        }else{ // df.ciOpenNewTab
            eWin = window.open(sUrl, '_blank');// +  df.dom.piDomCounter++);
        }
        
        // if(!eWin){
            // this.showMsgBox("Failed to open a new window. This might be caused by a popup blocker requiring user interaction. Do you want to try again?", "Popup blocked", "WebMsgBoxWarning", [ this.getTrans("yes"), this.getTrans("no") ], 1, function(iBtn, oDialog){
                // if(iBtn === 1){
                    // if(eMode === df.ciOpenNewWindow){
                        // eWin = window.open(sUrl, '_blank_' +  df.dom.piDomCounter++, 'width=700, height=500, resizable=yes');
                    // }else{ // df.ciOpenNewTab
                        // eWin = window.open(sUrl, '_blank_' +  df.dom.piDomCounter++);
                    // }
                // }
                
                // oDialog.hide();
            // });
        // }else{
            // setTimeout(function(){
                // if(eWin.outerHeight === 0){
                    // alert("Chrome popup blocked!");
                // }
            // }, 25);
        // }
    }
},

/*
Opens a new window that will load the specified URL. Note that popup blockers might block this new window.

@param  sUrl     The URL to open.
@param  iWidth   The width of the window in pixels.
@param  iHeight  The height of the window in pixels.

@client-action
*/
navigateNewWindow : function(sUrl, iWidth, iHeight){
    var eWin = window.open(sUrl, '_blank_' + df.dom.piDomCounter++, 'width=' + iWidth + ', height=' + iHeight + ', resizable=yes, location=yes');
},

/*
Reloads the current page. This is usually done after a logout.

@client-action
*/
navigateRefresh : function(){
    window.location.reload();
}

});