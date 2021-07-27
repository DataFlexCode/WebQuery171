/*
Class:
    df.InfoBalloon
Extends:
    Object

This class can show an info balloon next to a control to display errors or additional information. 
This info balloon consists of a simple div element that is positioned by the class next to the 
element. Used to display errors (WebBaseDEO.showControlError) and custom info balloons 
(WebBaseControl.showInfoBalloon).
    
Revision:
    2011/07/04  (HW, DAW) 
        Initial version.
    2013/12/10  (HW, DAW)
        Refactored from WebTooltip into InfoBalloon. Simplified so it doesn't inherit from WebObject
        any more (which wasn't needed).
*/
df.InfoBalloon = function(oControl, sCssClass, sMessage){
    this.psMessage = sMessage;
    this.piHideDelay = 6000;
    this.pbShowOnHover = true;
    this.psCSSClass = sCssClass;
        
    this.poTarget = oControl;
    
    this._eElem = null;
    this._eEventElem = null;
    this._eParentRef = null;
    this._bTopTooltip = false;
    this._tHideTimeout = null;
    
};
df.defineClass("df.InfoBalloon", {

update : function(){
    if(this._eElem){
        this._eElem.innerHTML = this.psMessage;
        this._eElem.className = "WebInfoBalloon " + this.psCSSClass;
        
        //  Reset position
        this._eElem.style.bottom = "";
        this._eElem.style.top = "";
        this._eElem.style.left = "";
        
        //  Recalculate position (from scratch)
        this._bTopTooltip = false;
        this.position(true);
    }
},

show : function(){
    var eRef, eTarget = this.getTargetElem();
    
    if(!this._eElem){
         //  Create elem
        this._eElem = df.dom.create('<div class="WebInfoBalloon ' + this.psCSSClass + '"></div>');
        this._eElem.innerHTML = this.psMessage;
        
        //  Insert
        this._eParentRef = eRef = df.sys.gui.findParentRef(this.poTarget);
        if(eRef){
            eRef.appendChild(this._eElem);
            
            this._bTopTooltip = false;
            this.position(true);
    
            if(this.pbShowOnHover){
                df.events.addDomListener("mouseover", eTarget, this.onMouseOver, this);
                df.events.addDomListener("mouseout", eTarget, this.onMouseOut, this);
                this._eEventElem = eTarget;
            }
            
            this._show();
            this.setTimeout();
        }else{
            throw new df.Error(999, "No element to insert next to!");
        }
    }else{
        this._show();
        this.setTimeout();
    }
},

_show : function(){
    if(this._eElem){
        // this.position();
        // this._eElem.style.visibility = "visible";
        df.dom.addClass(this._eElem, "WebInfoBalloonVisible");
        
    }
},



getTargetElem : function(){
    var eElem = this.poTarget._eElem;
    
    if(this.poTarget.getTooltipElem){
        eElem = this.poTarget.getTooltipElem() || eElem;
    }
    
    return eElem;
},

hide : function(){
    var eElem = this._eElem;
    
    if(this._eElem){
        this._hide();
    
        if(this._eEventElem){
            df.events.removeDomListener("mouseover", this._eEventElem, this.onMouseOver);
            df.events.removeDomListener("mouseout", this._eEventElem, this.onMouseOut);
            this._eEventElem = null;
        }
        
        if(this._tHideTimeout){
            clearTimeout(this._tHideTimeout);
            this._tHideTimeout = null;
        }
        
        setTimeout(function(){
            if(eElem.parentNode){
                eElem.parentNode.removeChild(eElem);
            }
        }, 3000);
        this._eElem = null;
    }
},

_hide : function(){
    if(this._eElem){
        // this._eElem.style.visibility = "hidden";
        df.dom.removeClass(this._eElem, "WebInfoBalloonVisible");
    }    
},

position : function(bOptFirstPos){
    var eParent, iTop = 0, iLeft = 0, iHeight, iBottom, iWidth, eCurrent, eTarget, eTool;
    
    eParent = this._eElem && this._eElem.offsetParent; //  The parent element of the tooltip
    eTarget = this.getTargetElem(); //  The element to position next
    eTool = this._eElem;    //  The tooltip
    
    if(eTool && eParent){
        
        iTop = eTarget.offsetHeight;
        if(eTarget.offsetWidth > 70){
            iLeft = Math.round((eTarget.offsetWidth - 70) / 2);
        }
        
        
        //  Determine offset between target & relative parent
        eCurrent = eTarget;
        while(eCurrent.offsetParent && eCurrent !== eParent){
            iTop += eCurrent.offsetTop;
            iLeft += eCurrent.offsetLeft;
            
            eCurrent = eCurrent.offsetParent;
        }
        
        //  Calculate width & height of the tooltip
        iHeight = eTool.clientHeight + df.sys.gui.getVertBoxDiff(eTool);
        iWidth = eTool.clientWidth + df.sys.gui.getHorizBoxDiff(eTool);
        
        //  Calculate the bottom coordiante
        iBottom = eParent.clientHeight - iTop + eTarget.offsetHeight;
        
        if(bOptFirstPos){
            //  Determine if we should make it a top balloon (we do that if there is not enough space below and enough space above)
            if(eParent.clientHeight < (iTop + iHeight) && eParent.clientHeight > (iBottom + iHeight)){
                this._bTopTooltip = true;
                df.dom.addClass(this._eElem, "WebInfoBalloon_Top");
                // eTool.style.height = eTool.clientHeight + "px";
            }
        }
        
        //  Optionally move it to the left if it is too wide
        if(eParent.clientWidth < iLeft + iWidth){
            iLeft = eParent.clientWidth - iWidth;
            if(iLeft < 0){
                iLeft = 0;
            }
        }
        
        //  Position on top or at the bottom
        if(this._bTopTooltip){
            eTool.style.bottom = iBottom + "px"; 
        }else{
            eTool.style.top = iTop + "px";
        }
        eTool.style.left = iLeft + "px";
        
    }
},

setTimeout : function(){
    var that = this;
    if(this.piHideDelay > 0){
        if(this._tHideTimeout){
            clearTimeout(this._tHideTimeout);
        }
        this._tHideTimeout = setTimeout(function(){
            that._hide();
        }, this.piHideDelay);
    }
},

/*
Handles the mouseover event of the element. It displays the balloon.

@param  oEvent  Event object.
@private
*/
onMouseOver : function(oEvent){
    this._show();
    
    if(this._tHideTimeout){
        clearTimeout(this._tHideTimeout);
        this._tHideTimeout = null;
    }
},

onMouseOut : function(oEvent){
    this.setTimeout();
},

resize : function(){
    this.position();
}

});