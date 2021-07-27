/*
Class:
    df.WebDateForm
Extends:
    df.WebForm

This class is the client-side representation of the cWebDateForm and renders a form with a date 
picker button as the prompt button. It uses the df.DatePicker class to render the actual date 
picker.
    
Revision:
    2012/03/16  (HW, DAW) 
        Initial version.
*/
df.WebDateForm = function WebDateForm(oDef, oParent){
    df.WebDateForm.base.constructor.call(this, oDef, oParent);
    
    this.prop(df.tBool, "pbShowWeekNr", true);
    this.prop(df.tBool, "pbShowToday", true);
    this.prop(df.tInt, "piStartWeekAt", 1);
    this.prop(df.tBool, "pbAutoShow", false);
    
    //  Configure super classes
    this.pbPromptButton = true;
    
    // @privates
    this._ePickerWrp = null;
    this._eFocus = null;
    this._bPickerVisible = false;
    this._bSkipAutoShow = false;
    this._bShowWait = false;
    this._iWidth = 0;
    this._iHeight = 0;
    
    this._sControlClass = "WebForm WebDateForm";
    
    this._eParentRef = null;
};
df.defineClass("df.WebDateForm", "df.WebForm",{

/*
Augment the afterRender method that is called when the DOM elements are created. We use it to 
instantiate the DatePicker object and to let that render itself (hidden). We also inject the focus 
holder Anchor element.

@private
*/
afterRender : function(){
    df.WebDateForm.base.afterRender.call(this);
    
    //  Create hidden focus element (used while the picker is shown)
    this._eFocus = df.dom.create('<div class="WebDateForm_FocusHolder" tabindex="0" style="display: none; position: absolute; width: 0px; height: 0px;"></div>');
    this._eWrap.appendChild(this._eFocus);
    
    df.events.addDomListener("focus", this._eFocus, this.onPickFocus, this);
    df.events.addDomListener("blur", this._eFocus, this.onPickBlur, this);
    
   
},

/*
Augment the resize event to (re)calculate the position of the date picker if it is visible.

@private
*/
resize : function(){
    if(this._bPickerVisible){
        this.position();
    }
},

/*
This method calculates the position of the date picker. It positions the datepicker absolute below 
the wrapper element of the form. If there is no space below the form it will try to position it 
above.

@private
*/
position : function(){
    var iWidth, iHeight, oRect, ePicker, eTarget, iOffsetTop, iOffsetLeft;

    ePicker = this._ePickerWrp;
    eTarget = this._eWrap; //  The element to position next
    
    if(ePicker && eTarget){
        //  Calculate width & height of the picker
        iHeight = ePicker.clientHeight + df.sys.gui.getVertBoxDiff(ePicker);
        iWidth = ePicker.clientWidth + df.sys.gui.getHorizBoxDiff(ePicker);
        
        //  Determine position of target (the form)
        oRect = eTarget.getBoundingClientRect();
        
        //  Calculate top position
        iOffsetTop = oRect.top + eTarget.offsetHeight;
        if(iOffsetTop + iHeight > df.sys.gui.getViewportHeight()){
            iOffsetTop -= iHeight + eTarget.offsetHeight;
            
            if(iOffsetTop < 0){
                iOffsetTop = 0;
            }
        }
        
        //  Calculate left position
        iOffsetLeft = oRect.left;
        if(iOffsetLeft + iWidth > df.sys.gui.getViewportWidth()){
            iOffsetLeft = df.sys.gui.getViewportWidth() - iWidth - 10;
            
            if(iOffsetLeft < 0){
                iOffsetLeft = 0;
            }
        }
        
        //  Set position
        ePicker.style.top = iOffsetTop + "px";
        ePicker.style.left = iOffsetLeft + "px";
    }
},

/*
This function initializes the date picker by creating the JavaScript object and the floating wrapper 
div. It adds them to the document object model. It should only be called the first time the date 
picker is shown.

@private
*/
initDatePicker : function(){
    var eViewPort = this.getWebApp()._eViewPort || document.body;
    
    //  Create wrapper div that will holdd the date picker
    this._ePickerWrp = df.dom.create('<div class="WebDateForm_Picker" style="left: 0px; top: 0px;"></div>');
    
    //  Insert into the DOM 
    eViewPort.appendChild(this._ePickerWrp);
    

     // Create date picker instance
    this._oPicker = new df.DatePicker();
    this._oPicker._oParent = this;
    this._oPicker._eFocus = this._eFocus;
    
    
     // Set initial values on the picker
    this._oPicker.pbShowWeekNr  = this.pbShowWeekNr;
    this._oPicker.pbShowToday   = this.pbShowToday;
    this._oPicker.piStartWeekAt = this.piStartWeekAt;
    
    this._ePickerWrp.appendChild(this._oPicker.render());
    this._oPicker.afterRender();
    
    this._oPicker.onEnter.addListener(this.onPickerEnter, this);
},

/*
Displays the date picker by applying the 'WebDF_WrapVisible' class that allows a CSS3 transformation
to be used.
*/
showDatePicker : function(){
    var eViewPort = this.getWebApp()._eViewPort || document.body;

    //  Insert picker into DOM (initialize if needed)
    if(!this._ePickerWrp){
        this.initDatePicker();
    }
    
    //  Display mask
    this._eMask = df.dom.create('<div class="WebDateForm_Mask">&nbsp;</div>');
    eViewPort.appendChild(this._eMask);
    df.events.addDomListener("click", this._eMask, this.onMaskClick, this);
    
    //  Add picker to DOM
    eViewPort.appendChild(this._ePickerWrp);
    
    //  Reset position
    this._ePickerWrp.style.bottom = "";
    this._ePickerWrp.style.top = "";
    this._ePickerWrp.style.left = "";
    
    //  Position the date picker
    this.position();
    
    //  Update selected date
    if(this.peDataType === df.ciTypeDate || this.peDataType === df.ciTypeDateTime){
        this.updateTypeVal();
        
        //  FIX: We clone the date object so that the picker doesn't change ours directly
        this._oPicker.setSelectedDate(((this._tValue && new Date(this._tValue.getTime())) || new Date()), true, false);
    }
    
    //  Display
    df.dom.addClass(this._ePickerWrp, "WebDF_WrapVisible");
    this._eFocus.style.display = "";
    
    this._bPickerVisible = true;
    
    this.focus();
},

/*
This method hides the date picker by removing the 'WebDF_WrapVisible' class so that a CSS3 
transformation can be used.
*/
hideDatePicker : function(bOptNoFocus){
    var that = this;
    
    df.events.removeDomListener("click", this._eMask, this.onMaskClick);
    this._eMask.parentNode.removeChild(this._eMask);
    this._eMask = null;
    
    df.dom.removeClass(this._ePickerWrp, "WebDF_WrapVisible");
    
    //  Remove from DOM after animation finished
    setTimeout(function(){
        if(that._eParentRef && that._ePickerWrp && !that._bPickerVisible){
            that._eParentRef.removeChild(that._ePickerWrp);
        }
    }, 2000);
    
    this._eFocus.style.display = "none";
    
    this._bPickerVisible = false;
    
    if(!bOptNoFocus){
        this._bSkipAutoShow = true;
        this.focus();
    }
},

/*
This method overrides the firePrompt method and makes it display the calendar. We don't fire the 
OnPrompt event at all anymore.

@private
*/
firePrompt : function(){
    var that = this;
    
    if(this.pbEnabled && !this._bShowWait){
        if(this._bPickerVisible){
            this.hideDatePicker();
        }else{
            this.showDatePicker();
            
            this._bShowWait = true;
            setTimeout(function(){
                that._bShowWait = false;
            }, 100);
        }
        
        return true;
    }
    
    return false;
},
// - - - - - - - Focus - - - - - - -

/*
Handles the click event of the mask and closes the picker (unless the click was very close to the 
picker).

@param  oEvent  The event object.
@private
*/
onMaskClick : function(oEvent){
    var oOffset, eTarget = oEvent.getTarget();
    
    eTarget = oEvent.getTarget();
    
    //  Add in a litle margin (5 pixels arround the picker) to prevent accidental clicks
    oOffset = this._ePickerWrp.getBoundingClientRect();
    if(oEvent.getMouseY() >= oOffset.top - 5 && oEvent.getMouseY() <= oOffset.bottom + 5 && oEvent.getMouseX() >= oOffset.left - 5 && oEvent.getMouseX() <= oOffset.right + 5){
        this.focus();
        return false;
    }
        
    this.hideDatePicker();
},

/*
Augment the focus method and if the date picker is visible we give the focus to the hidden focus 
element.

@return True if the List can take the focus.
*/
focus : function(){
    if(this._bPickerVisible){   //  Give focus to hidden focus element
        if(this._bFocusAble && this.pbEnabled && this._eFocus){
            this._eFocus.focus();
            return true;
        }
        
        return false;
    }
    //  Forward to base function
    return df.WebDateForm.base.focus.call(this);
},

/*
This method augments the onFocus event of the display field and handles two different scenarios. If 
the date picker is visible then this means that the user manually passed the focus to the input 
field. In that case we hide the date picker. If the date picker is not visible then we might need to 
show the date picker if pbAutoShow is true. The _bSkipAutoShow property can be set to true to 
prevent recursive loops. 

@param  oEvent  Event object (see: df.events.DOMEvent).
*/
onFocus : function(oEvent){
    var that = this;
    this._bLozingFocus = false;
    
    if(this._bPickerVisible){   //  Hide edatepicker if it is visible
        if(this.pbAutoShow && !this._bShowWait){
            this.hideDatePicker(true);
        }
    }else{  //  Show date picker if it is visible
        if(this.pbAutoShow && !this._bSkipAutoShow){
            this.showDatePicker();
            this._bShowWait = true;
            setTimeout(function(){
                that._bShowWait = false;
            }, 100);
            
        }
        this._bSkipAutoShow = false;
        df.WebDateForm.base.onFocus.call(this, oEvent);
    }
},

/*
This method handles the onFocus event of the hidden date picker focus holder. It will manually show 
the calendar as being focused. 

@param  oEvent  Event object (see: df.events.DOMEvent).
@private
*/
onPickFocus : function(oEvent){
    if(this._eElem){
        df.dom.addClass(this._eElem, "WebCon_Focus");
    }
    if(this._oPicker && this._oPicker._eElem){
        df.dom.addClass(this._oPicker._eElem, "WebCon_Focus");
    }   
    
    this._bHasFocus = true;
    
    this._bLozingFocus = false;
    
    if(this._tBlurTimeout){
        clearTimeout(this._tBlurTimeout);
        this._tBlurTimeout = null;
    }
},

/*
This method handles the onBlur event of the hidden date picker focus holder. It will manually remove the visual focus and hide the date picker after a short timeout. The timeout is needed because the onBlur will also fire when a mouse action is performed within the date picker.

@param  oEvent  Event object (see: df.events.DOMEvent).
@private
*/
onPickBlur : function(oEvent){
    var that = this;

    if(this._bPickerVisible){
        this._bLozingFocus = true;
        
        if(this._tBlurTimeout){
            clearTimeout(this._tBlurTimeout);
            this._tBlurTimeout = null;
        }
        this._tBlurTimeout = setTimeout(function(){

            if(that._bLozingFocus){
                that.getWebApp().objBlur(that);
            
                if(that._eElem){
                    df.dom.removeClass(that._eElem, "WebCon_Focus");
                }
                if(that._oPicker && that._oPicker._eElem){
                    df.dom.removeClass(that._oPicker._eElem, "WebCon_Focus");
                }   
                that.hideDatePicker(true);
                
                that._bHasFocus = false;
                that._bLozingFocus = false;
            }
        }, 200);
        
    }else{
        df.WebDateForm.base.onBlur.call(this, oEvent);
    }
},

/*
This method handles the onEnter event of the date picker. It updates the form value and hides the date picker.

@param  oEvent  Event object (see: df.events.DOMEvent).
@private
*/
onPickerEnter : function(oEvent){
    if(this.peDataType === df.ciTypeDate || this.peDataType === df.ciTypeDateTime){
        this._tValue = oEvent.dValue;
        this.refreshDisplay(this._tValue);
    }
    this.hideDatePicker();
    
    //  Trigger OnChange
    this.fireChange();
    
    //  Stop event to prevent OnSubmit from being fired
    return false;
},

onKey : function(oEvent){
    if(oEvent.matchKey(df.settings.calendarKeys.close) && this._bPickerVisible){
        this.hideDatePicker();
        oEvent.stop();
    }else{
        df.WebDateForm.base.onKey.call(this, oEvent);
    }
}

});