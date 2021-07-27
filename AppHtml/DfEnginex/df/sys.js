/*
Name:
    df.sys
Type:
    Library(object)

Revisions:
    2005/09/01  Created the initial version with a basic set of browser
    independent functions. (HW, DAE)

    2006/11/05  Restructured into dom, events, data, gui categories. (HW, DAE)

    2007/12/14  Converted into 2.0 structure. It is now called df.sys and the
    events functionallity is moved to a separate df.events version. (HW, DAE)

*/

/*
An important part of the Visual DataFlex AJAX Library is the layer that is build
between the browser and the engine. Its main goal is to straighten out the
differences between the supported browsers. It contains a lot of functionality
that cover the various parts of client side web development.
*/

df.sys = {

/*
If true the browser is supposed to be safari or part of the safari family.
*/
isSafari : false,
/*
True if the browser seems to be Google Chrome.
*/
isChrome : false,
/*
True if the browser seems to be Opera.
*/
isOpera : false,
/*
If true the browser is supposed to be part of the mozilla family (usually
FireFox).
*/
isMoz : false,
/*
True if the browser seems to be Internet Explorer. Also true if we where not
able to detect the browser type properly (if browser unknown threat it as IE
policy).
*/
isIE : false,
/*
True if the WebKit layout engine is used (Safari & Chrome).
*/
isWebkit : false,

/*
Indicates the browser version.
*/
iVersion : 0,

/*
The reflection library contains functionality related to prototypes, objects
and functions. Some of this functionality is closely related to the Visual DataFlex
AJAX Library and might not work on objects from outside the library.
*/
ref : {

/*
Determines the object type using "typeof" and for objects it tries to determine
the constructorname.

@param  oObject     Reference to the object of which the type should be determined.
@return The type of the object ("object", "function", "array", "undefined", ..).
*/
getType : function(oObject){
    var sType = typeof(oObject);

    if(sType === "object"){
        if(oObject === null || oObject === undefined){
            sType = "null";
        }else if(oObject.constructor === Array){
            sType = "array";
        }else if(oObject.constructor === Date){
            sType = "date";
        }else{
            sType = this.getConstructorName(oObject);
        }
    }

    return sType;
},

/*
It tries to determine the name of the constructor of the object. If the
constructor is not found "object" is returned.

@param  oObject     Reference to the object of which we want to determine the
        constructor name.
@return String with the constructorname ("object" if not found).
*/
getConstructorName : function(oObject){
    var sName = this.getMethodName(oObject.constructor);

    if(sName === ""){
        sName = "object";
    }

    return sName;
},

/*
Determines the name of the given function by converting the function its string
definition.

@param  fFunction   Reference to the function.
@return Name of the function ("unknownType" if not able to determine).
*/
getMethodName : function(fFunction){
    var sString;

    try {
        sString = fFunction.toString();
        return sString.substring(sString.indexOf("function") + 8, sString.indexOf('(')).replace(/ /g,'');
    }catch(e){
        return "";
    }
},

/*
Determines the global scope object. Within browsers this usually is the window
object.

@return Reference to the global scope object.
*/
getGlobalObj : function(){
    return (function(){
        return this;
    }).call(null);
},

/*
Finds the (nested) object property by a path string (like "df.core.List")
without using an eval. Always starts at the global object.

@param  sPath   Path to the property (like "df.core.List").
@return The property (null if not found).
*/
getNestedProp : function(sPath){
    var aParts, oProp, iPart;

    //  Split into parts
    aParts = sPath.split(".");

    //  We start our search at the global object
    oProp = df.sys.ref.getGlobalObj();

    //  Loop through parts and object properties
    for(iPart = 0; iPart < aParts.length; iPart++){
        if(typeof oProp === "object" && oProp !== null){
            oProp = oProp[aParts[iPart]];
        }else{
            return null;
        }
    }

    return oProp;
}

},

/*
The math library contains functionality to perform calculations.
*/
math : {
/*
Fills out the given number with zero's until it has the required amount of digits.

@param  iNum    Number to convert.
@param  iDigits Number of digits.
@return String with the number outfilled with zero's.
*/
padZero : function(iNum, iDigits)
{
    var sResult = iNum.toString();

    while(sResult.length < iDigits){
        sResult = "0" + sResult;
    }

    return sResult;
}

},

/*
Functionality for data conversions and other data related functions.
*/
data : {

/*
Parses a string into a number using the correct thousands and decimal separator.

@param  sVal            String containing the number to parse.
@param  sDecSep        The decimal separator used.
@param  sOptThousSepp   (optional) The thousands separator used.
@return Number.

*/
stringToNum : function(sVal, sDecSep, sOptThousSepp){
    return sVal && parseFloat(sVal.replace(sOptThousSepp || "", "").replace(sDecSep, "."));
},

/*
This method converts a numeric value to a string using the decimal separator that is configured.

@param  nVal        The numeric value.
@param  sDecSep     The decimal separator used.
@param  iPrecision  Number of decimals.
@return The string with the number.
@private
*/
numToString : function(nVal, sDecSep, iPrecision){
    var aVal, sVal;
    
    //  Make sure that we have a number
    nVal = nVal || 0.0;
    
    //  Parse to string
    sVal = nVal.toString().replace(".", sDecSep);
    
    //  Format
    if(iPrecision > 0){
        aVal = sVal.split(sDecSep);
        
        if(aVal.length < 2){
            aVal[1] = "";
        }
        aVal[1] = (aVal[1] + "0000000000000000000").substr(0, iPrecision);
        
        sVal = aVal[0] + sDecSep + aVal[1];
    }
        
    
    return sVal;
},

/*
Applies the date mask on the date.

@param  dValue          The date object.
@param  sMask           The mask string.
@param  sDateSeparator  Separator character that will be used in the date mask.
@return String with the masked data.
*/
applyDateMask : function(dValue, sMask, sDateSeparator){
    return sMask.replace(/(m{1,4}|d{1,4}|yyyy|yy|\/)/gi, function (sValue, iPos){

        switch(sValue.toLowerCase()){
            case "m":
                return dValue.getMonth() + 1;
            case "mm":
                return df.sys.math.padZero(dValue.getMonth() + 1, 2);
            case "mmm":
                return df.sys.string.copyCase(df.lang.monthsShort[dValue.getMonth()], sValue);
            case "mmmm":
                return df.sys.string.copyCase(df.lang.monthsLong[dValue.getMonth()], sValue);

            case "d":
                return dValue.getDate();
            case "dd":
                return df.sys.math.padZero(dValue.getDate(), 2);
            case "ddd":
                return df.sys.string.copyCase(df.lang.daysShort[dValue.getDay()], sValue);
            case "dddd":
                return df.sys.string.copyCase(df.lang.daysLong[dValue.getDay()], sValue);

            case "yy":
                return df.sys.math.padZero(dValue.getFullYear() % 100, 2);
            case "yyyy":
                return df.sys.math.padZero(dValue.getFullYear(), 4);

            case "/":
                return sDateSeparator;
        }

        return sValue;
    });
},

/*
This method applies a numeric mask to a number. 

@param  nValue      Value as a number.
@param  sMask       The mask string.
@param  sDecSep     The decimal separator to use.
@param  sThousSep   The thousands separator to use.
@param  sCurSym     The currency symbol to use.
@return The string containing the masked number.
*/
applyNumMask : function(nValue, sMask, sDecSep, sThousSep, sCurSym){
    var aParts, aResult = [], sChar, bEscape, iChar, iNumChar, iCount, sBefore, sDecimals, 
        sMaskBefore, sMaskDecimals = null, sValue, iMaskBefore = 0, iMaskDecimals = 0, 
        bThousands = false, bBefore = true; 
    
    // Replace &curren; and &euro;
    sMask = sMask.replace(/&curren;/g, sCurSym).replace(/&euro;/g, String.fromCharCode(0x20ac));
    
    //  Zero suppress (indicated by the "Z" as first mask character)
    if(sMask.charAt(0) === "Z"){
        if(nValue === 0.0){
            return "";
        }
        sMask = sMask.substr(1);
    }
    
    //  Determine which mask to use :D
    aParts = sMask.split(";");
    if(nValue < 0.0){
        if(aParts.length > 1){
            sMask = aParts[1];
        }else{
            sMask = "-" + aParts[0];
        }
    }else{
        sMask = aParts[0];
    }

    //  Split into before and and after decimal separator
    aParts = sMask.split(".");
    sMaskBefore = aParts[0];
    if(aParts.length > 1){
        sMaskDecimals = aParts[1];
    }

    
    //  Pre process mask
    for(iChar = 0; iChar < sMask.length; iChar++){
        switch(sMask.charAt(iChar)){
            case "\\":
                iChar++;
                break;
            case "#":
            case "0":
                if(bBefore){
                    if(iMaskBefore >= 0){
                        iMaskBefore++;
                    }
                }else{
                    if(iMaskDecimals >= 0){
                        iMaskDecimals++;
                    }
                }
                break;
            case "*":
                if(bBefore){
                    iMaskBefore = -1;
                }else{
                    iMaskDecimals = -1;
                }
                break;
            case ",":
                bThousands = true;
                break;
            case ".":
                bBefore = false;
                break;
        }
    }
    
    //  Convert number into string with number before and numbers after
    if(iMaskDecimals >= 0){
        nValue = nValue.toFixed(iMaskDecimals);
    }
    sValue = (nValue === 0.0 ? "" : String(nValue));
    aParts = sValue.split(".");
    sBefore = aParts[0];
    if(aParts.length > 1){
        sDecimals = aParts[1];
    }else{
        sDecimals = "";
    }
    if(sBefore.charAt(0) === "-"){
        sBefore = sBefore.substr(1);
    }
    
    //  BEFORE DECIMAL SEPARATOR
    iChar = sMaskBefore.length - 1;
    iNumChar = sBefore.length - 1;
    iCount = 0;
    while(iChar >= 0){
        sChar = sMaskBefore.charAt(iChar);
        bEscape = (iChar > 0 && sMaskBefore.charAt(iChar - 1) === "\\");
        
        if(!bEscape && (sChar === "#" || sChar === "*" || sChar === "0")){
            while(iNumChar >= 0 || sChar === "0"){
                //  Append thousands separator if needed
                if(iCount >= 3){
                    iCount = 0;
                    if(bThousands){
                        aResult.unshift(sThousSep);
                    }
                }
                
                //  Append number
                aResult.unshift((iNumChar >= 0 ? sBefore.charAt(iNumChar) : "0"));
                iNumChar--;
                iCount++;
                
                //  Break out for non repeative characters
                if(sChar === "#" || sChar === "0"){
                    break;
                }
            }
        }else{
            // if(sChar === "$" && !bEscape){
                // sChar = sCurSym;
            // }
            if((sChar !== "," && sChar !== "\\") || bEscape){
                aResult.unshift(sChar);
            }
        }
        iChar--;
    }
    
    //  AFTER DECIMAL SEPARATOR
    if(sMaskDecimals !== null){
        aResult.push(sDecSep);
        
        iNumChar = 0;
        for(iChar = 0; iChar < sMaskDecimals.length; iChar++){
            sChar = sMaskDecimals.charAt(iChar);
            bEscape = (iChar > 0 && sMaskBefore.charAt(iChar - 1) === "\\");
            
           
            if(!bEscape && (sChar === "#" || sChar === "*" || sChar === "0")){
                while(iNumChar < sDecimals.length || sChar === "0"){
                    //  Append number
                    aResult.push((iNumChar >= 0 ? sDecimals.charAt(iNumChar) : "0"));
                    iNumChar++;
                    
                    //  Break out for non repeative characters
                    if(sChar === "#" || sChar === "0"){
                        break;
                    }
                }
            }else{
                // if(sChar === "$" && !bEscape){
                    // sChar = sCurSym;
                // }
                if(sChar !== "\\" || bEscape){
                    aResult.push(sChar);
                }
            }
        }
    }
    
    return aResult.join("");
},

/*
Applies the windows mask the to the value by adding the mask characters. If 
the value doesn't matches the mask the value isn't completely displayed.

Params:
    sValue  Value to apply the mask on.
Returns:
    Masked value.
*/
applyWinMask : function(sValue, sMask){
    var iChar = 0, iValChar = 0, aResult = [], bFound, sChar;
    
    if(sValue === ""){
        return "";
    }
    if(sMask === ""){
        return sValue;
    }
    
    while(iChar < sMask.length){
        sChar = sMask.charAt(iChar);
        
        if(sChar === "\\" && sMask.length > (iChar + 1)){
            aResult.push(sMask.charAt(iChar + 1));
        }else{
            if(sChar === "#" || sChar === "@" || sChar === "!" || sChar === "*"){
                bFound = false;
                while(iValChar < sValue.length && !bFound){
                    if(this.acceptWinMaskChar(sValue.charAt(iValChar), sChar)){
                        aResult.push(sValue.charAt(iValChar));
                        bFound = true;
                    }
                    iValChar++;
                }
                if(!bFound){
                    break;
                }
            }else{
                //  Append mask display character
                aResult.push(sChar);
            }
        }
        iChar++;
    }
    
    return aResult.join("");
},

/*
Checks if the given character is allowed at the given position for windows 
masks.

Params:
    sChar   Character to check.
    iPos    Position to check. 
Returns:
    True if the character is allowed at the given position.

@private
*/
acceptWinMaskChar : function(sValChar, sChar){
    return ((sChar === "#" && sValChar.match(/[0-9]/)) ||
        (sChar === "@" && sValChar.match(/[a-zA-Z]/)) ||
        (sChar === "!" && sValChar.match(/[^a-zA-Z0-9]/)) ||
        sChar === "*");
},

/*
Parses a date string into a Date object using the given format.

@param  sValue          String date (that confirms the format).
@param  sFormat         Date format (basic date format).
@param  sDateSeparator  Separator character used in the date format.
@return Date object representing the date (returns 1970/01/01 if no value given).
*/
stringToDate : function(sValue, sFormat, sDateSeparator){
    var dResult, dToday = new Date(), iChar, aMask, aData, sChar, iPart, sPart, iDate, iMonth, iYear;

    sFormat = sFormat.toLowerCase();

    if(df.sys.string.trim(sValue) === ""){
        return null;
    }

    //  Determine separator if its not given
    if(typeof sDateSeparator !== "string"){
        for(iChar = 0; iChar < sFormat.length; iChar++){
            sChar = sFormat.charAt(iChar).toLowerCase();
            if(sChar !== "m" && sChar !== "d" && sChar !== "y"){
                sDateSeparator = sChar;
                break;
            }
        }
    }

    //  Split the date
    aMask = sFormat.toLowerCase().split("/");
    if(aMask.length === 0){
        aMask = sFormat.toLowerCase.split(sDateSeparator);
    }
    aData = sValue.toLowerCase().split(sDateSeparator);

    //  Loop throught the parts finding the year, date and month
    for(iPart = 0; iPart < aData.length && iPart < aMask.length; iPart++){
        sPart = aData[iPart];
    
        switch(aMask[iPart]){
            case "d":
            case "dd":
                iDate = parseInt(sPart, 10);
                break;
            case "m":
            case "mm":
                iMonth = parseInt(sPart, 10);
                break;
            case "yy":
            case "yyyy":
                iYear = parseInt(sPart, 10);
                if(sPart.length === 2){
                    iYear = (iYear > 50 ? iYear + 1900 : iYear + 2000);
                }else if(sPart.length === 0){
                    iYear = dToday.getFullYear();
                }
                
                break;
        }
    }

    //  Set the determined values to the new data object, decrement if to high
    dResult = new Date(1, 1, 1, 1, 1, 1);
    

    //  Year
    if(iYear){
        if(iYear > 9999){
            iYear = 9999;
        }
        if(iYear < -9999){
            iYear = 0;
        }
        dResult.setFullYear((iYear > 9999 ? 9999 : (iYear < 0 ? 0 : iYear)));
    }else{
        dResult.setFullYear(dToday.getFullYear());
    }

    //  Month
    if(iMonth){
        dResult.setMonth((iMonth < 0 ? 0 : (iMonth > 12 ? 11 : iMonth - 1)));
    }else{
        dResult.setMonth(dToday.getMonth());
    }

    //  Date
    if(iDate){
        iDate = (iDate < 1 ? 1 : (iDate > 31 ? 31 : iDate));
    }else{
        iDate = dToday.getDate();
    }

    //  Make sure that it didn't shifted the month (retry and reduce the day until it doesn't);
    iMonth = dResult.getMonth();
    iYear = dResult.getFullYear();
    dResult.setDate(iDate);
    while(dResult.getMonth() !== iMonth){
        dResult.setFullYear(iYear);
        dResult.setMonth(iMonth);
        iDate--;
        dResult.setDate(iDate);
    }





    return dResult;
},

/*
Generates a string for the given date using the given format.

@param  dValue      Data object.
@param  sFormat     Date format (basic date format).
@return String representing the given date.
*/
dateToString : function(dValue, sFormat, sDateSeparator){
    return this.applyDateMask(dValue, sFormat, sDateSeparator || "/");
},

/*
Determines the week number of the given date object.

@param  dDate   Date object.
@return The week number.
*/
dateToWeek : function(dDate){
    var iYear, iMonth, iDate, dNow, dFirstDay, dThen, iCompensation, iNumberOfWeek;
    
    iYear = dDate.getFullYear();
    iMonth = dDate.getMonth();
    iDate = dDate.getDate();
    dNow = Date.UTC(iYear,iMonth,iDate+1,0,0,0);
    
    dFirstDay = new Date();
    dFirstDay.setFullYear(iYear);
    dFirstDay.setMonth(0);
    dFirstDay.setDate(1);
    dThen = Date.UTC(iYear,0,1,0,0,0);
    iCompensation = dFirstDay.getDay();
    
    if (iCompensation > 3){
        iCompensation -= 4;
    }else{
        iCompensation += 3;
    }
    iNumberOfWeek =  Math.round((((dNow-dThen)/86400000)+iCompensation)/7);
    return iNumberOfWeek;
},

/*
Loops through the array and removes all items that match the given object.

@param  aArray  Reference to the array.
@param  oObj    Object reference or value to remove.
*/
removeFromArray : function(aArray, oObj){
    var i;
    
    for(i = 0; i < aArray.length; i++){
        if(aArray[i] === oObj){
            aArray.splice(i, 1);
        }
    }
},

/*
Expression used by the format method.

@private
*/
formatRegExp : /\{\{([0-1a-zA-Z]+)\}\}/gi,
/*
Formats a string based on a past object or array. Markers {{prop}} will be replaced with properties 
from the passed object or array. 

@code
sStr = df.sys.data.format('Hi {{name}}!', { name : 'John' }); // sStr will contain 'Hi John!'
sStr = df.sys.data.format('The {{0}} and {{1}}!', [ 'first', 'second' ]); // sStr will contain 'The first and second'
@code

@param  sStr    String containing markers to replace.
@param  oReps   Object or array containing properties to replace markers with.
@return Formatted string.
*/
format : function(sStr, oReps){
    var reps = oReps || { };
    
    
    return sStr.replace(this.formatRegExp, function(str, p1, offset, s){
        if(reps.hasOwnProperty(p1)){
            return reps[p1];
        }
        return str;
    });
},

/*
Properly formats a data size in the appropriate unit (like 131 kB or 15.4 MB or 900 GB).

@param  iBytes      The data size in bytes.
@return String containing the formatted size.
*/
markupDataSize : function(iBytes){
    var nVal;
    
    if (iBytes < 1024){
        return iBytes + " B";
    }
    
    //  kilobytes
    nVal = iBytes / 1024;
    if(nVal < 2048){
        return Math.round(nVal) + " kB";
    }
   
    //   megabytes
    nVal = nVal / 1024;
    if(nVal < 2048){
        if(nVal < 100){
            return ((Math.round(nVal) * 10) / 10) + " MB";
        }
        return Math.round(nVal) + " MB";
    }
    
    //  gigabytes
    nVal = nVal / 1024;
    if(nVal < 2048){
        if(nVal < 100){
            return ((Math.round(nVal) * 10) / 10) + " GB";
        }
        return Math.round(nVal) + " GB";
    }
    
    //  terabyte
    nVal = nVal / 1024;
    if(nVal < 2048){
        if(nVal < 100){
            return ((Math.round(nVal) * 10) / 10) + " TB";
        }
        return Math.round(nVal) + " TB";
    }
    
    //  petabyte
    nVal = nVal / 1024;
    if(nVal < 100){
        return ((Math.round(nVal) * 10) / 10) + " PB";
    }
    return Math.round(nVal) + " PB";

},

/* 
Escapes a string for safe usage within a regular expression.

@param  sStr    The string to escape.
@return Escaped string.
*/
escapeRegExp : function(sStr) {
  return sStr.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

},

/*
Functions that ease the access of cookies.
*/
cookie : {

/*
Places a cookie.

@param  sVar			Name of cookie variable.
@param  sValue			Value of cookie variable.
@param  iExpires        Determines when the cookie expires in hours from right now.
*/
set : function(sVar, sValue, iExpires){
    var date = new Date();
    
    if(iExpires){
		date.setHours(date.getHours() + iExpires);
		document.cookie = sVar + "=" + sValue + "; expires=" + date.toGMTString();	
	}else{
		document.cookie = sVar + "=" + sValue;
	} 
},

/*
Removes cookie by expiring.

@param  sVar	Name of cookie variable.
*/
del : function(sVar){
    var date = new Date();
    
    date.setTime(date.getTime()-1);

    document.cookie = sVar + "=; expires=" + date.toGMTString();		
},

/*
Fetches cookie value.

@param  sVar		Name of cookie variable.
@param  sDefault	Variable to return when not found.
@return Value of the cookie variable (sDefault if not found).
*/
get : function(sVar, sDefault){
    var sResult = null, aVars, aVar, iVar;
    
    if(document.cookie){
        aVars = document.cookie.split(';');
        
        for(iVar = 0; iVar < aVars.length && sResult === null; iVar++){
            aVar = aVars[iVar].split('=');
            
            if(aVar.length > 1){
                if(df.sys.string.trim(aVar[0]) === df.sys.string.trim(sVar)){
                    sResult = aVar[1];	
                }
            }
        }
    }
    
    if(sResult !== null){
        return sResult;
    }
    return sDefault;
}


},



/*
Functionality to create graphical components.
*/
gui : {

/*
This method is used to determine which parent element within the DOM structure generated by the 
rendered controls and panels is the most suitable for adding our absolutely rendered element (date 
picker / error tooltip / suggestion list). It makes sure that we don't pass panels that are 
scrolling and are hiding / showing (tab pages / views).

TODO:   Consider supporting to go outside of views / tab panels. Controls will have to hook into 
        that to hide when necessary. 

@param  oControl    The control object to bubble up from.
*/
findParentRef : function(oControl){
    var eContent = oControl._eElem;
    
    eContent = eContent.parentNode || eContent;
    
    while(oControl){
        if(oControl instanceof df.WebBaseContainer){
            if(oControl._eSizer){
                eContent = oControl._eSizer;
            
                if(oControl._eContainer.scrollHeight > oControl._eContainer.clientHeight){
                    return eContent;
                }
            }else{
                eContent = oControl._eSizer;
            }
        }
        
        //  TODO: This limits the tooltip to be displayed within a tab page (it can't cross the border), think of better solution
        if(oControl instanceof df.WebCard){
            return eContent;
        }
        
        if(oControl instanceof df.WebView){
            if(oControl._eContainer.scrollHeight > oControl._eContainer.clientHeight){
                return eContent;
            }
            return oControl._eElem;
        }
    
        oControl = oControl._oParent;
    }
    
    return eContent;
},

/*
Finds all the child elements of the given element that can be focussed and
disables the tabindex by setting a negative value.

@param  eParent    DOM element to search.
*/
disableTabIndexes : function(eParent){
    var iElem, aElems, eElem;

    aElems = df.dom.query(eParent, df.dom.cFocusSelector, true);

    for(iElem = 0; iElem < aElems.length; iElem++){
        eElem = aElems[iElem];
    
        if(eElem.getAttribute("data-dfOrigTabIndex") === null){
            eElem.setAttribute("data-dfTabIndexCount", 1);
            eElem.setAttribute("data-dfOrigTabIndex", eElem.tabIndex);
            eElem.tabIndex = "-1";
        }else{
            eElem.setAttribute("data-dfTabIndexCount", parseInt(eElem.getAttribute("data-dfTabIndexCount"), 10) + 1);
        }
    }
},

/*
Finds all the child elements of the given element that can contain tabs and
restores their tabindex (if it is modified by by the disableTabIndex method).

@param   eParent    DOM element to search.
*/
restoreTabIndexes : function(eParent){
    var iElem, aElems, eElem;
    
    aElems = df.dom.query(eParent, df.dom.cFocusSelector, true);

    for(iElem = 0; iElem < aElems.length; iElem++){
        eElem = aElems[iElem];
        if(parseInt(eElem.getAttribute("data-dfTabIndexCount"), 10) !== null){
            if(eElem.getAttribute("data-dfTabIndexCount") <= 1){
                eElem.tabIndex = eElem.getAttribute("data-dfOrigTabIndex");
                eElem.removeAttribute("data-dfOrigTabIndex");
                eElem.removeAttribute("data-dfTabIndexCount");
            }else{
                eElem.setAttribute("data-dfTabIndexCount", parseInt(eElem.getAttribute("data-dfTabIndexCount"), 10) - 1);
            }
        }
    }
},

/*
Hides plugins inside the element in Internet Explorer by removing them from the document object 
model. Internet Explorer has problems doing that by itself.  It will return an array with 
information which can be used to restore the elements into the DOM. 

@param  eElem    The element to search.
@return Array with details for restorePlugins.
*/
hidePlugins : function(eElem){
    var aElems, i, aHidden = [];
    
    //  Only for Internet Explorer
    if(df.sys.isIE){
        //  Find problematic elements
        aElems = df.dom.query(eElem, "iframe, object, embed", true);
        
        for(i = 0; i < aElems.length; i++){
            eElem = aElems[i];
            
            //  Check if not already hidden
            if(eElem.getAttribute("data-df-hiddenplugin") !== "yes"){
                
                //  Remember
                aHidden.push(eElem);
                
                //  Hide
                eElem.style.display = "none";
                
                //  Mark as already hidden
                eElem.setAttribute("data-df-hiddenplugin", "yes");
            }
        }
    }
    
    return aHidden;
},

/*
Restores plugin elements that are hidden by hidePlugins. It inserts the elements back into the DOM 
based on the passed details.

@param  aHidden     Details of the hidden elements as it is returned by hidePlugins.
*/
restorePlugins : function(aHidden){
    var i;
    
    for(i = 0; i < aHidden.length; i++){
        //  Display
        aHidden[i].style.display = "";
        
        //  Unmark
        aHidden[i].removeAttribute("data-df-hiddenplugin");
    }
},


/*
Bubbles up in the dom measuring the total offsets until the next absolute
(or fixed) positioned element in the DOM. This is are values that can be used
as the style.left and style.top to position an absolute (or fixed) element on
the same position.

@param  eElement The object to get offset(s) from.
@return Object { top : 500, left : 500 } with the offset values.
*/
getAbsoluteOffset : function(eElement){
    var oReturn = { left : 0, top : 0 }, bFirst = true;

    if (eElement.offsetParent){
        while (eElement && (bFirst || df.sys.gui.getCurrentStyle(eElement).position !== "absolute") && df.sys.gui.getCurrentStyle(eElement).position !== "fixed" && df.sys.gui.getCurrentStyle(eElement).position !== "relative"){
            bFirst = false;
            oReturn.top += eElement.offsetTop;
            oReturn.left += eElement.offsetLeft;
            eElement = eElement.offsetParent;
        }
    }else if (eElement.y){
        oReturn.left += eElement.x;
        oReturn.top += eElement.y;
    }

    return oReturn;

},

/*
@return The full display width (of the frame / window).
*/
getViewportHeight : function(){
    if (window.innerHeight !== undefined){
        return window.innerHeight;
    }

    if (document.compatMode === "CSS1Compat"){
        return document.documentElement.clientHeight;
    }
    if (document.body){
        return document.body.clientHeight;
    }
    return null;
},

/*
@return The full display height (of the frame / window).
*/
getViewportWidth : function(){
    if (document.compatMode === 'CSS1Compat'){
        return document.documentElement.clientWidth;
    }
    if (document.body){
        return document.body.clientWidth;
    }
    if (window.innerWidth !== undefined){
        return window.innerWidth;
    }
    
    return null;
},

/*
Determines the 'real size' of the element.

@return Object with width and height property.
*/
getSize : function(eElem){
    if(df.sys.isIE || df.sys.isWebkit){
        return { width : eElem.offsetWidth, height : eElem.offsetHeight };
    }
    var oStyle = df.sys.gui.getCurrentStyle(eElem);
    return { width : parseInt(oStyle.getPropertyValue("width"), 10), height : parseInt(oStyle.getPropertyValue("height"), 10) };
},


/*
Returns the current or computed style of the DOM element.

@param  eElem    Reference to a DOM element.
@return The browsers current style element.
*/
getCurrentStyle : function(eElem){
    return (typeof(window.getComputedStyle) === "function" ? window.getComputedStyle(eElem, null) : eElem.currentStyle);
},

getContentHeight : function(eElem){
    var iHeight = 0, oStyle = df.sys.gui.getCurrentStyle(eElem);
    
    iHeight = eElem.clientHeight;
    
    iHeight -= parseInt(oStyle.paddingTop, 10) || 0;
    iHeight -= parseInt(oStyle.paddingBottom, 10) || 0;
    
    return iHeight;
},

/*

@param  iOptType    (optional) 0 = all (padding + margin + border), 1 = outside (margin + border), 
                    2 = inside (padding)
*/
getVertBoxDiff : function(eElem, iOptType){
    var iDiff = 0, oStyle = df.sys.gui.getCurrentStyle(eElem);
    
    iOptType = iOptType || 0;
    
    if(iOptType === 0 || iOptType === 1){
        iDiff += parseFloat(oStyle.marginTop) || 0;
        iDiff += parseFloat(oStyle.borderTopWidth) || 0;
    }
    if(iOptType === 0 || iOptType === 2){
        iDiff += parseFloat(oStyle.paddingTop) || 0;
    }
    
    if(iOptType === 0 || iOptType === 1){
        iDiff += parseFloat(oStyle.marginBottom) || 0;
        iDiff += parseFloat(oStyle.borderBottomWidth) || 0;
    }
    if(iOptType === 0 || iOptType === 2){
        iDiff += parseFloat(oStyle.paddingBottom) || 0;
    }
    
    return iDiff;
},

/*

@param  iOptType    (optional) 0 = all (padding + margin + border), 1 = outside (margin + border), 
                    2 = inside (padding)
*/
getHorizBoxDiff : function(eElem, iOptType){
    var iDiff = 0, oStyle = df.sys.gui.getCurrentStyle(eElem);
    
    iOptType = iOptType || 0;
    
    if(iOptType === 0 || iOptType === 1){
        iDiff += parseFloat(oStyle.marginLeft) || 0;
        iDiff += parseFloat(oStyle.borderLeftWidth) || 0;
    }
    if(iOptType === 0 || iOptType === 2){
        iDiff += parseFloat(oStyle.paddingLeft) || 0;
    }
    
    if(iOptType === 0 || iOptType === 1){
        iDiff += parseFloat(oStyle.marginRight) || 0;
        iDiff += parseFloat(oStyle.borderRightWidth) || 0;
    }
    if(iOptType === 0 || iOptType === 2){
        iDiff += parseFloat(oStyle.paddingRight) || 0;
    }
    
    return iDiff;
},

/* 
Cross browser method for getting a boundingclientrect object.

@param  eElem   The DOM element.
@return Bounding rectangle object { top:x, right:x, bottom:x, left:x, width:x, height:x }.
*/
getBoundRect : function(eElem){
    var oR = eElem.getBoundingClientRect();
    
    if (typeof oR.width !== 'number') {  //  Internet Explorer 8 doesn't support width & height
        return {
            top : oR.top,
            right : oR.right,
            bottom : oR.bottom,
            left : oR.left,
            width : oR.right - oR.left,
            height : oR.bottom - oR.top
        }
    }
    
    return oR;
},

/*
Sets the CSS class of the body element with a class name that indicates the used
browser. The used classnames are df-ie, df-safari, df-chrome, df-opera,
df-mozilla for the different browsers. For internet explorer the extra
classnames df-ie6, df-ie7, df-ie8 are also attached. Browsers using the
webkit engine (like chrome and safari) also get the df-webkit class.

The function is called automatically after loading. It uses the df.sys.is.. and
df.sys.iVersion indicators to determine browser versions.
*/
initCSS : function(){
    var sClass;

    if(df.sys.isIE){
        sClass = "df-ie";
        
        sClass = "df-ie" + (df.sys.iVersion <= 6 ? " df-ie6" : (df.sys.iVersion <= 7 ? " df-ie7" : (df.sys.iVersion <= 8 ? " df-ie8" : " df-ie9")));
    }else if(df.sys.isSafari){
        sClass = "df-safari";
    }else if(df.sys.isChrome){
        sClass = "df-chrome";
    }else if(df.sys.isOpera){
        sClass = "df-opera";
    }else if(df.sys.isMoz){
        sClass = "df-mozilla";
    }

    if(df.sys.isWebkit){
        sClass += " df-webkit";
    }

    document.body.className = document.body.className + " " + sClass;
},

/* 
Checks if the element is on the screen by looking at the scrollbar positions. It doesn’t check if 
the the element (or one of its parent elements) are visible or not. 

TODO: Extend with support for horizontal scrolling.
TODO: Check what happens if one of the parents was made invisible using display or visibility.

@param  eElem    DOM Element.
*/
isOnScreen : function(eElem){
    var iTop, iBottom, iLeft, iRight, iHeight;
    
    iTop = eElem.offsetTop;
    iLeft = eElem.offsetLeft;
    iHeight = eElem.offsetHeight;
    
    while(eElem = eElem.offsetParent){
        if(eElem.scrollTop > iTop + iHeight || eElem.scrollTop + eElem.clientHeight < iTop){
            return false;
        }
        
        iTop = iTop - eElem.scrollTop + eElem.offsetTop;
        iLeft = iLeft - eElem.scrollLeft + eElem.offsetLeft;
    }
    
    return true;
}

},

/*
Library object that contains several string functions that seem to be missing
the in the ECMAScript standard.
*/
string : {

/*
Removes spaces before and after the given string.

@param  sString	    String to trim.
@return Trimmed string.
*/
trim : function(sString){
    return sString.replace(/^\s+|\s+$/g,"");
},

/*
Removes spaces before the given string.

@param  sString	String to trim.
@return Trimmed string.
*/
ltrim : function(sString){
    return sString.replace(/^\s+/,"");
},

/*
Removes spaces after the given string.

@param  sString	String to trim.
@return Trimmed string.
*/
rtrim : function(sString){
    return sString.replace(/\s+$/,"");
},

/*
Modifies the casing of the value string according to the sample string.

@param  sValue  String of which the casing is adjusted.
@param  sSample String determining the casing.
@return String with the modified casing.
*/
copyCase : function(sValue, sSample){
    var bUpper, iChar, sResult = "";

    for(iChar = 0; iChar < sValue.length; iChar++){
        bUpper = (iChar < sSample.length ? sSample.charAt(iChar) === sSample.charAt(iChar).toUpperCase() : bUpper);

        sResult += (bUpper ? sValue.charAt(iChar).toUpperCase() : sValue.charAt(iChar).toLowerCase());
    }

    return sResult;
},

/*
Encodes special HTML characters so the string can safely be send in an XML message or displayed as 
source in the page.

@param  sValue  String containing HTML code.
@return String containing the encoded HTML.
*/
encodeHtml : function(sValue){
    return (sValue || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

},

/*
Function that doesn't do anything. It is used in some situations where
something needs to be called.
*/
nothing : function(){

}

};


/*
Performing the version checks. In most situations we try to use object
detection, but sometimes we still need version checks.
*/
if(navigator.userAgent.indexOf("Trident") >= 0){
    df.sys.isIE = true;
    if(document.documentMode){
        df.sys.iVersion = document.documentMode;
    }else if(navigator.appVersion.indexOf("MSIE") >= 0){
        df.sys.iVersion = parseInt(navigator.appVersion.substr(navigator.appVersion.indexOf("MSIE") + 4), 10);
    }else{
        df.sys.iVersion = parseInt(navigator.appVersion.substr(navigator.appVersion.indexOf("rv:") + 3), 10);
    }
}else if(navigator.userAgent.indexOf("Chrome") >= 0){
    df.sys.isChrome = true;
    df.sys.iVersion = parseFloat(navigator.appVersion.substr(navigator.appVersion.indexOf("Chrome/") + 7));
}else if (navigator.userAgent.indexOf("Safari") >= 0){
    df.sys.isSafari = true;
    df.sys.iVersion = parseFloat(navigator.appVersion.substr(navigator.appVersion.indexOf("Version/") + 8));
}else if (navigator.product === "Gecko"){
    df.sys.isMoz = true;
    df.sys.iVersion = parseFloat(navigator.userAgent.substr(navigator.userAgent.indexOf("Firefox/") + 8));
}else if (navigator.userAgent.indexOf("Opera") >= 0){
    df.sys.isOpera = true;
    df.sys.iVersion = parseFloat(navigator.appVersion);
}else{
    df.sys.isIE = true;
    df.sys.iVersion = parseInt(navigator.appVersion.substr(navigator.appVersion.indexOf("MSIE") + 4), 10);
    
    if(document.documentMode){
        df.sys.iVersion = document.documentMode;
    }
}

if (navigator.userAgent.indexOf("AppleWebKit") >= 0){
    df.sys.isWebkit = true;
}

//  Make sure that the autoInit function after the DOM is initialized (Which can be in the future but also can be right now)
df.dom.ready(df.sys.gui.initCSS);