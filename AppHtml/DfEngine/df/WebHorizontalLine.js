/*
Class:
    df.WebHorizontalLine
Extends:
    df.WebBaseControl

This is the client-side representation of the cWebHorizontalLine class. 
    
Revision:
    2012/08/30  (HW, DAW) 
        Initial version.
*/
df.WebHorizontalLine = function(sName, oParent){
    df.WebHorizontalLine.base.constructor.call(this, sName, oParent);

    this._sControlClass = "WebHorizontalLine";
    this._bFocusAble = false;
};
df.defineClass("df.WebHorizontalLine", "df.WebBaseControl",{

/*
This method augments the html generation and adds the div.WebHorizontalLine_Spacer element.

@param  aHtml   String builder array containing html.

@private
*/
openHtml : function(aHtml){
    df.WebHorizontalLine.base.openHtml.call(this, aHtml);
    
    aHtml.push('<hr/>'); 
},

/*
This method augments the html generation and closes the div.WebHorizontalLine_Spacer element.

@param  aHtml   String builder array containing html.

@private
*/
closeHtml : function(aHtml){
    
    
    df.WebHorizontalLine.base.closeHtml.call(this, aHtml);
},

/*
This method is called after rendering and is used the get references to DOM elements, attach event 
listeners and do other initialization.

@private
*/
afterRender : function(){
    this._eControl = df.dom.query(this._eElem, "hr");
    
    df.WebHorizontalLine.base.afterRender.call(this);
},

/*
Override the setter for psBackgroundColor because <hr elements behave different in different 
browsers. If we want the line to show the background color we need to set both color and
backgroundColor because some browsers use one and others use the other.

@param  sVal    The new background color.
*/
set_psBackgroundColor : function(sVal){
    if(this._eControl){
        this._eControl.style.backgroundColor = sVal || '';
        this._eControl.style.color = sVal || '';
        //this._eControl.style.backgroundImage = (sVal ? 'none' :'');
    }
}

});