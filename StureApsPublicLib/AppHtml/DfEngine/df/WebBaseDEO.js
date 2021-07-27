/*
Class:
    df.WebBaseDEO
Extends:
    df.WebBaseControl

This class is the client-side representation of the WebBaseDEO class that has most of the Data Entry 
Object logic.
    
Revision:
    2011/07/16  (HW, DAW) 
        Initial version.
*/
df.WebBaseDEO = function WebBaseDEO(sName, oParent){
    df.WebBaseDEO.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tString, "psValue", "");
    this.prop(df.tBool, "pbChanged", false);
    
    this.prop(df.tInt, "peDataType", df.ciTypeText);
    this.prop(df.tInt, "piPrecision", 0);
    this.prop(df.tInt, "piMaxLength", 0);
    this.prop(df.tBool, "pbCapslock", false);
    this.prop(df.tBool, "pbRequired", false);
    
    this.prop(df.tInt, "peAlign", -1);
    this.prop(df.tString, "psMask", "");
    
    //  Events
    this.event("OnAutoFind");
    this.event("OnChange");

    //@privates
    this._tValue = null;
    this._sOrigValue = "";
    
    this._bFilters = true;
    this._bMasks = true;
    this._bAutoFind = false;
    
    this._aMaskChars = null;
    
    this._aErrors = [];
    
    this.setActionMode("Request_Save", df.cCallModeWait);
    this.setActionMode("Request_Delete", df.cCallModeWait);
    
    //  Always mark psValue & pbChanged as synchronized properties
    this.addSync("psValue");
    this.addSync("pbChanged");
};
/*
This class adds most Data Entry Object logic to the inheritance tree. It contains a lot of the 
validation functionality and has support for masking & input filtering.
*/
df.defineClass("df.WebBaseDEO", "df.WebBaseControl",{

/*
This method is called after the control is rendered and provides an opportunity to further 
initialize the DOM elements.

@private
*/
afterRender : function(){
    df.WebBaseDEO.base.afterRender.call(this);
    
    //  Set property value to apply them to to the DOM
    var sVal = this.psValue;
    this.set_peDataType(this.peDataType);
    this.set_psValue(sVal);
    this.set_pbCapslock(this.pbCapslock);
    this.set_peAlign(this.peAlign);
    
    this.set_pbEnabled(this.pbEnabled); //  WebBaseUIObject doesn't call it any more
    
    df.dom.enableTextSelection(this._eControlWrp);
    
    //  Attach listener
    if(this._eControl){
        df.events.addDomListener("change", this._eControl, this.onChange, this);
        df.events.addDomKeyListener(this._eControl, this.onKey, this);
        
        df.dom.enableTextSelection(this._eControl);
    }
},

/*
This method is called to attach the focus event handlers. These can be attached differently for the 
different controls. For data entry objects they are attached pretty straight forward to the control 
element.

@private
*/
attachFocusEvents : function(){
    //  We use a simpler focus detection on the control
    if(this._eControl){
        df.events.addDomListener("focus", this._eControl, this.onFocus, this);
        df.events.addDomListener("blur", this._eControl, this.onBlur, this);
    }
},

// - - - - - - Server API - - - - - -

/*
This getter determines the changed state. It will first look at the pbChanged property (which can be 
set to true by user interface events). If pbChanged was false it will also compare the original 
value with current value.
*/
get_pbChanged : function(){
    if(!this.pbChanged && this._eElem){
		this.updateTypeVal();
    }

    return this.pbChanged || this._sOrigValue !== this.getServerVal();
},

/*
This setter updates the current value of the component. It will first update the internal typed 
values and then update the displayed value according to the proper masking rules.

@param  sVal    The new value.
*/
set_psValue : function(sVal){
    // this._sOrigValue = sVal;

    //  Set the type specific value
    this._tValue = this.serverToType(sVal);
    this.psValue = sVal;
    
    // this.tValue = toTypeVal(sVal);
    this._sPrevChangeVal = this._sOrigValue = this.getServerVal();
    
    //  Update the displayed value
    this.refreshDisplay(this._tValue);
    
    //  If a new value is set we assume that errors don't apply any more
    this.clearErrors();
},

/*
This getter returns the current value in the 'server format'. First it updates the current value 
according to the current value inside the control then it gets it in the 'server format' using the 
getServerVal method.
*/
get_psValue : function(){
    //  Update the type specific value from the DOM
    if(this._eElem){
        this.updateTypeVal();
    }

    //  Return the 'server' value
    return this.getServerVal();
},

/*
This setter changes the data type. It will attach the event handlers for the input filters and apply 
the CSS class for the markup of the type.

@param  iVal    The new value.
*/
set_peDataType : function(iVal, bSvr){
    var sValue;
    
    if(this._eControl){
        //  Add event listeners for input filters
        if(this._bFilters){
            df.events.removeDomListener("keypress", this._eControl, this.filterDate);
            df.events.removeDomListener("keypress", this._eControl, this.filterNumeric);
            
            if(iVal === df.ciTypeBCD){
                df.events.addDomListener("keypress", this._eControl, this.filterNumeric, this);
            }else if(iVal === df.ciTypeDate){
                df.events.addDomListener("keypress", this._eControl, this.filterDate, this);
            }
        }
        
        //  Preserve value & changed-state
        if(bSvr){
            sValue = this.get_psValue();
        }
        // this.pbChanged = this.get_pbChanged();
        
        //  Make sure the new data type is properly applied
        this.peDataType = iVal;
        this.initMask();
        
        //  Update the displayed value with the new data type
        if(bSvr){
            this.set_psValue(sValue);
        }
        
        //  Set CSS class based on data type
        df.dom.removeClass(this._eControl, "dfData_BCD dfData_Date dfDate_Text");
        if(iVal === df.ciTypeBCD){
            df.dom.addClass(this._eControl, "dfData_BCD");
        }else if(iVal === df.ciTypeDate){
            df.dom.addClass(this._eControl, "dfData_Date");
        }else{
            df.dom.addClass(this._eControl, "dfData_Text");
        }
    }

},

/*
This setter updates the used mask. It makes sure that the new mask is properly initialized and tries 
to keep the value correct by calling updateTypeVal and refreshDisplay before and after the change.

@param  sVal    The new mask.
*/
set_psMask : function(sVal){
    //  Make sure the current value is correct using the 'old mask'
    this.updateTypeVal();
    this.psMask = sVal;
    this.initMask();
    
    //  Update the displayed value with the new mask
    this.refreshDisplay(this._tValue);
},

set_pbCapslock : function(bVal){
    if(this._eControl){
        this._eControl.style.textTransform = (bVal ? "uppercase" : "");
    }
},

set_pbEnabled : function(bVal){
    df.WebBaseDEO.base.set_pbEnabled.call(this, bVal);
    
    if(this._eControl){
        this._eControl.disabled = !bVal;
        this._eControl.tabIndex = (bVal ? 0 : -1);
    }
},

set_peAlign : function(iVal){
    if(this._eControl){
        this._eControl.style.textAlign = (iVal === df.ciAlignLeft ? "left" : (iVal === df.ciAlignCenter ? "center" : (iVal === df.ciAlignRight ? "right" : "")));
    }
},

// - - - - - - Data type logic - - - - - -

/*
This method updates the displayed value. It does this based on the type specific value and uses 
typeToDisplay to markup the value.

@param  tVal    The new value in the type specific format.
@private
*/
refreshDisplay : function(tVal){
    var sVal = this.typeToDisplay(tVal);
    
    this.setControlValue(sVal);
},

/*
This method determines the type specific value with a new value which is usually received from the 
server. The value is supplied in the 'server format' and is parsed into the private type specific 
value.

@param  sVal    The new value provided in the 'server format'.
@return The type specific value (date object or number).
@private
*/
serverToType : function(sVal){
    var tVal = sVal;
    
    if(this.peDataType === df.ciTypeBCD){
        tVal = df.sys.data.stringToNum(sVal, "."); 
    }else if(this.peDataType === df.ciTypeDate){
        tVal = df.sys.data.stringToDate(sVal, "yyyy/mm/dd", "-"); // TODO: Shoud be yyyy-mm-dd
    }
    
    return tVal;
},

/*
This method converts a type specific value to a display value.

@param  tVal    Value in type specific format (number or date object).
@return String with the display value.
*/
typeToDisplay : function(tVal){
    var sVal = tVal;

    if(!this._bHasFocus && this.psMask && this.peDataType !== df.ciTypeText){    //  If the field doesn't have the focus we need to apply a mask
        if(this.peDataType === df.ciTypeDate){ // Date mask
            sVal = (tVal && df.sys.data.applyDateMask(tVal, this.psMask, this.getWebApp().psDateSeparator)) || "";
        }else if(this.peDataType === df.ciTypeBCD){ // Numeric mask
            sVal = (tVal !== null && df.sys.data.applyNumMask(tVal || 0.0, this.psMask, this.getWebApp().psDecimalSeparator, this.getWebApp().psThousandsSeparator, this.getWebApp().psCurrencySymbol)) || "";
        }
    }else if(this.psMask && this.peDataType === df.ciTypeText){  //  Window mask
            sVal = df.sys.data.applyWinMask(sVal, this.psMask);
    }else{  //  No mask
        if(tVal !== ""){    // Leave blank value alone
            if(this.peDataType === df.ciTypeBCD){   //  Plain number
                sVal = (tVal !== null && df.sys.data.numToString(tVal, this.getWebApp().psDecimalSeparator, this.piPrecision));
            }else if(this.peDataType === df.ciTypeDate){   //  Pain date
                sVal = (tVal && df.sys.data.dateToString(tVal, this.getWebApp().psDateFormat, this.getWebApp().psDateSeparator)) || "";
            }
        }
    }
    
    return sVal;
},

/*
This method updates the value properties from the user interface. It uses the getControlValue method 
to get the value from the user interface (usually the DOM). If a numeric or date mask is applied 
then it doesn't update since those are not changed. The type specific properties (_nValue and 
_dValue) are also updated.

@private
*/
updateTypeVal : function(){
    var sVal = this.getControlValue();
    
    if(this.pbCapslock){
        sVal = sVal.toUpperCase();
    }
    
    if(this.peDataType === df.ciTypeText && this.psMask){    //  Window mask is always read from the DOM
        //  Read the value and remove the mask characters
        this.psValue = this._tValue = this.clearWinMask(sVal);
    }else if(this._bHasFocus || !this.psMask){      //  The value is not updated when masked value is shown (exept window mask)
        this.psValue = sVal;
        
        //  Parse to the typed value if needed.
        if(this.peDataType === df.ciTypeBCD){
            this._tValue = df.sys.data.stringToNum(sVal, this.getWebApp().psDecimalSeparator, this.getWebApp().psThousandsSeparator);
        }else if(this.peDataType === df.ciTypeDate){
            this._tValue = df.sys.data.stringToDate(sVal, this.getWebApp().psDateFormat, this.getWebApp().psDateSeparator);
        }else{
            this._tValue = sVal;
        }
    }
},

/*
This method returns the current format as a string in the server format. It uses the type specific 
properties (_nValue and _dValue) or psValue as the current value.

@return The current value in server format.
@private
*/
getServerVal : function(){
    if(this._tValue !== null){
        if(this.peDataType === df.ciTypeBCD){
            return this._tValue.toString(); //df.sys.data.numToString(this._tValue, ".", this.piPrecision);
        }
        if(this.peDataType === df.ciTypeDate){
            return (this._tValue && df.sys.data.dateToString(this._tValue, "yyyy/mm/dd", "-")) || "";
        }
    }
    
    return this.psValue;
},

/*
This method reads the current value from the user interface. It will be overridden by the different 
type of Data Entry Objects. The default implementation reads the value property of the control DOM 
element.

@return The currently displayed value.
@private
*/
getControlValue : function(){
    if(this._eControl){
        return this._eControl.value;
    }
    
    return this.psValue;
},

/*
This method sets a value to the user interface. It will be overridden by the different type of Data 
Entry Objects. The default implementation sets the value property of the control DOM element.

@param  sVal    The new value to display.
*/
setControlValue : function(sVal){
    if(this._eControl && this._eControl.value !== sVal){
        this._eControl.value = sVal;
    }
},


// - - - - - - Window masks - - - - - - 

/*
This method initializes the window mask system. It will attach the listeners (after removing them 
first so a clean situation exists after changing from a window mask to another mask). The mask 
characters are analyzed and an array of describing objects is created. That array is used for quick 
access by the filterWinMask and correctWinMask method.

@private
*/
initMask : function(){
    var i, sChar, sMask = this.psMask;
    
    if(this._bMasks){
        
        //  Clean up
        this._aMaskChars = null;
        if(this._bFilters){
            df.events.removeDomListener("keypress", this._eControl, this.filterWinMask, this);
            
            df.events.removeDomListener("keyup", this._eControl, this.correctWinMask, this);
            df.events.removeDomListener("blur", this._eControl, this.correctWinMask, this);
            df.events.removeDomListener("cut", this._eControl, this.onCutPasteWinMask, this);
            df.events.removeDomListener("paste", this._eControl, this.onCutPasteWinMask, this);
        }
        
        
        if(this.peDataType === df.ciTypeText && this.psMask){

            this._aMaskChars = [];
                    
            //  Fill character information array for quick access (also take in account the "\" exception) which is used only by the filterWinMask
            for(i = 0; i < sMask.length; i++){
                sChar = sMask.charAt(i);
                
                if(sChar === "\\" && i + 1 < this.sMask.length && (sMask.charAt(i + 1) === "#" || sMask.charAt(i + 1) === "@" || sMask.charAt(i + 1) === "!" || sMask.charAt(i + 1) === "*")){
                    i++;
                    this._aMaskChars.push({ bEnter : false, bNumeric : false, bAlpha : false, bPunct : false, sChar : sMask.charAt(i + 1) });
                }else{
                    this._aMaskChars.push({
                        bEnter : (sChar === "#" || sChar === "@" || sChar === "!" || sChar === "*"),
                        bNumeric : (sChar === "#" || sChar === "*"),
                        bAlpha : (sChar === "@" || sChar === "*"),
                        bPunct : (sChar === "!" || sChar === "*"),
                        sChar : sChar 
                    });
                }
            }
            
            //  Attach listeners
            if(this._bFilters){
                df.events.addDomListener("keypress", this._eControl, this.filterWinMask, this);
                
                df.events.addDomListener("keyup", this._eControl, this.correctWinMask, this);
                df.events.addDomListener("cut", this._eControl, this.onCutPasteWinMask, this);
                df.events.addDomListener("paste", this._eControl, this.onCutPasteWinMask, this);
            }
        }
    }
  
    
},

/*
Clears the windows mask from the value by removing the mask characters. If the
value doesn't match the mask the value might be returned incomplete.

@param  sValue  Value to apply the mask on.
@return Clean value to store in the database.

@private
*/
clearWinMask : function(sVal){
    var i = 0, sResult = "";
    
    while(i < sVal.length && i < this._aMaskChars.length){
        if(this._aMaskChars[i].bEnter || sVal.charAt(i) !== this._aMaskChars[i].sChar){
            sResult += sVal.charAt(i);
        }
        
        i++;
    }
    
    return sResult;
},

/*
Corrects the value according to the mask. It tries to preserve the caret 
position and only updates if the value needs to.

@param  oEvent   (optional) Event object.
@private
*/
correctWinMask : function(oEvent){
    var iPos, sNewValue;
    
    //  Calculate the correct value
    sNewValue = df.sys.data.applyWinMask(this.clearWinMask(this._eControl.value), this.psMask);
    
    //  If the correct value is different than the current value update the value (and try to preserve the caret position)
    if(sNewValue !== this._eControl.value){
        iPos = df.dom.getCaretPosition(this._eControl);
        this._eControl.value = sNewValue;
        df.dom.setCaretPosition(this._eControl, iPos);
    }
},

/*
Handles the onpaste and oncut events. It calls the correctWinMask method with 
a slight delay so the value is actually modified.

TODO: It is possible to perform the copy / paste action by ourself and so get 
rid of the delay.

@param  oEvent   Event object.
@private
*/
onCutPasteWinMask : function(oEvent){
    var that = this;
    
    setTimeout(function(){
        that.correctWinMask();
    }, 50);
},


// - - - - - - Input filters - - - - - -

/*
Adds/skips mask characters if the caret is located before them. It cancels 
characters that are not allowed at that position.

@param  oEvent   Event object.
@private
*/
filterWinMask : function(oEvent){
    var iPos, iNewPos, sChar;
    
    if(!oEvent.isSpecialKey()){
        iPos = df.dom.getCaretPosition(this._eControl);
        sChar = String.fromCharCode(oEvent.getCharCode());
        
        //  Skip no enter characters (add them if they aren't already there)
        iNewPos = iPos;
        while(iNewPos < this._aMaskChars.length && !this._aMaskChars[iNewPos].bEnter){
            if(this._eControl.value.length <= iNewPos){
                this._eControl.value += this._aMaskChars[iNewPos].sChar;
            }
            iNewPos++;
        }
        
        //  Set the new caret position if it is moved
        if(iPos !== iNewPos && iNewPos < this._aMaskChars.length){
            df.dom.setCaretPosition(this._eControl, iNewPos);
            iPos = iNewPos;
        }
        
        //  Check if character allowed by mask
        if(iPos >= this._aMaskChars.length || !df.sys.data.acceptWinMaskChar(sChar, this._aMaskChars[iPos].sChar)){
            oEvent.stop();
        }
    }
},

/*
Handles the keypress event for date fields and filters unwanted characters.

@param  oEvent   Event object.
@private
*/
filterDate : function(oEvent){
    var sChar, iCarret, sNumChar, aFormats, aValues, iCur, iStartPos, sCur, sDateFormat = this.getWebApp().psDateFormat, sDateSepp = this.getWebApp().psDateSeparator;

    if(!oEvent.isSpecialKey()){
        sChar = String.fromCharCode(oEvent.getCharCode());
        iCarret = df.dom.getCaretPosition(this._eControl);
        sNumChar = "0123456789";
        
        //  Is character allowed?
        if(sNumChar.indexOf(sChar) !== -1 || sChar === sDateSepp){
            //  Make parts arrays
            aFormats = sDateFormat.toLowerCase().split('/');
            //new RegExp('[/' + sDateSepp + ']'));
            aValues = this._eControl.value.split(sDateSepp);
            
            //  Loop through parts
            iCur = 0; 
            iStartPos = 0;
            while(iCur < aValues.length && iCur < aFormats.length){
                
                //  Determine if carret is inside part
                if(iCarret - iStartPos >= 0 && (iCur + 1 === aValues.length ||  iCarret - iStartPos <= aValues[iCur].length)){
                    sCur = aValues[iCur];
                    
                    if(sChar === sDateSepp){
                        //  Adding a date separator must make valid part before
                        if(iCarret - iStartPos > (aFormats[iCur] === "yyyy" ? 4 : 2) || iCarret - iStartPos <= 0){
                            oEvent.stop();
                            return;
                        }
                        if(aValues.length >= aFormats.length || sCur.length - (iCarret - iStartPos) > (aFormats[iCur + 1] === "yyyy" ? 4 : 2)){ // There must also be space for a part after
                            oEvent.stop();
                            return;
                        }
                    }else{
                        if(sCur.length >= (aFormats[iCur] === "yyyy" ? 4 : 2)){
                            if(iCur + 1 === aValues.length && aFormats.length > iCur + 1 && sCur.length - (iCarret - iStartPos) < (aFormats[iCur + 1] === "yyyy" ? 4 : 2)){
                                this._eControl.value = this._eControl.value.substring(0, iCarret) + sDateSepp + this._eControl.value.substring(iCarret);
                                df.dom.setCaretPosition(this._eControl, iCarret + 1);
                                return;
                            }
                            oEvent.stop();
                            return;
                        }
                    }
                }
                iStartPos += sDateSepp.length + aValues[iCur].length;
                iCur++;
                
            }
        }else{
            oEvent.stop();
        }
        
    }
},

/*
Filters non numeric characters and prevents the user from entering incorrect 
values.

Params:
    e   Event object
@private
*/
filterNumeric : function(oEvent){
    var sValidChars, sChar, iSeparator, iBefore, iDecimals, iMaxBefore, iPos, sValue, iSel, sDecSepp = this.getWebApp().psDecimalSeparator;
        
    if(!oEvent.isSpecialKey()){
        sChar = String.fromCharCode(oEvent.getCharCode());
        iPos = df.dom.getCaretPosition(this._eControl);
        iSel = df.dom.getSelectionLength(this._eControl);
        sValue = this._eControl.value;
        sValidChars = "0123456789";
        
        if(sChar === "-"){
            //  Only allow "-" at the first position
            if(iPos === 0){ 
                //  When at the first position but a caret is already there we allow the user
                if(sValue.indexOf("-") !== -1){
                    df.dom.setCaretPosition(this._eControl, 1);
                    oEvent.stop();
                }
            }else{
                oEvent.stop();
            }
        }else if(sChar === sDecSepp){
            iSeparator = sValue.indexOf(sDecSepp);
            
            if(iPos === iSeparator && iSel === 0){ // If we are at the decimal separator typing a decimal separator we move the caret one position
                df.dom.setCaretPosition(this._eControl, iPos + 1);
                oEvent.stop();
            }else if(iSeparator !== -1 && (iSeparator < iPos || iSeparator > (iPos + iSel))){ //    If there is a separator it must be selected
                oEvent.stop();
            }else if(sValue.indexOf("-") >= iPos && sValue.indexOf("-") >= iPos + iSel){ //  Make sure we don't insert before the "-"
                oEvent.stop();
            }else if(sValue.length - iSel - iPos > this.piPrecision){   //  Make sure we don't get to may decimals
                oEvent.stop();
            }else if(this.piPrecision <= 0){ // Are decimals actually allowed?
                oEvent.stop();
            }
        }else if(sValidChars.indexOf(sChar) !== -1){
            //  When we are before the the "-" we move one character forward
            if(iPos === 0 && sValue.indexOf("-") !== -1 && iSel === 0){
                iPos++;
                df.dom.setCaretPosition(this._eControl, iPos);
            }
            
            iMaxBefore = this.piMaxLength - this.piPrecision;
            
            if(iMaxBefore >= 0 && this.piPrecision >= 0){
                //  Determine separator, numbers before and decimals
                iSeparator = sValue.indexOf(sDecSepp);
                iBefore = (iSeparator === -1 ? sValue.length : iSeparator) - (sValue.indexOf("-") === -1 ? 0 : 1);
                iDecimals = (iSeparator === -1 ? 0 : sValue.length - iSeparator - 1);
                
                
                if(iPos <= iSeparator || iSeparator === -1){
                    //  Don't allow to many numbers before (add / move to after decimal separator if we are there and there is room after)
                    if(iBefore >= iMaxBefore){
                        if(iDecimals < this.piPrecision && iSeparator !== -1 && iPos === iSeparator){
                            iPos++;
                            df.dom.setCaretPosition(this._eControl, iPos);
                        }else if(iDecimals < this.piPrecision && iSeparator === -1 && iPos === sValue.length){
                            this._eControl.value = sValue + sDecSepp;
                        }else{
                            oEvent.stop();
                        }
                    }
                }else if(iDecimals >= this.piPrecision){ //  Don't allow to may decimals!
                    oEvent.stop();
                }
            }
        }else{
            oEvent.stop();
        }
    }
},

/*
This method performs the validations that are needed. It performs some client-side validations and \
will trigger the server-side validation by firing the OnValidate event.

@return True if no validation errors occurred. Note that server-side validatione errors are 
            triggered later.
*/
validate : function(){
    var bResult = true, sVal;
    
    if(this.pbRequired){
        sVal = this.get_psValue();
        
        if((this.peDataType === df.ciTypeBCD && parseFloat(sVal) === 0.0) || sVal === ""){
            bResult = false;
            this.displayError(13, "An entry is required on this window");
        }else{
            this.clearError(13);
        }
    }
    
    if(bResult){
        //  Make sure that OnChange is fired before OnValidate
        this.fireChange();
        this.fireAutoFind();
    
        this.fire("OnValidate", [], function(oEvent){
            if(oEvent.bServer){
                //  If handled on the server this means ASynchronous so we have to put the focus back manually if a problem occurred
                if(oEvent.sReturnValue === "0"){
                    this.focus();
                }else{
                    this.clearErrors();
                }
            }else{
                //  If handled on the client we can make bResult false if event stopped to cancel moving out of the field
                if(oEvent.bCancelled){
                    bResult = false;
                }
            }
        });
    }
    
    return bResult;
},  


// - - - - - - Event handling - - - - - -

/*
This method handles the onKey event and performs the various actions like finds, saves & deletes. It 
also initiates the validations when tabbing out of the field.

@param oEvent   The event object.
*/
onKey : function(oEvent){
    var oView = this.getView();

    if(oEvent.matchKey(df.settings.formKeys.tabOut)){ 
        if(!this.validate()){
            oEvent.stop();
        }
    }else if(oView && oView.pbDDHotKeys){
        if(oEvent.matchKey(df.settings.formKeys.findGT)){ 
            this.serverAction("Request_Find", [ df.GT ]);  // F8:  find next
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.formKeys.findLT)){ 
            this.serverAction("Request_Find", [ df.LT ]);  // F7:  find previous
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.formKeys.findGE)){ 
            this.serverAction("Request_Find", [ df.GE ]);  // F9:  find equal
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.formKeys.save)){ 
            this.serverAction("Request_Save", []);           // F2:  save
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.formKeys.clear)){ 
            this.serverAction("Request_Clear", []);          // F5:  clear
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.formKeys.clearAll)){ 
            this.serverAction("Request_Clear_All", []);       // Crtl - F5:  clear all
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.formKeys.findFirst)){ 
            this.serverAction("Request_Find", [ df.FIRST ]); // ctrl - home: find first
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.formKeys.findLast)){ 
            this.serverAction("Request_Find", [ df.LAST ]);  // ctrl - end:  find last
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.formKeys.remove)){ 
            this.serverAction("Request_Delete", []);      // shift - F2:  delete
            oEvent.stop();
        }
    }
},

