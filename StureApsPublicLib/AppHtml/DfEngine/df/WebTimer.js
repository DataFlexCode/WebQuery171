/*
Class:
    df.WebTimer
Extends:
    df.WebObject

This class contains a simple timer object that allows developers to easily build user interfaces 
that have to refresh regularly. It works a lot like the windows DfTimer class but with this 
framework the timer has to run on the client and call the server.
    
Revision:
    2012/11/30  (HW, DAW) 
        Initial version.
*/
df.WebTimer = function WebTimer(sName, oParent){
    df.WebTimer.base.constructor.call(this, sName, oParent);
    
    //  Public API
    this.prop(df.tBool, "pbAutoStart", true);
    this.prop(df.tBool, "pbAutoStop", true);
    this.prop(df.tInt, "piInterval", 2000);
    this.prop(df.tBool, "pbRunning", false);
    this.prop(df.tBool, "pbWaitForCall", true);
     
    this.event("OnTimer", df.cCallModeDefault);
    
    //  Privates
    this._tInterval = null;
    this._tTimeout = null;
    
    this.addSync("pbRunning");
    this.init();
};
df.defineClass("df.WebTimer", "df.WebObject", {

/*
This method initializes the timer. It attaches event listeners to the view object for automatic 
starting / stopping or starts the timer right away.

@private
*/
init : function(){

    //  Check if we are in a view, if so we listen to its OnShow and OnHide events, else we just start it
    var oView = this.getView();
    if(oView){
        oView.OnShow.addListener(this.showView, this);
        oView.OnHide.addListener(this.hideView, this);
    }else{
        if(this.pbAutoStart){
            this.pbRunning = true;
            this.trigger();
        }
    }
},

/*
This method fires the OnTimer event to the server when it is triggered. It will call the trigger 
method when finished to control the next timeout.

@private
*/
timer : function(){
    if(this.pbRunning){
        this.fire("OnTimer", [], function(){ 
            this.trigger();
        });
    }
},

/*
This method is the central method of this timer and it sets / clears the timeout or interval. 

@private
*/
trigger : function(){
    var that = this;

    if(this.pbRunning){
        if(this.pbWaitForCall){
            if(this._tInterval){
                clearInterval(this._tInterval);
                this._tInterval = null;
            }
            if(this._tTimeout){
                clearTimeout(this._tTimeout);
            }
        
            this._tTimeout = setTimeout(function(){
                that.timer();
            }, this.piInterval);
        }else if(!this._tInterval){
            this._tInterval = setInterval(function(){
                that.timer();
            }, this.piInterval);
        }
    }else{
        if(this._tInterval){
            clearInterval(this._tInterval);
            this._tInterval = null;
        }
        if(this._tTimeout){
            clearTimeout(this._tTimeout);
            this._tTimeout = null;
        }
    }
},

/*
This setter method for pbRunning starts / stops the timer. It updates the property an calls the 
trigger method to make sure that the timer is started or stopped.

@param bVal     The new value.
*/
set_pbRunning : function(bVal){
    this.pbRunning = bVal;
    
    this.trigger();
},

/*
This setter method piInterval updates the timeout between the calls. If we are using the setInterval 
API we need to clear the current interval. We then call the trigger method to make sure the new 
timeout / interval is properly set.

@param iVal     The new value.
*/
set_piInterval : function(iVal){
    if(this.piInterval !== iVal){
        this.piInterval = iVal;
        
        if(this._tInterval){
            clearInterval(this._tInterval);
            this._tInterval = null;
        }
        
        this.trigger();
    }
},

/*
Setter method for pbWaitForCall that updates the intervals used by calling the trigger method.

@param  bVal    The new value.
*/
set_pbWaitForCall : function(bVal){
    this.pbWaitForCall = bVal;
    
    this.trigger();
},

/*
This method handles the OnShow event of the view which starts the timer if needed.

@param  oEvent  Event object.
@private
*/
showView : function(oEvent){
    if(this.pbAutoStart){
        this.pbRunning = true;
        this.trigger();
    }
},

/*
This method handles the OnHide event of the view which stops the timer if needed.

@param  oEvent  Event object.
@private
*/
hideView : function(oEvent){
    if(this.pbAutoStop){
        this.pbRunning = false;
        this.trigger();
    }
}

});