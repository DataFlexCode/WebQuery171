/*
Class:
    df.WebSuggestionForm
Extends:
    df.WebForm

Implementation of the web suggestion form that is capable of showing a list of suggestions while 
typing. These suggestions can come from a variety of sources which is mainly determined on the 
server.

Revision:
    2013/10/12  (HW, DAW) 
        Initial version.
*/


/* 
Definition of the struct in which suggestions are received from / sent to the server.
*/
df.tWebSuggestion = {
    sRowId : df.tString,
    aValues : [ df.tString ]
};


df.WebSuggestionForm = function WebSuggestionForm(sName, oParent){
    df.WebSuggestionForm.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tInt, "peSuggestionMode", df.smFind);
    this.prop(df.tBool, "pbCaseSensitive", false);
    this.prop(df.tBool, "pbAllowForce", true);
    this.prop(df.tBool, "pbFullText", false);
    this.prop(df.tBool, "pbHighlight", true);
    this.prop(df.tInt, "piMaxResults", 15);
    this.prop(df.tInt, "piStartAtChar", 2);
    this.prop(df.tInt, "piSuggestionWidth", 0);
    
    this.prop(df.tBool, "pbClientRefinement",  true);
    
    this.prop(df.tInt, "piPopupTimeout", 50);
    this.prop(df.tInt, "piTypeTimeout",  20);
    
    this._eSuggestions = null;
    this._bForceDisplay = false;
    
    this._sSelectedId = null;
    
};
df.defineClass("df.WebSuggestionForm", "df.WebForm", {

/* 
Augment openHtml to insert hidden suggestion list div elements.

@param  aHtml   String builder array.
@private
*/
openHtml : function(aHtml){
    df.WebSuggestionForm.base.openHtml.call(this, aHtml);
    
    aHtml.push('<div class="WebSuggestions WebSug_Hidden"><div class="WebSug_Content"></div><div>'); 
},

/* 
Augment afterRender to initialize suggestionlist (find elements, attach listeners).

@private
*/
afterRender : function(){
    this._eSuggestions = df.dom.query(this._eElem, "div.WebSuggestions");
    this._eSugContent = df.dom.query(this._eElem, "div.WebSug_Content");
    
    df.WebSuggestionForm.base.afterRender.call(this);
    
    df.events.addDomListener("keyup", this._eControl, this.onSuggestKey, this);
    df.events.addDomListener("click", this._eSuggestions, this.onSuggestClick, this);
},

/*
Compile optimized serialize and deserialize valuetree functions.
*/
deserializeVT : df.sys.vt.generateDeserializer([ df.tWebSuggestion ]),
serializeVT : df.sys.vt.generateSerializer([ df.tWebSuggestion ]),

/*
This method updates the suggestion list according to the current field value. It will initiate the 
loading of values from the server, refinement on the client and will hide the list if needed.
*/
suggestUpdate : function(){
    var that = this, sVal = this.getControlValue();
    
    if(sVal !== this._sSuggestPrevVal || this._bForceDisplay){
        this._sSuggestPrevVal = sVal;
        
        if(sVal.length >= this.piStartAtChar || this._bForceDisplay){
            if(this._bSuggestVisible){
                if(this.pbClientRefinement && this._sSuggestBaseVal){
                    if(sVal.substr(0, this._sSuggestBaseVal.length) === this._sSuggestBaseVal){
                        this.suggestRefine(sVal);
                        return;
                    }
                }
            }else{
                if(!this._tSuggestDisplay){
                    this._tSuggestDisplay = setTimeout(function(){
                        that._tSuggestDisplay = null;
                        that.suggestDisplay();
                    }, this.piPopupTimeout);
                }
            }
            
            
            this.suggestLoad();
        }else if(this._bSuggestVisible){
            this.suggestHide();
        }
        
    }
},

/* 
This method displays the loading symbol and sets a small timeout that will perform the loading call. 
This timeout gives the user a chance to continue typing.

@private
*/
suggestLoad : function(){
    var that = this;
    
    df.dom.addClass(this._eSuggestions, "WebSug_Loading");
    
    if(!this._tSuggestUpdate){
        this._tSuggestUpdate = setTimeout(function(){
            that._tSuggestUpdate = null;
            
            that.suggestDoLoad(that.getControlValue());
        }, this.piTypeTimeout);
    }
},

/* 
This method sends the server call that will load new suggestions. This method sends the server call 
that will load new suggestions. If a call is already being performed it will wait until that call is 
finished before sending a new call.

@param  sVal    The search value.
@private
*/
suggestDoLoad : function(sVal){
    if(!this._bSuggestLoading){
        this._bSuggestLoading = true;
        
        this.serverAction("FindSuggestions", [ sVal ], null, function(){
            this._bSuggestLoading = false;
            
            if(this._sSuggestNextLoad){
                this.suggestDoLoad(this._sSuggestNextLoad);
                this._sSuggestNextLoad = null;
            }else{
                df.dom.removeClass(this._eSuggestions, "WebSug_Loading");
            }
                
        }, this);
    }else{
        this._sSuggestNextLoad = sVal;
    }
},

/*
This method is called by the server when new suggestions are loaded. This is usually triggered by 
the FindSuggestions server call. It will process the suggestions and update the display. The 
suggestions are sent as action data (in the value tree format).

@param  sVal    The search value.
@client-action
*/
suggestHandle : function(sVal){
    var aList, i, sCurVal, bFound = false, bRefine;
    
    //  Load and deserialize suggestions from the action data
    aList = this.deserializeVT(this._tActionData);
    
    //  Get the current control value
    sCurVal = this.getControlValue();
    
    //  Check if the value didn't change during the call
    if(sCurVal !== sVal){
        if(this.pbClientRefinement && sCurVal.substr(0, sVal) === sVal){
            bRefine = true;
        }else{
            return;
        }
    }
    
    //  Update suggestion administration
    this._sSuggestBaseVal = sVal;
    this._aSuggestBase = this._aSuggestRows = aList;
    
    //  Refind the selected value value
    for(i = 0; i < aList.length; i++){
        if(aList[i].sRowId === this._sSelectedId){
            bFound = true;
        }
    }
    //  Select the first if not found
    if(!bFound){
        this._sSelectedId = (aList.length > 0 ? aList[0].sRowId : null);
    }
    
    //  Update the display
    if(bRefine){
        this.suggestRefine(sCurVal);
    }else{
        this.suggestRender(sVal);
    }
},

/* 
This method displays the suggestion box by setting the proper CSS Classnames.
*/
suggestDisplay : function(){
    if(this.pbEnabled){
        if(!this._aSuggestRows){
            this._eSugContent.innerHTML = "";
        }
        
        this.suggestPosition();
        
        df.dom.addClass(this._eSuggestions, "WebSug_Visible");
        df.dom.removeClass(this._eSuggestions, "WebSug_Hidden");
        
        this._bSuggestVisible = true;
    }
},

/* 
This method positions the suggestion list below the control. The suggestion list is positioned fixed 
and this method is called when the page is scrolled, a tab is displayed or other positioning 
changes.
*/
suggestPosition : function(){
    var oRect = this._eSuggestions.parentNode.getBoundingClientRect();
    
    // TODO: Consider screen height..
    
    this._eSuggestions.style.top = oRect.bottom + "px";
    this._eSuggestions.style.left = oRect.left + "px";
    
    this._eSuggestions.style.width = (this.piSuggestionWidth > 0 ? this.piSuggestionWidth : (oRect.right - oRect.left)) + "px";
    
    if(oRect.bottom + this._eSugContent.clientHeight > window.innerHeight){
        this._eSuggestions.style.bottom = "0px";
    }else{
        this._eSuggestions.style.bottom = "";
    }
    
},

/* 
This method hides the suggestion list. It clears all timers and the suggestion administration. 
Hiding is done by changing the CSS Classnames.
*/
suggestHide : function(){
    if(this._eSuggestions){
        df.dom.addClass(this._eSuggestions, "WebSug_Hidden");
        df.dom.removeClass(this._eSuggestions, "WebSug_Visible");
        
        if(this._tSuggestDisplay){
            clearTimeout(this._tSuggestDisplay);
            this._tSuggestDisplay = null;
        }
        if(this._tSuggestUpdate){
            clearTimeout(this._tSuggestUpdate);
            this._tSuggestUpdate = null;
        }
        
        this._sSuggestPrevVal = this.getControlValue();
        
        this._aSuggestRows = null;
        this._bSuggestVisible = false;
        this._sSelectedId = null;
        this._bForceDisplay = false;
    }
},

/* 
Updates the displayed suggestion list.

@param  sSearch     The current search value.
*/
suggestRender : function(sSearch){
    var aHtml = [], aList = this._aSuggestRows, i, x, sLowerSearch, iLen, sVal, oRegEx;
    
    function makeBold(sMatch){ 
        return '<b>' + sMatch + '</b>'; 
    }
    
    //  Prepare highlight searches
    if(this.pbHighlight){
        if(this.pbFullText){
            oRegEx = new RegExp(df.sys.data.escapeRegExp(sSearch), (this.pbCaseSensitive ? 'g' : 'gi'));
        }else{
            sLowerSearch = sSearch.toLowerCase();
            iLen = sSearch.length;
        }
    }
    
    
    //  Generate result table
    aHtml.push('<table>');
    
    for(i = 0; i < aList.length; i++){
        aHtml.push('<tr data-suggestnr="', i, '" class="WebSug_Suggestion ', ( aList[i].sRowId === this._sSelectedId ? 'WebSug_Selected': ''), '">');
        
        for(x = 0; x < aList[i].aValues.length; x++){
            sVal = aList[i].aValues[x];
            
            aHtml.push('<td>');
            
            //  Do highlighting
            if(this.pbHighlight && (this.peSuggestionMode !== df.smValidationTable || x === 0)){
                if(this.pbFullText){
                    //  Perform a find and replace to highlight keyword(s)
                    aHtml.push(sVal.replace(oRegEx, makeBold));
                }else{
                    if(sVal.substr(0, iLen).toLowerCase() === sLowerSearch){
                        aHtml.push('<b>', sVal.substr(0, iLen), '</b>', sVal.substr(iLen));
                    }else{
                        aHtml.push(sVal);
                    }
                }
            }else{
                aHtml.push(sVal);
            }
                
             aHtml.push('</td>');
        }
        
        aHtml.push('</tr>');
    }
    
    aHtml.push('</table>');
    
    this._eSugContent.innerHTML = aHtml.join("");
    this.suggestPosition();
},

/* 
This method performs the client-side filtering / refinement using the search value. It will go over 
the available suggestions and remove the items that do not apply the filter. If we were starting 
with the maximum amount of suggestions it will trigger suggestLoad to reload from the server as 
there might be more matches.

@param  sSearch     The search string.
*/
suggestRefine : function(sSearch){
    var i, x, aList = [], aBase = this._aSuggestBase, sLowVal, iLen, bServer = true, bFound = false, oRegEx;
    
    if(this.pbFullText){
        oRegEx = new RegExp(df.sys.data.escapeRegExp(sSearch), (this.pbCaseSensitive ? '' : 'i'));
        
        for(i = 0; i < aBase.length; i++){
            for(x = 0; x < (this.peSuggestionMode !== df.smValidationTable ? aBase[i].aValues.length : 1); x++){
                if(oRegEx.test(aBase[i].aValues[x])){
                    aList.push(aBase[i]);
                    
                    bFound = (bFound || aBase[i].sRowId === this._sSelectedId);
                    break;
                }
            }
        }
        
        this._aSuggestRows = aList;
        
        this.suggestRender(sSearch);
        if(aBase.length >= this.piMaxResults && aList.length < this.piMaxResults){
            this.suggestLoad();
        }
    
    }else{
        sLowVal = sSearch.toLowerCase();
        iLen = sSearch.length;
    
        for(i = 0; i < aBase.length; i++){
            if( (!this.pbCaseSensitive && aBase[i].aValues[0].substr(0, iLen).toLowerCase() === sLowVal) ||
                (this.pbCaseSensitive && aBase[i].aValues[0].substr(0, iLen) === sSearch) ){
                
                aList.push(aBase[i]);
                
                bFound = (bFound || aBase[i].sRowId === this._sSelectedId);
            }else if(aList.length > 0){
                bServer = (this.peDataType === df.ciTypeBCD);
            }
        }
        
        this._aSuggestRows = aList;
        
        //  Determine selected id
        if(!bFound){
            this._sSelectedId = (aList.length > 0 ? aList[0].sRowId : null);
        }
    
        this.suggestRender(sSearch);
        if(aBase.length >= this.piMaxResults && bServer && sSearch !== this._sSuggestBaseVal){
            this.suggestLoad();
        }
    }
},

/*
Selects the item by sending a call to the server with the selected suggestion details.
*/
suggestSelect : function(){
    var i, aList = this._aSuggestRows, tRow = null;
    
    if(this._sSelectedId){
        for(i = 0; i < aList.length; i++){
            if(aList[i].sRowId === this._sSelectedId){
                tRow = aList[i];
                break;
            }
        }
        
        if(tRow){
            this.serverAction("SelectSuggestion", [ this.getControlValue() ], this.serializeVT([ tRow ]), function(oEvent){
                this.suggestHide();
            });
        }
    }
},

/* 
Moves the selection suggestion up or down.

@param  iDir    Direction (-1 goes one up and 1 goes one down).
@private
*/
suggestMove : function(iDir){
    var i, aList = this._aSuggestRows;
    
    if(this._sSelectedId){
        for(i = 0; i < aList.length; i++){
            if(aList[i].sRowId === this._sSelectedId){
                break;
            }
        }
        
        i = i + iDir;
        
        i = (i >= 0 ? (i < aList.length ? i : aList.length - 1) : 0);
        
        this.suggestHightlight(aList[i].sRowId);
    }else{
        this.suggestHightlight(aList.length > 0 ? aList[0].sRowId : null);
    }
},

/*
Highlights the specified suggestion in the list by applying the WebSug_Selected CSS Classname to its 
tr DOM element.

@param  sId     ID of suggestion.
@private
*/
suggestHightlight : function(sId){
    var eElem, iTop, iBottom;
    
    this._sSelectedId = sId;
    
    this.suggestRender(this.getControlValue());
    
    eElem = df.dom.query(this._eSugContent, "tr.WebSug_Selected");
    
    if(eElem){
        iTop = df.sys.gui.getAbsoluteOffset(eElem).top;
        iBottom = iTop + eElem.offsetHeight;
        
        if(iTop - this._eSuggestions.scrollTop < 0){
            this._eSuggestions.scrollTop = iTop;
        }else if(iBottom > this._eSuggestions.clientHeight + this._eSuggestions.scrollTop){
            this._eSuggestions.scrollTop = iBottom - this._eSuggestions.clientHeight;
        }
    }
    
    
},

/* 
Handles the click event of the suggestionlist.

@param  oEvent  Event object (see df.events.DOMEvent).
@private
*/
onSuggestClick : function(oEvent){
    var iRow, eElem = oEvent.getTarget();
    
    if(eElem.tagName === "TD"){
        eElem = eElem.parentNode;
    }
    
    if(eElem.hasAttribute("data-suggestnr")){
        iRow = parseInt(eElem.getAttribute("data-suggestnr"), 10);
        
        if(this._aSuggestRows[iRow]){
            this.suggestHightlight(this._aSuggestRows[iRow].sRowId);
            this.suggestSelect();
        }
    }
},

/* 
Augments the key handler and implements the key operations.

@param  oEvent  Event object (see df.events.DOMEvent).
@private
*/
onKey : function(oEvent){
    var oKeys = df.settings.suggestionKeys;

    df.WebSuggestionForm.base.onKey.call(this, oEvent);
    
    if(!oEvent.bCanceled){
        if(this._bSuggestVisible){
            if(oEvent.matchKey(oKeys.escape)){
                this.suggestHide();
                // oEvent.stop();
            }else if(oEvent.matchKey(oKeys.select)){
                this.suggestSelect();
                oEvent.stop();
            }else if(oEvent.matchKey(oKeys.moveUp)){
                this.suggestMove(-1);
                oEvent.stop();
            }else if(oEvent.matchKey(oKeys.moveDown)){
                this.suggestMove(1);
                oEvent.stop();
            }
        }
        
        //  Make sure force display doesn't change value
        if(oEvent.matchKey(oKeys.forceDisplay) && this.pbAllowForce){
            oEvent.stop();
        }
    }
},

/* 
Handles the keyup event and performs the force display if needed. 

TODO: Not sure why we do this in keyup but there must be a good reason!

@param  oEvent  Event object (see df.events.DOMEvent);
@private
*/
onSuggestKey : function(oEvent){
    var oKeys = df.settings.suggestionKeys, iKey = oEvent.getKeyCode();
    // df.WebSuggestionForm.base.onKey.call(this, oEvent);
    
    if(this._bSuggestVisible){
        this.suggestUpdate();
    }else{
        if(oEvent.matchKey(oKeys.forceDisplay) && this.pbAllowForce){
            this._bForceDisplay = true;
            this.suggestDisplay();
            this.suggestUpdate();
            oEvent.stop();
        }else if(!oEvent.isSpecialKey() && (iKey < 112 || iKey > 127)){ //  Explicitly filter out function keys (to prevent responding to finds)
            this.suggestUpdate();
            df.log("onSuggestKey");
        }
    }
},

/* 
Augment the blur event and hide the suggestion list.

@param  oEvent  Event object (see df.events.DOMEvent);
@private
*/
onBlur : function(oEvent){
    var that = this;
    
    df.WebSuggestionForm.base.onBlur.call(this, oEvent);
    
    setTimeout(function(){
        if(!that._bHasFocus){
            that.suggestHide();
        }
    }, 100);
}

});