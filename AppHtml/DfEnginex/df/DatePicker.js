/*
Class:
    df.DatePicker
Extends:
    Object
    
This class is the engine of the datepicker components. It is able to render a datepicker including 
the month & year pull down. This class is designed to be wrapped by other controls like the 
df.WebDatePicker and the df.WebDateForm.
    
Revisions:
    2006/07/01 (HW, DAE)
        Created the initial version. 
    2008/10/07 (HW, DAE)
        Complete rebuild into the 2.0 structure with focus, key control and support for the inline 
        version. 
    2012/03/16 (HW, DAW)
        Refactored into new AjaxWeb Framework for Visual DataFlex 17.1. This includes a refactor of 
        the rendering engine using the latest technique.
*/
df.DatePicker = function DatePicker(){
    this.pbShowWeekNr = true;
    this.pbShowToday = true;
    this.piStartWeekAt = 1;
    
    this.psMask = "mm/dd/yyyy";
    
    this.onChange = new df.events.JSHandler();
    this.onEnter = new df.events.JSHandler();
    this.onDateClick = new df.events.JSHandler();
    
        
    //  @privates
    this._eElem = null;
    this._eFocus = null;
    this._eBody = null;
    this._eDispMonth = null;
    this._eDispYear = null;
    
    this._dSelected = new Date();
    this._iWeekSelected = df.sys.data.dateToWeek(this._dSelected);
    this._iDisplayYear = this._dSelected.getFullYear();
    this._iDisplayMonth = this._dSelected.getMonth();
    this._iLastDisplayYear = this._iDisplayYear;
    this._iLastDisplayMonth = this._iDisplayMonth;
    
    this._oParent = null;
    
    //  Translations
    this._aMonthNames = df.lang.monthsLong;
    this._aMonthNamesShort = df.lang.monthsShort;
    this._aDaysShort = df.lang.daysShort;
    this._aDaysLong = df.lang.daysLong;

};
df.defineClass("df.DatePicker", {

// - - - - - - - - - - Calendar Rendering - - - - - - - - - - - - 

/*
This method generates the HTML before the calendar body including the year & month menus.

@param  aHtml   Array used as stringbuilder to add the HTML to.
@private
*/
openHtml : function(aHtml){
    aHtml.push(
        '<div class="WebDP">',
          '<div class="WebDP_Wrp">',
            '<div class="WebDP_Head">',
                '<div class="WebDP_BtnPrev"><span></span></div>',
                '<div class="WebDP_BtnNext"><span></span></div>',
                '<div class="WebDP_BtnYear"><span></span><div class="WebDP_YearMnu"></div></div>',
                '<div class="WebDP_BtnMonth"><span></span><div class="WebDP_MonthMnu"></div></div>',
                '<div style="clear: both;"></div>',
            '</div>',
            '<div class="WebDP_Body">'
    );
},

/*
This method generates the HTML after the calendar body including the today button.

@param  aHtml   Array used as stringbuilder to add the HTML to.
@private
*/
closeHtml : function(aHtml){
    aHtml.push(
            '</div>'
    );
    if(this.pbShowToday){
       aHtml.push(
            '<div class="WebDP_Footer">',
                '<div class="WebDP_BtnToday">', this.getWebApp().getTrans("todayIs"), ' <span></span></div>',
            '</div>'
        );
    }
    aHtml.push(
          '</div>',
        '</div>'
    );
},

/*
This method renders the control which is done separately when wrapped a control that doesn't display 
the calendar continuously. 

@return DOM element representing the date picker.
@private
*/
render : function(){
    var aHtml = [];
    
    this.openHtml(aHtml);
    this.closeHtml(aHtml);
    
    this._eElem = df.dom.create(aHtml.join(''));
    
    return this._eElem;
},

/*
Method called after rendering to get references to the DOM and attach event handlers.

@private
*/
afterRender : function(){
    this._eBody = df.dom.query(this._eElem, "div.WebDP_Body");
    this._eDispMonth = df.dom.query(this._eElem, "div.WebDP_BtnMonth > span");
    this._eDispYear = df.dom.query(this._eElem, "div.WebDP_BtnYear > span");

    if(this.pbShowToday){
        this._eDispToday = df.dom.query(this._eElem, "div.WebDP_BtnToday > span");
    }
    
    df.events.addDomListener("click", this._eBody, this.onBodyClick, this);
    df.events.addDomListener("click", df.dom.query(this._eElem, "div.WebDP_BtnNext"), this.onNextClick, this);
    df.events.addDomListener("click", df.dom.query(this._eElem, "div.WebDP_BtnPrev"), this.onPrevClick, this);
    df.events.addDomListener("click", df.dom.query(this._eElem, "div.WebDP_BtnMonth"), this.onMonthClick, this);
    df.events.addDomListener("click", df.dom.query(this._eElem, "div.WebDP_BtnYear"), this.onYearClick, this);
    
    if(this.pbShowToday){
        df.events.addDomListener("click", df.dom.query(this._eElem, "div.WebDP_BtnToday"), this.onTodayClick, this);
    }
    
    df.events.addDomKeyListener(this._eFocus, this.onKey, this);

    
    
    this.update();
    
},

/*
This method updates the display according to the current settings. It calls displayCalendar to 
re-render the calendar and it updates the year, month and today date in the header and footer.

@private
*/
update : function(){
    if(this._eElem){
        //  Update displayed month & year
        df.dom.setText(this._eDispMonth, this._aMonthNames[this._iDisplayMonth]);
        df.dom.setText(this._eDispYear, this._iDisplayYear);
        if(this.pbShowToday){
            df.dom.setText(this._eDispToday, df.sys.data.applyDateMask((new Date()), this.psMask, this.getWebApp().psDateSeparator));
        }
        
        this.displayCalendar();
    }
},

/*
This method renders the actual calendar. It will generate the HTML of the calendar table using the 
JavaScript Date object to determine the dates. If the month has changed it will add the new table to 
the DOM and set the CSS classes so that the change can be animated using CSS3 transitions. If the 
newly generated month is the same as the previous month it simply replaces the content of the body 
element to display the newly generated month.

@private
*/
displayCalendar : function(){
    var iDay, iDayPointer, aHtml = [], sCSS, dToday, dEnd, dDate, iRows, iYear, iMonth, eNew, eOld;
    
    aHtml.push('<div><table>');
    
    //  Generate dates
    iYear = this._iDisplayYear;
    iMonth = this._iDisplayMonth;
    
    dToday = new Date();
    dDate = new Date(iYear, iMonth, 1, 1, 1, 1);
    dEnd = new Date(iYear, (iMonth + 1), 1, 1, 1, 1);
    
    //  Header
    aHtml.push('<tr class="WebDP_BodyHead">');
    if(this.pbShowWeekNr){
        aHtml.push('<th class="WebDP_WeekNr">', this.getWebApp().getTrans("wk"), '</th>');
    }
    for(iDay = 0; iDay < 7; iDay++){
        sCSS = "";
        
        iDayPointer = (iDay + this.piStartWeekAt > 6 ? iDay + this.piStartWeekAt - 7 : iDay + this.piStartWeekAt);
        if(iDayPointer === 0 || iDayPointer === 6){
            sCSS = "WebDP_Weekend";
        }
        
        aHtml.push('<th class="', sCSS, '">', this.getDay(iDay, true), '</th>');
    }
    aHtml.push('</tr>');
    
    //  Calculate start date
    iDayPointer = dDate.getDay() - this.piStartWeekAt;
    if(iDayPointer < 0){
        iDayPointer = 7 + iDayPointer;
    }
    dDate.setDate(dDate.getDate() - iDayPointer);
    iDayPointer = 0;
    iRows = 0;
    
    
    //  Loop through the days
    aHtml.push('<tr>');
    
    while(dDate < dEnd || (iDayPointer < 7 && iDayPointer !== 0) || iRows < 6){
        
    
        //  Add weeknr & correct daypointer if needed
        if(iDayPointer === 0 || iDayPointer > 6){
            if(iRows > 0){
                aHtml.push('</tr><tr>');
            }
        
            iRows++;
            if(this.pbShowWeekNr){
                aHtml.push('<td class="WebDP_WeekNr">', df.sys.data.dateToWeek(dDate), '</td>');
            }
            iDayPointer = 0;
        }
        
        //  Determine styles
        sCSS = "WebDP_Day";
        if(dDate.getMonth() !== iMonth){
            sCSS += (sCSS !== "" ? " " : "") + "WebDP_Overflow";
        }
        if(dDate.getDay() === 0|| dDate.getDay() === 6){
            sCSS += (sCSS !== "" ? " " : "") + "WebDP_Weekend";
        }
        if(dDate.getDate() === this._dSelected.getDate() && dDate.getMonth() === this._dSelected.getMonth() && dDate.getFullYear() === this._dSelected.getFullYear()){
            sCSS += (sCSS !== "" ? " " : "") + "WebDP_Selected" + (this.bHasFocus ? " focussed" : "");
        }
        if(dDate.getDate() === dToday.getDate() && dDate.getMonth() === dToday.getMonth() && dDate.getFullYear() === dToday.getFullYear()){
            sCSS += (sCSS !== "" ? " " : "") + "WebDP_Today";
        }
        
        //  Generate day cell
        aHtml.push('<td class="', sCSS, '" data-date="', dDate.getDate(), '" data-month="', dDate.getMonth(), '" data-year="', dDate.getFullYear(), '">', dDate.getDate(), '</td>');
        
        //  Move to the next day
        dDate.setDate(dDate.getDate() + 1);
        iDayPointer++;
    }
        
    aHtml.push('</table></div>');
    
    //  Only use animation when moving to different month
    if(this._iLastDisplayYear === this._iDisplayYear && this._iLastDisplayMonth === this._iDisplayMonth){
        this._eBody.innerHTML = aHtml.join('');
    }else{
        
        //  Clean old month
        eOld = df.dom.query(this._eBody, ".WebDP_Old");
        if(eOld){
            this._eBody.removeChild(eOld);
        }
        
        //  Create new month
        eNew = df.dom.create(aHtml.join(''));
        eOld = this._eBody.firstChild;
        
        if(eOld){
            //  Fix dimensions for animation
            eOld.firstChild.style.width = eOld.firstChild.clientWidth + "px";
            eOld.firstChild.style.height = eOld.firstChild.clientHeight + "px";
            
            //  Set animation initial class
            df.dom.addClass(eOld, "WebDP_Old");
        }
        //  Add new month
        this._eBody.appendChild(eNew);
        //  Set animation target class
        if(eOld){
            df.dom.addClass(eOld, ((this._iLastDisplayYear < this._iDisplayYear ||  (this._iLastDisplayYear === this._iDisplayYear && this._iLastDisplayMonth < this._iDisplayMonth)) ? "WebDP_HideNext" : "WebDP_HidePrev"));
        }
    }
    
    this._iLastDisplayYear = this._iDisplayYear;
    this._iLastDisplayMonth = this._iDisplayMonth;
},


// - - - - - - - - - - Parent API - - - - - - - - - - - - 

/*
Change the currently selected date. The calendar will be refreshed with this new date.

@param  dSelected           Date object representing the new selected date.
@param  bOptNoAni           (optional) If true no animation will shown.
@param  bOptNoDisplayNow    (optional) If true it will not go to the displayed month but stay on the 
                            currently displayed date.

*/
setSelectedDate : function(dSelected, bOptNoAni, bOptNoDisplayNow){
    //  There is always a date selected!
    if(!dSelected){
        dSelected = new Date();
        this.fireChanged();
    }
    
    //  Remember selected date
    this._dSelected = dSelected;
    this._iWeekSelected = df.sys.data.dateToWeek(this._dSelected);
    
    if(!bOptNoDisplayNow){
        this._iDisplayYear = this._dSelected.getFullYear();
        this._iDisplayMonth = this._dSelected.getMonth();
        
        if(bOptNoAni){
            //  Als set the last displayed so we don't get the animation
            this._iLastDisplayYear = this._iDisplayYear;
            this._iLastDisplayMonth = this._iDisplayMonth;
        }
    }
    
    this.update();
},

/*
@return The currently selected date (as Date object).
*/
getSelectedDate : function(){
    return new Date(this._dSelected.valueOf());
},

/*
Translates a weekday number into the textual description. It takes the piStartWeekAt into account. 
Can return the long description and the short description.

@param  iDay    Day of the week.
@param  bShort  If true the short translation is returned.
@return The name of the day ('Mon' or 'Monday').
@private
*/
getDay : function(iDay, bShort){
    iDay += this.piStartWeekAt;
    if(iDay > 6){
        iDay = iDay - 7;
    }
    
    return (bShort ? this._aDaysShort[iDay] : this._aDaysLong[iDay]);
},

/*
This method handles the onClick event of the year pull down button. It will generate the month menu 
and has internal event handlers for hiding the menu and selecting the month. 

@param  oEvent  The event object.
@private
*/
onMonthClick : function(oEvent){
    var eMenu, tMenuTimeout, aHtml = [], i, sCSS, hide, that = this;
    
    eMenu = df.dom.query(this._eElem, "div.WebDP_MonthMnu");
    
    //  Handles the onclick which selects the month
    function onClick(oEvent){
        var eLI = oEvent.getTarget();
        
        if(eLI.getAttribute('data-month')){
            this._iDisplayMonth = parseInt(eLI.getAttribute('data-month'), 10);
            
            hide();
            this.update();
            this.focus();
            
            oEvent.stop();
        }
    }
    
    //  Clears the hide timeout when hovering the menu
    function onOver(oEvent){
        clearTimeout(tMenuTimeout);
    }
    
    //  Sets the hide timeout when leaving the menu
    function onOut(oEvent){
        clearTimeout(tMenuTimeout);
        tMenuTimeout = setTimeout(hide, 1200);
    }
    
    //  Hides the menu 
    hide = function hide(){
        //  Clear event listeners
        df.events.removeDomListener("click", eMenu, onClick);
        df.events.removeDomListener("mouseover", eMenu, onOver);
        df.events.removeDomListener("mouseout", eMenu, onOut);
        
        eMenu.style.display = "none";
        
        clearTimeout(tMenuTimeout);
        that._fMonthHide = null;
    };
    
    if(this._fMonthHide){
        this._fMonthHide();
    }else{
        if(this.isEnabled()){
            this._fMonthHide = hide;
            
            //  Attach event listeners
            df.events.addDomListener("click", eMenu, onClick, this);
            df.events.addDomListener("mouseover", eMenu, onOver, this);
            df.events.addDomListener("mouseout", eMenu, onOut, this);
            
            //  Generate menu
            aHtml.push('<ul>');
            for(i = 0; i < 12; i++){
                sCSS = (i === this._iDisplayMonth ? "WebDP_Current" : "");
            
                aHtml.push('<li data-month="', i, '" class="', sCSS, '">', this._aMonthNames[i], '</li>');
            }
            aHtml.push('</ul');
            
            //  Display menu
            eMenu.innerHTML =  aHtml.join('');
            eMenu.style.display = "inline";
            
            tMenuTimeout = setTimeout(hide, 2400);
        }
    }
    
    
    this.focus();    
},

/*
This method handles the onClick event of the year pull down button. It will generate the year menu 
and has internal event handlers for hiding the menu and scrolling it up and down. 

@param  oEvent  The event object.
@private
*/
onYearClick : function(oEvent){
    var eMenu, eUp, eDown, tMenuTimeout, tScrollTimeout, aHtml = [], i, iYear = this._dSelected.getFullYear(), sCSS, hide, that = this;
    
    eMenu = df.dom.query(this._eElem, "div.WebDP_YearMnu");
    
    //  Handles the onclick which selects the month
    function onClick(oEvent){
        var eLI = oEvent.getTarget();
        
        if(eLI.getAttribute('data-year')){
            this._iDisplayYear = parseInt(eLI.getAttribute('data-year'), 10);
            
            hide();
            this.update();
            this.focus();
        }
        oEvent.stop();
    }
    
    //  Clears the hide timeout when hovering the menu
    function onOver(oEvent){
        clearTimeout(tMenuTimeout);
    }
    
    //  Sets the hide timeout when leaving the menu
    function onOut(oEvent){
        tMenuTimeout = setTimeout(hide, 1200);
    }
    
    //  Scrolls the menu one year up
    function scrollUp(){
        var iYear, eNew;
        
        //  Determine new year
        iYear = eUp.nextSibling.getAttribute("data-year");
        iYear--;
        
        //  Remove old element
        eDown.parentNode.removeChild(eDown.previousSibling);
        
        //  Create and insert new element
        eNew = document.createElement("li");
        df.dom.setText(eNew, iYear);
        eNew.setAttribute("data-year", iYear);
        eUp.parentNode.insertBefore(eNew, eUp.nextSibling);
    
    }
    
    //  Scrolls the menu one year down
    function scrollDown(){
        var iYear, eNew;
        
        //  Determine new year
        iYear = eDown.previousSibling.getAttribute("data-year");
        iYear++;
        
        //  Remove old element
        eUp.parentNode.removeChild(eUp.nextSibling);
        
        //  Create and insert new element
        eNew = document.createElement("li");
        df.dom.setText(eNew, iYear);
        eNew.setAttribute("data-year", iYear);
        eDown.parentNode.insertBefore(eNew, eDown);
    }
    
    //  Initiates the menu scrolling if the button up or down is clicked
    function onScroll(oEvent){
        var fFunc, eScroll;

        //  Determine which button is clicked
        eScroll = oEvent.getTarget();
        fFunc = (eScroll === eUp ? scrollUp : scrollDown);
        
        //  Function that executes the scrolling after a timeout
        function doScroll(){
            fFunc();
            
            tScrollTimeout = setTimeout(doScroll, 35);
        }
        
        //  Perform one scroll step
        fFunc();
        
        //  Set timout
        tScrollTimeout = setTimeout(doScroll, 300);
        
        //  Display button as being held down
        df.dom.addClass(eScroll, (eScroll === eUp ? "WebDP_UpDown" : "WebDP_DownDown"));
        
        oEvent.stop();
    }
    
    //  Stops the scrolling (cancel timeout and remove CSS classes)
    function onScrollStop(oEvent){
        clearTimeout(tScrollTimeout);
        
        df.dom.removeClass(eUp, "WebDP_UpDown");
        df.dom.removeClass(eDown, "WebDP_DownDown");
        
        oEvent.stop();
    }
    
    //  Hides the menu 
    hide = function hide(){
        eMenu.style.display = "none";
        
        //  Clear event listeners
        df.events.removeDomListener("click", eMenu, onClick);
        df.events.removeDomListener("mouseover", eMenu, onOver);
        df.events.removeDomListener("mouseout", eMenu, onOut);
        df.events.removeDomListener("mousedown", eUp, onScroll);
        df.events.removeDomListener("mouseout", eUp, onScrollStop);
        df.events.removeDomListener("mouseup", eUp, onScrollStop);
        df.events.removeDomListener("mousedown", eDown, onScroll);
        df.events.removeDomListener("mouseout", eDown, onScrollStop);
        df.events.removeDomListener("mouseup", eDown, onScrollStop);
        
        clearTimeout(tMenuTimeout);
        that._fYearHide = null;
    };
    
    if(this._fYearHide){
        this._fYearHide();
    }else{
        if(this.isEnabled()){
            this._fYearHide = hide;
            
            //  Generate menu
            aHtml.push('<ul>');
            aHtml.push('<li class="WebDP_Up"></li>');
            
            for(i = this._iDisplayYear - 4; i < this._iDisplayYear + 4; i++){
                sCSS = (i === iYear ? "WebDP_Current" : "");
            
                aHtml.push('<li data-year="', i, '" class="', sCSS, '">', i, '</li>');
            }
            aHtml.push('<li class="WebDP_Down"></li>');
            aHtml.push('</ul');
            
            
            //  Display menu
            eMenu.innerHTML =  aHtml.join('');
            eMenu.style.display = "inline";
            
            //  Get references to buttons
            eUp = df.dom.query(eMenu, 'li.WebDP_Up');
            eDown = df.dom.query(eMenu, 'li.WebDP_Down');
            
            //  Attach event listeners
            df.events.addDomListener("click", eMenu, onClick, this);
            df.events.addDomListener("mouseover", eMenu, onOver, this);
            df.events.addDomListener("mouseout", eMenu, onOut, this);
            df.events.addDomListener("mousedown", eUp, onScroll, this);
            df.events.addDomListener("mouseout", eUp, onScrollStop, this);
            df.events.addDomListener("mouseup", eUp, onScrollStop, this);
            df.events.addDomListener("mousedown", eDown, onScroll, this);
            df.events.addDomListener("mouseout", eDown, onScrollStop, this);
            df.events.addDomListener("mouseup", eDown, onScrollStop, this);  
            
            tMenuTimeout = setTimeout(hide, 2400);
        }
    }
    this.focus();
},

/*
Handles the onclick event of the next button. It moves to the next month.

@param  oEvent  Event object.
@private
*/
onNextClick : function(oEvent){
    if(this.isEnabled()){
        this._iDisplayMonth++;
        if(this._iDisplayMonth >= 12){
            this._iDisplayYear++;
            this._iDisplayMonth = 0;
        }
        
        this.update();
        this.focus();
    }
},

/*
Handles the onclick event of the next button. It moves to the next month.

@param  oEvent  Event object.
@private
*/
onPrevClick : function(oEvent){
    if(this.isEnabled()){
        this._iDisplayMonth--;
        if(this._iDisplayMonth < 0){
            this._iDisplayYear--;
            this._iDisplayMonth = 11;
        }
        
        this.update();
        this.focus();
    }
},

/*
Handles the click event of one of the displayed days in the calendar. It 
selects the day, repaints the calendar and fires the onChange and onEnter 
events.

@param  oEvent  Event object.
@private
*/
onBodyClick : function(oEvent){
    var eCell = oEvent.getTarget(), dDate;
    
    if(this.isEnabled()){
        if(eCell.getAttribute("data-date")){
            dDate = new Date(parseInt(eCell.getAttribute("data-year"), 10), parseInt(eCell.getAttribute("data-month"), 10),parseInt(eCell.getAttribute("data-date"), 10), 1, 1, 1);
            
            this.setSelectedDate(dDate, false, false);
            this.fireChanged();
            this.fireEnter();
            this.fireDateClick();
            this.focus();
        }
    }
},

/*
Handles the click event of the "today" date. It selects the current date.

@param  oEvent  Event object.
@private
*/
onTodayClick : function(oEvent){
    if(this.isEnabled()){
        this._dSelected = new Date();
        this._iDisplayYear = this._dSelected.getFullYear();
        this._iDisplayMonth = this._dSelected.getMonth();
        
        this.update();
        this.fireChanged();
        this.fireEnter();
        this.fireDateClick();
        this.focus();
    }
},

/*
Handles the keypress event of focus holder element. If the pressed key matches 
one of the keys that are set it performs the action.

@param  oEvent  Event object.
@private
*/
onKey : function(oEvent){
    var dDate = this._dSelected;
    
    //  Generate key object to compare
    if(this.isEnabled()){
        if(oEvent.matchKey(df.settings.calendarKeys.dayUp)){ // Up (decrement with 7 days)
            dDate.setDate(dDate.getDate() - 7);
            this.setSelectedDate(dDate);
            this.fireChanged();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.dayDown)){ //  Down (increment with 7 days)
            dDate.setDate(dDate.getDate() + 7);
            this.setSelectedDate(dDate);
            this.fireChanged();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.dayLeft)){ // Left (decrement with one day)
            dDate.setDate(dDate.getDate() - 1);
            this.setSelectedDate(dDate);
            this.fireChanged();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.dayRight)){ // Right (increment with one day)
            dDate.setDate(dDate.getDate() + 1);
            this.setSelectedDate(dDate);
            this.fireChanged();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.monthUp)){ //  Month up
            dDate.setMonth(dDate.getMonth() + 1);
            this.setSelectedDate(dDate);
            this.fireChanged();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.monthDown)){ //    Month down
            dDate.setMonth(dDate.getMonth() - 1);
            this.setSelectedDate(dDate);
            this.fireChanged();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.yearUp)){ //   Year up
            dDate.setFullYear(dDate.getFullYear() + 1);
            this.setSelectedDate(dDate);
            this.fireChanged();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.yearDown)){ // Year down
            dDate.setFullYear(dDate.getFullYear() - 1);
            this.setSelectedDate(dDate);
            this.fireChanged();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.enter)){ //    Enter
            this.fireDateClick();
            
            if(!this.fireEnter()){   //  WebDateForm will cancel onEnter to stop submit
                oEvent.stop();
            }
        }else{
            //  We need to forward the event to our wrapper object
            this._oParent.onKey(oEvent);
        }
    }
},

/*
This method lets the wrapper (_oParent) object know that it should take the focus.

@private
*/
focus : function(){
    this._oParent.focus();
},

/*
Fires the onChange event.

@private
*/
fireChanged : function(){
    this.onChange.fire(this, { dValue : this.getSelectedDate() });
},

/*
Fires the onEnter event.

@private
*/
fireEnter : function(){
    return this.onEnter.fire(this, { dValue : this.getSelectedDate() });
},

/* 
Fires the onDateClick event.

@private
*/
fireDateClick : function(){
    this.onDateClick.fire(this, { dValue : this.getSelectedDate() });
},

/*
This method checks if the control is actually enabled by querying the wrapper object (_oParent).

@return True if the control is enabled.
@private
*/
isEnabled : function(){
    return this._oParent.pbEnabled;
},

// - - - - - - - - - - Default internal API's - - - - - - - - - 
getWebApp : function(){
    return this._oParent.getWebApp();
}

});





