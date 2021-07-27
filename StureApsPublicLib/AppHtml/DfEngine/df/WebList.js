/*
Class:
    df.WebList
Extends:
    df.WebBaseControl

This is the client-side representation of the cWebList control which shows a multi column list of 
data. The nested cWebColumn objects represent the grid columns. The cWebCheckboxColumn and 
cWebComboColumn classes will represent different types of columns. The cWebList is readonly and only 
allows the users to select a row. The cWebList can be data bound and then it will automatically find 
 records.

Where the server-side is responsible for providing the data the client-side is only responsible for 
calling the server to load the data and rendering the list. It will also call the server when the 
current row is changed. The client works with a cache that is usually bigger than the displayed 
amount of rows. It loads chunks of data on the background while scrolling and renders only a part of 
the cached data to the DOM (usually the visible rows and a few above and below). The cache usually 
isn't cleared by scrolling (except when jumping to the end of the beginning of the list). For non 
data bound lists the entire set of data is usually loaded at once because that is easier to 
implement for the application developer.
    
Revision:
    2011/12/02  (HW, DAW) 
        Initial version.
*/



df.WebList = function WebList(sName, oParent){
    df.WebList.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tString, "psCurrentRowID", "");
    this.prop(df.tInt, "piCurrentRowIndex", -1);
    this.prop(df.tInt, "piRowCount", 0);
    
    
    this.prop(df.tBool, "pbDataAware", true);
    this.prop(df.tInt, "peDbGridType", df.gtAutomatic);
    this.prop(df.tBool, "pbOfflineEditing", false);
    
    this.prop(df.tBool, "pbAutoSearch", true);
    this.prop(df.tBool, "pbColumnSortable", true);
    this.prop(df.tBool, "pbReverseOrdering", true);
    this.prop(df.tInt, "piSortColumn", 0);
    
    this.prop(df.tInt, "piMinHeight", 0);
    this.prop(df.tInt, "piHeight", 0);
    this.prop(df.tBool, "pbColumnsResizable", true);


    
    // @privates
    this._aColumns = [];    
    this._aCache = [];          //  Array with the rows
    this._bFirst = false;       //  Indicates if we have the first record in cache
    this._bLast = false;        //  Indicates if we have the last record in cache
    this._bLoading = false;     //  Indicates if the grid is already loading records    
    this._bNoRender = false;    //  Tempolary disables the rendering while initializing or updating the cache
    
    this._bZebraTop = false;    //  Indicates wether the next row inserted on top should be a 'Odd' colored row
    this._bZebraBottom = false; //  Indicates wether the next row inserted at the bottom should be a 'Odd' colored row
    
    this._iDispOffset = 0;      //  The first row that is currently rendered
    this._iViewOffset = 0;      //  The amount of rows that are rendered but not visible
    this._iRowsOffset = 0;      //  The total offset from the top of the cache to the first visible row
    this._bClear = true;        //  Indicates if the cache is refilled which requires a full redraw
    
    this._iRowHeight = 0;       //  The height of a row in pixels
    this._iTableWidth = 0;      //  The widht of the table in pixels
    this._iTableHeight = 0;     //  The height of the table in pixels
    
    this._iPrefViewOffset = 8;      //  The preferred view offset (amount of rows rendered that are not visible)
    this._iPrevCacheOffset = 25;    //  The preferred amount of rows in the cache above and below the rendered rows
    
    this._bLozingFocus = false;     //  There is a short timeout when lozing the focus before really lozing it
    this._bInvalidRow = true;       //  Indicates that no valid row is selected (initially or after a grid refresh)
    
    this._iRound = (df.sys.isIE && df.sys.iVersion <= 8 ? 1 : 100);    //    This determines the decimals used (1 is none, 100 is 2) when rounding column widths (IE8 has issues with decimals on table cells)
    this._iColMin = 1.5;            //    Determines the minimum percentage available
    
    this._bNoSearch = false;         //  If set to true the auto search will not respond on keypress events (usually temporary set from onKeyDown for FireFox)
    
    this._aReadyQueue = [];
    
    //  Configure super classes
    this.piMinHeight = 200;
    this.pbShowLabel = false;
    this.addSync("piCurrentRowIndex");
    this.addSync("psCurrentRowID");
    this.addSync("piRowCount");
    
    //  Actions we need to wait for due to integrety
    this.setActionMode("HandleProcessDataSet", df.cCallModeWait);
    this.setActionMode("ChangeCurrentRow", df.cCallModeWait);
    
    this._sControlClass = "WebList";
};
df.defineClass("df.WebList", "df.WebBaseControl",{

// - - - - - - - Initialization (Control API) - - - - - - -

openHtml : function(aHtml){
    df.WebList.base.openHtml.call(this,aHtml);
    
    this.calculateColumnSizes();
    
    
    aHtml.push('<div class="WebList_Head">');
    aHtml.push('<div class="WebList_HeadWrp', (this.pbColumnsResizable ? ' WebList_ColResizable' : ''), '">');
    this.headerHtml(aHtml);
    aHtml.push('</div>');
    aHtml.push('</div>');
    aHtml.push('<div class="WebList_BodyWrp" tabindex="0">');
    //aHtml.push('<a class="WebList_FocusHolder" href="javascript: df.sys.nothing();" style="text-decoration: none; position: absolute; left: -3000px;">&nbsp;</a>');
    
    
    aHtml.push('<div class="WebList_Scroll" tabindex="-1"><div class="WebList_Stretcher" style="width: 1px;"></div></div>');
    aHtml.push('<div class="WebList_Body">');
    
    
    
    aHtml.push('<div class="WebList_TableWrp">');
    
    aHtml.push('<table>');
    
    this.resizeRowHtml(aHtml);
    
    aHtml.push('</table>');
    
    aHtml.push('</div></div><div style="clear: both"></div>');
    
},

headerHtml : function(aHtml){
    var iPrevCol = -1, sCssClass;
    
    aHtml.push('<table>');
    this.resizeRowHtml(aHtml);
    aHtml.push('<tr>');
    
    this.loopCols(function(oCol, iCol, bLast){
        
        //  Determine column CSS class
        sCssClass = "WebList_ColHead";
        if(iCol === this.piSortColumn){
            sCssClass += (this.pbReverseOrdering ? " WebList_SortedReverse" : " WebList_Sorted");
        }
        if(this.pbColumnSortable && oCol.pbSortable){
            sCssClass += " WebList_Sortable";
        }
        sCssClass += " " + this.cellClass(oCol, false, null);
                
        
        aHtml.push('<th class="', sCssClass, '" data-dfcol="', iCol, '"><div>');
        if(iPrevCol >= 0){
            aHtml.push('<div class="WebList_ColSep" data-dfcol="', iPrevCol, '"></div>');
        }
        aHtml.push('<div class="WebList_ColCap">', oCol.psCaption, '</div>');
        aHtml.push('</div></th>');
        
        iPrevCol = iCol;
        
    });
    aHtml.push('</tr></table>');
    
},

resizeRowHtml : function(aHtml){
    aHtml.push('<colgroup>');
    
    this.loopCols(function(oCol){
        aHtml.push('<col style="width: ', oCol._iRealWidth, '%"></col>');
    });
    
    
    aHtml.push('</colgroup>');
},

closeHtml : function(aHtml){
    
    aHtml.push('</div>');
    
    df.WebList.base.closeHtml.call(this,aHtml);
},

afterRender : function(){
    var fHandler;

    this._eTable = df.dom.query(this._eElem, "div.WebList_TableWrp > table");
    this._eBody = df.dom.query(this._eElem, "div.WebList_Body");
    this._eTableWrp = df.dom.query(this._eElem, "div.WebList_TableWrp");
    this._eScrollbar = df.dom.query(this._eElem, "div.WebList_Scroll");
    this._eScrollStretch = df.dom.query(this._eElem, "div.WebList_Scroll > div.WebList_Stretcher");
    this._eBodyWrp = df.dom.query(this._eElem, "div.WebList_BodyWrp");
    this._eHead = df.dom.query(this._eElem, "div.WebList_Head");
    this._eHeadWrp = df.dom.query(this._eElem, "div.WebList_HeadWrp");
    this._eControl = this._eFocus = this._eBodyWrp; // df.dom.query(this._eElem, "a.WebList_FocusHolder");
    
    df.WebList.base.afterRender.call(this);
    
    df.events.addDomListener("scroll", this._eScrollbar, this.onScrollbarScroll, this);
    df.events.addDomMouseWheelListener(this._eBody, this.onMouseWheelScroll, this);
    df.events.addDomListener("touchstart", this._eBody, this.onTouch, this);
    
    df.events.addDomListener("click", this._eTableWrp, this.onTableClick, this);
    df.events.addDomListener("dblclick", this._eTableWrp, this.onTableDblClick, this);
    df.events.addDomListener("click", this._eElem, this.onListClick, this);
    df.events.addDomListener("click", this._eHead, this.onHeadClick, this);
    df.events.addDomListener("mousedown", this._eHead, this.onHeadMouseDown, this);
    
    df.events.addDomListener("keydown", this._eFocus, this.onKeyDown, this);
    df.events.addDomListener("keypress", this._eFocus, this.onKeyPress, this);
    
    
    while(fHandler = this._aReadyQueue.shift()){
        fHandler.call(this);
    }
    
    this.resize();
},

afterRenderChildren : function(){

},

// - - - - - - - Display & scroll - - - - - - -

updatePosition : function(bForceRedraw){
    var iDisplaySize, iRowsOffset, iViewSize;
    
    if(!this._bNoRender){
        iDisplaySize = this.getDisplaySize();
        iViewSize = this.getViewSize();
        bForceRedraw = !!bForceRedraw;
        
        //  Calculate the scroll offset in rows
        iRowsOffset = Math.round(this._eScrollbar.scrollTop / (this._iRowHeight || 20));
        
        //  Check if we are not too high
        if(iRowsOffset + iViewSize > this._aCache.length){
            iRowsOffset = (this._aCache.length - iViewSize) + 1;
        }
        
        //  Check if anything needs to be done
        if(this._iRowsOffset !== iRowsOffset || this._eTable.rows.length < iDisplaySize || bForceRedraw){
            this._iRowsOffset = iRowsOffset;
            
            //  Check if there is a reason for a forced redraw
            if(this._eTable.rows.length > iDisplaySize + (this._iPrefViewOffset * 3) || this._bClear){
                bForceRedraw = true;
                this._bClear = false;
            }
            
            //  If the rows in the new viewport are already visible we can scroll this (unless this is somehow a forced redraw)
            if((this._iDispOffset <= iRowsOffset && this._iDispOffset + iDisplaySize >= iRowsOffset + iViewSize - 1) && !bForceRedraw){
                
                this._iViewOffset = iRowsOffset - this._iDispOffset;
                this.updateScrollPos(this._iViewOffset * (this._iRowHeight || 20));
                
                this.adjustDisplay();
            }else{  //  Else we need to rerender the entire page
                if(iRowsOffset > this._iPrefViewOffset){
                    this._iDispOffset = iRowsOffset - this._iPrefViewOffset;
                    this._iViewOffset = this._iPrefViewOffset;
                }else{
                    this._iDispOffset = 0;
                    this._iViewOffset = iRowsOffset;
                }
                
                //  Refresh the display
                this.refreshDisplay();
            }
            
            
        }
    }
},

adjustDisplay : function(){
    //  Adjusts the display by adding / removing rows at the top or the bottom
    var iDispOffset, iDisplaySize = this.getDisplaySize();
       
    //  Calculate new ideal display offset
    iDispOffset = this._iRowsOffset - this._iPrefViewOffset;
    if(iDispOffset < 0){
        iDispOffset = 0;
    }
    if(iDispOffset + iDisplaySize > this._aCache.length){
        iDispOffset = this._aCache.length - iDisplaySize;
    }
    
    //  Add rows on top
    while(this._iDispOffset > iDispOffset){
        this._iDispOffset--;
        this._iViewOffset++;
        this.insertRow(this._aCache[this._iDispOffset], true);
        
    }
    
    // Remove rows on top
    if(!df.sys.isIE || df.sys.iVersion > 8){  //  FIX: We don't remove rows like this in IE8, it causes input elements to dissapear, IE8 refreshes every now and then
        while(this._iDispOffset < iDispOffset){
            this.removeTopRow();
            
        }
        
        this.updateScrollPos(this._iViewOffset * (this._iRowHeight || 20));
    }
    
    //  Add rows on the bottom
    while(this._eTable.rows.length < iDisplaySize){
        this.insertRow(this._aCache[this._iDispOffset + this._eTable.rows.length], false);
    }
    
    //  Remove rows on the bottom
    if(!df.sys.isIE || df.sys.iVersion > 8){  //  FIX: We don't remove rows like this in IE8, it causes input elements to dissapear, IE8 refreshes every now and then
        while(this._eTable.rows.length > iDisplaySize){
            this.removeBottomRow();
        }
    }
},

/*
This method removes a single row from the display table. It makes sure the _iDispOffset and 
_iViewOffset are properly updated. It is called by the adjustDisplay method.

@private
*/
removeTopRow : function(){
    this._iDispOffset++;
    this._iViewOffset--;
    this._bZebraTop = !this._bZebraTop;
    this._eTable.deleteRow(0);
},

/*
This method removes a single row from the top of the display table. It is called by the 
adjustDisplay method.

@private
*/
removeBottomRow : function(){
    this._eTable.deleteRow(-1);
    this._bZebraBottom = !this._bZebraBottom;
},

updateScrollPos : function(iOffset){
    this._eTable.style.top = "-" + iOffset + "px";
},

insertRow : function(tRow, bTop){
    var eRow, eCell, bZebra, bSelected = (tRow && tRow.aValues[0]) === this.psCurrentRowID;
    
    if(bTop){
        bZebra = this._bZebraTop;
        this._bZebraTop = !this._bZebraTop;
    }else{
        bZebra = this._bZebraBottom;
        this._bZebraBottom = !this._bZebraBottom;
    }

    
    eRow = this._eTable.insertRow(bTop ? 0 : -1);
    eRow.className = "WebList_Row " + (bSelected ? 'WebList_Selected' : '') + (bZebra ? ' WebList_RowOdd' : ' WebList_RowEven');
    
    this.loopCols(function(oCol, i){
        eCell = eRow.insertCell(-1);
        eCell.innerHTML = (tRow ? this.cellHtml(oCol, tRow.aValues[i + 1]) : "&nbsp;");
        eCell.className = this.cellClass(oCol, bSelected, tRow);
    
    });
},

rowHtml : function(tRow, aHtml, bZebra){
    var bSelected = (tRow && tRow.aValues[0]) === this.psCurrentRowID ;
    
    aHtml.push('<tr class="WebList_Row ', (bSelected ? 'WebList_Selected' : ''), (bZebra ? ' WebList_RowOdd' : ' WebList_RowEven'), (tRow ? '': ' WebList_RowEmpty'), '">');
    
    //  Loop cells
    this.loopCols(function(oCol, i){
        aHtml.push('<td class="', this.cellClass(oCol, bSelected, tRow), '">', (tRow ? this.cellHtml(oCol, tRow.aValues[i + 1]) : '&nbsp;'), '</td>');
    });
    
    aHtml.push('</tr>');
},

cellClass : function(oCol, bSelected, tRow){
    var sClass = oCol._sCellClass;
    
    sClass += (oCol.pbEnabled ? " Web_Enabled " : " Web_Disabled ");
    
    sClass += (oCol.peAlign === df.ciAlignLeft ? "WebList_AlignLeft " : (oCol.peAlign === df.ciAlignCenter ? "WebList_AlignCenter " : (oCol.peAlign === df.ciAlignRight ? "WebList_AlignRight " : "")));
    
    if(oCol.peDataType === df.ciTypeBCD){
        return sClass + "dfData_BCD";
    }
    if(oCol.peDataType === df.ciTypeDate){
        return sClass + "dfData_Date";
    }
    return sClass + "dfData_Text";
},

cellHtml : function(oCol, sVal){
    var bFocus, sHtml;
    
    sVal = sVal || "";
    
    //  We need to tempolary set the focus to false because we always want the masked value
    bFocus = oCol._bHasFocus;
    oCol._bHasFocus = false;
    
    sHtml = oCol.cellHtml(sVal);
    
    //  Restore the focus
    oCol._bHasFocus = bFocus;
    
    return sHtml;
},

/*
Refreshes the display entirely based on this._iDispOffset & this._iViewOffset
*/
refreshDisplay : function(){
    var i, aHtml = [], iDisplaySize = this.getDisplaySize(true), bZebra = !this._bZebraTop;

    aHtml.push('<table>');
    this.resizeRowHtml(aHtml);
    
    //  Loop rows
    for(i = this._iDispOffset; i < this._iDispOffset + iDisplaySize && i < this._aCache.length; i++){
        this.rowHtml(this._aCache[i], aHtml, bZebra);
        
        bZebra = !bZebra;
    }
    
    
    for(i; i < iDisplaySize; i++){
        this.rowHtml(null, aHtml, bZebra);
        
        bZebra = !bZebra;
    }
    
    aHtml.push('</table>');
    
    
    
    this._eTableWrp.innerHTML = aHtml.join('');
    this._eTable = this._eTableWrp.firstChild;
    
    this.updateScrollPos(this._iViewOffset * (this._iRowHeight || 20));
    
    this._bZebraBottom = bZebra;
   
},

onScrollbarScroll : function(){
    this.updatePosition();
    this.updateCache();
},

onMouseWheelScroll : function(oEvent){
    var iTo, iDelta = oEvent.getMouseWheelDelta();
    if(iDelta > 0){
        //  Scroll up
        iTo = this._eScrollbar.scrollTop - ((this._iRowHeight || 20) * 2);
        this._eScrollbar.scrollTop = (iTo > 0 ? iTo : 0);
        
    }else if(iDelta < 0){
        //  Scroll down
        
        this._eScrollbar.scrollTop =  this._eScrollbar.scrollTop + ((this._iRowHeight || 20) * 2);
    }
    
    // this.updateCache();
},

/*
This event handler handles the touch event on mobile devices. It will scroll list if the touch is a 
vertical sliding touch.

@param  oEvent     Event object (df.events.DOMEvent)
@private
*/
onTouch : function(oEvent){
    var iY, iPrevY, bMoved = false;
    
    //  Only respond to single finger swipes
    if(oEvent.e.targetTouches.length > 1){
        return true;
    }
    
    iPrevY = oEvent.e.targetTouches[0].pageY;
    
    // df.log(" ------ touch start ------- ");
    
    //  Handles the move event and recalculates the scrollbar position accordingly
    function touchMove(oEvent){
        iY = oEvent.e.targetTouches[0].pageY;
        
        // var iDiff, iNew, iOld;
        
        // iDiff = iY - iPrevY;
        // iOld = this._eScrollbar.scrollTop;
        // iNew = iOld - iDiff;
        
        // this._eScrollbar.scrollTop = iNew;
        //df.log("scrollMove iY:" + iY + " iDiff: " + iDiff + " iOld: " + iOld + " iNew: " + iNew); 
        this._eScrollbar.scrollTop = this._eScrollbar.scrollTop - (iY - iPrevY);
        
        if(iPrevY !== iY){
            bMoved = true;
        }
        iPrevY = iY;
        
        oEvent.stop();
    }
    
    //  Handles the touch end event and stops the scrolling
    function touchEnd(oEvent){
        // df.log(" ------ touch end ------- ");
        df.events.removeDomListener("touchend", this._eBody, touchEnd, this);
        df.events.removeDomListener("touchmove", this._eBody, touchMove, this);
        
        if(bMoved){
            oEvent.stop();
        }
    }
    
    df.events.addDomListener("touchend", this._eBody, touchEnd, this);
    df.events.addDomListener("touchmove", this._eBody, touchMove, this);
},


getViewSize : function(bOptFull){
    //  Determine the amount of rows that should be visible
    var iViewSize = Math.floor(this._eTableWrp.clientHeight / (this._iRowHeight || 20)) + 1;
    if(!bOptFull && iViewSize > this._aCache.length){
        iViewSize = this._aCache.length;
    }
    
    return iViewSize;
},

getDisplaySize : function(bOptFull){
    //  Determine the amount of rows that we want rendered
    var iDisplaySize = this.getViewSize(bOptFull) + (this._iPrefViewOffset * 2);
    if(!bOptFull && iDisplaySize > this._aCache.length){
        iDisplaySize = this._aCache.length;
    }
    
    return iDisplaySize;
},

/*
Updates the size of the stretch element defining the size of the scrollbar thingy based on the 
current cache.
*/
updateScrollSize : function(){
    var iHeight = this._aCache.length * (this._iRowHeight || 20) + (this._iRowHeight || 20);
    
    if(this._eScrollStretch && this._eScrollStretch.clientHeight !== iHeight){
        this._eScrollStretch.style.height = iHeight + "px";
    }
},

updateRowHeight : function(){
    var bRemove = false;
    
    if(this._eTable){
        //  If no row available we generate a test row
        if(this._eTable.rows.length < 1){
            this._eTable.style.visibility = "hidden";
            
            //  Generate row
            this.insertRow(null);
            bRemove = true;
        }
        
        //  Determine height
        this._iRowHeight = this._eTable.rows[0].offsetHeight; // + df.sys.gui.getVertBoxDiff(this._eTable.rows[1]);
                
        //  Remove testrow (if created
        if(bRemove){
            this._eTable.deleteRow(0);
            this._eTable.style.visibility = "visible";
        }
    }
},

centerCurrentRow : function(){
    var iStart = this.findRowByRowId(this.psCurrentRowID);

    if(iStart >= 0){
        iStart = iStart - ((this.getViewSize() - 2) / 2);
        if(iStart < 0){
            iStart = 0;
        }
        this._eScrollbar.scrollTop = (this._iRowHeight || 20) * iStart;
    }
},

scrollToCurrentRow : function(){
    var iRow = this.findRowByRowId(this.psCurrentRowID), 
        iViewSize = this.getViewSize() - 1;

    if(iRow <= this._iDispOffset + this._iViewOffset){
        this._eScrollbar.scrollTop = (this._iRowHeight || 20) * (iRow);
    }else{
        if(iRow + 1 > this._iDispOffset + this._iViewOffset + iViewSize){
            this._eScrollbar.scrollTop = (this._iRowHeight || 20) * (iRow - iViewSize + 1);
        }
    }
    
},

/*
@param  sGotoRow    String describing the row that will be selected ("new", "first", "last", "row").
@param  iRow        When sGotoRow indicates "row" then this is the cache row number to select.
*/
selectRow : function(sGotoRow, iRow, fOptHandler, tOptSelectRowData){
    var sPrevRowID = this.psCurrentRowID, bContinue = true, sTargetRowID = "", iPrevRow, tSelectRowData = tOptSelectRowData || null;
    
    iPrevRow = this.findRowByRowId(sPrevRowID);
    
    //  Make sure there are no outstanding ChangeCurrentRow calls
    this.cancelServerAction("ChangeCurrentRow");
    
    //  Determine if row change is needed & translate specific row nr into rowid
    if(sGotoRow === "row"){
        sTargetRowID = this._aCache[iRow].aValues[0];
        bContinue = (sTargetRowID !== this.psCurrentRowID);
        
        //  For non data-aware grids / lists we send a copy of the row we are going to as action data to the server
        if(!this.pbDataAware){
            tSelectRowData = this._aCache[iRow];
        }
    }
    
    function handleRowChange(oEvent){
        var eRow, iPrevRow, ePrevRow, iRow;
        
        if(this.pbOfflineEditing || oEvent.sReturnValue === "1"){
            //  Find and deselect previously selected row
            if(sPrevRowID){
                iPrevRow = this.findRowByRowId(sPrevRowID);
                
                if(iPrevRow >= this._iDispOffset && iPrevRow < this._iDispOffset + this.getDisplaySize()){
                    ePrevRow = this._eTable.rows[iPrevRow - this._iDispOffset];
                    df.dom.removeClass(ePrevRow, "WebList_Selected");
                }
            }

            //  We do this so that handlers that scroll the screen are executed before we add the class
            if(fOptHandler){
                fOptHandler.call(this, true);
            }
            
            //  Select the newly selected row (goto new row is handled by the handler)
            iRow = this.findRowByRowId(this.psCurrentRowID);
            if(iRow >= 0 && iRow - this._iDispOffset >= 0 && iRow - this._iDispOffset < this._eTable.rows.length){
                eRow = this._eTable.rows[iRow - this._iDispOffset];
                
                df.dom.addClass(eRow, "WebList_Selected");
            }
        }else{
            fOptHandler.call(this, false);
        }
    }
    
    if(bContinue){
        if(!this.pbOfflineEditing){
            if(!this.serverAction("ChangeCurrentRow", [ sGotoRow, sTargetRowID ], (tSelectRowData && [ tSelectRowData ])|| null, handleRowChange, this)){
                
                //  If the action didn't get true we call the handler to clean up the mess (with bChanged as false)
                if(fOptHandler){
                    fOptHandler.call(this, false);
                }
                
                //  Check after the call that blocked the action if a rowchange is needed (_bInvalidRow indicates if the grid was refreshed)
                this.getWebApp().waitForCall(function(){
                    if(this._bInvalidRow){
                        if(this.psCurrentRowID === "" && this._aCache.length > 0){
                            this.selectRow("row", 0, function(){
                                this.scrollToCurrentRow();
                            });
                        }else{
                            this.appendNewRow();
                        }
                    }
                }, this);
            }else{
                this._bInvalidRow = false;
            }
        }else{
            //  When working offline we manually load the row into the columns and set it as current
            if(sGotoRow === "row"){
                this.set('psCurrentRowID', sTargetRowID);
                this.updateColumnsFromCache(true);
            }
                        
            handleRowChange.call(this);
            
            this._bInvalidRow = false;
        }
    }else{
        if(fOptHandler){
            fOptHandler.call(this, false);
        }
    }
},

/*
This method updates the column DEO objects with the data in the cache for the current row. It does 
nothing if pbNonDataAware is false. It will reset the changed-states if bResetChange is true.

@param  bResetChange    If true the changed-state is reset.
@private
*/
updateColumnsFromCache : function(bResetChange){
    var iRow, iCol;
    
    //  Update the column value's
    if(!this.pbDataAware){
        iRow = this.findRowByRowId(this.psCurrentRowID);
        
        if(iRow >= 0){
            for(iCol = 0; iCol < this._aColumns.length; iCol++){
                this._aColumns[iCol].set('psValue', this._aCache[iRow].aValues[iCol + 1]);
                if(bResetChange){
                    this._aColumns[iCol].set('pbChanged', false);
                }
            }
            this._bUpdatedColumnsFromCache = true;
        }
    }
},

calculateColumnSizes : function(){
    var iTotal = 0, iCol, oCol, oLast, iUsed = 0, iLeft;
    
    //  Determine total width
    for(iCol = 0; iCol < this._aColumns.length; iCol++){
        oCol = this._aColumns[iCol];
        
        if(oCol.pbRender){
            iTotal += oCol.piWidth;
            
            oLast = oCol;
        }
    }
    
    //  Calculate real sizes
    for(iCol = 0; iCol < this._aColumns.length; iCol++){
        oCol = this._aColumns[iCol];
        
        if(oCol.pbRender){
            oCol._iRealWidth = Math.floor((oCol.piWidth * (100 / iTotal)) * this._iRound) / this._iRound;
        
            iUsed = iUsed + oCol._iRealWidth;
        }
    }
    
    //    Due to rounding (IE8) we might have some space left, we spread this over the columns
    iLeft = 100 - iUsed;
    if(iLeft >= 1){
        for(iCol = 0; iCol < this._aColumns.length && iLeft > 0; iCol++){
            oCol = this._aColumns[iCol];
            
            if(oCol.pbRender){
                oCol._iRealWidth++;
                iLeft--;
            }
        }
    }
},

resizeColumn : function(oEvent, iCol){
    var eMask, eGhost, iLeft = 0, iPX, iStartX, iDiff = 0, iMin, iMax = 0;
    
    eMask = df.gui.dragMask();
    eMask.style.cursor = "e-resize";
    
    
    this.loopCols(function(oCol, iCur){
        if(iCur <= iCol){
            //    Calculate start positon
            iLeft += oCol._iRealWidth;
        }else{
            //    Determine minimum
            iMax += oCol._iRealWidth - this._iColMin;
        }
    });
    iStartX = oEvent.getMouseX();
    
    //    Determine minimum
    iMin = -this._aColumns[iCol]._iRealWidth + this._iColMin;
    
    
    //    Calculate pixel
    iPX = 100 / this._eTableWrp.offsetWidth;
    
    //    Create ghost separator
    eGhost = df.dom.create('<div class="WebList_ColResizer"></div>');
    this._eHeadWrp.appendChild(eGhost);
    eGhost.style.left = iLeft + "%";
    eGhost.style.height = (this._eHead.clientHeight + this._eBody.clientHeight) + "px";
    
    function onResize(oEvent){
        var iNewX = oEvent.getMouseX(), iNewLeft;
        
        iDiff = (iNewX - iStartX) * iPX;
        
        if(iDiff < iMin){
            iDiff = iMin;
        }
        if(iDiff > iMax){
            iDiff = iMax;
        }
        
        iNewLeft = this.roundColSize(iLeft + iDiff);
        
        eGhost.style.left = iNewLeft + "%";
    }
    
    function onStopResize(oEvent){
        
        df.events.removeDomListener("mouseup", eMask, onStopResize);
        df.events.removeDomListener("mouseup", window, onStopResize);
        //df.events.removeDomListener("mouseout", eMask, onStopResize);
        df.events.removeDomListener("mousemove", eMask, onResize);
        
        eGhost.parentNode.removeChild(eGhost);
        eMask.parentNode.removeChild(eMask);
        
        this.recalcColumnSizes(iCol, iDiff);
        this.updateHeader();
        this.updatePosition(true);
    }
    
    df.events.addDomListener("mouseup", eMask, onStopResize, this);
    df.events.addDomListener("mouseup", window, onStopResize, this);
    //df.events.addDomListener("mouseout", eMask, onStopDrag, this);
    df.events.addDomListener("mousemove", eMask, onResize, this);
},

recalcColumnSizes : function(iCol, iDiff){
    var i, iTotal = 0, iUsed = 0, iColDiff, oCol;
    
    if(this.roundColSize(iDiff) !== 0){
        //    Determine total space behind column
        for(i = iCol + 1; i < this._aColumns.length; i++){
            oCol = this._aColumns[i];
            if(oCol.pbRender){
                if(iDiff < 0){
                    iTotal += oCol._iRealWidth;
                }else{
                    iTotal += oCol._iRealWidth - this._iColMin;
                }
            }
        }
        
        //    Loop over next columns to determine 
        for(i = iCol + 1; i < this._aColumns.length; i++){
            oCol = this._aColumns[i];
            if(oCol.pbRender){
                if(iDiff < 0){
                    iColDiff = this.roundColSize((1 / (iTotal / (oCol._iRealWidth))) * iDiff);
                }else{
                    iColDiff = this.roundColSize((1 / (iTotal / (oCol._iRealWidth - this._iColMin))) * iDiff);
                }
                
                iUsed += iColDiff;
                
                oCol._iRealWidth = this.roundColSize(oCol._iRealWidth - iColDiff);
                if(isNaN(oCol._iRealWidth)){
                    alert("calculations went wrong!");
                }
            }
        }
        
        this._aColumns[iCol]._iRealWidth = this.roundColSize(this._aColumns[iCol]._iRealWidth + iUsed);
    }
},

roundColSize : function(iVal){
    return Math.round(iVal * this._iRound) / this._iRound;
},

// - - - - - - - Cache - - - - - - -

updateCache : function(){
    // var sLog = "(first: " + this._bFirst + ", before : " + this._iDispOffset + ", cache size : " + this._aCache.length + ", display:  " + this.getDisplaySize() + ", after : " + (this._aCache.length  - this._iDispOffset - this.getDisplaySize()) + ", last: " + this._bLast + ")";
    
    if(!this._bNoRender){
        if(!this._bLast){
            if((this._aCache.length  - this._iDispOffset - this.getDisplaySize()) < this._iPrevCacheOffset){
                this.loadCachePage("next", function(){
                    // this.adjustDisplay();
                    this.updateCache();
                }, this);
            }
        }
        if(!this._bFirst){
            if(this._iDispOffset - this._iPrevCacheOffset < 0){
                this.loadCachePage("prev", function(){
                    // this.adjustDisplay();
                    this.updateCache();
                }, this);
            }
        }
    }
},

loadCachePage : function(sType, fOptHandler, oOptEnv){
    var sStartRowID = "";
    
    if(this._bLoading){
        return;
    }
    this._bLoading = true;
    
     // Determine start rowid
    if(sType === "next"){
        sStartRowID = this._aCache[this._aCache.length - 1].aValues[0];
    }else if(sType === "prev"){
        sStartRowID = this._aCache[0].aValues[0];
    }else{
        this._bNoRender = true;
    }
    
    // Create action
    this.serverAction("LoadDataPage", [ sType, sStartRowID ], null, function(oEvent){
        this._bLoading = false;
        
        if(!oEvent.bError){
            this.ready(function(){
                
                if(fOptHandler){
                    fOptHandler.call(oOptEnv || this);
                }
            });
        }
    });
},

/*
This function handles a new page of data and adds it to the cache. Depending on the sType parameter 
it will add or replace the cache. After this it will refresh the display.

@client-action
*/
handleDataPage : function(sType, sStartRowId, bFirst, bLast){
    var aRows = this._aActionData;
    
    //  Convert from string to boolean
    bFirst = (bFirst === "1");
    bLast = (bLast === "1");
    
    this.ready(function(){
        this.onBeforeCacheUpdate();
    
        //  Make sure the rowheight we calculate with is determined
        if(this._iRowHeight < 1){
            this.updateRowHeight();
        }
        
        if(sType === "page"){
            //  Update cache
            this._aCache = aRows;
            this._bLast = bLast;
            this._bFirst = bFirst;
            
            this.sortData();
            
            //  Update display (center selected record)
            this.updateScrollSize();
            this.centerCurrentRow();
            this._bNoRender = false;
            this.updatePosition(true);
            
            //  If there are now rows we might try to move to a new row (grids only)
            if(this._aCache.length === 0){
                this.appendNewRow();
            }
        }
        
        
        if(sType === "first"){
            //  Update cache
            this._aCache = aRows;
            this._bLast = bLast;
            this._bFirst = bFirst;
            this.sortData();
                                
            //  Update  display (scroll to top)
            this.updateScrollSize();
            this._eScrollbar.scrollTop = 0;
            this._bNoRender = false;
            this.updatePosition();
        }
        
        if(sType === "last"){
            //  Update cache
            aRows.reverse();
            this._aCache = aRows;
            this._bLast = bLast;
            this._bFirst = bFirst;
            this.sortData();
                                
            //  Update display
            this.updateScrollSize();
            this._eScrollbar.scrollTop = this._eScrollStretch.clientHeight - this._eScrollbar.clientHeight;
            this._bNoRender = false;
            this.updatePosition();
        }
        
        if(sType === "next"){
            //  Update cache
            this._aCache = this._aCache.concat(aRows);
            this._bLast = bLast;
            
            //  Update display
            this.updateScrollSize();
        }
        
        if(sType === "prev"){
            //  Update cache
            aRows.reverse();
            this._aCache = aRows.concat(this._aCache);
            this._bFirst = bFirst;
            this._iDispOffset += aRows.length;
            
            //  Update display
            this.updateScrollSize();
            this._eScrollbar.scrollTop = this._eScrollbar.scrollTop  + aRows.length * (this._iRowHeight || 20);
            this.updatePosition();
        }
        
        this.onAfterCacheUpdate();
    });
},

/*
Clears the cache and the displayed table.

@private
*/
clearCache : function(){
    // var aHtml = [];

    if(this._eScrollbar){
        this._eScrollbar.scrollTop = 0;
    }
    
    //  Throw away displayed HTML
    // if(this._eTableWrp){
        // aHtml.push('<table>');
        // this.resizeRowHtml(aHtml);
        // aHtml.push('</table>');
        // this._eTableWrp.innerHTML = aHtml.join('');
        // this._eTable = this._eTableWrp.firstChild;
    // }
    // ToDo:  (re-) consider this!
    if(this._eTable){    //    This hides the table, works surprisingly well, setting a color somewhere in the table might break this
        this._eTable.style.color = "transparent";
    }
    
    
    //  Clear cache
    this._bClear = true;
    this._aCache = [];
    this._bFirst = false;
    this._bLast = false;
    this._iDispOffset = 0;
    this._iViewOffset = 0;
},

refreshData : function(){
    this.clearCache();
    this.showLoading();
    
    this.loadCachePage("page", "", function(oEvent){
        this.hideLoading();
    
    });
},

/* 
Function that is called mainly by columns if their properties have changed. Forces a full redraw of 
the grid after a short timeout. This timeout is added so that call handlers (like HandleChangeRow) 
are not disturbed.
*/
redraw : function(){
    var that = this;
    
    if(this._tRedraw){
        clearTimeout(this._tRedraw);
    }
    
    this._tRedraw = setTimeout(function(){
        if(that._eTableWrp){
            that.calculateColumnSizes();
            that.updateHeader();
            that.refreshDisplay();
        }
        that._tRedraw = null;
    }, 10);
},

/*
Implementation of the client-side sorting for non-data-bound lists / grids. It uses the JavaScript 
sort function with a custom comparison function. It uses special comparison functions for special 
columns. If the values of the sort column are equal it will start looking at other columns. 

@private
*/
sortData : function(){
    //  Only do client sorting for non data aware grid and a sort column is set
    if((!this.pbDataAware || this.peDbGridType !== df.gtAutomatic) && this.piSortColumn >= 0){
        //  Check if the entire set of data is on the client
        if(this._bLast && this._bFirst){
            var iCol, bRev, aCompare, i;
            
            this.onBeforeCacheUpdate();
            
            //  Determine sort column & order
            iCol = this.piSortColumn + 1;
            bRev = this.pbReverseOrdering;
            
            //  Generate array of comparison methods for each column based on the type
            aCompare = [];
            for(i = 0; i < this._aColumns.length; i++){
                if(this._aColumns[i].peDataType === df.ciTypeText){
                    aCompare[i + 1] = this.compareText;
                }else if(this._aColumns[i].peDataType === df.ciTypeBCD){
                    aCompare[i + 1] = this.compareBCD;
                }else if(this._aColumns[i].peDataType === df.ciTypeDate || this._aColumns[i].peDataType === df.ciTypeDateTime){
                    aCompare[i + 1] = this.compareDate;
                }
                
            }
            
            //  Sort the cache using the standard JS sort algoritm
            this._aCache.sort(function(oItem1, oItem2){
                var i, x;
                
                
                if(oItem1.aValues[iCol] !== oItem2.aValues[iCol]){  //  If the sort column values are different we only compare those
                    //  Call comparison function for this column
                    x = aCompare[iCol](oItem1.aValues[iCol], oItem2.aValues[iCol]);
                    
                    return (bRev ? -x : x);
                }  
                //  If the sort column values are equal we are going to look at other columns starting at the first column
                for(i = 1; i < oItem1.aValues.length; i++){
                    if(oItem1.aValues[i] !== oItem2.aValues[i]){
                        x = aCompare[i](oItem1.aValues[i], oItem2.aValues[i]);
                
                        return (bRev ? -x : x);
                    }
                }
                return 0;
            });
            
            this.onAfterCacheUpdate();
        }else{
            throw new df.Error(999, "Client-side sorting is only supported with manual data loading!", [], this);
        }
    }

},

/*
Comparison function used by the sortData function that compares text columns.

@param  sVal1   First string value.
@param  sVal2   Second string value.
@return Negative number if sVal1 < sVal2, positive for sVal1 > sVal2 and 0 when equal.

@private
*/
compareText : function(sVal1, sVal2){
    return sVal1.localeCompare(sVal2);
},

/*
Comparison function used by the sortData function that compares numeric columns.

@param  sVal1   First string value.
@param  sVal2   Second string value.
@return -1 if sVal1 < sVal2, 1 if sVal1 >= sVal2.

@private
*/
compareBCD : function(sVal1, sVal2){
    return parseFloat(sVal1) - parseFloat(sVal2);
},

/*
Comparison function used by the sortData function that compares date columns.

@param  sVal1   First string value.
@param  sVal2   Second string value.
@return -1 if sVal1 < sVal2, 1 if sVal1 >= sVal2.

@private
*/
compareDate : function(sVal1, sVal2){
    return df.sys.data.stringToDate(sVal1, "yyyy/mm/dd", "-") < df.sys.data.stringToDate(sVal2, "yyyy/mm/dd", "-") ? -1 : 1;
},


onBeforeCacheUpdate : function(){

},

onAfterCacheUpdate : function(){

},

// - - - - - - - Supportive - - - - - - -

getColCell : function(oCol){
    var iCol, iCell, iRow;
    
    //  Determine row & cell number
    iRow = this.findRowByRowId(this.psCurrentRowID);
    iCol = this.findColNr(oCol);
    iCell = this.colNrToCell(iCol);
    
    //  Determine if found & displayed
    if(iRow >= 0 && iCol >= 0 && iCell >=0){
        if(iRow >= this._iDispOffset && iRow < this._iDispOffset + this.getDisplaySize()){
            return this._eTable.rows[iRow - this._iDispOffset].cells[iCell];    
        }
    }
    
    return null;
},

getColHead : function(oCol){
    var iCol;
    
    //  Determine row & cell number
    iCol = this.findColNr(oCol);
    
    return df.dom.query(this._eHeadWrp, "th.WebList_ColHead[data-dfcol='" + iCol + "']");
},

showLoading : function(){

},

hideLoading : function(){

},

findRowByRowId : function(sRowID){
    var i;
    
    for(i = 0; i < this._aCache.length; i++){
        if(this._aCache[i].aValues[0] === sRowID){
            return i;
        }
    }
    
    return -1;
},

ready : function(fHandler){
    if(this._eElem){
        fHandler.call(this);
    }else{
        this._aReadyQueue.push(fHandler);
    }
},

/*
Augmenting the addChild method to filter out columns.

@private
*/
addChild : function(oChild){
    if(oChild instanceof df.WebColumn || oChild instanceof df.WebColumnCombo || oChild instanceof df.WebColumnCheckbox){
        this._aColumns.push(oChild);
    }
    
    df.WebBaseContainer.base.addChild.call(this, oChild);
},

loopCols : function(fHandler, bOptHidden){
    var i, x, iCount = 0, oCol, bLast;
    for(i = 0; i < this._aColumns.length; i++){
        oCol = this._aColumns[i];
        
        //    Skip hidden columns (unless bOptHidden)
        if(oCol.pbRender || bOptHidden){
            //    Determine bLast
            bLast = true;
            for(x = i + 1; x < this._aColumns.length && bLast; x++){
                bLast = !(this._aColumns[x].pbRender || bOptHidden);
            }
            
            if(fHandler.call(this, oCol, i, bLast, iCount) === false){
                return false;
            }
            
            iCount++;
        }
    }
    
    return true;
},

/*
Translates a column number into a cell number. The column number is the index in the array of column 
objects (_aColumns) where the cell number is the index of the visual cell in the rendered table.

@param  iCol    Number of the child column object.
@return Index of the cell in the rendered table.
@private
*/
colNrToCell : function(iCol){
    var i, iCount = 0;
    for(i = 0; i < this._aColumns.length; i++){
        //    Skip hidden columns (unless bOptHidden)
        if(this._aColumns[i].pbRender){
            if(iCol === i){
                return iCount;
            }
            
            iCount++;
        }
    }
    
    return -1;
},

/*
Translates a cell index into a culumn number. The cell index is the number of the rendered cell 
within the table (doesn't include hidden columns) where the column number is the index in the array 
of child column objects (_aColumns).

@param  iCell   Cell index in the rendered table.
@return Column number in the _aColumns array.
@private
*/
cellToColNr : function(iCell){
    var i, iCount = 0;
    
    for(i = 0; i < this._aColumns.length; i++){
        //    Skip hidden columns (unless bOptHidden)
        if(this._aColumns[i].pbRender){
            if(iCell === iCount){
                return i;
            }
            
            iCount++;
        }
    }
    
    return -1;
},

findColNr : function(oCol){
    var iCol;
    
    //  Determine column number
    for(iCol = 0; iCol < this._aColumns.length; iCol++){
        if(this._aColumns[iCol] === oCol){
            return iCol;
        }
    }
    
    return -1;
},

/*
This function performs an incremental search on the column that the list is currently sorted on. In 
case of a static list (pbDataAware is false or peDbGridType is not gtAutomatic) it will perform the 
search completely on the client and select the row. The search on the client is performed as a 
binary search for optimal performance. If piSortColumn is not set nothing will be done.

@param sSearch   The search string.


@client-action
*/
search : function(sSearch){
    var fComp, aData = this._aCache, iCol = this.piSortColumn, iLow = 0, iHigh = aData.length - 1, iMid, iRes, iRow = null, bRev = this.pbReverseOrdering;
    
    if(iCol < 0){
        return;
    }
    
    if((!this.pbDataAware || this.peDbGridType !== df.gtAutomatic)){
        //  Determine comparison function
        if(this._aColumns[iCol].peDataType === df.ciTypeText){
            //  For text we do a case insensitive comparison of the first characters
            fComp = function(sVal1, sVal2){
                sVal1 = sVal1.substr(0, sVal2.length).toLowerCase();
               
                return sVal1.localeCompare(sVal2);
            };
            
            sSearch = sSearch.toLowerCase();
        }else if(this._aColumns[iCol].peDataType === df.ciTypeBCD){
            fComp = this.compareBCD;
        }else if(this._aColumns[iCol].peDataType === df.ciTypeDate || this._aColumns[iCol].peDataType === df.ciTypeDateTime){
            fComp = this.compareDate;
        }
        
        //  Debugging
        // var fPrevComp = fComp, iCount = 0;
        // fComp = function(sVal1, sVal2){
            // var iRes = fPrevComp(sVal1, sVal2);
            
            // df.debug("Comparing: sVal1='" + sVal1 + "', sVal2='" + sVal2 + "', iRes=" + iRes + ", iLow=" + iLow + ", iMid=" + iMid + ", iHigh=" + iHigh); 
            
            // iCount++;
            
            // return iRes;
        // };
        
        //  Skip the rowid
        iCol++;
        
        //  Do a binary search
        while(iLow < iHigh){
            iMid = Math.floor((iLow + iHigh) / 2);
            iRes = fComp(aData[iMid].aValues[iCol], sSearch);
            iRes = (bRev ? -iRes : iRes);
            
            if(iRes < 0){
                iLow = iMid + 1;
            }else if(iRes > 0){
                iHigh = iMid - 1;
            }else{
                iRow = iMid;
                break;
            }
        }
        
        if(iRes === 0){
            //  We want the first full hit
            if(iRow > 0){
                iRes = fComp(aData[iRow - 1].aValues[iCol], sSearch);
                iRes = (bRev ? -iRes : iRes);
                
                while(iRes === 0 && iRow > 0){
                    iRow--;
                    if(iRow > 0){
                        iRes = fComp(aData[iRow - 1].aValues[iCol], sSearch);
                    }
                }
            }
        }else{
            //  If we didn't find a full hit and iMid is outside range we assume that the range is right
            if(iMid < iLow){
                iRow = iLow;
            }else if(iMid > iLow){
                iRow = iHigh;
            }else{
                iRow = iMid;
            }
        }
    
        //  Move to the row
        this.moveToRow(iRow);
    }else{
        //  For automatic data aware grids we send the search action to the server
        this.serverAction("OnSearch", [ sSearch ]);
    }
},

/*
This function displays the search dialog for doing an incremental search on the list. It creates a 
dialog that has an input form and data settings are based on the current sort column.

@param sOptSearch   The search string.

@client-action
*/
showSearch : function(sOptSearch){
    var oDialog, oForm, iCol = this.piSortColumn;
    
    if(iCol < 0){
        return;
    }
    
    //  Create dialog with panel
    oDialog = new df.WebModalDialog(null, this);
    oDialog.psCaption = this.getWebApp().getTrans("search") + ": " + this._aColumns[iCol].psCaption;
    oDialog.pbShowClose = true;
    oDialog.pbDDHotKeys = false;
    oDialog.pbResizable = false;
    oDialog.piWidth = 320;
    
    //  Create input form
    oForm = new df.WebForm(null, oDialog);
    oForm.psLabel = "";
    oForm.pbShowLabel = false;
    oForm.psValue = sOptSearch || "";
    oForm.peDataType        = this._aColumns[iCol].peDataType;
    oForm.psMask            = this._aColumns[iCol].psMask;
    oForm.piPrecision       = this._aColumns[iCol].piPrecision;
    oForm.piMaxLength       = this._aColumns[iCol].piMaxLength;
    oForm.pbCapslock        = this._aColumns[iCol].pbCapslock;
    
    oDialog.addChild(oForm);
    
    //  Add submit listener
    oDialog.OnSubmit.addListener(function(oEvent){
        var sVal = oForm.get("psValue");
        oDialog.hide();
        
        
        // alert("We will search for: '" + oForm.get("psValue") + "'");
        this.getWebApp().objFocus(this);
        
        this.search(sVal);
        
        if(this._eFocus){
            this._eFocus.focus();
        }
    }, this);
    
    oDialog.show();
    
    df.dom.setCaretPosition(oForm._eControl, oForm._eControl.value.length);
},

/*
Handles the keypress event and will initiate the auto search if needed. The keypress is used because 
we need the character code and are not interested in special keys anyway. 

@param  oEvent  The event object.
@private
*/
onKeyPress : function(oEvent){
    var sChar, iKey, iChar;
    
    //  Auto search
    if(this.pbAutoSearch && this.piSortColumn >= 0 && !this._bNoSearch){
        iKey = oEvent.getKeyCode();
        iChar = oEvent.getCharCode();
        
        //  Check if we where really typing a character
        if(iChar > 0 && iChar !== 13 && !oEvent.isSpecialKey()){ // && (iKey === 0 || (iKey > 48 && iKey < 123)) 

            sChar = String.fromCharCode(oEvent.getCharCode());
            
            //  Filter character based on data type (this is done pretty raw)
            if(this._aColumns[this.piSortColumn].peDataType === df.ciTypeBCD){
                if(("0123456789,.-").indexOf(sChar) < 0){
                    sChar = "";
                }
            }else if(this._aColumns[this.piSortColumn].peDataType === df.ciTypeDate){
                if(("0123456789-").indexOf(sChar) < 0){
                    sChar = "";
                }
            }
            
            //  Display search dialog
            this.showSearch(sChar);
            
            oEvent.stop();
            return false;
        }
    }
    
    return true;
},

/*
This method handles the keypress event and initiates the actions bound to it. The 
df.settings.listKeys define the exact key code's / combinations for the different actions.

@param  oEvent  The event object.
@return False if we did handle the event and performed an action, true if we didn't do anything.
*/
onKeyDown : function(oEvent){
    var that = this;
    
    if(oEvent.matchKey(df.settings.listKeys.scrollUp)){ 
        this.moveUpRow();
    }else if(oEvent.matchKey(df.settings.listKeys.scrollDown)){ 
        this.moveDownRow();
    }else if(oEvent.matchKey(df.settings.listKeys.scrollPageUp)){ 
        this.movePageUp();
    }else if(oEvent.matchKey(df.settings.listKeys.scrollPageDown)){ 
        this.movePageDown();
    }else if(oEvent.matchKey(df.settings.listKeys.scrollTop)){ 
        this.moveToFirstRow();
    }else if(oEvent.matchKey(df.settings.listKeys.scrollBottom)){ 
        this.moveToLastRow();
    }else{
        return true;
    }
    
    //  Temporary block search on key press (stopping onKeyDown doesn't cancel onKeyPress in firefox)
    this._bNoSearch = true;
    setTimeout(function(){
        that._bNoSearch = false;
    }, 50);
    
    oEvent.stop();
    return false;
},

onTableClick : function(oEvent){
    var eElem = oEvent.getTarget();

    //  We need to determine if and which row was clicked so we start at the clicked element and move up untill we find the row
    while(eElem.parentNode && eElem !== this._eTableWrp){
        //  Check if we found the tr element and if it is part of the table
        if(eElem.tagName === "TR" && this._eTable.rows[eElem.rowIndex] === eElem){
            this.selectRow("row", eElem.rowIndex + this._iDispOffset, function(){
                this.focus();
            });
        }
        
        eElem = eElem.parentNode;
    }

},

/*
Handles the onclick event on the list header. It will determine which column is clicked and if 
pbColumnSortable is true and pbSortable of the column is true it will update the sorting by calling 
the changeSorting method.

@param  oEvent  The event object (df.events.DOMEvent).
@return
*/
onHeadClick : function(oEvent){
    var eElem = oEvent.getTarget(), iCol;
    
    if(this.pbColumnSortable){
        //  Find the column header div
        while(eElem.parentNode && eElem !== this._eHead){
            if(eElem.tagName === "TH" && eElem.hasAttribute("data-dfcol")){
                //  Determine the column
                iCol = parseInt(eElem.getAttribute("data-dfcol"), 10);
                if(this._aColumns[iCol]){
                    
                    this._aColumns[iCol].fire("OnHeaderClick", [], function(oEvent){
                        if(!oEvent.bServer && !oEvent.bClient){
                            if(this._aColumns[iCol].pbSortable){
                                //  Update the sortcolumn property
                                if(this.piSortColumn === iCol){
                                    // this.set("pbReverseOrdering", !this.pbReverseOrdering);
                                    this.changeSorting(iCol, !this.pbReverseOrdering);
                                }else{
                                    // this.set("piSortColumn", iCol);
                                    // this.set("pbReverseOrdering", false);
                                    this.changeSorting(iCol, false);
                                }
                            }
                        }
                    }, this);
                }
                
                
                return;
            }
            
            eElem = eElem.parentNode;
        }
    }
},

updateHeader : function(){
    var aHtml = [];
    
    if(this._eHeadWrp){
        this.headerHtml(aHtml);
        this._eHeadWrp.innerHTML = aHtml.join("");
    }
},


/*
This method changes the sorting order to the supplied column and direction. It will update 
piSortColumn and pbReverseOrdering properties and send ChangeSorting to the server. The header is 
also updated.

@param  iCol        Column number to sort on.
@param  bReverse    If true the order will be reversed.
*/
changeSorting : function(iCol, bReverse){
    var iPrevCol = this.piSortColumn, bPrevReverse = this.pbReverseOrdering;
    
    this.addSync('piSortColumn');
    this.addSync('pbReverseOrdering');
    
    this.piSortColumn = iCol;
    this.pbReverseOrdering = bReverse;
    
    //  Data aware grids set to automatic sort on the server
    if(this.pbDataAware && this.peDbGridType === df.gtAutomatic){
        this.serverAction("ChangeSorting", [ iCol, bReverse, iPrevCol, bPrevReverse ]);
    }else{
        this.sortData();
        this.scrollToCurrentRow();        
        this.refreshDisplay();
    }
    
    this.updateHeader();
},

onHeadMouseDown : function(oEvent){
    var eTarget = oEvent.getTarget();

    //    Check if it is the resize div
    if(eTarget.className === 'WebList_ColSep' && this.pbColumnsResizable){
        this.resizeColumn(oEvent, parseInt(eTarget.getAttribute('data-dfcol'), 10));
        
        oEvent.stop();
        return false;
    }
    
    return true;
},

onTableDblClick : function(oEvent){
    this.fireSubmit();
},

// - - - - - - - Public API - - - - - - -

/*

@client-action
*/
gridRefresh : function(bFirst, bLast){
    //  Cancel row change because it will fail!
    this.cancelServerAction("ChangeCurrentRow");
    this._bInvalidRow = false;
    
    this.clearCache();
    
    this.handleDataPage("page", "", bFirst, bLast);
    
    this.ready(function(){
        if(this.psCurrentRowID === ""){
            this._bInvalidRow = true;
            if(this._aCache.length > 0){
                this.selectRow("row", 0, function(){
                    this.scrollToCurrentRow();
                });
            }else{
                this.appendNewRow();
            }
        }
    });
},




/*
Scrolls to the first record and selects it. It is called by the keyboard handler or from the server. 
In case of a static grid it will directly call the selectRow function to select the first row, for a 
non-static grid (pbDataAware is true or peDbGridType is not gtAutomatic) it will always refresh the 
cache by loading the first page of records. Note that when pbOfflineEditing is true we need to load 
the first cache page before changing rows.

@client-action
*/
moveToFirstRow : function(){
    var fSelect, sRowID = this.psCurrentRowID, iRow; 
    
    iRow = this.findRowByRowId(sRowID);
    
    fSelect = function(){
        if(this._aCache.length > 0){
            this.selectRow("row", 0, function(bChanged){
                if(bChanged){
                    this.scrollToCurrentRow();
                }
            });
        }else{
            this.appendNewRow();
        }        
    };
    
    if(!this.pbDataAware || this.peDbGridType !== df.gtAutomatic){
        fSelect.call(this);
    }else{
        if(this.pbOfflineEditing || (iRow === 0 && sRowID === "")){
            this.loadCachePage("first", function(){
                fSelect.call(this);
            });
        }else{
            this.selectRow("first", -1, function(bChanged){
                if(bChanged){
                    //this.loadCachePage("last"); // This is now done by the server!
                    this.scrollToCurrentRow();
                }
            });
        }
    }
},

/*
Scrolls to the last record and selects it. It is called by the keyboard handler or from the server. 
In case of a static grid it will directly call the selectRow function to select the last row, for a 
non-static grid (pbDataAware is true or peDbGridType is not gtAutomatic) it will always refresh the 
cache by loading the last page of records. Note that when pbOfflineEditing is true we need to load 
the last cache page before changing rows.

@client-action
*/
moveToLastRow : function(){
    var fSelect, sRowID = this.psCurrentRowID, iRow; 
    
    iRow = this.findRowByRowId(sRowID);
    
    fSelect = function(){
        if(this._aCache.length > 0){
            this.selectRow("row", this._aCache.length - 1, function(bChanged){
                if(bChanged){
                    this.scrollToCurrentRow();
                }
            });
        }else{
            this.appendNewRow();
        }   
    };
    
    if(!this.pbDataAware || this.peDbGridType !== df.gtAutomatic){
        fSelect.call(this);
    }else{
        if(this.pbOfflineEditing || (iRow === 0 && sRowID === "")){
            this.loadCachePage("last", function(){
                fSelect.call(this);
            });
        }else{
            this.selectRow("last", -1, function(bChanged){
                if(bChanged){
                    //this.loadCachePage("last"); // This is now done by the server!
                    this.scrollToCurrentRow();
                }
            });
        }
    }
},

/*
This method selects the next row available in the cache and returns true if successful. It is called 
by the key handler or the server.

@return True if a next row is available.
@client-action
*/
moveDownRow : function(){
    var iRow = this.findRowByRowId(this.psCurrentRowID);
    if(iRow >= 0 && iRow < this._aCache.length - 1){
        iRow++;
        
        this.selectRow("row", iRow, function(bChanged){
            if(bChanged){
                this.scrollToCurrentRow();
            }
        });
        
        return true;
    }
    
    return false;
},

/*
This method selects the previous row available in the cache and returns true if successful. It is 
called by the key handler or the server.

@return True if a previous row is available.
@client-action
*/
moveUpRow : function(){
    var iRow = this.findRowByRowId(this.psCurrentRowID);

    if(iRow > 0){
        iRow--;
        
        this.selectRow("row", iRow, function(bChanged){
            if(bChanged){
                this.scrollToCurrentRow();
            }
        });
    }
},

/*
This method performs a page down which means that it select the record one page down in the cache 
and scrolls to it. A page in this context means the amount of rows that fit inside the grid view. It 
is called by the key handler or the server.

@client-action
*/
movePageDown : function(){
    var iRow = this.findRowByRowId(this.psCurrentRowID);
    
    iRow = iRow + this.getViewSize() - 1;
    if(iRow >= this._aCache.length){
        iRow = this._aCache.length - 1;
    }
    
    this.selectRow("row", iRow, function(bChanged){
        if(bChanged){
            this.scrollToCurrentRow();
        }
    });
},

/*
This method performs a page up which means that it select the record one page up in the cache and 
scrolls to it. A page in this context means the amount of rows that fit inside the grid view. It is 
called by the key handler or the server.

@client-action
*/
movePageUp : function(){
    var iRow = this.findRowByRowId(this.psCurrentRowID);
    
    iRow = iRow - this.getViewSize() + 1;
    if(iRow < 0){
        iRow = 0;
    }
    
    this.selectRow("row", iRow, function(bChanged){
        if(bChanged){
            this.scrollToCurrentRow();
        }
    });
},

/*
This method moves to a specific row based on its row index.

@client-action
*/
moveToRow : function(iRowIndex){
    //  Since this method can be called from the server the parameter might still be a string
    iRowIndex = parseInt(iRowIndex, 10);

    if(iRowIndex >= 0 && iRowIndex < this._aCache.length){
        this.selectRow("row", iRowIndex, function(bChanged){
            if(bChanged){
                this.scrollToCurrentRow();
            }
        });
    }
},

/*
This method moves to a specific row based on its unique row ID.

@client-action
*/
moveToRowByID : function(sRowID){
    var iRowIndex = this.findRowByRowId(sRowID);
    
    if(iRowIndex >= 0){
        this.moveToRow(iRowIndex);
    }
},

/*
@client-action
*/
processDataSet : function(eOperation){
    var iRow = this.findRowByRowId(this.psCurrentRowID);

    this.serverAction("HandleProcessDataSet", [ eOperation, iRow ], this._aCache);
},

/*
Setter method for the pbColumnSortable property that updates the header so it displays the columns 
as sortable or not.

@param  bVal    The new value.
*/
set_pbColumnSortable : function(bVal){
    if(this._eElem){
        this.pbColumnSortable = bVal;
        this.updateHeader();
    }
},

set_pbColumnsResizable : function(bVal){
    //  Reset column sizes to orrigional when resetting
    if(!bVal){
        df.dom.removeClass(this._eHeadWrp, 'WebList_ColResizable');
        
        this.calculateColumnSizes();
        if(this._eElem){
            this.updateHeader();
            this.updatePosition(true);
        }
    }else{
        df.dom.addClass(this._eHeadWrp, 'WebList_ColResizable');
    }
},

get_piCurrentRowIndex : function(){
    return this.findRowByRowId(this.psCurrentRowID);
},

get_piRowCount : function(){
    return this._aCache.length;
},

/* 
Setter method that updates the header to reflect the current sorting.

@param  iVal    The new value.
*/
set_piSortColumn : function(iVal){
    if(this._eTableWrp && this.piSortColumn !== iVal){
        this.piSortColumn = iVal;
        
         // Refresh the header
        this.updateHeader();
    }
},

/* 
Setter method that updates the header to reflect the current sorting.

@param  bVal    The new value.
*/
set_pbReverseOrdering : function(bVal){
    if(this._eTableWrp && this.pbReverseOrdering !== bVal){
        this.pbReverseOrdering = bVal;
        
         // Refresh the header
        this.updateHeader();
    }
},


// - - - - - - - Grid API Stubs - - - - - - -
appendNewRow : function(){
    return false;
},

// - - - - - - - Focus - - - - - - -
/*
We override the focus method and make it give the focus to the hidden focus holder element.

@return True if the List can take the focus.
*/
focus : function(){
    if(this._bFocusAble && this.pbEnabled && this._eFocus){
        this._eFocus.focus();
        return true;
    }

    return false;
},

onListClick : function(oEvent){
    this.focus();
},

onFocus : function(oEvent){
    if(!this._bHasFocus){
        df.WebList.base.onFocus.call(this, oEvent);
    }
    
    this._bLozingFocus = false;
},

onBlur : function(oEvent){
    var that = this;
    
    this._bLozingFocus = true;
    
    setTimeout(function(){
        if(that._bLozingFocus){
            df.WebList.base.onBlur.call(that, oEvent);
            
            that._bLozingFocus = false;
        }
    }, 100);
},

// - - - - - - - Sizing - - - - - - -

setHeight : function(iHeight){
    if(this._eBody){
        //  The list has a hard-coded minimum of 80px
        if(iHeight <= 80){
            iHeight = 80;
        }
    
        //  If the label is on top we reduce that (note that this means that piMinHeight and piHeight are including the label)
        if(this.peLabelPosition === df.ciLabelTop){
            iHeight -= this._eLbl.offsetHeight;
        }
        
        //  Reduce the grid header
        iHeight -= this._eHead.offsetHeight;
        
        //  Reduce the margins, paddings and border widths of the wrapping elements
        iHeight -= df.sys.gui.getVertBoxDiff(this._eBody);
        iHeight -= df.sys.gui.getVertBoxDiff(this._eBodyWrp);
        iHeight -= df.sys.gui.getVertBoxDiff(this._eInner);
        iHeight -= df.sys.gui.getVertBoxDiff(this._eControlWrp);

        //iHeight -= 4;
        //  Set the height on the grid body
        this._eBody.style.height = iHeight + "px";
        this._eScrollbar.style.height = iHeight + "px";
    }
},

resize : function(){
    var iWidth, iScrollbarWidth;

    iScrollbarWidth = this._eBody.clientWidth - this._eTableWrp.clientWidth;
    
    //  Adjust the margin for the scrollbar
    if(iScrollbarWidth > 0){
        this._eHead.style.paddingRight = iScrollbarWidth + "px";
    }
    
    //  Determine and remember table width
    iWidth = this._eBodyWrp.clientWidth;
    iWidth -= df.sys.gui.getHorizBoxDiff(this._eBody);
    this._iTableWidth = iWidth;
    
    this.updateRowHeight();
    this.updateScrollSize();
    this.updatePosition((this._iTableHeight !== this._eTableWrp.clientHeight));  //  Force redraw if height changed
    this.updateHeader();
    
    //  Remember table height
    this._iTableHeight = this._eTableWrp.clientHeight;
}

});

