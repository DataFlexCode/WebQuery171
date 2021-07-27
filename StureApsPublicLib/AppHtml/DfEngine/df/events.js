/*
Name:
    df.events
Type:
    Library (object)
Contains:
    df.events.DOMHandler   (Prototype)
    df.events.DOMEvent     (Prototype)    
    df.events.JSHandler    (Prototype)
    df.events.JSEvent      (Prototype)
Revisions:
    2007/12/14  Created the new event system framework based on experiences 
    with the event handling methods in previous releases. (HW, DAE)
*/


/*
The AJAX Library has its own event system that works on top of the browsers 
events system and allows custom events to be created and thrown. This layer 
straightens out the differences between browsers and works easier. Events 
thrown by the AJAX Library itself work almost the same as browser events so the 
developer doesn't have to deal with the differences.

Browser/DOM events are attached using a set of global functions. The DOMEvent 
prototype defines the interface of the objects that are given as parameters to 
the listener methods. A set of global methods can be used to attach and remove 
listeners for the DOM events. For events thrown by the framework we have the 
JSHandler prototype that is actually used to instantiate the events. Listeners 
are attached using the addListener method of the JSHandler and will get an 
instantiation of the JSEvent as the parameter. Event specific properties are 
added to this event.

Example of a DOM event:
@code
function initialize(){
     df.events.addDomListener("click", document.getElementById("myButton"), myButton_click, this);
}

function myButton_click(oEvent){
     if(confirm("Sure you clicked the button?")){
        oEvent.eSource.value = "Clicked!"; // Use oEvent.oSource property to get a reference to the button
    }else{
        oEvent.stop(); // Make sure no other listeners are called
    }
}
@code

Example of a framework event:
@code
function initMyForm(oForm){
      oForm.getDD("customer").onBeforeDelete.addListener(confirmdelete, this);
}

function confirmdelete(oEvent){
     return confirm("Are you sure that you want to delete this record?"); // Returning false also stops the event
}
@code
*/
df.events = {

/*
Keycode for the tab key.

@private
*/
KEY_CODE_TAB : 9,

/*
Keycodes that do not edit a value.

@private
*/
KEY_CODE_NON_EDIT : {37:1, 38:1, 39:1, 40:1, 35:1, 36:1, 9:1},

/*
Special keys that are almost always allowed.

@private
*/
KEY_CODE_SPECIAL : {37:1, 38:1, 39:1, 40:1, 35:1, 36:1, 46:1, 8:1, 9:1},
//  37, 38, 39, 40 cursor keys
//  35  end
//  36  home
//  46  delete
//  8   backspace
//  9   tab

/*
Adds a capturing listener to a DOM element. This function is only supported by 
browsers that implement the W3C event model. Please do not use this method if 
you don't know what event capturing is because it can places the event listener
before any other event. It works by adding a "capture_" prefix to the event 
name for W3C browsers so the DOMHandler recognizes this as a different event.

@param  sEvent          Name of the event to listen to.
@param  eElement        Reference to the DOM element that fires the event.
@param  fListener       Reference to the function that will handle the event.
@param  oEnvironment    (optional) Reference to the environment of the handler 
        ('this' will reference to this object when the handler is called).
*/
addDomCaptureListener : function(sEvent, eElement, fListener, oEnvironment){
    //  Attach the listener
    if(window.addEventListener){ // W3C
        sEvent = "capture_" + sEvent;
    }
    
    this.addDomListener(sEvent, eElement, fListener, oEnvironment);
},

/*
Removes a capturing listener to of a DOM element.

@param  sEvent      Name of the event.
@param  eElement    Reference to the DOM element.
@param  fListener   Reference to the function that is attached to the event.
*/
removeDomCaptureListener : function(sEvent, eElement, fListener){
    //  Attach the listener
    if(window.addEventListener){ // W3C
        sEvent = "capture_" + sEvent;
    }
    
    this.removeDomListener(sEvent, eElement, fListener);
},

/*
Adds a listener to an event of a DOM element in a browser independent way using
the df.events.DOMHandler object. The name of the event is according to the W3C
specifications (so without the microsoft "on") usage. Note that for some 
special events like the mousewheel event special methods are available.

@param  sEvent          Name of the event to listen to.
@param  eElement        Reference to the DOM element that fires the event.
@param  fListener       Reference to the function that will handle the event.
@param  oEnvironment    (optional) Reference to the environment of the handler 
        ('this' will reference to this object when the handler is called).
*/
addDomListener : function(sEvent, eElement, fListener, oEnvironment){
    var oDOMHandler;
    
    //  Find or create DOM Handler
    if(eElement._oDfDomH === undefined || !eElement._oDfDomH[sEvent]){
        oDOMHandler = new df.events.DOMHandler(sEvent, eElement);
    }else{
        oDOMHandler = eElement._oDfDomH[sEvent];
    }
    
    //  Add listener to handler
    oDOMHandler.addListener(fListener, oEnvironment);
},

/*
Removes the event listener from the DOM element so it won't be called any more 
if the event occurs.

@param  sEvent      Name of the event to which the handler listened.
@param  eElement    Reference to the element that fired the event.
@param  fListener   Reference to the method that was handling the event.
*/
removeDomListener : function(sEvent, eElement, fListener){
    //  Find handler and call remove method
    if(eElement._oDfDomH !== undefined && eElement._oDfDomH[sEvent]){
        eElement._oDfDomH[sEvent].removeListener(fListener);
    }
},

/*
Adds a key listener to the DOM elements. The Internet Explorer only sends the 
correct key information on the keydown event instead of with the keypress 
event.

@param  eElement        Reference to the DOM element that fires the event.
@param  fListener       Reference to the function that will handle the event.
@param  oEnvironment    (optional) Reference to the environment of the handler 
        ('this' will reference to this object when the handler is called).    
*/
addDomKeyListener : function(eElement, fListener, oEnvironment){
    // if(window.addEventListener){ // W3C
        // df.events.addDomListener("keypress", eElement, fListener, oEnvironment);
    // }else{ // IE
        df.events.addDomListener("keydown", eElement, fListener, oEnvironment);
    // }
},

/*
Removes the key listener from the DOM element.

@param  eElement    Reference to the element that fired the event.
@param  fListener   Reference to the method that was handling the event.
*/
removeDomKeyListener : function(eElement, fListener){
    // if(window.addEventListener){ // W3C
        // df.events.removeDomListener("keypress", eElement, fListener);
    // }else{ // IE
        df.events.removeDomListener("keydown", eElement, fListener);
    // }
},

/*
Adds a listener to the mousewheel event which has different names for the 
different browsers.

@param  eElement        Reference to the DOM element that fires the event.
@param  fListener       Reference to the function that will handle the event.
@param  oEnvironment    (optional) Reference to the environment of the handler 
                    ('this' will reference to this object when the handler is 
                    called).       
*/
addDomMouseWheelListener : function(eElement, fListener, oEnvironment){
    if(df.sys.isMoz){ //   Mozilla
        df.events.addDomListener("DOMMouseScroll", eElement, fListener, oEnvironment);
    }else{ // IE, WebKit
        df.events.addDomListener("mousewheel", eElement, fListener, oEnvironment);
    }
},

/*
Removes the mousewheel listener from the DOM element.

@param  eElement    Reference to the element that fired the event.
@param  fListener   Reference to the method that was handling the event.
*/
removeDomMouseWheelListener : function(eElement, fListener){
    if(df.sys.isMoz){  //  Mozilla
        df.events.removeDomListener("DOMMouseScroll", eElement, fListener);
    }else{ // IE, WebKit
        df.events.removeDomListener("mousewheel", eElement, fListener);
    }
},

/*
Generic event listener used to cancel events directly.

@param  oEvent  Event object.
*/
stop : function(oEvent){
    oEvent.stop();
},


/*
@private

Administration used to clear the event listeners on window unload.
*/
iDOMHandlers : 0,
/*
@private
*/
oDOMHandlers : {},


/*
@private

Clears all the event handlers to prevent memory leaks.
*/
clearDomHandlers : function(){
    var iHandlerId;
    
    for(iHandlerId in df.events.oDOMHandlers){
        if(df.events.oDOMHandlers.hasOwnProperty(iHandlerId)){
            if(df.events.oDOMHandlers[iHandlerId].__DOMHandler){
                df.events.oDOMHandlers[iHandlerId].clear();
            }
        }
    }
},

/*
This method clears all the event listeners that are attached to the given DOM 
element. The listeners need to be attached using the AJAX Library event system. 
If bRecursive is true it will move into the child elements and clear those event 
listeners as well. Clearing the listeners is important because these connections 
between the browsers DOM environment and the JavaScript environment can cause 
problems with the garbage collector which can cause memory leaks.

@param  eElement    Reference to the DOM element.
@param  bRecursive  (optional) If true child elements are also cleared.
*/
clearDomListeners : function(eElement, bRecursive){
    var sEvent;
    
    //  Loop through DOM handlers and remove them
    if(eElement._oDfDomH){
        for(sEvent in  eElement._oDfDomH){
            if(eElement._oDfDomH.hasOwnProperty(sEvent)){
                eElement._oDfDomH[sEvent].clear();
            }
        }
    }
    
    //  Move into children
    if(bRecursive){
        df.dom.visit(eElement, function(eChild){
            df.events.clearDomListeners(eChild, true);
        });
    }
}
};




