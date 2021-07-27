/*
Class:
    df.wqWebEdit
Extends:
    df.WebEdit
    
Purpose: Adds getter and setter methods for piCaretPosition

Author: Mike Peat; copyright (c) Unicorn InterGlobal Ltd, 2013
*/

df.wqWebEdit = function wqWebEdit(oDef, oParent) {    
    df.wqWebEdit.base.constructor.call(this, oDef, oParent);
    this.prop(df.tInt, "piCaretPosition", 0);    
    this.addSync("piCaretPosition");
    this._sControlClass = "WebEdit";
};

df.defineClass("df.wqWebEdit", "df.WebEdit", {

    get_piCaretPosition: function () {
        var el = this._eControl;
        if (!el) return 0;
        if (el.selectionStart) {
            return el.selectionStart + 1;
        } 
        else if (document.selection) {
            el.focus();
            var r = document.selection.createRange();
            if (r == null) {
                return 0 + 1;
            }
            var re = el.createTextRange(),
            rc = re.duplicate();
            re.moveToBookmark(r.getBookmark());
            rc.setEndPoint('EndToStart', re);
            return rc.text.length + 1;
        }
        return 0 + 1;
    },
    
    set_piCaretPosition: function(iPos) {
        var el = this._eControl;
        if (!el) return;
        el.focus();
        if (el.selectionStart) {
            el.setSelectionRange(iPos - 1, iPos - 1);
            return;
        }
        else if (el.createTextRange) {
            var range = el.createTextRange();
            range.move('character', iPos - 1);
            range.select();
        }        
    }
});