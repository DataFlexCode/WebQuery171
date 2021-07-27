/*
Class:
    df.WebSlider
Extends:
    df.WebBaseDEO

This is the client-side representation of the cWebSlider class. It is able to display
a slider with labels and a ranged slider
    
Revision:
    2012/09/05  (RH, DAE) 
        Initial version.
    2013/02/13  (HW, DAW)
        Refactored, implemented design, finished.
*/
df.WebSlider = function WebSlider(sName, oParent) {
    df.WebSlider.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tInt, "piMinValue", 1);
    this.prop(df.tInt, "piMaxValue", 10);
    this.prop(df.tInt, "piSliderValue", 1);
    this.prop(df.tInt, "piInterval", 1);
    
    this.prop(df.tBool, "pbVertical", false);
    this.prop(df.tInt, "piHeight", 0);
    
    this.prop(df.tBool, "pbShowMarkers", false);
    this.prop(df.tInt, "piMaxMarkers", 101);
    this.prop(df.tBool, "pbRanged", false);
    this.prop(df.tInt, "piSliderStart", 0);
    this.prop(df.tInt, "piFrom", 1);
    this.prop(df.tInt, "piTo", 3);
    this.prop(df.tBool, "pbShowValue", true);
	this.prop(df.tBool, "pbShowRange", false);

    // @privates
    this._eSlider = null;
    this._eSliderWrp = null;
    this._eSliderBar = null;
    this._eControl = null;
    this._eLabels = null;
    this._eValueIndicator = null;
    this._bSelected = false;
    this._bFocus = false;
    this._eRangedSlider = null;
    
    this._iValueInterval = 0;
    this._aLabels = [];
    this._aMarkers = [];
    this._iPrevChangePos = 1;
    
    //  Configure super classes
    this.unSync("psValue");
    this._sControlClass = "WebSlider";
};
df.defineClass("df.WebSlider", "df.WebBaseDEO",{

/*
Do initializations based on the initial values of the web properties.
*/
create : function(tDef){
    df.WebSlider.base.create.call(this, tDef);
    
    //  We automatically correct wrong initial piSliderValue
    if(this.piSliderValue < this.piMinValue){
        this.piSliderValue = this.piMinValue;
    }else if(this.piSliderValue > this.piMaxValue){
        this.piSliderValue = this.piMaxValue;
    }
    this._iPrevChangePos = this.piSliderValue;
    
    //  Validate properties
    this.assertions();
    
    //  Make sure properties are being synchronized
    if(this.pbRanged){
        this.addSync("piFrom");
        this.addSync("piTo");
    }else{
        this.addSync("piSliderValue");
    }
},

//--------Main element functions --------
/*
This function adds the slider element to the aHtml param.

Params:
    aHtml   Array string builder to add HTML to.

@private
*/
openHtml : function(aHtml){
    df.WebSlider.base.openHtml.call(this, aHtml);
    
	// This will be used to show the current value of the slider
    if(this.pbShowValue){
        aHtml.push('<div class="WebSlider_ValueIndicatorWrapper">1</div>');
    }
    
    aHtml.push('<div class="WebSlider_Wrapper', (this.pbVertical ? ' WebSlider_Vertical' : ' WebSlider_Horizontal'), '', (this.pbRanged ? ' WebSlider_Range' : ' WebSlider_NoRange'), '">');
   
    //  BAR
    aHtml.push('<div class="WebSlider_BarWrapper">');
    aHtml.push('<div class="WebSlider_Bar">');
	aHtml.push('<div class="WebSlider_InnerBar">');
	
	//If the range should be shown
	if(this.pbShowRange){
		aHtml.push('<div class="WebSlider_ShowRange"></div>');
	}
	aHtml.push('</div></div>');
    aHtml.push('</div>');
   
   //Add a wrapper for the labels and let another function create the HTML for the labels
    aHtml.push('<div class="WebSlider_Labels">');
	this.generateMarkers();

    this.renderLabels(aHtml);
    aHtml.push('</div>');
   
    
    //  SLIDER
    aHtml.push('<div class="WebSlider_SliderWrapper">');
    aHtml.push('<div class="WebSlider_Slider"></div>');
	
	if(this.pbRanged){
        aHtml.push('<div class="WebSlider_SliderRanged WebSlider_Slider"></div>');
    }
	
	
    
    aHtml.push('</div>');
    
    
},

/*
This method adds the a element making the next element come on the next line
and closes the slider element to the aHtml param.

Params:
    aHtml   Array string builder to add HTML to.
    
@private
*/
closeHtml : function(aHtml){
    aHtml.push('</div>'); 
},

/*
This method gets the needed references, sets the needed eventlisteners 
and positions the slider element to the start position.
*/
afterRender : function(){
    //  Get references
    this._eControl = df.dom.query(this._eElem, "div.WebSlider_Wrapper");
    this._eSlider = df.dom.query(this._eElem, "div.WebSlider_Slider");
    this._eSliderWrp = df.dom.query(this._eElem, "div.WebSlider_SliderWrapper");
    this._eSliderBar = df.dom.query(this._eElem, "div.WebSlider_Bar");
    this._eSliderBarWrp = df.dom.query(this._eElem, "div.WebSlider_BarWrapper");
    this._eSliderBarInner = df.dom.query(this._eElem, "div.WebSlider_InnerBar");
    this._eLabels = df.dom.query(this._eElem, "div.WebSlider_Labels");
    this._eValueIndicator = df.dom.query(this._eElem, "div.WebSlider_ValueIndicatorWrapper");
    
    //Get the reference for the ranged slider if this is a ranged slider
    if(this.pbRanged){
        this._eRangedSlider = df.dom.query(this._eElem, "div.WebSlider_SliderRanged");
    }
	
	if(this.pbShowRange){
		this._eRangeIndicator = df.dom.query(this._eElem, "div.WebSlider_ShowRange");
	}
    
    
    //  Call super
    df.WebSlider.base.afterRender.call(this);
    
    //  Update display
    this.updateDisplay();
    
    //   Attatch slider events
    if(this.pbRanged){
        df.events.addDomListener("mousedown", this._eRangedSlider, this.onSlide, this);
    }
    df.events.addDomListener("mousedown", this._eSlider, this.onSlide, this);
    df.events.addDomListener("click", this._eLabels, this.onLabelClick, this);
    df.events.addDomListener("click", this._eControl, this.onSliderClick, this);
    // df.events.removeDomKeyListener(this._eControl, this.onKey, this);
    
},

//-----------Label functions-------------

assertions : function(){
    if(this.piInterval <= 0){
        throw new df.Error(999, "The piInterval needs to be a positive number", this);
    }

    //Check for errors
    if(this.piMaxValue === this.piMinValue){
        throw new df.Error(999, "Please specify a Max and a Min value", this);
    }else if(this.piMaxValue < this.piMinValue){
        throw new df.Error(999, "The max value is smaller then the min value", this);
    }
    //Check if the piMaxValue, piMinValue and intervall add up
    if((this.piMaxValue - this.piMinValue)%this.piInterval >0){
        throw new df.Error(999, "Your maximum, minimum and interval value do not match properly", this);
    }
    
    //Check if the specified piSliderValue is within the range of the piMaxValue and the piMinValue
    //Check if the slider is able to reach the specified piSliderValue with the current piInterval
    if(this.piSliderValue < this.piMinValue || this.piSliderValue > this.piMaxValue){
        throw new df.Error(999, "Please specify the piSliderValue with a number between the piMinValue and piMaxValue", this);
    }else if((this.piSliderValue - this.piMinValue)%this.piInterval > 0 || (this.piMaxValue - this.piSliderValue)%this.piInterval > 0 ){
        throw new df.Error(999, "The piSliderValue value is unreachable with the specified interval.", this);
    }

    if(this.pbRanged){
        //Check if the specified piFrom and piTo are within the range of the piMaxValue and the piMinValue
        //Check if the slider is able to reach the specified piFrom and piTo with the current piInterval
        if(this.piFrom < this.piMinValue || this.piFrom > this.piMaxValue ){
            throw new df.Error(999, "Please specify the piFrom with a number between the piMinValue and piMaxValue", this);
        }else if(this.piTo < this.piMinValue || this.piTo > this.piMaxValue){
            throw new df.Error(999, "Please specify the piTo with a number between the piMinValue and piMaxValue", this);
        }else if((this.piFrom - this.piMinValue)%this.piInterval > 0 || (this.piMaxValue - this.piFrom)%this.piInterval > 0 ){
            throw new df.Error(999, "The piRangedValue value is unreachable with the specified interval.", this);
        }else if((this.piTo - this.piMinValue)%this.piInterval > 0 || (this.piMaxValue - this.piTo)%this.piInterval > 0 ){
            throw new df.Error(999, "The piTo value is unreachable with the specified interval.", this);
        }
    }
},

setHeight : function(iHeight){
    if(this._eControl){
        //  If a negative value is given we should size 'naturally'
        if(iHeight > 0){
            //  If the label is on top we reduce that (note that this means that piMinHeight and piHeight are including the label)
            if(this.peLabelPosition === df.ciLabelTop){
                iHeight -= this._eLbl.offsetHeight;
            }
            
            //  Substract the wrapping elements
            iHeight -= df.sys.gui.getVertBoxDiff(this._eInner);
            iHeight -= df.sys.gui.getVertBoxDiff(this._eControlWrp);
            iHeight -= df.sys.gui.getVertBoxDiff(this._eControl);
            
            if(this._eValueIndicator && this.pbVertical){
                iHeight -= this._eValueIndicator.offsetHeight;
            }
            if(iHeight < 0){
                iHeight = 0;
            }
            
            //  Set the height
            this._eControl.style.height = iHeight + "px";
        }else{
            this._eControl.style.height = "";
        }
    
    }
},

/*
This function repositions the labels and sliders to the new dimentions of the element.

Params:
    oEvent  The event object which fired this function.
*/
resize : function(oEvent){
    this.positionLabels();
    this.updateDisplay();
},

/*
This method updates the currently displayed valued based on the properties. It will move the 
slider(s), range and updates the value indicator.

@private
*/
updateDisplay : function(){
    var nOffset, nFrom, nTo, nStep, nWidth;
    
    if(this._eElem){
        nStep = this.getInterval() / this.piInterval;
        
        if(this.pbRanged){
            //  Update the slider positions
            nFrom = nStep * (this.piFrom - this.piMinValue);
            nTo = nStep * (this.piTo - this.piMinValue);
            if(this.pbVertical){
                this._eRangedSlider.style.top = nFrom + "px";
                this._eSlider.style.top = nTo + "px";
            }else{
                this._eRangedSlider.style.left = nFrom + "px";
                this._eSlider.style.left = nTo + "px";
            }
            
            //  Update the value indicator
            if(this.pbShowValue){
                this._eValueIndicator.innerHTML = this.piFrom + "-" + this.piTo;
            }
            
            //  Update range indicator
            if(this.pbShowRange){
                if(this.pbVertical){
                    this._eRangeIndicator.style.top = nFrom + "px";
                    this._eRangeIndicator.style.height = (nTo - nFrom) + "px";
                }else{
                    this._eRangeIndicator.style.left = nFrom + "px";
                    
                    nWidth = nTo - nFrom;
                    nWidth = (nWidth < 0 ? -nWidth : nWidth);
                    this._eRangeIndicator.style.width = nWidth + "px";
                }
            }
        }else{
            //  Update the slider position
            nOffset = nStep * (this.piSliderValue - this.piMinValue);
            if(this.pbVertical){
                this._eSlider.style.top = nOffset + "px";
            }else{
                this._eSlider.style.left = nOffset + "px";
            }
            
            //  Update the value indicator
            if(this.pbShowValue){
                this._eValueIndicator.innerHTML = this.piSliderValue;
            }
            
            //  Update range indicator
            if(this.pbShowRange){
                if(this.pbVertical){
                    this._eRangeIndicator.style.top = "0px";
                    this._eRangeIndicator.style.height = nOffset + "px";
                }else{
                    this._eRangeIndicator.style.left = "0px";
                    nOffset = nOffset < 0 ? -nOffset : nOffset;
                    this._eRangeIndicator.style.width = nOffset + "px";
                }
            }
        }

    }
},

/*
Client action that is called by the server to update the labels with a new set of labels. We update 
the labels array, regenerate the markers array and update the display.

@client-action
*/
fillLabels : function(){
    if(this._tActionData){
        this._aLabels = df.sys.vt.deserialize(this._tActionData, [{ sN : df.tString, sV : df.tString }]);
        
        this.generateMarkers();
        this.updateLabels();
    }
},

/*
This function generates the array of markers based on the all the properties (pbShowMarkers, 
piInterval, piMaxValue, piMinValue) and the array of labels.
*/
generateMarkers : function(){
    var aData = this._aLabels, i, oLabel, iNumberOfIntervals, iInterval, iDevide;
    
    //  Clear values array
    this._aMarkers = [];
    
    //  Create the indicators and add them to the _aLabel array
    if(this.pbShowMarkers){
        
        //  Deterine the number of markers
        iNumberOfIntervals = this.piMaxMarkers;
        iDevide = (this.piMaxValue - this.piMinValue) / (iNumberOfIntervals - 1);
        
        if(iDevide < this.piInterval){  //  More markers that possible values
            iInterval = this.piInterval;
        }else{  //  More values than markers allowed, no find the right number of markers where markers are placed at possible values and there is a marker at the max and min value
            iInterval = this.piInterval;
            while(iInterval < iDevide || ((this.piMaxValue - this.piMinValue) % iInterval)){
                iInterval += this.piInterval;
            }
        }
        iNumberOfIntervals = (this.piMaxValue - this.piMinValue) / iInterval;
        
        //  Gernate & store the markers
        for(i = 0 ; i <= iNumberOfIntervals; i++){
            oLabel = {};
            oLabel.piSliderValue = iInterval * i + this.piMinValue;
            oLabel.psLabel = "";
            this._aMarkers.push(oLabel);
        }
    }
    
    //  Transform raw data into value / description objects
    if(aData){
        for(i = 0; i < aData.length; i++){
            oLabel = {};
            oLabel.piSliderValue = parseFloat(aData[i].sV, 10);
            oLabel.psLabel = aData[i].sN;
            this._aMarkers.push(oLabel);
            
            //Check if the values of the labels can be reached with the slider        
            if(oLabel.piSliderValue % this.piInterval > 0 || oLabel.piSliderValue > this.piMaxValue || oLabel.piSliderValue < this.piMinValue){
                throw new df.Error(999, "The position you want this label on is unreachable for the slider.", this);
            }
        }
    }
    //Remove the indicators where a label is also specified, sort, and update the DOM the array.
    this._aMarkers = this._aMarkers.sort(this.sortLabels);
    this._aMarkers = this.removeDoubleValues(this._aMarkers);
},

/*
This function is used by the sort function. This function determines whether
a label object is greater then, smaller then or equal to another label.

Params:
    a   The element to compare with b.
    b   The element to compare with a.
Returns:
    0 if the two elements are equal, 1 if a is greater then b, or -1 is b is greater then a.
*/
sortLabels : function(a,b){
    if(a.piSliderValue < b.piSliderValue){
        return -1;
    }
    if(a.piSliderValue > b.piSliderValue){
        return 1;
    }
    if(a.piSliderValue === b.piSliderValue){
        return 0;
    }
},

/*
This function removes the possible double labels.

Params:
    aLabels   The labels array to remove the double labels from.
Returns:
    The labels array without the double labels.
*/
removeDoubleValues : function(aLabels){
    var i, iDummyArray = [];
    
    for(i = 0; i < aLabels.length; i++){
        if(i + 1 === aLabels.length){
            iDummyArray.push(aLabels[i]);
        }else{
            if(aLabels[i].piSliderValue === aLabels[i+1].piSliderValue){
                if(aLabels[i].psLabel.length > aLabels[i+1].psLabel.length){
                    iDummyArray.push(aLabels[i]);
                }else{
                    iDummyArray.push(aLabels[i+1]);
                }
                i++;
            }else{
                iDummyArray.push(aLabels[i]);
            }
        }
    }    
    return iDummyArray;
},

/*
This function creates the HTML for the labels

Params:
    aHtml   Array string builder to add HTML to.
*/
renderLabels : function(aHtml){
    var i;
    
	aHtml.push('<div class="WebSlider_LabelMarkerWrapper"', (this._aLabels.length === 0 && !this.pbShowMarkers ? ' style="display: none;"' : ''), '>');
	for(i = 0; i < this._aMarkers.length; i++){
        //The data-labelIndex indicates the position of the label in the _aMarkers array
        //needed for a reference later on.
        aHtml.push('<div class="WebSlider_LabelMarker" data-labelIndex="',i,'"></div>');
    }
	
	
	aHtml.push('</div><div class="WebSlider_LabelWrapper"', (this._aLabels.length === 0 ? ' style="display: none;"' : ''), '>');
        
	for(i = 0; i < this._aMarkers.length; i++){
        //The data-labelIndex indicates the position of the label in the _aMarkers array
        //needed for a reference later on.		
        if(this._aMarkers[i].psLabel !== ''){
			aHtml.push('<div class="WebSlider_LabelText" data-labelIndex="',i,'">',this._aMarkers[i].psLabel,'</div>');
		}
    }    
	aHtml.push('</div>');
},

positionLabels : function(){
    var i, iNewPosition, aMarkers, iIntervalSize, aLabels, iValue, nRel, nSliderOffset;
    
    iIntervalSize = (this.getInterval()/this.piInterval);
    aLabels = df.dom.query(this._eLabels, "div.WebSlider_LabelText", true);
    aMarkers = df.dom.query(this._eLabels, "div.WebSlider_LabelMarker", true);
    
    if(this.pbVertical){
        nSliderOffset = this._eSlider.offsetHeight / 2;
    }else{
        nSliderOffset = this._eSlider.offsetWidth / 2;
    }
    
	
    //Calculate the new position for each labelMarker
    for(i = 0; i< aMarkers.length; i++){
        iNewPosition = 0;
        
        iNewPosition = nSliderOffset + iIntervalSize * (this._aMarkers[i].piSliderValue - this.piMinValue); 
        
        if(this.pbVertical){
            aMarkers[i].style.top =  iNewPosition + "px";
        }else{
            aMarkers[i].style.left = iNewPosition + "px"; 
        }
    }
	
    
    
	//Calculate the new position for each label
	for(i = 0; i< aLabels.length; i++){
        iNewPosition = 0;
        iValue = this._aMarkers[aLabels[i].getAttribute("data-labelIndex")].piSliderValue;
		
		
        iNewPosition = nSliderOffset + iIntervalSize * (iValue - this.piMinValue);
        if(this.pbVertical){
            iNewPosition = iNewPosition - (aLabels[i].offsetHeight / 2);
            aLabels[i].style.top = iNewPosition + "px";
        }else{
            // Calculate percentage of the label width we want to move the label horizontally
            nRel = (iValue - this.piMinValue) / (this.piMaxValue - this.piMinValue);
            nRel = ((nRel - 0.5) * 0.6) + 0.5; // We want to go slightly over the sides
            
            // Decrease with percentage of label width
            iNewPosition = iNewPosition - (nRel * aLabels[i].offsetWidth);
            
            aLabels[i].style.left = iNewPosition + "px"; 
        }
    }
},

/*
This function re-renders the labels if it is not the initial call.
The inital call already does this, therefore doing this twice is redundant.
*/
updateLabels : function(){
    var aNewLabels = [];

    //Check for inital call
    if(this._eElem){
        this.renderLabels(aNewLabels);
        this._eLabels.innerHTML = aNewLabels.join("");
        //Call the resize function to put the labels neatly in theire place
        this.positionLabels();
    }
},

//----- Helper functions --------

/*
This function positively or negatively increments the position of the slider and the value.

Params:
    bUp     True if the slider should be positively incremented, false if the slider should be negatively incremented.
    bSize   If true on a ranged slider it will increase the size of the range where false would move the range.
*/
increment : function(bUp, bSize){
    if(this.pbRanged){
        if(bSize){
            if(bUp){
                if(this.piTo < this.piMaxValue){
                    this.piTo += this.piInterval;
                }else if(this.piFrom > this.piMinValue){
                    this.piFrom -= this.piInterval;
                }
            }else{
                if(this.piFrom < this.piTo){
                    this.piTo -= this.piInterval;
                }
            }
        }else{
            if(bUp){
                if(this.piTo < this.piMaxValue){
                    this.piTo += this.piInterval;
                    this.piFrom += this.piInterval;
                }
            }else{
                if(this.piFrom > this.piMinValue){
                    this.piTo -= this.piInterval;
                    this.piFrom -= this.piInterval;
                }
            }
        }
    }else{
        if(bUp && this.piSliderValue !== this.piMaxValue){
            this.piSliderValue += this.piInterval;
        }else if(!bUp && this.piSliderValue !== this.piMinValue){
            this.piSliderValue -= this.piInterval;
        }
    }
    
    this.updateDisplay();
    this.fireChange();
},

/*
This method calculates the ammount of pixels each increment represents.

@return The amount of pixels.
*/
getInterval : function(){
    var iSliderSize, iValueInterval;
    
    //Calculate the ammount of pixels
    iSliderSize = (this.pbVertical) ? this._eSliderBarInner.offsetHeight : this._eSliderBarInner.offsetWidth;
    
    iValueInterval = iSliderSize / ((this.piMaxValue - this.piMinValue) / this.piInterval);

    return iValueInterval;
},

/*
This method converts any value to a positive value.

Params:
    iValue    The value to be converted to positive.
Returns:
    The positive value
*/
toPositive : function(iValue){
    iValue = Math.sqrt(Math.pow(iValue,2));
    return iValue;
},

/*
This method calculates the maximal position the slider can be in.

Returns:
    The maximal position value for the slider
*/
getMaximalSliderPosition : function(){
    var iSliderSize;
    if(this.pbVertical){
        iSliderSize = this._eSliderBarInner.offsetHeight;
    }else{
        iSliderSize = this._eSliderBarInner.offsetWidth;
    }
    return iSliderSize;
},

/*
When a label is clicked this function jumps the slider to the corresponding place.

Params:
    oEvent  The event object causing the function to go off.
*/
onLabelClick : function(oEvent){
    var eLabel = oEvent.getTarget();
    
    if(!this.pbEnabled){
        return ;
    }
    
    while(eLabel.getAttribute("data-labelindex") === null || eLabel === document){
        eLabel = eLabel.parentNode;
        
        if(eLabel === document){
            return;
        }
    }
    this.piSliderValue = this._aMarkers[eLabel.getAttribute("data-labelIndex")].piSliderValue;
    this.updateDisplay();
    
    this.fireChange();
    
    this.onFocus();
},


//---------Event handlers=--------------

/*
This method is fired when the sliding begins.

Params:
    oEvent  The event object causing the function to go off.
*/
onSlide : function (oEvent){
    var iMaxOffset, iMinOffset, iMouseStart, eMask, iStartValue, iTemp, bIsFrom, iInterval;
    
    if(!this.pbEnabled){
        return ;
    }
    
    //  Check if the slider is a ranged slider
    bIsFrom = (this._eRangedSlider === oEvent.eSource && this.pbRanged);
    
    iInterval = this.getInterval();
    
    //  Generate mask
    eMask = df.gui.dragMask();
    eMask.style.cursor = this.pbVertical ? "s-resize" : "e-resize";
    
    iMouseStart = this.pbVertical ? oEvent.getMouseY() : oEvent.getMouseX();
    iMinOffset = 0;
    iMaxOffset = this.getMaximalSliderPosition();
    
    //Set the starting values
    if(this.pbRanged){
        if(bIsFrom){
            iStartValue = this.piFrom;
        }else{
            iStartValue = this.piTo;
        }
    }else{
        iStartValue = this.piSliderValue;
    }
    
    
    /*
    This function is fired when the drag event is fired.
    This function repositions the slider to the new mouse position and ajustst the value of the (ranged)slider
    
    Params:
        oEvent  The event object causing the function to go off.
    */
    function onDragSlide(oEvent){
        var iNewMouseValue, iNewValue, iDiff, iPossDiff, iNumberOfIntervals; 
        
        //Calculate the new mouse position difference
        iNewMouseValue = (this.pbVertical)? oEvent.getMouseY():oEvent.getMouseX();
        iDiff = iNewMouseValue - iMouseStart;
        iPossDiff = this.toPositive(iDiff);
        
        //Calculate the number of intervals the slider has to change, compared to the beginning values
        iNumberOfIntervals = iDiff / iInterval;
        iNumberOfIntervals = Math.round(this.toPositive(iNumberOfIntervals));
        
        //If the new mouse value is lower then the starting mouse value make the number of intervals negative
        if(iMouseStart > iNewMouseValue){
            iNumberOfIntervals *= -1;
        }
        
        //Calculate the new position of the slider
        iNewValue = iNumberOfIntervals * this.piInterval + iStartValue;
        
        //Check if the new position is not lower then the minimal position or higher then the maximum position
        if(iNewValue < this.piMinValue){
            iNewValue = this.piMinValue;
        }else if(iNewValue > this.piMaxValue){
            iNewValue = this.piMaxValue;
        }
        
        //Reposition the slider and change the value
        if(this.pbRanged){
            if(bIsFrom){
                this.piFrom = iNewValue;
                if(this.piFrom > this.piTo){
                    bIsFrom = false;
                    iTemp = this.piFrom;
                    this.piFrom = this.piTo;
                    this.piTo = iTemp;
                }
            }else{
                this.piTo = iNewValue;
                if(this.piTo < this.piFrom){
                    bIsFrom = true;
                    iTemp = this.piFrom;
                    this.piFrom = this.piTo;
                    this.piTo = iTemp;
                }
            }
        }else{    
            this.piSliderValue = iNewValue;
        }
        this.updateDisplay();
    }
    
    /*
    This function removes the dragmask and removes the mouseup listener    
    
    Params:
        oEvent  The event object causing the function to go off.
    */
    function onStopSlide(oEvent){
        eMask.parentNode.removeChild(eMask);
        df.events.removeDomListener("mouseup", window, onStopSlide);
        df.events.removeDomListener("mouseup", eMask, onStopSlide);
        df.events.removeDomListener("mousemove", eMask, onDragSlide);
        
        this.fireChange();
    }
    
    //add event listeners to the mask
    df.events.addDomListener("mouseup", window, onStopSlide, this);
    df.events.addDomListener("mouseup", eMask, onStopSlide, this);
    df.events.addDomListener("mousemove", eMask, onDragSlide, this);
    
    oEvent.stop();
    
    this.focus();
},

/*
Event handler for a click on the slider bar. This event is handler on a wrapping element because our 
bar is not rendered on top (slider & markers go in front of it). We check if the click was on (or 
close to) the bar and then we update the value based on the position of the click.

@param  oEvent  Event object.
@private
*/
onSliderClick : function(oEvent){
    var oOffset, iOffset, iVal, iRawVal;
    
    if(!this.pbEnabled){
        return;
    }
    
    //  Determine bar position
    oOffset = this._eSliderBarInner.getBoundingClientRect();
    
    //  Check if the click was anywhere close to the bar (we are handling the event on a bigger element)
    if(!(oEvent.getMouseY() >= oOffset.top - 2 && oEvent.getMouseY() <= oOffset.bottom + 2 && oEvent.getMouseX() >= oOffset.left - 2 && oEvent.getMouseX() <= oOffset.right + 2)){
        return;
    }
    
    //  Calculate the clicked position
    if(this.pbVertical){
        iOffset = oEvent.getMouseY() - oOffset.top;
    }else{
        iOffset = oEvent.getMouseX() - oOffset.left;
    }
    iRawVal = iOffset / (this.getInterval() / this.piInterval);
    
    //  Round and increment with minimum value
    iVal = (Math.round(iRawVal / this.piInterval) * this.piInterval) + this.piMinValue;
    
    if(iVal < this.piMinValue){
        iVal = this.piMinValue;
    }else if(iVal > this.piMaxValue){
        iVal = this.piMaxValue;
    }
    
    if(this.pbRanged){
        //  For the ranged slider we adjust the slider the click was the closest to
        if(iVal < this.piFrom){
            this.piFrom = iVal;
        }else if(iVal > this.iTo){
            this.piTo = iVal;
        }else if(iVal - this.piFrom < this.piTo - iVal){
            this.piFrom = iVal;
        }else{
            this.piTo = iVal;
        }
    }else{
        //  Update the position
        this.piSliderValue = iVal;
    }
    
    this.updateDisplay();
    this.fireChange();
    
},

/*
This function handles the event when a key is pressed and increments or decrements the slider accordingly

Params:
    oEvent  The event object causing the function to go off.
*/
onKey : function(oEvent){
    
    if(oEvent.matchKey(df.settings.sliderKeys.sliderDown)){
        this.increment(this.pbVertical, !this.pbVertical);
        oEvent.stop();
        return;
    }
    if(oEvent.matchKey(df.settings.sliderKeys.sliderUp)){
        this.increment(!this.pbVertical, !this.pbVertical);
        oEvent.stop();
        return;
    }
    if(oEvent.matchKey(df.settings.sliderKeys.sliderLeft)){
        this.increment(false, this.pbVertical);
        oEvent.stop();
        return;
    }
    if(oEvent.matchKey(df.settings.sliderKeys.sliderRight)){
        this.increment(true, this.pbVertical);
        oEvent.stop();
        return;
    }
    
    df.WebSlider.base.onKey.call(this, oEvent);
},

/*
This method checks if the value is changed and if so it will trigger the OnChange event.
*/
fireChange : function(){

    //  Only fire events if it changed
    if(this._iPrevChangePos !== this.piSliderValue){
        this.pbChanged = true;
        
        //  Fire events (OnSelectedChange on every radio and OnSelect on the selected one)
        this.fire('OnChange', [ this.piSliderValue , this._iPrevChangePos]);
        
        //  Remember the value
        this._iPrevChangePos = this.piSliderValue;
    }
},

//------------Getters and setters for the element -----------------

//-------------Setters
/*
Setter for piMinValue.

@param iVal    The new value.
*/
set_piMinValue : function(iVal){
    this.piMinValue = iVal;
    this.resize();
        
    this.generateMarkers();
    this.updateLabels();
},

/*
Setter for piMaxValue.

@param iVal    The new value.
*/
set_piMaxValue : function(iVal){
    this.piMaxValue = iVal;
    this.updateDisplay();
    
    this.generateMarkers();
    this.updateLabels();
},

/*
Setter for piInterval.

@param iVal    The new value.
*/
set_piInterval : function(iVal){
    this.piInterval = iVal;
    this.updateDisplay();
    
    this.generateMarkers();
    this.updateLabels();
},

/*
Setter for pbShowMarkers.

@param bVal    The new value.
*/
set_pbShowMarkers : function(bVal){
    this.pbShowMarkers = bVal;
    
    this.generateMarkers();
    this.updateLabels();
},

/*
Setter for piSliderValue.

@param iVal    The new value.
*/
set_piSliderValue : function(iVal){
    if(iVal > this.piMaxValue){
        this.piSliderValue = this.piMaxValue;
    }else if(iVal < this.piMinValue){
        this.piSliderValue = this.piMinValue;
    }else{
        this.piSliderValue = iVal;
    }
    
    this._iPrevChangePos = this.piSliderValue;
    // this.pbChanged = false;
    this.updateDisplay();
    
    return false;
},

/*
Setter for piFrom. Note that if piFrom is lower than piTo then the values will be switched after a 
short timeout (to give set_piTo a chance).

@param iVal    The new value.
*/
set_piFrom : function(iVal){
    var that = this;
    
    if(iVal > this.piMaxValue){
        this.piFrom = this.piMaxValue;
    }else if(iVal < this.piMinValue){
        this.piFrom = this.piMinValue;
    }else{
        this.piFrom = iVal;
    }
    
    
    if(this.piFrom > this.piTo){
        //  We need to set a small timeout to make sure that set_piTo is not going to be called after this
        setTimeout(function(){
            var i;
            
            if(that.piFrom > that.piTo){
                i = that.piFrom;
                that.piFrom = that.piTo;
                that.piTo = i;
            }
            
            that.updateDisplay();
        }, 10);
    }else{
        this.updateDisplay();
    }
    
    
    
    return false;
},

/*
Setter for piTo. Note that if piFrom is lower than piTo then the values will be switched after a 
short timeout (to give set_piTo a chance).

@param iVal    The new value.
*/
set_piTo : function(iVal){
    var that = this;
    
    if(iVal > this.piMaxValue){
        this.piTo = this.piMaxValue;
    }else if(iVal < this.piMinValue){
        this.piTo = this.piMinValue;
    }else{
        this.piTo = iVal;
    }
    
    
    if(this.piFrom > this.piTo){
        //  We need to set a small timeout to make sure that set_piFrom is not going to be called after this
        setTimeout(function(){
            var i;
            
            if(that.piFrom > that.piTo){
                i = that.piFrom;
                that.piFrom = that.piTo;
                that.piTo = i;
            }
            
            that.updateDisplay();
        }, 10);
    }else{
        this.updateDisplay();
    }
    
    return false;
},

/*
Override this property to make it work on pbChanged only.
*/
get_pbChanged : function(){
    return this.pbChanged;
},

/*
Override and make it actually return piSliderValue.

@private
*/
get_psValue : function(){
    return this.piSliderValue.toString();
},

/*
Override to make sure they are not accidentally called.

@private
*/
set_psValue : function(sVal){

},

// - - - - - - - Focus - - - - - - -

//TODO This can be done correct
attachFocusEvents : function(){
    //  We use a simpler focus detection on the control
    if(this._eControl && this.pbEnabled && this.pbVisible){
        df.events.addDomCaptureListener("focus", this._eControl, this.onFocus, this);
        df.events.addDomListener("blur", this._eControl, this.onBlur, this);
    }
},
/*
We override the focus method and make it give the focus to the hidden focus holder element.

@return True if the List can take the focus.
*/
focus : function(){
    if(this._bFocusAble && this.pbEnabled && this._eControl){
        this._eControl.focus();
        return true;
    }
    return false;
},

onFocus : function(oEvent){
    df.WebSlider.base.onFocus.call(this, oEvent);
    this.focus();
    this._bLozingFocus = false;
},

onBlur : function(oEvent){
    var that = this;
    this._bLozingFocus = true;
    
    setTimeout(function(){
        if(that._bLozingFocus){
            that.getWebApp().objBlur(that);
            if(that._eElem){
                df.dom.removeClass(that._eElem, "WebCon_Focus");
            }
            
            that._bHasFocus = false;
            that._bLozingFocus = false;
        }
    }, 100);
}
});