/*
Constructor that gets the important properties.

@param  sEvent      Name of the event.
@param  eElement    Reference to the DOM element.
@private
*/
df.events.DOMHandler = function DOMHandler(sEvent, eElement){
    //  @privates
    this.sEvent = sEvent;
    this.eElement = eElement;
    
    
    this.aListeners = [];
    this.aRemoveListeners = [];
    this.bFiring = false;
    this.fHandler = null;
    this.__DOMHandler = true;
    
    this.iHandlerId = df.events.iDOMHandlers++;
    
    this.attach();
};
/*
The handler for one event that can contain multiple listeners. Contains the 
functionality to attach to the event and to call the registered listeners. 
Detaches itself if the last listener is unregistered (or if the page is 
unloaded). The _oDfDomH property is added to the element that contains 
references (as a named array) to all the handlers for that element.

@private
*/
df.defineClass("df.events.DOMHandler", {

/*
@private

Attaches itself to the event using an inline anonymous function that calls the 
fire method with the correct envirioment. Registers itself on the element and 
globally.
*/
attach : function(){
    var oDOMHandler, fHandler;
    oDOMHandler = this;

    //  Create inline method that calls the handling method with the correct environment
    fHandler = function(e){
        return oDOMHandler.fire(e);
    };
    
    //  Attach the listener
    if(window.addEventListener){ // W3C
        if(this.sEvent.substr(0, 8) === "capture_"){
            this.eElement.addEventListener(this.sEvent.substr(8), fHandler, true);
        }else{
            this.eElement.addEventListener(this.sEvent, fHandler, false);
        }
    }else{ // IE
        this.eElement.attachEvent("on" + this.sEvent, fHandler);
    }
    
    //  Register the handler on the element
    if(!this.eElement._oDfDomH){
        this.eElement._oDfDomH = { };
    }
    this.eElement._oDfDomH[this.sEvent] = this;
    
    //  Register the handler globally
    df.events.oDOMHandlers[this.iHandlerId] = this;
    
    this.fHandler = fHandler;
},


/*
@private

Clears the handler by deattaching itself from the event and removing itself 
from the global and elements registration.
*/
clear : function(){
    //  Deattach the listener
    if(window.addEventListener){
        this.eElement.removeEventListener(this.sEvent, this.fHandler, false);
    }else{
        this.eElement.detachEvent("on" + this.sEvent, this.fHandler);
    }
    
    //  Unregister the handler on the element
    delete this.eElement._oDfDomH[this.sEvent];
    
    //  Unregister the global handler
    delete df.events.oDOMHandlers[this.iHandlerId];
},


/*
@private

Adds a listener to the event that is handled by this handler. It adds the 
listener and environment reference encapsulated in an object to the listeners 
array.

@param  fListener       Reference to the handling method.
@param  oEnvironment    (optional) Reference to the preferred environment.
*/
addListener : function(fListener, oEnvironment){
    if(typeof(fListener) !== "function"){
        throw new df.Error(5131, "Listener must be a function (event: {{0}})", this, [ this.sEvent ]);
    }

    this.aListeners.push({ "fListener" : fListener, "oEnvironment" : oEnvironment });
},


/*
@private

Removes a listener from the event that is handled by the handler. It removes 
the listener from the array and if it is the last listener it clears the 
handler.

@param  fListener   Reference to the handling method.
*/
removeListener : function(fListener){
    var i;
    
    for(i = 0; i < this.aListeners.length; i++){
    
        if(this.aListeners[i].fListener === fListener){
            if(this.bFiring){
                this.aListeners[i].fListener = null;
            
                this.aRemoveListeners.push(fListener);
            }else{
                if(this.aListeners.length > 1){
                    this.aListeners.splice(i, 1);
                }else{
                    this.clear();
                }
            }
            
            break;
        }
    }
},


/*
@private

Fires the event by creating a df.events.DOMEvent object and calling the 
listeners in sequence. It "locks" the event handling using the bFiring boolean. 
It stops if the event is cancelled. If listeners are removed during the 
handling it will perform this action again.

@param  e   Event object in some browsers.
*/
fire : function(e){
    var i, oEvent;
    
    //  Create event object
    oEvent = new df.events.DOMEvent(e, this.eElement, this.sEvent);
    
    //  Lock
    this.bFiring = true;
    
    //  Call the listeners
    for(i = 0; i < this.aListeners.length && !oEvent.bCanceled; i++){
        if(typeof(this.aListeners[i].fListener) === "function"){
            try{
                if(this.aListeners[i].fListener.call((this.aListeners[i].oEnvironment !== undefined ? this.aListeners[i].oEnvironment : this.eElement), oEvent) === false){
                    oEvent.stop();
                }
            }catch (oError){
                df.handleError(oError);
            }
        }
    }
    
    //  Unlock
    this.bFiring = false;
    
    //  Remove the listeners that where placed for removal during the event execution.
    while(this.aRemoveListeners.length > 0){
        this.removeListener(this.aRemoveListeners.pop());
    }
    
    //  If the event is canceled we do anything we can to stop the event!
    if (oEvent.bCanceled){
        // necessary for addEventListener, works with traditional
        if(e.preventDefault){
            e.preventDefault();
        }
        // necessary for attachEvent, works with traditional
        e.returnValue = false; 
        
        // works with traditional, not with attachEvent or addEventListener
        return false; 
    }
    return true;
}

});



