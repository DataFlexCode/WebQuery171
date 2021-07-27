/*
Class:
    df.WebTabPage
Extends:
    df.WebCard

This class represents a page within a tab container. The main functionality is available in the 
WebCard class. The tab page is a container that contains controls and its tab button is rendered by 
the tab container.
    
Revision:
    2011/10/13  (HW, DAW) 
        Initial version.
    2012/10/02  (HW, DAW)
        Split into WebCard and WebTabPage.
*/
df.WebTabPage = function WebTabPage(sName, oParent){
    //  Assertions
    if(!(oParent && oParent instanceof df.WebCardContainer)){
        this._sName = sName;        //  Set them because our super class didn't have the chance yet
        this._oParent = oParent;    
        throw new df.Error(999, "WebTabPage object '{{0}}' should be placed inside a WebTabContainer object. Consider wrapping your tab page with a tab container.", this, [ this.getLongName() ]);
    }

    df.WebTabPage.base.constructor.call(this, sName, oParent);
    
    this._sControlClass = "WebTabPage";
};
df.defineClass("df.WebTabPage", "df.WebCard",{


});