/*
Augments the onFocus event listener and calls the refreshDisplay method after forwarding the onFocus 
event. This will make sure that the value will be displayed in the proper edit format.

@param  oEvent   Event object.
@private
*/
onFocus : function(oEvent){
    df.WebBaseDEO.base.onFocus.call(this, oEvent);
    
    this.refreshDisplay(this._tValue);
},

/*

@param  oEvent   Event object.
@private
*/
onBlur : function(oEvent){
    this.updateTypeVal();
    
    this.fireAutoFind();
    
    df.WebBaseDEO.base.onBlur.call(this, oEvent);
    
    this.refreshDisplay(this._tValue);
},

/*
This method checks if the value is changed and if so it will trigger the OnChange event.
*/
fireChange : function(){
    var sNewVal;
    
    //  Check the new value
    this.updateTypeVal();
    sNewVal = this.getServerVal();
    
    //  Only fire events if it changed
    if(this._sPrevChangeVal !== sNewVal){
        this.pbChanged = true;
        
        //  Fire events (OnSelectedChange on every radio and OnSelect on the selected one)
        this.fire('OnChange', [ sNewVal , this._sPrevChangeVal]);
        
        this._bAutoFind = true;
        
        //  Remember the value
        this._sPrevChangeVal = sNewVal;
    }
},