/*
Constructor that takes the event object of the browser as a parameter.

@param  e       Event object (in some browsers).
@param  eSource Reference to the element to which the listener is attached.
*/
df.events.DOMEvent = function DOMEvent(e, eSource, sName){
    /*
    Reference to the element to which the listener is attached.
    */
    this.eSource = eSource;
    /*
    Reference to the browsers event object.
    */
    if(!e){
        this.e = window.event;
    }else{
        this.e = e;
    }
    /*
    Name of the event (used by the AJAX Library, without the "on").
    */
    this.sName = sName;
    
    // @privates
    this.bCanceled = false;
};
/*
This class is used as a wrapper of the event object when using the AJAX Library 
event system to handle DOM events. It main purpose is to provide a browser 
independent API to handle the events. It is passed as parameter to the event 
handler method.

@code
function myInitForm(oForm){
    df.events.addDomListener("click", document.getElementById("mybutton"), myButtonClick);
}

function myButtonClick(oEvent){
    //  oEvent.eSource always contains a reference to the element on which the listener was attached.
    oEvent.eSource.value = "I am clicked!";
}

...

<input type="button" id="mybutton" value="Click me!"/>
@code
*/
df.defineClass("df.events.DOMEvent", {

/*
Determines which DOM element has thrown the event. This can be a different 
element than to which the listeners is attached because events can bubble up in 
the DOM. Note that there are still some minor differences between the different 
browsers in the result of this function.

@return The DOM element that fired the event.
*/
getTarget : function(){
    var eTarget;
    
    if (this.e.target){
        eTarget = this.e.target; // W3C
    }else if (this.e.srcElement){
        eTarget = this.e.srcElement;    // IE
    }
    
    if (eTarget.nodeType === 3){
        eTarget = eTarget.parentNode; // Safari bug
    }
    
    return eTarget;
},

/*
@return The horizontal mouse position.
*/
getMouseX : function(){
    return this.e.clientX;
},

/*
@return The vertical mouse position.
*/
getMouseY : function(){
    return this.e.clientY;
},

/*
@return The keycode from the key that is pressed.
*/
getKeyCode : function(){
//    if(this.e.keyCode){
        return this.e.keyCode;  // IE
//    }else{
//        return this.e.which; // W3C
//    }
},

/*
Determines wether the key event represents an special key (delete, home, 
end, up, ...).

@return True if the key is supposed to be special.
*/
isSpecialKey : function(){
    var iKeyCode = this.getKeyCode();
    
    //  IE and webkit browsers do not fire keypress events for special keys
    if((df.sys.isIE || df.sys.isSafari) && this.e.type === "keypress"){
        return false;
    }
    
    return (this.getAltKey() || this.getCtrlKey() || (df.events.KEY_CODE_SPECIAL[iKeyCode]  && iKeyCode !== 0));
},

/*
@return The charcode from the key that is pressed. If no explicit charcode is 
        available the keycode is returned.
*/
getCharCode : function(){
    if(this.e.charCode){
        return this.e.charCode;
    }
    if(this.e.which){
        return this.e.which;
    }
    return this.e.keyCode;
},

/*
@return True if the ctrl key was pressed.
*/
getCtrlKey : function(){
    return this.e.ctrlKey;
},

/*
@return True if the shift key was pressed.
*/
getShiftKey : function(){
    return this.e.shiftKey;
},

/*
@return True if the alt key was pressed.
*/
getAltKey : function(){
    return this.e.altKey;
},

/*
Checks which mouse button has been pressed if the event is a mouse event. 

@return Integer indicating the clicked button according to the microsoft standard 
    (left: 1, middle: 4, right: 2).
*/
getMouseButton : function(){
    if(this.e.which){ // W3C
        switch(this.e.which){
            case 0:
                return 1;
            case 1:
                return 4;
            case 2:
                return 2;
            default:
                return 0;
        }
    }else{ // IE
        return this.e.button;
    }    
},

/*
Determines the mousewheel action performed by the user.

@return Integer indicating the action (up: >0, down: <0, none:0).
*/
getMouseWheelDelta : function(){
    var iDelta = 0;
    
    if(this.e.detail){ 
        //  Mozilla has multiple of 3 as detail
        iDelta = -this.e.detail/3;
    }else if(this.e.wheelDelta){ // IE / Opera
        iDelta = this.e.wheelDelta / 120;
    } 

    return iDelta;
},

/*
Stops the event chain by setting bCanceled to true so the handling object 
won't call other listeners and tries to stop the event bubbling further.
*/
stop : function(){
    this.bCanceled = true;
    this.e.returnValue = false;
    this.e.cancelBubble = true;
    this.e.canceled = true;

    if(this.e.preventDefault){
        this.e.preventDefault();
    }
    if(this.e.stopPropagation){
        this.e.stopPropagation();
    }
    
    if(df.sys.isIE && this.sName.indexOf("key") >= 0){
        this.e.keyCode = 0;
    }
},

matchKey : function(keydef){
    var i;
    if(keydef){
        if(keydef instanceof Array){
            for(i = 0; i < keydef.length; i++){
                if(keydef[i].iKeyCode === this.getKeyCode() &&
                        keydef[i].bCtrl === this.getCtrlKey() &&
                        keydef[i].bShift === this.getShiftKey() &&
                        keydef[i].bAlt === this.getAltKey()){
                    return true;
                }
            }
        }else{
            return (keydef.iKeyCode === this.getKeyCode() &&
                keydef.bCtrl === this.getCtrlKey() &&
                keydef.bShift === this.getShiftKey() &&
                keydef.bAlt === this.getAltKey());
        }
    }
    return false;
}

});


