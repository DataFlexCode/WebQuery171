/*
Classes defining objects used to store data for actions and calls by the df.WebApp and df.WebObject 
classes.

Revisions:
    2011/11/18  Created the initial versions. (HW, DAW)
    2013/06/07  Refactored and moved call logic itself to df.WebApp. (HW, DAW)
*/

/*
The df.ServerAction class / object represents an action to be executed on the server. It basically 
is a function call. This class is purely used by df.WebApp and df.WebObject to store data that 
belongs to a call while it is queued and send.
*/
df.ServerAction = function ServerAction(){
    this.oWO = null;
    this.sAction = "";
    this.aParams = [];
    this.tData = { v:"", c:[] };
    
    this.aViews = [];
    
    this.eCallMode = df.cCallModeDefault;
    this.sProcessMessage = "";
    
    this.fHandler = null;
    this.oHandlerEnv = null;
    
    this.sReturnValue = null;
};

/*
The df.ServerCall class represents a call about to be sent to the server. It contains one or more 
actions (df.ServerAction) and can be waiting to be sent (pending) or it can be currently processed. 
The df.WebApp class uses the call objects internally.
*/
df.ServerCall = function(){
    this.aActions = [];
    
    this.eCallMode = df.cCallModeDefault;
    this.sProcessMessage = "";
    
    this.sFocus = "";
    
    this.aWaiters = [];
    
    this.bSending = false;
};