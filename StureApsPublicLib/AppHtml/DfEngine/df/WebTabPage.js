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