/*
Attach the clearDomHandlers method to the windows unload event to clean the 
events when the page is unloaded.
*/
df.events.addDomListener("unload", window, df.events.clearDomHandlers);


/*
Represents an event within the AJAX Library.
*/
df.events.JSHandler = function JSHandler(){
    // @privates
    this.aListeners = [];
    
    this.aRemoveListeners = [];
    this.bFiring = false;
};
/*
The df.events.JShandler class contains the logic that is used to throw AJAX 
Library events. An event within the AJAX Library is nothing more than an 
instance of this class. The class maintains an array of listeners (and their 
environment references) that are added to this event. If the object throwing the 
event calls the fire method it will go through this array calling all the 
methods attached to this event. 

The example below shows how the event object can be used. The AJAX Library 
components have several events (usually with names startin with "on") that can 
be handled this way.
@code
function listener1(oEvent){
    //  Access the sPersonName property given with the event
    df.gui.alert("Hello " + oEvent.sPersonName);
    
    //  Stop the event so listener2 never gets called
    oEvent.stop();
}

function listener2(oEvent){
    df.gui.alert("This method should never be called..");
}

//  Create event object
var myEvent = new df.events.JSHandler();

//  Add listeners
myEvent.addListener(listener1);
myEvent.addListener(listener2);

//  Fire event
myEvent.fire(this, { sPersonName : "John" })
@code
*/
df.defineClass("df.events.JSHandler", {

/*
Adds a new listener to the handler by putting it into the aListeners array.

@param  fListener       Function that will be called when the event occurs.
@param  oEnvironment    The environment (this reference) in which the listeners 
        will be called.
*/
addListener : function(fListener, oEnvironment){
    if(typeof(fListener) !== "function"){
        throw new df.Error(5131, "Listener must be a function", this, [ this.sEvent ]);
    }
    
    this.aListeners.push({ "fListener" : fListener, "oEnvironment" : oEnvironment });
},

/*
Removes the given listener from the handler by removing it from the aListeners
array.

@param  fListener   Function that was listening to the event.
*/
removeListener : function(fListener){
    var iListener;
    
    for(iListener = 0; iListener < this.aListeners.length; iListener++){
        if(this.aListeners[iListener].fListener === fListener){
            if(this.bFiring){
                this.aListeners[iListener].fListener = null;
            
                this.aRemoveListeners.push(fListener);
            }else{
                this.aListeners.splice(iListener, 1);
            }
        }
    }
},

/*
The fire method that calls the listeners in a first registered = first called 
sequence as long as bCanceled is false.

@return bCanceled property of the event object.
*/
fire : function(oSource, oOptions){
    if (this.aListeners.length > 0){
        var iListener, oEvent;
        
        oEvent = (oOptions instanceof df.events.JSEvent ? oOptions : new df.events.JSEvent(oSource, oOptions));

        //  Lock
        this.bFiring = true;
        
        //  Call the listeners
        for(iListener = 0; iListener < this.aListeners.length && !oEvent.bCanceled; iListener++){
            if(typeof(this.aListeners[iListener].fListener) === "function"){
                try{
                    if(this.aListeners[iListener].fListener.call((this.aListeners[iListener].oEnvironment !== undefined ? this.aListeners[iListener].oEnvironment : this.eElement), oEvent) === false){
                        oEvent.stop();
                    }
                }catch (oError){
                    df.handleError(oError, oSource);
                }
            }
        }
        
        //  Unlock
        this.bFiring = false;
        
        //  Remove the listeners that where placed for removal during the event execution.
        while(this.aRemoveListeners.length > 0){
            this.removeListener(this.aRemoveListeners.pop());
        }
    
        return !oEvent.bCanceled;
    }
    
    
    
    return true;
}

});


