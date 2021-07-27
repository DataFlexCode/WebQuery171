/*
Class:
    df.WebColumnDate
Mixin:
    df.WebColumn_mixin (df.WebColumnDateBase)
Extends:
    df.WebForm

This is the client-side representation of the cWebColumnDate control.

Revision:
    2013/12/11  (HW, DAW) 
        Initial version.
*/

//  Generate new base class using df.WebColumn_mixin and df.WebDateForm
df.WebColumnDateBase = df.mixin("df.WebColumn_mixin", "df.WebDateForm");


df.WebColumnDate = function WebColumnDate(sName, oParent){
    df.WebColumnDate.base.constructor.call(this, sName, oParent);
    
    //  Configure super class
    this._sCellClass = "WebCol";
};
df.defineClass("df.WebColumnDate", "df.WebColumnDateBase",{


});