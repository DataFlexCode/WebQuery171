/*
Class:
    df.WebBaseContainer
Extends:
    df.WebBaseUIObject

This class is the client-side representation of the WebBaseContainer class. It extends the 
WebBaseUIObject with positioning logic for child panels and controls.
    
Revision:
    2011/08/01  (HW, DAW) 
        Initial version.
    2011/10/06  (HW, DAW)
        Rewrote the sizing.
*/
df.WebBaseContainer = function WebBaseContainer(sName, oParent){
    df.WebBaseContainer.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tInt, "piColumnCount", 1);
    this.prop(df.tInt, "piWidth", 0);
    this.prop(df.tInt, "piMinWidth", 0);
    this.prop(df.tInt, "piHeight", 0);
    this.prop(df.tInt, "piMinHeight", 0);
    
    // @privates
    this._oRegionTop = null;
    this._oRegionLeft = null;
    this._oRegionCenter = null;
    this._oRegionRight = null;
    this._oRegionBottom = null;    
    
    this._eRegionTop = null;
    this._eMainArea = null;
    this._eRegionLeft = null;
    this._eRegionCenter = null;
    this._eContent = null;
    this._eRegionRight = null;
    this._eRegionBottom = null;
    this._eContainer = null;
    
    this._aUIObjects = [];
    
    this._bHasFill = false;
    this._iContentHeight = null;
    this._bRendered = false;
    this._bPanels = false;
    
    //  Configure super classes
    this._bRenderChildren = true;
    this._sBaseClass = "WebContainer";
};
df.defineClass("df.WebBaseContainer", "df.WebBaseUIObject",{

// - - - - Rendering - - - -

openHtml : function(aHtml){
    //  Call the super
    df.WebBaseContainer.base.openHtml.call(this, aHtml);
    
    aHtml.push('<div class="WebCon_Sizer">');
    
    if(this._bPanels){
        aHtml.push('<div class="WebCon_Main">');
    }else{
		aHtml.push('<div class="WebCon_Content">');
	}
},

/*
Augment the closeHtml method and add the HTML with the panel wrapper DIV elements.

@private
*/
closeHtml : function(aHtml){
    aHtml.push('</div></div>');

    //  Call the super
    df.WebBaseContainer.base.closeHtml.call(this, aHtml);
},

/*
Augment afterRender to call setters.

@private
*/
afterRender : function(){
    df.WebBaseContainer.base.afterRender.call(this);
    
    this._bRendered = true;
},

/*
Panels are containers so we have to call our child components to render themselves.

@private
*/
render : function(){
    var eElem;
    
    //  Call super (make sure that it doesn't render children right away
    this._bRenderChildren = false;
    eElem = df.WebBaseContainer.base.render.call(this);
    this._bRenderChildren = true;
    
    //  Get references to the regions
    this._eSizer = df.dom.query(this._eElem, "div.WebCon_Sizer");
    
    if(this._bPanels){
        this._eMainArea = df.dom.query(this._eElem, "div.WebCon_Main");
    }else{
		this._eContent = df.dom.query(this._eElem, "div.WebCon_Content");
	}
	
	//	Also get reference to container already (when doing that later there are multiple containers inside while for WebWindow the container is a sub element as well)
    this._eContainer = df.dom.query(this._eElem, "div.WebContainer") || this._eElem;
    
    
        
    //  Render children
    this.renderChildren();
    
    //  Call positioning system
    this.position();
    
    return eElem;
},

/*
Override the renderChildren method with support for panels.

@private
*/
renderChildren : function(){
    var i, eChild;
    
    //  Call children and append them to ourselves
    
    if(this._bPanels){
        //  Give a nice error when controls and panels are mixed up
        if(this._aUIObjects.length > 0){
            throw new df.Error(999, "Web controls and panels cannot be siblings within the same container object '{{0}}'. Consider placing them within a panel.", this, [ (this.getLongName() || 'oWebApp') ]);
        }
    
        if(this._oRegionTop){
            this._eRegionTop = this._oRegionTop.render();
            this._eSizer.insertBefore(this._eRegionTop, this._eMainArea);
        }
        if(this._oRegionLeft){
            this._eRegionLeft = this._oRegionLeft.render();
            this._eMainArea.appendChild(this._eRegionLeft);
            
            this._eRegionLeft.style.styleFloat = "left";    // IE8 FIX
            this._eRegionLeft.style.cssFloat = "left";
        }
        if(this._oRegionRight){
            this._eRegionRight = this._oRegionRight.render();
            this._eMainArea.appendChild(this._eRegionRight);
            
            this._eRegionRight.style.styleFloat = "right";    // IE8 FIX
            this._eRegionRight.style.cssFloat = "right";
        }

        if(this._oRegionCenter){
            this._eRegionCenter = this._oRegionCenter.render();
            this._eMainArea.appendChild(this._eRegionCenter);
        }
        //  FIX: This is moved to the CSS using the :after, this makes the clear also happen after the ViewRegion of the webapp
        this._eMainArea.appendChild(df.dom.create('<div style="clear: both;"></div>'));
        
        if(this._oRegionBottom){
            this._eRegionBottom = this._oRegionBottom.render();
            this._eSizer.appendChild(this._eRegionBottom);
        }
    }else{
        for(i = 0; i < this._aUIObjects.length; i++){
            eChild = this._aUIObjects[i].render();
            
            this._eContent.appendChild(eChild);
        }
        
        this._eContent.appendChild(df.dom.create('<div style="clear: both;"></div>'));
    }
},

/*
Augmenting the addChild method to filter out child panels and assign them to the proper region.

@private
*/
addChild : function(oChild){
    if(oChild instanceof df.WebBaseUIObject){
        if(oChild.peRegion !== undefined){
            this._bPanels = true;
            
            if(oChild.peRegion === df.ciRegionCenter){ 
                if(this._oRegionCenter){
                    throw new df.Error(999, "The region setting (peRegion) in panel '{{0}}' is already used by panel '{{1}}'. Sibling panels may not share the same region setting.", this, [ oChild._sName, this._oRegionCenter._sName ]);
                }
                
                this._oRegionCenter = oChild;
            }else if(oChild.peRegion === df.ciRegionTop){  
                if(this._oRegionTop){
                    throw new df.Error(999, "The region setting (peRegion) in panel '{{0}}' is already used by panel '{{1}}'. Sibling panels may not share the same region setting.", this, [ oChild._sName, this._oRegionTop._sName ]);
                }
            
                this._oRegionTop = oChild;
            }else if(oChild.peRegion === df.ciRegionLeft){  
                if(this._oRegionLeft){
                    throw new df.Error(999, "The region setting (peRegion) in panel '{{0}}' is already used by panel '{{1}}'. Sibling panels may not share the same region setting.", this, [ oChild._sName, this._oRegionLeft._sName ]);
                }
            
                this._oRegionLeft = oChild;
            }else if(oChild.peRegion === df.ciRegionRight){ 
                if(this._oRegionRight){
                    throw new df.Error(999, "The region setting (peRegion) in panel '{{0}}' is already used by panel '{{1}}'. Sibling panels may not share the same region setting.", this, [ oChild._sName, this._oRegionRight._sName ]);
                }
            
                this._oRegionRight = oChild;
            }else if(oChild.peRegion === df.ciRegionBottom){ 
                if(this._oRegionBottom){
                    throw new df.Error(999, "The region setting (peRegion) in panel '{{0}}' is already used by panel '{{1}}'. Sibling panels may not share the same region setting.", this, [ oChild._sName, this._oRegionBottom._sName ]);
                }
            
                this._oRegionBottom = oChild;
            }else{
                throw new df.Error(999, "Invalid value for peRegion of '{{0}}'", this, [ oChild._sName ]);
            }            
        }else{
            this._aUIObjects.push(oChild);
        }
    }
    
    df.WebBaseContainer.base.addChild.call(this, oChild);
},


// - - - - Sizing - - - -

/*
This recursive method is called as the start of a resize action. It calculates the minimal height 
that a container needs and it determines if the panel wants to stretch or not. Center, left and 
right panels can stretch and if they stretch then their parent wants to stretch as well. The 
resizeHorizontal and resizeVertical methods depend on the results of this method.

@private
*/
prepareSize : function(){
    var iHeight = 0, iMiddle = 0, iCur;
    
    this._bStretch = false;
   
    
    //  Determine content size
    if(this._bPanels){
        //  Visit all panels and determine what height they want
        if(this._oRegionTop && this._oRegionTop.pbRender){
            iHeight += this._oRegionTop.prepareSize();
        }
        
        //  We take the highest of left, right and center
        if(this._oRegionCenter && this._oRegionCenter.pbRender){
            iMiddle = this._oRegionCenter.prepareSize();
            
            this._bStretch = this._oRegionCenter._bStretch || this._bStretch;
        }
        if(this._oRegionLeft && this._oRegionLeft.pbRender){
            iCur = this._oRegionLeft.prepareSize();
            
            iMiddle = (iCur > iMiddle ? iCur : iMiddle);
            
            //  Stretch if left panel wants to stretch
            this._bStretch = this._oRegionLeft._bStretch || this._bStretch;
        }
        if(this._oRegionRight && this._oRegionRight.pbRender){
            iCur = this._oRegionRight.prepareSize();
            
            iMiddle = (iCur > iMiddle ? iCur : iMiddle);
            
            //  Stretch if right panel wants to stretch
            this._bStretch = this._oRegionRight._bStretch || this._bStretch;
        }
        iHeight += iMiddle;
        
        if(this._oRegionBottom && this._oRegionBottom.pbRender){
            iHeight += this._oRegionBottom.prepareSize();
        }
        
         iHeight += this.getHeightDiff(true, true, true, true);
    }else{
        if(this._bHasFill){
            if(!this._iContentHeight){
                this.resizeColumnLayout();
            }   
            iHeight += this._iContentHeight + this.getHeightDiff(true, true, true, true);
        }else{
            iHeight += this._eContent.clientHeight + this.getHeightDiff(true, true, true, false);    //this.getContentHeightDiff(true);// + 1;    //   We take one pixel extra due to pixel rounding
        }
    }
    
    //  Determine _iWantedHeight & _iMinHeight
    this._iMinHeight = iHeight;
    if(this.piHeight > 0){
        this._iWantedHeight = this.piHeight;
    }else{
        this._iWantedHeight = (iHeight > this.piMinHeight ? iHeight : this.piMinHeight);
    }
    
    //  Determine if we want to stretch
    if(this.peRegion !== df.ciRegionTop && this.peRegion !== df.ciRegionBottom){
        if((this.piHeight <= 0 && this._bHasFill) || (this instanceof df.WebView && this.pbFillHeight)){
            this._bStretch = true;
        }        
    }
    
    //  Mark ourself as prepared for sizing
    this._bSizePrep = true;
    
    return this._iWantedHeight;
},

/*
This recursive method performs the horizontal size actions that are needed. It sizes left and right 
panels and sets the inner width (based on piMinWidth) which might cause a scrollbar. Horizontal 
sizing is done first so that vertical sizing can handle scrollbars that might appear.

@private
*/
resizeHorizontal : function(){
    var i, iWidth = 0, iDiff;

    if(this._eElem){
		if(this._bPanels){
            //  Size the middle panels
            if(this._oRegionLeft){
                this._oRegionLeft.setOuterWidth(this._oRegionLeft.piWidth);
                
                //  FIX: Only set for the top level where it is somehow needed, setting it where center has overflow:hidden breaks center panel for safari and mobile browsers
                if(this._eRegionCenter && (this instanceof df.WebApp)){
                    this._eRegionCenter.style.marginLeft = (this._oRegionLeft.pbRender ? this._oRegionLeft.piWidth + "px" : "0px"); 
                }
            }
            if(this._oRegionRight){
                this._oRegionRight.setOuterWidth(this._oRegionRight.piWidth);
                
                //  FIX: Only set for the top level where it is somehow needed, setting it where center has overflow:hidden breaks center panel for safari and mobile browsers
                if(this._eRegionCenter && (this instanceof df.WebApp)){ 
                    this._eRegionCenter.style.marginRight = (this._oRegionRight.pbRender ? this._oRegionRight.piWidth + "px" : "0px");
                }
            }
        }
	
        //  Determine inner width (for scrolling)
        iDiff = this.getWidthDiff();
        if(this.piWidth > 0){
            iWidth = this.piWidth;
        }        
        if(iWidth < this.piMinWidth){
            iWidth = this.piMinWidth;
        }
        
        //  Set inner width
        if(iWidth > (this._eElem.clientWidth + iDiff)){
            this.setInnerWidth(iWidth);
        }else{
            this.setInnerWidth(0);
        }
        
        
        //  Call children
        for(i = 0; i < this._aChildren.length; i++){
            if(this._aChildren[i] instanceof df.WebBaseUIObject && !(this._aChildren[i] instanceof df.WebView)){ //  Skip views, they are called by the WebApp
                if(this._aChildren[i].pbRender && this._aChildren[i].resizeHorizontal){
                    
                    this._aChildren[i].resizeHorizontal();
                }
            }
        }
    }
},

/*
This recursive method performs the vertical sizing. It determines the size of sub panels and sets 
the inner size when needed. The height of the top and bottom panels is determined by their piHeight 
or their pre-calculated _iWantedHeight. Height of the middle area (left, center and right panels) is 
determined by the available space and whether they are set to stretch or not.

@private
*/
resizeVertical : function(){
    var iHeight, iMiddleHeight, iVSpace, iPanelHeight, bStretch = false, i;
    
    if(this._eElem){
		//  Make sure we are prepared for sizing (pre calculations are done)
        if(!this._bSizePrep){
            this.prepareSize();
        }
        
        if(this.piHeight > 0 || this._bStretch){
            iHeight = this._eContainer.clientHeight + this.getHeightDiff(true, false, false, false);
            bStretch = true;
        }else{
            iHeight = this._iWantedHeight;
        }
        
		if(iHeight < this.piMinHeight){
            iHeight = this.piMinHeight;
            bStretch = true;
        }

        if(this._bPanels){
            iVSpace = iHeight;
            if(this._oRegionTop && this._oRegionTop.pbRender){
                iPanelHeight = this._oRegionTop._iWantedHeight;
            
                //  We need to stretch ourself if more space is required
                if(iPanelHeight > iVSpace){
                    iHeight = iHeight + this._oRegionTop._iWantedHeight - iVSpace;
                    iVSpace = iPanelHeight;
                }
                iVSpace -= iPanelHeight;
                
                this._oRegionTop.setOuterHeight(iPanelHeight);
            }
            
            if(this._oRegionBottom && this._oRegionBottom.pbRender){
                iPanelHeight = this._oRegionBottom._iWantedHeight;
            
                //  We need to stretch ourself if more space is required
                if(iPanelHeight > iVSpace){
                    iHeight = iHeight + iPanelHeight - iVSpace;                
                    iVSpace = iPanelHeight;
                }
                iVSpace -= iPanelHeight;
                
                this._oRegionBottom.setOuterHeight(iPanelHeight);
            }
            
            //  Determine the middle height
            if(bStretch || (this._oRegionLeft && this._oRegionLeft._bStretch) || (this._oRegionCenter && this._oRegionCenter._bStretch) || (this._oRegionRight && this._oRegionRight._bStretch)){
                iMiddleHeight = iVSpace - this.getHeightDiff(true, true, true, true);
            }else{
                iMiddleHeight = 0;
                if(this._oRegionLeft && this._oRegionLeft.pbRender){
                    iMiddleHeight = this._oRegionLeft._iWantedHeight;
                }
                if(this._oRegionCenter && this._oRegionCenter.pbRender && this._oRegionCenter._iWantedHeight > iMiddleHeight){
                    iMiddleHeight = this._oRegionCenter._iWantedHeight;
                }
                if(this._oRegionRight && this._oRegionRight.pbRender && this._oRegionRight._iWantedHeight > iMiddleHeight){
                    iMiddleHeight = this._oRegionRight._iWantedHeight;
                }
                
                // if(iMiddleHeight > iVSpace){
                    // iMiddleHeight = iVSpace;
                // }
            }
            
            //  Size the middle panels
            if(this._oRegionLeft){
                this._oRegionLeft.setOuterHeight(iMiddleHeight);
            }
            if(this._oRegionCenter){
                this._oRegionCenter.setOuterHeight(iMiddleHeight);
            }
            if(this._oRegionRight){
                this._oRegionRight.setOuterHeight(iMiddleHeight);
            }
            
            //  Provide a hook for the webapp to size the view
            this._iMiddleHeight = iMiddleHeight;
        }else{
            this.resizeColumnLayout();
            
            //  Scrollbars
            if(iHeight > this._eElem.clientHeight + this.getHeightDiff(true, false, false)){
                this.setInnerHeight(iHeight);
            }else{
                this.setInnerHeight(0);
            }
        }
        

        
        //  Call children
        for(i = 0; i < this._aChildren.length; i++){
            if(this._aChildren[i] instanceof df.WebBaseUIObject && !(this._aChildren[i] instanceof df.WebView)){  //  Skip views, they are called by the WebApp
                if(this._aChildren[i].pbRender){
                    if(this._aChildren[i].resizeVertical){
                        this._aChildren[i].resizeVertical();
                    }else if(this._aChildren[i].resize){
                        this._aChildren[i].resize();
                    }
                }
            }
        }
        
        this._bSizePrep = false;
    }
},

setOuterHeight : function(iHeight){
    iHeight -= this.getHeightDiff(true, false, false, false);
    this._eElem.style.height = (iHeight > 0 ? iHeight + "px" : "");
},

setInnerHeight : function(iHeight){
    iHeight -= this.getHeightDiff(true, true, false, false);
    this._eSizer.style.height = (iHeight > 0 ? iHeight + "px" : "");
},

setOuterWidth : function(iWidth){
    iWidth -= df.sys.gui.getHorizBoxDiff(this._eElem, 1);
    this._eElem.style.width = (iWidth > 0 ? iWidth + "px" : "");
},

setInnerWidth : function(iWidth){
    iWidth -= df.sys.gui.getHorizBoxDiff(this._eElem, 0);
    iWidth -= df.sys.gui.getHorizBoxDiff(this._eSizer, 1);
    this._eSizer.style.width = (iWidth > 0 ? iWidth + "px" : "");
},

/*
This method is called by the resize method to calculate to resize controls inside this container. It 
calculates the heights of the controls with pbFillHeight set to true.

@private
*/
resizeColumnLayout : function(){
    var oChild, i, x, iHeight = 0, iRow = 0, iCol = 0, iRowHeight = 0, iMinHeight, iSpace, aStretch = [], iSize, oStretch, iCount = this.piColumnCount, iIndex, iSpan;

    //  FIX: On IE8 we are missing three pixels (don't know why)
    if(df.sys.isIE && df.sys.iVersion <= 8){
        iHeight = 3;
    }
    
    //  Only do this if there are stretching controls
    if(this._bHasFill){
        //  Loop through children
        for(i = 0; i < this._aUIObjects.length; i++){
            oChild = this._aUIObjects[i];
            
            if(oChild.pbRender){
                //  Determine child index and span
                iIndex = (oChild.piColumnIndex < iCount ? oChild.piColumnIndex : 0);
                if(iIndex + oChild.piColumnSpan > iCount || oChild.piColumnSpan <= 0){
                    iSpan = iCount - iIndex;
                }else{
                    iSpan = oChild.piColumnSpan;
                }
                
                //  Detect that we move to the next row
                if(iCol > iIndex || iCol + iSpan > iCount){
                    //  Switch between stretch row
                    if(oStretch){
                        oStretch.iHeight = iRowHeight;
                        aStretch.push(oStretch);
                        oStretch = null;
                    }else{
                        iHeight = iHeight + iRowHeight;
                    }
                    
                    //  Reset values
                    iRowHeight = 0;
                    iRow++;
                    iCol = 0;
                }
                
                //  Check if this is a stretcher
                if(oChild.pbFillHeight){
                    //  Remember stretcher
                    if(oStretch){
                        oStretch.aItems.push(oChild);
                    }else{
                        oStretch = {
                            aItems : [ oChild ],
                            iHeight : 0
                        };
                    }
                    
                    //  Obey minimum height
                    if(oChild.getMinHeight){
                        iMinHeight = oChild.getMinHeight();
                    }else{
                        iMinHeight = oChild.piMinHeight;
                    }
                    
                    if(iRowHeight < iMinHeight){
                        iRowHeight = iMinHeight;
                    }
                }else{
                    //  Check if this is the highest item in this row, if so we count this one
                    if(oChild._eElem.offsetHeight > iRowHeight){
                        iRowHeight = oChild._eElem.offsetHeight;
                    }
                }
                
                //  Remember current pos
                iCol = iIndex + (iSpan || 1);
            }
        }
        
        //  Update administration for the last row
        if(oStretch){
            oStretch.iHeight = iRowHeight;
            aStretch.push(oStretch);
        }else{
            iHeight += iRowHeight;
        }
        
        this._iContentHeight = iHeight;
        
        //  Determine available space
        iSpace = this._eContainer.clientHeight + this.getHeightDiff(true, false, false, false);
		if(iSpace < this.piMinHeight){
            iSpace = this.piMinHeight;
        }
        iSpace = iSpace - this.getHeightDiff(true, true, true, true);
        
        iSpace = iSpace - iHeight;
        
        //  Loop through stretch rows
        for(i = 0; i < aStretch.length; i++){
            oStretch = aStretch[i];
            
            //  Calculate height for this stretch row
            iSize =  iSpace / (aStretch.length - i);
            //iSize--;    // FIX: Take an extra pixel here (don't know why, needed for firefox)
            
            //  Obey minimum row height
            this._iContentHeight = this._iContentHeight + oStretch.iHeight;
            
            if(iSize < oStretch.iHeight){
                iSize = oStretch.iHeight;
            }
            
            //  Set heights
            for(x = 0; x < oStretch.aItems.length; x++){
                oStretch.aItems[x].sizeHeight(iSize);
            }
            
            //  Space is now taken
            iSpace -= iSize;
        }
    }
},

/*
This method calculates and sets the positioning CSS attributes for controls inside this container 
based on the column layout system. The horizontal positioning is done in percentages where the 
number of columns determines the precision that is used.

@private
*/
position : function(){
    var i, oChild, iCol = 0, iCount = this.piColumnCount, iIndex, iSpan;

    if(iCount <= 0){
        throw new df.Error(999, "Invalid column count on '{{0}}'", this, [ this.getLongName() || "oWebApp" ]);
    }
    
    //  Reset indicator for fill height components
    this._bHasFill = false;
    
    //  Loop through children
    for(i = 0; i < this._aUIObjects.length; i++){
        oChild = this._aUIObjects[i];
        if(oChild._eElem && oChild.pbRender){
            //  Determine child index and span
            iIndex = (oChild.piColumnIndex < iCount ? oChild.piColumnIndex : 0);
            if(iIndex + oChild.piColumnSpan > iCount || oChild.piColumnSpan <= 0){
                iSpan = iCount - iIndex;
            }else{
                iSpan = oChild.piColumnSpan;
            }
            
            //  All controls float
            oChild._eElem.style.styleFloat = "left";    // IE8 FIX
            oChild._eElem.style.cssFloat = "left";
            
            //  Detect new row
            if(iCol > iIndex || iCol + iSpan > iCount){
                oChild._eElem.style.clear = "left";
                iCol = 0;
            }else{
                oChild._eElem.style.clear = "none";
            }
            
            //  Calculate whitespace on the left
            oChild._eElem.style.marginLeft = ((Math.floor((10000 / iCount)) / 100) * (iIndex - iCol)) + "%";
            
            //  Remember current pos
            iCol = iIndex + (iSpan || 1);
            
            //  Calculate width
            oChild._eElem.style.width =((Math.floor((10000 / iCount) ) / 100) * iSpan) + "%";
        }
        
        //  Indicate when we find a fill height component (that means we need to resize it)
        this._bHasFill = this._bHasFill || oChild.pbFillHeight;
    }
            
            
},

/*
This method determines the 'minimal height' required by this panel and its children. If there are 
nested panels it will return the sum of the content height of these panels. If this panel has 
controls it will measure the total size of these. When stretching controls are there 
(with pbFillHeight) set to true it uses the _iContentHeight property which is calculated by the 
resizeColumnLayout method. Else it simply takes the height of the content div element.

@private
*/
getRequiredHeight : function(){
    //  Make sure we are prepared for sizing (pre calculations are done)
    if(!this._bSizePrep){
        this.prepareSize();
    }
    
    this._bSizePrep = false;
    
    return this._iWantedHeight;
},

getAvailableHeight : function(){
    return (this._eSizer.clientHeight > this._eElem.clientHeight ? this._eSizer.clientHeight : this._eElem.clientHeight);
},

/*
Calculates the height differences between the elements of the container. These are margins, paddings 
and borders. The parameter Booleans indicate which parts should be included. The illustration shows  
the different parts.

bOut        Container
            +------
bIn         |  Sizer
            |  +------
bContentOut |  |  Content
            |  |  +------
bContentIn  |  |  |

@param  bOut        Margin & border of the container element.
@param  bIn         Padding of the container + margin & border of the sizer.
@param  bContentOut Padding of the sizer + margin & border of the content element.
@param  bCOntentIn  Padding of the content element.
@private
*/
getHeightDiff : function(bOut, bIn, bContentOut, bContentIn){
    var iHeight = 0;
    
    if(bOut){
        if(this._eElem){
            iHeight += df.sys.gui.getVertBoxDiff(this._eElem, 1);
        }
    }
    if(bIn){
        if(this._eElem){
            iHeight += df.sys.gui.getVertBoxDiff(this._eElem, 2);
        }
        if(this._eSizer){
            iHeight += df.sys.gui.getVertBoxDiff(this._eSizer, 1);
        }
    }
    if(bContentOut){
        if(this._eSizer){
            iHeight += df.sys.gui.getVertBoxDiff(this._eSizer, 2);
        } 
        if(this._eMainArea){//  Allow paddings on the main area, even while this space will be below the top panel it still needs to be recogned with
            iHeight += df.sys.gui.getVertBoxDiff(this._eMainArea, 2);
        } 
        if(this._eContent){
            iHeight += df.sys.gui.getVertBoxDiff(this._eContent, 1);
        }
    }
    if(bContentIn){
        if(this._eContent){
            iHeight += df.sys.gui.getVertBoxDiff(this._eContent, 2);
            iHeight += 1; // Always add 1 pixel for pixel rounding issues
        }
    }
    
    return iHeight;
},

/*
This method is called to determine the horizontal space that is lost due to headers & footers. This 
method will be overridden by subclasses to determine the width of title bars and tab buttons.

@private
*/
getWidthDiff : function(){
    var iWidth = 0;
    
    if(this._eElem){
        iWidth += df.sys.gui.getHorizBoxDiff(this._eElem, 1);
    }
    
    return iWidth;
},

/*
This method determines the vertical space taken by the container component itself. It only 
calculates the space that is inside the element that is actually sized.

@return Amount of pixels taken.
*/
getContentWidthDiff : function(){
    var iWidth = 0;
    
    if(this._eContent){
        iWidth += df.sys.gui.getHorizBoxDiff(this._eContent);
    }
    
    return iWidth;
},

// - - - - Special - - - -

focus : function(bOptSelect){
    var i;
    
    for(i = 0; i < this._aChildren.length; i++){
        if(this._aChildren[i].focus){
            if(this._aChildren[i].focus(bOptSelect)){
                return true;
            }
        }
    }
    
    return false;
},

// - - - - Setters - - - - 

set_piWidth : function(iVal){
    this.piWidth = iVal;
    
    if(this._eElem){
        this.sizeChanged();
    }
},

set_piHeight : function(iVal){
    this.piHeight = iVal;
    
    if(this._eElem){
        this.sizeChanged();
    }
},

set_piMinHeight : function(iVal){
    this.piMinHeight = iVal;
    
    if(this._eElem){
        this.sizeChanged();
    }
},

set_piMinWidth : function(iVal){
    this.piMinWidth = iVal;
    
    if(this._eElem){
        this.sizeChanged();
    }
},

set_piColumnCount : function(iVal){
    this.piColumnCount = iVal;
    
    this.position();
},

set_psBackgroundColor : function(sVal){
	if(this._eContainer){
        this._eContainer.style.backgroundColor = sVal || '';
    }
}

});