/*
Constructor of the df.events.JSEvent class which takes two parameters.

@param  oSource     Reference to the object throwing the event.
@param  oOptions    Object with event options that are added to the object.
*/
df.events.JSEvent = function JSEvent(oSource, oOptions){
    var sProp;
    
    /*
    Reference to the object that has fired the event.
    */
    this.oSource = oSource;
    
    //  @privates
    this.bCanceled = false;
    
    if(typeof(oOptions) === "object"){
        for(sProp in oOptions){
            if(oOptions.hasOwnProperty(sProp)){
                this[sProp] = oOptions[sProp];
            }
        }
    }
};
/*
This class defines the API of the event that is given to event listeners by the 
AJAX Library event system. See df.events.JSHandler for an example of how this 
object can be used. Most events add event specific properties to this object. 
The important methods and properties are oSource and stop.
*/
df.defineClass("df.events.JSEvent", {

/*
Alternative for the oSource property so it is compatible with the DOMEvent.

@return Reference to the element that fired event (this.oSource).
*/
getTarget : function(){
    return this.oSource;
},

/*
Can be used to stop the firing of the event. The rest of the listeners won't be
called and true will be returned which usually causes the action that follows 
by "Before" events to cancel.
*/
stop : function(){
    this.bCanceled = true;
}

});
