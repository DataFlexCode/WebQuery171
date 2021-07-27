/*
Class:
    df.wqWebApp
Extends:
    df.WebApp
    
Purpose: Add extra functionality to NavigateToPage / navigateToPage

Author: Mike Peat; copyright (c) Unicorn InterGlobal Ltd, 2013
*/

df.wqWebApp = function WebAppExtra(sName, oParent) {
    df.wqWebApp.base.constructor.call(this, sName, oParent);
    this._sControlClass = "WebApp";
};

df.defineClass("df.wqWebApp", "df.WebApp", {

    navigateNewWindow: function (sUrl, iWidth, iHeight, sParams) {
        window.open(sUrl, '_blank_' + df.dom.piDomCounter++, 'width=' + iWidth + ', height=' + iHeight + sParams);
    }

});