df.WebModalDialog = function WebModalDialog(sName, oParent){
    df.WebModalDialog.base.constructor.call(this, sName, oParent);
    
    this.pbFloating = true;
    this.pbModal = true;
    
    //  Used by modal dialogs to indicate that this view also needs synchonization
    this._oInvokingView = null;
};
df.defineClass("df.WebModalDialog", "df.WebView",{

get_psInvokingView : function(){
    return (this._oInvokingView && this._oInvokingView._sName) || "";
},

set_psInvokingView : function(sVal){
    var oWO = this.getWebApp().findObj(sVal);
    
    this._oInvokingView = (oWO instanceof df.WebView && oWO) ||  null;
}

});