/*
Class:
    df.WebObject
Extends:
    Object

This class is the core of the new web application framework. It represents a Visual DataFlex Web 
Object on the client. It has the core functionality to support synchronized properties, getters, 
setters, server actions and the object tree structure as we know it in Visual DataFlex. It will be 
created and managed by the df.WebApp class. All classes represented as server-side web objects in 
Visual DataFlex will inherit from this class.
    
Revision:
    2011/06/26  (HW, DAW) 
        Initial version.
*/
df.WebObject = function WebObject(sName, oParent){
    
    this._sName = sName;
    this._oParent = oParent || null;
    
    this._oTypes = {};          //  Stores the property types used for automatic type conversion.
    this._oSynced = {};         //  Stores which properties are being synchronized.
    this._aChildren = [];       //  Array of child web objects.
    
    
    this._oServerActionModes = {};
    this._oServerWaitMsg = {};
    
    this._tActionData = null;   //  Will contain custom data (two dimensional string array) if a client-action contains data
    
    this._bStandalone = !sName;    //  If true this object isn't bound to a server-side object and not part of the tree
    
    this._oWebApp = null;   //  Optimization: will contain the webapp
};
df.defineClass("df.WebObject", {

/*
This function is called after the web object is created and the web properties have received their 
initial values. It can be implemented to do initialization based on the web property values before 
the rendering process starts.
*/
create : function(tDef){

},

/*
Called to register a direct child.

@private
*/
addChild : function(oChild){
    this._aChildren.push(oChild);
},

/*
This method defines a property on the current object. It will create the regular JavaScript 
property, set its initial value and it will store its type. The property type will be used for data 
conversions when values are received from the server (as a string).

@code
this.prop(df.tString, "psHtml", "");
this.prop(df.tInt, "piMaxLength", 0);
this.prop(df.tBool, "pbFillHeight", false);
@code

@param  eType   The property type (df.tString, df.tInt, df.tBool, ..).
@param  sName   Name of the property.
@param  sVal    Intial value of the property.
*/
prop : function(eType, sName, sVal){
    this[sName] = sVal;
    
    this._oTypes[sName] = eType;
},

/*
This method converts values received from the server to the local JavaScript type. For example a 
df.tBool value "1" becomes true and "0" or "-1" becomes false.

@param  val     The value (usually of type string).
@param  eType   The value type to convert to (df.tString, df.tInt, df.tBool, ..).
*/
toLocalType : function(val, eType){
    switch(eType){
        case df.tString:
            return val;
        case df.tBool:
            return df.toBool(val);
        case df.tInt:
            return df.toInt(val);
        case df.tNumber:
            //  TODO: Parse number with proper val!
            return df.toNumber(val);
    }
},

/* 
This method converts local values to the type / format expected by the server. This means that they 
are converted to strings and a Boolean for example becomes "1" or "0". 

@param  val     The value in the local type.
@param  eType   The value type to convert to (df.tString, df.tInt, df.tBool, ..).
*/
toServerType : function(val, eType){
    switch(eType){
        case df.tString:
            if(typeof val === "string"){
                return val;
            }
            if(val){
                return val.toString();
            }
            return "";
        case df.tBool:
            return df.fromBool(val);
        default:
            return val.toString();
    }
},


/*
This method gets a property value. If a getter method is defined (get_<propname>) then this function 
will be called else it will return the value of the actual property.

@param  sProp       The name of the property.
@returns    The value of the property (in its actual type).
*/
get : function(sProp){
    //  Use getter if available
    if(this['get_' + sProp]){
        return this['get_' + sProp]();
    }
    return this[sProp];
},

/*
This method sets a property value. If a setter function is defined it will call that 
(set_<propname>) with the value. The real property will be set after the setter is called. If a 
property is not synchronized yet it will be marked as synchronized unless bOptNoSync is passed as 
true. Note that the value is not converted so it needs to be provided in the proper type.

@param  sProp       The name of the property.
@param  val         The value of the property (in its actual type).
@param  bOptNoSync  (optional) If true the property will not become a synchronized property by setting it.
*/
set : function(sProp, val, bOptNoSync){
    var bRes;
    
    //  Call setter if available
    if(this['set_' + sProp]){
        bRes = this['set_' + sProp](val);
    }
    
    //  Set real property if available
    if(this[sProp] !== undefined && bRes !== false){
        this[sProp] = val;
    }
    
    //  Mark as synchronized
    if(bOptNoSync !== true){
        this.addSync(sProp);
    }
},

/*
This method is used when the value is set from the server. If it is called for a synchronized 
property then the setter will need to be executed and the property needs to be marked as 
synchronized while that doesn't happen for an initial value. The extra parameters control this. It 
also passes an extra Boolean parameter to the setter indicating that it is called from the server. 
Some setters might use this to behave slightly different.

@param  sProp       The name of the property.
@param  val         The value of the property (in its actual type).
@param  bSetter     If true the setter is executed if available.
@param  bSync       If true the property is marked as synchronized.
@private
*/
_set : function(sProp, val, bSetter, bSync){
    var bRes;
    
    //  Cast value to type if known
    if(this._oTypes[sProp]){
        val = this.toLocalType(val, this._oTypes[sProp]);
    }

    //  Call setter if available
    if(bSetter){
        if(this['set_' + sProp]){
            bRes = this['set_' + sProp](val, true);
        }
    }
    
    //  Always set real value
    this[sProp] = val;
    
    if(bSync){
        this.addSync(sProp);
    }
},

/*
This method marks a property as synchronized property.

@param  sProp       The name of the property.
@private
*/
addSync : function(sProp){
    if(!this._oSynced.hasOwnProperty(sProp)){
        this._oSynced[sProp] = true;
    }
},

/*
This method removes a property from the synchronized list so it won't be synchronized any more.

@param  sProp       The name of the property.
@private
*/
unSync : function(sProp){
    if(this._oSynced.hasOwnProperty(sProp)){
        delete this._oSynced[sProp];
    }
},

/*
This method gathers the synchronized properties for this Web Object.

@param  Reference to the array of synchronized property objects to which the properties are added.
@private
*/
getSynced : function(aObjs){
    var i, sProp, aProps = [], val;
    
    //  Gather synchronized properties
    for(sProp in this._oSynced){
        if(this._oSynced.hasOwnProperty(sProp)){
            val = this.get(sProp);
            
            if(this._oTypes[sProp]){
                val = this.toServerType(val, this._oTypes[sProp]);
            }
        
            aProps.push({
                sN : sProp,
                sV : val
            });
        }
    }
    
    //  If synced props where found we add it to the list with wrappers
    if(aProps.length > 0){
        aObjs.push({
            sO : this.getLongName(),
            aP : aProps
        });
    }
    
    //  Move into children
    for(i = 0; i < this._aChildren.length; i++){
        this._aChildren[i].getSynced(aObjs);
    }
},

/*
Function that generates the full name like "oWebApp.oCustomerView.oCustomer_Name".

@returns String with the full name.
@private
*/
getLongName : function(){
    var sName;
    
    if(this instanceof df.WebApp){
        return "";
    }
     
    sName = (this._oParent && this._oParent.getLongName()) || "";
    return (sName ? sName + "." + this._sName : this._sName);
},

/*
@returns The WebApp object to which this web object belongs.
@private
*/
getWebApp : function(){
    if(this._oWebApp){
        return this._oWebApp;
    }
    return this._oWebApp = (this instanceof df.WebApp && this) || (this._oParent && this._oParent.getWebApp && this._oParent.getWebApp()) || null;
},

/*
@returns The WebView object to which this web object belongs.
@private
*/
getView : function(){
    return (this instanceof df.WebView && this) || (this._oParent && this._oParent.getView && this._oParent.getView()) || null;
},

/*
This method calls a server method on the server. It will perform all necessary synchronizations. Note that the method on the server should be defined inside the corresponding object and needs to be published using WebPublish.

@param  sMethod    Name of the method that needs to be called.
@param  aParams  Array with the parameters (as primitive types).
@param  fOptHandler  (optional) Method that needs to be called when the AJAX call is finished.
@param  oOptEnv   (optional) Object that is used as the context when the handler is called.
*/
serverAction : function(sMethod, aOptParams, tOptData, fOptHandler, oOptEnv){
    var oView, oAction = new df.ServerAction();
    
    //  Configure action
    oAction.oWO = this;
    oAction.sAction = sMethod;
    oAction.aParams = aOptParams || [];
    oAction.tData = tOptData || null;
    
    //  Add view
    oView = this.getView();
    if(oView){
        oAction.aViews.push(oView);
    }

    //  Determine call mode
	oAction.eCallMode = this._oServerActionModes[sMethod.toLowerCase()] || df.cCallModeDefault;
    if(oAction.eCallMode === df.cCallModeProgress && this._oServerWaitMsg[sMethod.toLowerCase()] ){
        oAction.sProcessMessage = this._oServerWaitMsg[sMethod.toLowerCase()];
    }
    
    //  Register handler
	if(fOptHandler){
		oAction.fHandler = fOptHandler;
        oAction.oHandlerEnv = oOptEnv || this;
	}
	
    //  Pass on to webapp object
	this.getWebApp().handleAction(oAction);
},

/* 
Cancels a server action (if it isn't already sent).

@param  sMethod     The name of the server method that is being called.
*/
cancelServerAction : function(sMethod){
    this.getWebApp().cancelAction(this, sMethod);
},

/*
This method registers the call mode for when server action occurs. It stores the mode combined with 
the name of the method so that the serverAction method knows in which mode a call should be send. 

Supported modes are:
cCallModeDefault – The request is sent asynchronously, the user interface still responds and other 
call cans be made / registered while it happens.
cCallModeWait – The request is sent asynchronously but the no other calls can be registered during 
the call and the user interface will become irresponsible. A waiting cursor is shown.
cCallModeProgress – The request is sent asynchronously but no other calls can be registered during 
the call and  a modal progress dialog will be shown.

@param  sMethod      Name of the server action (like 'OnClick' or 'Request_Find').
@param  eMode        The call mode.

@client-action
*/
setActionMode : function(sMethod, eMode, sOptWaitMessage){
    this._oServerActionModes[sMethod.toLowerCase()] = df.toInt(eMode);
    
    if(sOptWaitMessage){
        this._oServerWaitMsg[sMethod.toLowerCase()] = sOptWaitMessage;
    }
},

getActionMode : function(sMethod){
    return this._oServerActionModes[sMethod.toLowerCase()] || df.cCallModeDefault;
},

/*
This method is used to declare events and replaces the separate declaration of the properties. It 
automatically defines the 'pbServer..' and 'psClient..' properties and creates the client-side event 
object.

@param  sName       Name of the event (like 'OnClick')
@param  eOptMode    The call mode (see setActionMode).
*/
event : function(sName, eOptMode){
    this.setActionMode(sName, eOptMode || df.cCallModeDefault);

    this[sName] = new df.events.JSHandler();
    
    this.prop(df.tBool, "pbServer" + sName, false);
    this.prop(df.tString, "psClient" + sName, "");
},

/*
This method fires an event by calling its client-side and server-side handlers. It will first call 
the global JavaScript method defined as the property psClientOnEvent. Then it calls the advanced 
client-side handlers in the OnEvent object. If pbServerOnEvent is set to true then it will call the 
server. If psLoadViewOnEvent property set then it will display this view. If it is not loaded it 
will load this by calling the server-side event.

@param  sName       Name of the event.
@param  oOptions    Object with event specific options passed to the client-side handlers.
@return True if an event handler is being called.
*/
fire : function(sName, aOptParams, fOptHandler, oOptEnv){
    var oEvent, bResult = false, bASync = false, fFunc;
    
    df.debug('Event: ' + sName + " " + df.sys.json.stringify(aOptParams || []) + " on " + this.getLongName() + "  (Call mode: " + this._oServerActionModes[sName.toLowerCase()] + " )");
    
    //  ASSERT: Prevent invallid JSON
    if(aOptParams && !(aOptParams instanceof Array)){
        throw new df.Error(999, "Parameters should be provided in an array", this);
    }
    aOptParams = aOptParams || [];
    
    //  Create event object
    oEvent = new df.events.JSEvent(this, { 
        aParams : aOptParams, 
        bClient : false,
        bServer : false,
        sReturnVal : null
    });
    
    //  Search for & call global event listener
    if(this['psClient' + sName]){
        fFunc = df.sys.ref.getNestedProp(this['psClient' + sName]);
        if(typeof fFunc === 'function'){
            oEvent.bClient = bResult = true;
            try{
                if(fFunc(oEvent) === false){
                    oEvent.stop();
                }
            }catch (oError){
                this.getWebApp().handleError(oError);
            }
        }else{
			this.getWebApp().handleError(new df.Error(999, "Event handler function '{{0}}' set as 'psClient{{1}}' not found.", this, [this['psClient' + sName], sName]));
		}
    }
    
    //  Search for advanced client-side handler
    if(!oEvent.bCancelled){
        if(this[sName] instanceof df.events.JSHandler){
            //  Determine if there are clients
            oEvent.bClient = bResult = (bResult || this[sName].aListeners.length > 0);
            this[sName].fire(this, oEvent);
        }
    }
    
    //  Call the server
    if(!oEvent.bCancelled){
        if(this['pbServer' + sName] && df.toBool(this['pbServer' + sName])){
        // if(true){
            bResult = true;
            bASync = true;
            
            //  Perform server call
            this.serverAction(sName, aOptParams, null, function(oActEvent){
                //  Set results
                oEvent.sReturnValue = oActEvent.sReturnValue;
                oEvent.bServer = true;
                
                //  Call the handler
                if(fOptHandler){
                    fOptHandler.call(oOptEnv || this, oEvent);
                }
            }, this);
        }   
    }
    
    //  Call the handler
    if(!bASync){
        if(fOptHandler){
            fOptHandler.call(oOptEnv || this, oEvent);
        }
    }
    
    return bResult;
}

});