/*
This method fires the autofind event when needed. The fireChanged method updates a Boolean when the 
value is changed telling us that we need to do an autofind. We reset the Boolean so that we don't do 
an autofind too often. The autofind is called from the blur event and the validation method because 
it should fire on the blur but before OnValidate.
*/
fireAutoFind : function(){
    if(this._bAutoFind){
        //  Fire autofind event
        this.fire('OnAutoFind');
        
        this._bAutoFind = false;
    }
},

/*
Augments the onBlur event and calls the updateTypeVal to update the value properties before 
forwarding the onBlur. The refreshDisplay method is called after the onBlur to display the properly 
masked value.

@param  oEvent   Event object.
@private
*/
onChange : function(){
    this.fireChange();
},

displayError : function(iNumber, sText){
    var i;
    
    for(i = 0; i < this._aErrors.length; i++){
        if(this._aErrors[i].iNumber === iNumber){
            this._aErrors[i].sText = sText;
            this.updateErrorDisp();
            return;
        }
    }
    
    this._aErrors.push({
        iNumber : iNumber,
        sText : sText
    });
    
    this.updateErrorDisp();
},

clearErrors : function(){
    this._aErrors = [];
    this.updateErrorDisp();
},

clearError : function(iNumber){
    var i;
    
    for(i = 0; i < this._aErrors.length; i++){
        if(this._aErrors[i].iNumber === iNumber){
            this._aErrors.splice(i, 1);
            
            this.updateErrorDisp();
            break;
        }
    }
},

