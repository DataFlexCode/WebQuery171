/*
Class:
    df.WebProgressBar
Extends:
    df.WebBaseControl

The progressbar control is a simple control that consists of multiple div elements where the width 
as an percentage is used to show the progress.
    
Revision:
    2013/07/24  (RH, DAE) 
        Initial version.
*/
df.WebProgressBar = function WebProgressBar(oDef, oParent){
    df.WebProgressBar.base.constructor.call(this, oDef, oParent);
    
    //  Web Properties
    this.prop(df.tInt, "piMaxValue", 100);
	this.prop(df.tInt, "piValue", 0);
	this.prop(df.tBool, "pbShowPercentage", true);
	this.prop(df.tString, "psCaption", "");
	this.prop(df.tInt, "piDecimals", "");
    
	// @privates
    this._eProgressBarWrp = null;
	this._eProgress = null;
	this._ePercentage = null;
    
    //  Configure super classes
    this.piColumnSpan = 0;
    this.pbShowLabel = false;
};
df.defineClass("df.WebProgressBar", "df.WebBaseControl",{

/*
This method generates the HTML for the progressbar.

@param  aHtml   Array used as string builder for the HTML.
@private
*/
openHtml : function(aHtml){
    df.WebProgressBar.base.openHtml.call(this, aHtml);
    
    aHtml.push('<div class="WebProgressBar_Wrp">');
        aHtml.push('<div>');
            aHtml.push('<div class="WebProgressBar_Progress"></div>');
            if(this.psCaption !== ""){
                aHtml.push('<div class="WebProgressBar_Percentage">',this.psCaption,'</div>');
            }else if(this.pbShowPercentage){
                aHtml.push('<div class="WebProgressBar_Percentage"></div>');
            }
},

/*
This method closes the progressbar wrapper

@param  aHtml   Array string builder to add HTML to.
@private
*/
closeHtml : function(aHtml){
    aHtml.push('</div></div>');
    
    df.WebProgressBar.base.closeHtml.call(this, aHtml);
},

/*
This method is called after the HTML is added to the DOM and gets a reference to the
Wrapper, progress and percentage divs

@private
*/
afterRender : function(){
    //  Get references
    this._eProgressBarWrp = df.dom.query(this._eElem, ".WebProgressBar_Wrp");
	this._eProgress = df.dom.query(this._eElem, ".WebProgressBar_Progress");
	this._ePercentage = df.dom.query(this._eElem, ".WebProgressBar_Percentage");
    
	this.set_piValue(this.piValue);
	
    df.WebProgressBar.base.afterRender.call(this);
},


//-------------Helper functions

/*
This function calculates the current percentage of the progress bar
*/
getPercentage : function(iCustomDecimals){
	var fPercentage, iDecimals = this.piDecimals;
	if(iCustomDecimals !== undefined){
		iDecimals = iCustomDecimals;
	}
	iDecimals = Math.pow(10, iDecimals);
	fPercentage = (this.piValue/this.piMaxValue) * 100;
	
	return Math.round(fPercentage * iDecimals)/iDecimals;
},


//-------------Setters
/*
This function sets the new value of the progressbar and updates the DOM
*/
set_piValue : function(iVal){
	iVal = (iVal >= 0 ? (iVal <= this.piMaxValue ? iVal : this.piMaxValue) : 0);

    this.piValue = iVal;
    this._eProgress.style.width =  this.getPercentage(2) +"%";
    if(this.pbShowPercentage && this.psCaption === ""){
        this._ePercentage.innerHTML = this.getPercentage() + "%";
    }
}
});