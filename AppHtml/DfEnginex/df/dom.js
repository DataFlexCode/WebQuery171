/*
Name:
    df.dom
Type:
    Library (object)

This library contains a generic layer of methods that perform Document Object Model (DOM) 
manipulations in a browser independent manner. It also extends the browser API with functionality 
that makes it easier to work with the DOM.
    
Revisions:
    2011/08/10 (HW, DAW)
        Initial version splitted from the df.sys library.
*/
df.dom = {

/*
Selector string for usage with df.dom.query that gives all elements that can have the focus.

@private
*/
cFocusSelector : 'a, button, textarea, input, iframe, select, *[tabindex]',

/* 
Counter for unique DOM ID's.

@private
*/
piDomCounter : 0,

/* 
Generates a unique ID using a counter. These unique ID's can be used by controls whenever a 
generated id is necessary.

@return String with unique ID.
*/
genDomId : function(){
    return "df:" + this.piDomCounter++;
},

/*
Adds one or more classes to the elements className. Make sure the added classes 
aren't already applied.

@param  eElem   The element.
@param  sClass  Space separated list of CSS class names.
*/
addClass : function(eElem, sClass){
    var aClasses, sClassName, i;
    if(eElem.className){
        aClasses = (sClass || "").split(/\s+/);
        sClassName = " " + eElem.className + " ";
        for(i = 0; i < aClasses.length; i++){
            if(sClassName.indexOf(" " + aClasses[i] + " ") < 0){
                sClassName += " " + aClasses[i];
            }
        }
        eElem.className = df.sys.string.trim(sClassName);
    }else{
        eElem.className = sClass;
    }
},

/*
Removes one or more classes from the elements className.

@param  eElem   The element.
@param  sClass  Space separated list of CSS class names.
*/
removeClass : function(eElem, sClass){
    var aClasses, sClassName, i;
    if(eElem.className){
        sClass = " " + sClass + " ";
        aClasses = eElem.className.split(/\s+/);
        sClassName = "";
        for(i = 0; i < aClasses.length; i++){
            if(sClass.indexOf(" " + aClasses[i] + " ") < 0){
                sClassName += " " + aClasses[i];
            }
        }
        eElem.className = df.sys.string.trim(sClassName);
    }
},

toggleClass : function(eElem, sClass, bVal){
    if(bVal){
        this.addClass(eElem, sClass);
    }else{
        this.removeClass(eElem, sClass);
    }
},

createCSSElem : function(sFile){
	var eStyle  = document.createElement('link');
	eStyle.rel = 'stylesheet';
	eStyle.type = 'text/css';
	eStyle.href = sFile;
    
    return eStyle;
},

/*
Sets the text / content of the element.

@param  eElem    DOM Element.
@param  sValue      The new text.
*/
setText : function(eElem, sValue){
    if(sValue === " "){
        eElem.innerHTML = "&nbsp;";
    }else{
        //  Replace \n\r with newline (note that we only add the newline character and not the carriage return because WebKit will add a two newlines)
        sValue = sValue.toString().replace(/\\n\\r/gi, '\n');

        //  Set the innerText property
        if(eElem.innerText !== undefined){
            eElem.innerText = sValue;
        }else{
            eElem.textContent = sValue;
        }
    }
},

/*
Gets the text / content of the element.

@param  eElem    DOM Element.
@return The content text.
*/
getText : function(eElem){
    if(eElem.innerText !== undefined){
        return eElem.innerText;
    }
    
    return eElem.textContent;
},

/*
This is a browser independent method to fetch the outerHTML of a DOM element. If the browser doesn't 
support the outerHTML property the method will generate a temporary element and use the innerHTML 
attribute.

@param  eElem   Reference to a DOM element.
@return The outerHTML of the element (null if not available).
*/
getOuterHTML : function(eElem){
	var eParent, eFake, sHTML;
	
	if(eElem.outerHTML){
		return eElem.outerHTML;
	}
    if(eElem.parentNode){
		eParent = eElem.parentNode;
		eFake = document.createElement(eParent.tagName);

		eFake.appendChild(eElem);
		sHTML = eFake.innerHTML;
		eParent.appendChild(eElem);

		return sHTML;
	}
    return null;
},

/*
Makes an exact clone of the given element and its sub element. It uses the 
cloneNode method of the DOM but goes through the structure to "repair" the 
flaws of the cloneNode method.

@param  eOrig   The element to clone.
@return Clone of the element (and its children).
*/
deepClone : function(eOrig){
    var eClone, fChecker;

    eClone = eOrig.cloneNode(true);
    
    fChecker = function(eClone, eOrig){
        var iChild;
        
        if(eClone.tagName === "SELECT" || eClone.tagName === "TEXTAREA"){
            eClone.value = eOrig.value;
        }
        
        for(iChild = 0; iChild < eClone.childNodes.length; iChild++){
            if(eClone.childNodes[iChild].nodeType !== 3 && eClone.childNodes[iChild].nodeType !== 8){
                fChecker(eClone.childNodes[iChild], eOrig.childNodes[iChild]);
            }
        }
    };
    
    fChecker(eClone, eOrig);
    
    return eClone;
},

/*
Replaces the node with the new one.

@param  eOrig   DOM Node to be replaced.
@param  eNew    New DOM node.
*/
swapNodes : function(eOrig, eNew){
    if (eOrig){
        if (eNew){
            if(eOrig.replaceNode !== undefined){
                eOrig.replaceNode(eNew);
            }else{
                eOrig.parentNode.replaceChild(eNew, eOrig);
            }
        }
    }
},

/*
Inserts the new element into the DOM after the given element.

@param eNewElement  The new element to insert.
@param eElem     The element to insert after.
*/
insertAfter : function(eNewElement, eElem){
    if(eElem.nextSibling !== null){
        eElem.parentNode.insertBefore(eNewElement, eElem.nextSibling);
    }else{
        eElem.parentNode.appendChild(eNewElement);
    }
},

/*
Recursive function that checks if the searched element is a parent of the
start element.

@param  eStart  Start element.
@param  eSearch Searched element.
@return True if the searched element is a parent.
*/
isParent : function(eStart, eSearch){
    if(eStart === null){
        return false;
    }
    if(eStart === eSearch){
        return true;
    }
    if(eStart.parentNode !== undefined){
        return this.isParent(eStart.parentNode, eSearch);
    }
    return false;
},

/*
Returns the a parent object (or itself) with the requested tagname

@param  eElem       Element where to startt the search.
@param  sTagName    Tagname of searched object.
@return First parent with the given tagname (null if not found).
*/
searchParent : function(eElem, sTagName){
    sTagName = sTagName.toUpperCase();

    if(eElem.tagName === sTagName){
        return eElem;
    }
    if(eElem.parentNode !== undefined && eElem !== document){
        return this.searchParent(eElem.parentNode, sTagName);
    }
    return null;
},

/*
Gives the focus to the given element. It has a try catch block because some
browsers tend to throw strange errors here. It also calls the setActive method
if it is available.

@param  eElem    Reference to the DOM element that should receive the focus.
@param  bSelect     If true the content of the element will also be selected.
*/
focus : function(eElem, bSelect){
    try {
        eElem.focus();
        if(bSelect && eElem.select){
            eElem.select();
        }
        
        if(typeof(eElem.setActive) === "function"){
            eElem.setActive();
        }
    } catch (err) {
        //ignore focus error
    }


},

/*
Tries to determine the current caret position of the text field.

@param  eField  Reference to the field DOM element.
@return The caret position (0 if not found).
*/
getCaretPosition : function(eField) {
    // Initialize
    var oSelection, oSelection2, iSelection;

    try{
        // IE Support
        if(document.selection){
            if (eField.tagName.toLowerCase() === "textarea"){
                oSelection = document.selection.createRange();
                oSelection2 = oSelection.duplicate();
                
                oSelection2.moveToElementText(eField);
                oSelection2.setEndPoint('StartToEnd', oSelection);
                
                return eField.value.length - oSelection2.text.length;
            }
            // Set focus on the element
            eField.focus();

            // To get cursor position, get empty selection range
            oSelection = document.selection.createRange();

            iSelection = oSelection.text.length;

            // Move selection start to 0 position
            oSelection.moveStart('character', -eField.value.length);

            // The caret position is selection length
            return oSelection.text.length - iSelection;
        }
        if(eField.selectionStart || eField.selectionStart === 0){  // Firefox support
            return eField.selectionStart;
        }

    }catch (e){

    }

    // Return results
    return 0;
},

/*
Determines the length of the selection.

@param  eField  Reference to a DOM element (usually a input type="text").
@return Length of the selection (0 if no selection).
*/
getSelectionLength : function(eField){
    var oBookmark, oSelection;

    try{
        if(eField.selectionStart || eField.selectionStart === 0){ //  Mozilla / Opera / Safari / Chrome
            return eField.selectionEnd - eField.selectionStart;
        }
        if(document.selection){ //  Internet Explorer
            oBookmark = document.selection.createRange().getBookmark();
            oSelection = eField.createTextRange();
            oSelection.moveToBookmark(oBookmark);

            return oSelection.text.length;
        }
    }catch (e){

    }

    return 0;
},

/*
Changes the caret position of the text field to the given position.

@param  eField  Reference to the field.
@param  iCaretPos   The new caret position.
*/
setCaretPosition : function(eField, iCaretPos){
    try{

        // IE Support
        if(document.selection){

            // Set focus on the element
            eField.focus();

            // Create empty selection range
            var oSel = document.selection.createRange();

            // Move selection start and end to 0 position
            oSel.moveStart('character', -eField.value.length);
            oSel.moveEnd('character', -eField.value.length);

            // Move selection start and end to desired position
            oSel.moveStart('character', iCaretPos);
            oSel.select();
        }else if(eField.selectionStart || eField.selectionStart === 0){ // Firefox support
            eField.selectionStart = iCaretPos;
            eField.selectionEnd = iCaretPos;
            eField.focus();
        }
    }catch (e){

    }
},

/*
Gives the focus to the first focusable child element that can receive the
focus. Is a recursive method that loops through the DOM.

@param  eElem    Reference to the DOM element.
@return First child element that can receive the focus.
*/
getFirstFocusChild : function(eElem){
    var aElems, i;

    aElems = df.dom.query(eElem, df.dom.cFocusSelector, true);

    for(i = 0; i < aElems.length; i++){
        if(aElems[i].tabIndex >= 0 && aElems[i].type !== "hidden"){
            return aElems[i];
        }
    }
    
    return null;
},

/*
This methods loops through the child elements of the DOM element and calls the 
worker method for each child element. Using this method will reduce the amount 
of code in the components and keep all checks on a single place. If the worker 
method returns false the next children won't be processed any more.

@param  eElem    Reference to the element.
@param  fWorker     Method to call for each child.
@param  oEnv        (optional) Environment object used when calling the worker.
@return False if worker stopped processing the children.
*/
visit : function(eElem, fWorker, oEnv){
    var iChild;

    //  Go into children
    if(eElem.childNodes){
        for(iChild = 0; iChild < eElem.childNodes.length; iChild++){
            if(eElem.childNodes[iChild].nodeType !== 3 && eElem.childNodes[iChild].nodeType !== 8){
                if(fWorker.call(oEnv || this, eElem.childNodes[iChild]) === false){
                    return false;
                }
            }
        }
    }
    
    return true;
},

/*
Disables the textselection for the element.

@param  eElement    Reference to DOM element.
*/
disableTextSelection : function(eElem){
    // eElement.onselectstart = function() {
        // return false;
    // };
    eElem.unselectable = "on";
    eElem.style.MozUserSelect = "none";
    eElem.style.webkitUserSelect = "none";
},

/*
Disables the textselection for the element.

@param  eElement    Reference to DOM element.
*/
enableTextSelection : function(eElem){
    // eElement.onselectstart = function() {
        // return false;
    // };
    eElem.unselectable = "off";
    eElem.style.MozUserSelect = "text";
    eElem.style.webkitUserSelect = "text";
},

/*
The passed method will be called as soon as the browser has finished initializing the Document 
Object Model (DOM) and is ready for manipulation. If the DOM was already initialized the method will 
be called right away. The sample code below shows how to make sure that a piece of code is executed 
after the DOM is ready.

@code
df.dom.ready(function(){
    //  Code executed after DOM initialization
    document.getElementById("mydiv").innerHTML = "<b>Browser is finished!</b>";
});
@code

@param  fWorker     Function that will be executed after the DOM is ready.
@param  oEnv		Environment object used when calling the worker function.

*/
ready : function(fWorker, oEnv){
    function call(){
        fWorker.call(oEnv || null);
        
        //  Cleanup
        if(window.addEventListener){ // W3C
            window.removeEventListener("load", call, false);
        }else{ // IE
            window.detachEvent("onload", call);
        }
    }

    if (document.readyState === "complete"){
        call();
    }else{
        //  Attach the listener
        if(window.addEventListener){ // W3C
            window.addEventListener("load", call, false);
        }else{ // IE
            window.attachEvent("onload", call);
        }
    }
},

/* 
This function converts a string of HTML into DOM elements. It creates a temporary div element of 
which the innerHTML is set to let the browser parse the HTML. The outermost element is returned (the 
first if there are multiple elements at root level).

@return Wrapping DOM element.
*/
create : function(sHtml){
    //var oFragment = document.createDocumentFragment();
    var eWrapper = document.createElement("div");
        
    eWrapper.innerHTML = sHtml;
    
    return eWrapper.firstChild;
},

/* 
This function searches the DOM based on a selector query. The selector query is comparable to CSS 
selectors. It searches inside the element passed as the first parameter. Depending on bOptMulti it 
will return the first match or an array with all matches. It uses the querySelector API from the 
browser.

@param  eElem       The element to search.
@param  sSelect     The selector string.
@param  bOptMulti   (optional) If true an array will be returned)

@return The first matched element or if bOptMulti is true an array with all matched elements.
*/
query : function(eElem, sSelect, bOptMulti){
    if(!bOptMulti && eElem.querySelector){
        return eElem.querySelector(sSelect);
    }
    if(eElem.querySelectorAll){
        var aRes = eElem.querySelectorAll(sSelect);
        
        if(bOptMulti){
            return aRes;
        }
        return (aRes.length > 0 ? aRes[0] : null);
    }
    /* Note: We could use Sizzle Selector library to support Internet Explorer 7 here
    
    var aRes = Sizzle(sSelect, eElem);
    
    if(bOptMulti){
        return aRes;
    }else{
        return (aRes.length > 0 ? aRes[0] : null);
    }*/
    throw new df.Error(999, "This browser doesn't support querySelectorAll");
}

};