updateErrorDisp : function(){
    var i, aHtml = [];
    
    if(this._aErrors.length > 0){
        //  Generate errors html
        for(i = 0; i < this._aErrors.length; i++){
            if(i > 0){
                aHtml.push('<br>');
            }
            aHtml.push(this._aErrors[i].sText);
        }
        
        //  Create tooltip if needed
        if(!this._oErrorTooltip){
            this._oErrorTooltip = new df.WebTooltip(null, this);
            this._oErrorTooltip._oTarget = this;
            this._oErrorTooltip.psCSSClass = "WebErrorTooltip";
        }
        
        //  Update & show tooltip
        this._oErrorTooltip.set('psMessage', aHtml.join(""));
        this._oErrorTooltip.show();
        
        df.dom.addClass(this.getErrorElem(), "WebError");
        
        this.makeVisible();
        
        this.focus();
    }else{
        //  Hide tooltip if needed
        if(this._oErrorTooltip){
            this._oErrorTooltip.hide();
            
            df.dom.removeClass(this.getErrorElem(), "WebError");
        }
    }
},

getErrorElem : function(){
    return this._eElem;
},

resize : function(){
    if(this._oErrorTooltip){
        this._oErrorTooltip.resize();
    }
},

makeVisible : function(){
    var oControl = this;
    
    while(oControl){
        if(oControl instanceof df.WebCard){
            oControl.show();
        }
        
        oControl = oControl._oParent;
    }
}

});