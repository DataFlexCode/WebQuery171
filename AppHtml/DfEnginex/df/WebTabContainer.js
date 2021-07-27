/*
Class:
    df.WebTabContainer
Extends:
    df.WebCardContainer

This class represents the tab container control. The WebCardContainer contains the main 
implementation of the WebTabContainer only different styles are applied.
    
Revision:
    2012/10/02  (HW, DAW)
        Split into WebCardContainer and WebTabContainer.
*/

df.WebTabContainer = function WebTabContainer(sName, oParent){
    df.WebTabContainer.base.constructor.call(this, sName, oParent);
    
    
    // @privates
    
    //  Configure super classes
    this._sControlClass = "WebTabContainer";
    
    this._sCardClass = "WebTbc";
};
df.defineClass("df.WebTabContainer", "df.WebCardContainer",{

openHtml : function(aHtml){
    this.pbShowCaption = false;
    this.pbShowBorder = false;
    
    df.WebTabContainer.base.openHtml.call(this, aHtml);
},

addChild : function(oChild){
    if(oChild instanceof df.WebBaseUIObject && !(oChild instanceof df.WebCard)){
        throw new df.Error(999, "WebTabContainer objects cannot have controls as direct children '{{0}}'. Consider placing them within a WebTabPage.", this, [ (oChild.getLongName() || 'oWebApp') ]);
    }    
    
    df.WebTabContainer.base.addChild.call(this, oChild);
},

set_pbShowCaption : function(bVal){

},

set_pbShowBorder : function (bVal){

},

// - - - - Focus  - - - - 

/*
Overrides the focus method and passes the focus to the first active tab button, if there is no 
active tab button we return false to indicate that it can't take the focus.
*/
focus : function(){
    var i, oTab;

    if(this._bFocusAble && this.pbEnabled && this._eElem){
        for(i = 0; i < this._aCards.length; i++){
            oTab = this._aCards[i];
            

            if(oTab.canShow() && oTab._eBtn){
                oTab._eBtn.focus();
                return true;
            }
        }
    }
    
    return false;
}

});