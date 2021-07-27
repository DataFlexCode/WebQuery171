/*
Name:
    df.ajax.JSONCall
Type:
    Class
Extends:
    df.ajax.HttpRequest

Extends the HttpRequest with specific functionally for calling JSON WebServices built with DataFlex.   
    
Revisions:
    2009/06/03  Created the JSONCall based on the HttpRequest and the new 
    jsonSerializer which calls the VDF 2009 JSON webservices. (HW, DAE)
    
    2008/01/16  Created the initial prototype with functionallity from the old 
    XmlRequest object which covered the SoapCall and the HttpRequest 
    functionallity in the 1.x versions. (HW, DAE)
    
    2012/04/14  Extended the component with support for sending JSON to the server introduced in 
    Visual DataFlex 17.1. (HW, DAW)
*/

/*
Constructor that initializes the settings with the given values.

@param  sFunction   The name of the webservice method that should be called.
@param  oParams     Object with the parameters { <param1> : <value>, <param2>, 
                    <value>}.
@param  sUrl        (default: WebService.wso) Url to the webservice.
*/
df.ajax.JSONCall = function JSONCall(sFunction, oParams, sUrl, oSource){
    if(sUrl === undefined || sUrl === null){
        sUrl = "WebService.wso";
    }
    df.ajax.JSONCall.base.constructor.call(this, sUrl, null, oSource);
    
    /*
    The webservice function that should be called.
    */
    this.sFunction = sFunction;
    /*
    Object with the function parameters. The property names should match the 
    parameter names.
    */
    this.oParams = oParams || {};
    /*
    If set to false a GET request will be made instead of a POST request. It is 
    advised to use POST requests due to limitation in the amount and length of 
    parameters that can be passed in the URL.
    */
    this.bUsePOST = true;
    /*
    If set to false the URL won't be extended with the "methodname/JSON" part. 
    The "methodname/JSON" part is added to the URL since Visual DataFlex web 
    services respond with JSON instead of SOAP if "methodname/JSON" is added.
    */
    this.bExtendURL = true;
    
    this._oJSON = null;
};
/*
This class contains the functionality to send an AJAX JSON call to the server. 
It does this according to the standards of the Visual DataFlex JSON services. 
Usually a http POST is made which means that the parameters are added to the 
body of the request but it can also be switched to GET which will add the 
parameters to the URL. Note that only primitive types can be used as parameters. 
This means that only string, integer and boolean types are supported. The return 
value can be a complex type and will be deserialized into an object structure. 
When complex parameters are required the df.ajax.SoapCall class should be used 
to send the call.

Server (inside Web Service Object):
@code
Struct TCarInfo
    String sFullName
    Integer iHorsePower
    String sEngine
End_Struct


{ Published = True  }
{ Description = ""  }
Function CarDetails String sBranch String sType Returns TCarInfo
    TCarInfo tResult
    
    If (sBranch = "BMW" and sType = "X5") Begin
        Move "BMW X5" to tResult.sFullName
        Move 153 to tResult.iHorsePower
        Move "V8 3.0L" to tResult.sEngine
    End
    
    Function_Return tResult
End_Function
@code

Client:
@code
function loadCarDetails(sBranch, sType){
    var oCall;
    
    oCall = new df.ajax.JSONCall("AutoDetails");
    oCall.addParam("sBranch", sBranch);
    oCall.addParam("sType", sType);
    oCall.onFinished.addListener(handleCarDetails);
    oCall.send(true);
}

function handleCarDetails(oEvent){
    var oResult = oEvent.oSource.getResponseValue();
    
    if(oResult.sFullName !== ""){
        alert("Car " + oResult.sFullName + " has a " + oResult.sEngine + " with " + String(oResult.iHorsePower) + "HP");
    }else{
        alert("Car not found!");
    }
}

loadCarDetails('BMW', 'X5');
@code
*/
df.defineClass("df.ajax.JSONCall", "df.ajax.HttpRequest", {

/*
Adds a parameter for the function call. Note that we can only use simple values 
which are all send as string.

@param  sName   Name of the parameter.
@param  sValue  Value of the parameter.
*/
addParam : function(sName, sValue){
    this.oParams[sName] = sValue;
},

/*
Augments the setHeaders method with the functionality that sets the 
"Content-Type" header to "application/x-www-form-urlencoded" when the call is 
made as a POST request.

@param  oLoader     Reference to the XmlHttpRequest object.
@private
*/
setHeaders : function(oLoader){
    df.ajax.JSONCall.base.setHeaders.call(this, oLoader);

    if(this.bUsePOST){
        oLoader.setRequestHeader("Content-Type", "application/json");
    }
},

/*
Overrides the orrigional method of HttpRequest 

@private
*/
getData : function(){
    if(this.bUsePOST){
        //  Append parameters
        return df.sys.json.stringify(this.oParams);
    }
    return null;
},

/*
Augments the getRequestUrl with the functionallity that adds the parameters and 
the /JSON extension.

@return The complete URL to which the request is send.
*/
getRequestUrl : function(){
    var sUrl, sParam, aParams = [];
    
    //  Call super method for start URL
    sUrl = df.ajax.JSONCall.base.getRequestUrl.call(this);
    
    //  Append /JSON
    if(sUrl.indexOf("/JSON") >= 0){
        sUrl = sUrl.replace("/JSON", "/" + this.sFunction + "/JSON");
    }else{
        if(sUrl.indexOf("?") >= 0){
            sUrl = sUrl.replace("?", "/" + this.sFunction + "/JSON");
        }else{
            sUrl = sUrl + (sUrl.charAt(sUrl.length - 1) !== "/" ? "/" : "") + this.sFunction + "/JSON";
        }
    }
    
    if(!this.bUsePOST){
        //  Append parameters
        for(sParam in this.oParams){
            if(this.oParams.hasOwnProperty(sParam)){
                aParams.push((aParams.length <= 0 && sUrl.indexOf("?") < 0 ? "?" : "&"));
                aParams.push(encodeURIComponent(sParam));
                aParams.push("=");
                aParams.push(encodeURIComponent(String(this.oParams[sParam])));
            }
        }
    
        //  Return the url
        return sUrl + aParams.join("");
    }
    return sUrl;
},

/*
Override getResponseXml to return null.

@return null
*/
getResponseXml : function(){
    return null;
},

/*
Checks if the webservice returned any errors after calling the checkErrors 
method from the super prototype.

@return True if no errors are found.
@private
*/
checkErrors : function(){
    var tError;

    if(this.oLoader.status === 500){
        try{
            tError = df.sys.json.parse(this.getResponseText());
        }catch(oErr){
        
        }
        
        if(tError && tError.errorCode){
            throw new df.Error(999, tError.errorDescription, this, [], null, false, false, "Server returned HTTP error 500");
        }
    }

    df.ajax.JSONCall.base.checkErrors.call(this);
},

/*
Searches the result node in the response and deserializes the value into 
objects.

@return Object presentation of the response.
*/
getResponseValue : function(){
    var sJSON = this.getResponseText();
    
    
    return df.sys.json.parse(sJSON);
}

});