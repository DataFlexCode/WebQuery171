/*
Name:
    df.sys.json
Type:
    Library (static object)
Revisions:
    2011/08/02  Refactored to df.sys.json. (HW, DAW)
    2009/06/02  Created the initial version. (HW, DAE)
*/

/*
Library that contains the functionality to serialize and parse JSON strings to 
JavaScript objects. Functions and properties starting with a double underscore 
are skipped. If the browser supports native JSON.stringify and JSON.parse 
methods these are used (Like IE 8+ and FireFox 3.1+). For parsing the JSON the 
JSON.parse method is used. Dates are serialized into strings and parsed as 
string.
*/
df.sys.json = {

/*
Deserializes a JSON string into a object structure. It uses the native 
JSON.parse function if it is available. Otherwise it will perform a few checks 
(to make sure the string is save for eval) and then use eval.

@param  sString String with JSON.
@return Object structure.
*/
parse : function(sString){
    if(typeof JSON === "object" && typeof JSON.parse === "function"){
        return JSON.parse(sString);
    }

    //  Replace characters that JavaScript doesn't handle very well
    this.oDecodeRegex.lastIndex = 0;
    if (this.oDecodeRegex.test(sString)) {
        sString = sString.replace(this.oDecodeRegex, function (sVal, iPos) {
            return '\\u' +
                ('0000' + sVal.charCodeAt(0).toString(16)).slice(-4);
        });
    }
    
    //  Test if JSON is save to eval
    if (this.validate(sString)) {
        return eval("(" + sString + ")");
    }
    throw new SyntaxError('JSON.parse');
},

/*
Checks if string contains valid JSON that is save for eval.

@param  sJSON   String with JSON.
@return True if the string contains valid JSON save for eval.
*/
validate : function(sJSON){
    return (/^[\],:{}\s]*$/.
            test(sJSON.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
            replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, '')));
},

/*
Serializes JavaScript object structure into a JSON string. It uses the native 
JSON.stringify function if it is available. Note that properties starting with 
double underscores are skipped.

@param  oObject Reference to the object to be serialized.
@return String with JSON.
*/
stringify  : function(oObject){
    // If native support is available we will use it
    // FIX: except for Internet Explorer 8 which has a bug serializing "" to "null" if the value comes from the value property of an input DOM element
    if(typeof JSON === "object" && typeof JSON.stringify === "function" && (!df.sys.isIE || (df.sys.iVersion > 8))){
        // Call native JSON stringify function 
        // replacer function is given to make sure properties with "__" are skipped
        return JSON.stringify(oObject, function(sKey, sValue){
            return (typeof sKey === "string" && sKey.substr(0, 2) === "__" ? undefined : sValue);
        });
    }
    //  Call our own recursive JSON functions
    var aResult = [];
    
    this.switchToJson(oObject, aResult);
    
    return aResult.join("");
},



/*
Determines the type of the object and then calls the correct function for that.

@param  object  The object to serialize.
@param  aResult Array with the resulting string parts.
@private
*/
switchToJson : function(object, aResult){
    switch(df.sys.ref.getType(object)){
        case "array":
            this.arrayToJson(object, aResult);
            break;
        case "string":
            this.stringToJson(object, aResult);
            break;
        case "number":
            this.numberToJson(object, aResult);
            break;
        case "boolean":
            this.booleanToJson(object, aResult);
            break;
        case "date":
            this.dateToJson(object, aResult);
            break;
        case "null":
            aResult.push("null");
            break;
        default:
            this.objectToJson(object, aResult);
            break;
    }
},

/*
Serializes an object to a JSON string { "<prop>" : <value>, "<prop>", <value> }
calling the switchToJson function to serialize the values. 

@param  oObj    Reference to the object to serialize.
@param  aResult Reference to the array to which the resulting strings are added.
@private
*/
objectToJson : function(oObj, aResult){
    var sProp, bFirst = true;
    
    
    if(oObj !== null && oObj !== undefined){
        aResult.push("{");
        for(sProp in oObj){
            if(typeof(oObj[sProp]) !== "function" && sProp.substr(0, 2) !== "__"){
                if(!bFirst){
                    aResult.push(",");
                }
                aResult.push('"');
                aResult.push(sProp);
                aResult.push('":');
                
                this.switchToJson(oObj[sProp], aResult);
                bFirst = false;
           }
        }
        aResult.push("}");
    }
    
},

/*
Loops through the items in the array and creates an XML element for them. It 
uses the df.sys.ref.getType to determine the tagname of the elements. switchToXML 
is called serialize the items itself.

@param  aArray  Reference to the array object that needs to be serialized.
@param  aResult Reference to the array with the resulting strings so far.
@private
*/
arrayToJson : function(aArray, aResult){
    var iItem, bFirst = true;
    
    aResult.push("[");
    
    for(iItem = 0; iItem < aArray.length; iItem++){
        if(!bFirst){
            aResult.push(",");
        }

        this.switchToJson(aArray[iItem], aResult);
        bFirst = false;
    }
    
    aResult.push("]");
},

/*
Special characters and their replacements.

@private
*/
oEncodeChars : {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"' : '\\"',
    '\\': '\\\\'
},


/*
Encodes a string value into JSON.

@param sString  The string value to convert to XML.
@param aResult  Reference to array containing the resulting string parts.
@private
*/
stringToJson : function(sString, aResult){
    aResult.push('"');
    
    //  Check if and replace special character
    this.oEncodeRegex.lastIndex = 0;
    if (this.oEncodeRegex.test(sString)){
        sString = sString.replace(this.oEncodeRegex, function(sValue, iPos){
            var sRep = df.sys.json.oEncodeChars[sValue];
            return (typeof sRep === "string" ? sRep : '\\u' + ('0000' + sValue.charCodeAt(0).toString(16)).slice(-4));
        });
    }
    
    aResult.push(sString);
    aResult.push('"');
},

/*
Encodes a boolean value to JSON.

@param  bBool   Boolean
@return "true" or "false"
@private
*/
booleanToJson : function(bBool, aResult){
    aResult.push(String(bBool));
},

/*
Encodes a numeric value to JSON.

@param  nNumber Number.
@return For example "32.121".
@private
*/
numberToJson : function(nNumber, aResult){
    aResult.push((isFinite(nNumber) ? String(nNumber) : nNumber));
},

/*
Encodes a date value to JSON.

@param  dDate   Date object containing date.
@return Date as a string like "2009-06-02T14:55:24Z"
@private
*/
dateToJson : function(dDate, aResult){
    aResult.push('"');
    aResult.push(dDate.getUTCFullYear());
    aResult.push("-");
    aResult.push(df.sys.math.padZero(dDate.getUTCMonth() + 1, 2));
    aResult.push('-');
    aResult.push(df.sys.math.padZero(dDate.getUTCDate(), 2));
    aResult.push('T');
    aResult.push(df.sys.math.padZero(dDate.getUTCHours(), 2));    
    aResult.push(':');
    aResult.push(df.sys.math.padZero(dDate.getUTCMinutes(), 2));
    aResult.push(':');
    aResult.push(df.sys.math.padZero(dDate.getUTCSeconds(), 2));
    aResult.push('Z');
    aResult.push('"');
}

};

/*
Regular expression used to find special characters to replace them in the JSON 
string.

@private
*/
df.sys.json.oEncodeRegex = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
/*
Regular expression used to find special characters to replace them before 
performing the eval.

@private
*/
df.sys.json.oDecodeRegex = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;