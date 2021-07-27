/*
Class:
    df.WebGrid
Extends:
    df.WebList

This is the client-side representation of the cWebGrid control. It extends the cWebList control with 
edit functionality. Editing means that the selected cell value is replaced with an edit control 
(usually an input element). The nested column object is responsible for creating the DOM elements 
for editing, the grid is only responsible for adding it to the DOM and removing it from the DOM. 
Saving is usually done automatically by the server when the ChangeCurrentRow event is fired on the 
server.
    
Revision:
    2011/12/15  (HW, DAW) 
        Initial version.
*/
df.WebGrid = function WebGrid(sName, oParent){
    df.WebGrid.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tBool, "pbAllowInsertRow", true);
    this.prop(df.tBool, "pbAllowAppendRow", true);
    
    
    // @privates
    this._tNewRow = null;
    
    this._iCurrentColumn = null;
    this._iNewCurrentColumn = 0;
    this._eEditCell = null;
    this._bCellEdit = false;
    
    this._bFocusEdit = true;
    this._bNewRowAppend = false;
    this._bGridRefresh = false;
    
    this._aOrigRow = null;    //  Orrigional values of the current row used for clearing
    
    this._iNewCount = 0;
    
    //  Configure super classes
    this.pbAutoSearch = false;
    this._sControlClass = "WebGrid";
    this._bRenderChildren = true;
};
df.defineClass("df.WebGrid", "df.WebList",{

// - - - - - - - Core - - - - - - -

/*
Implementation of the renderChildren method that makes sure that the grid columns render themselves. 
The DOM elements of the columns are not inserted into the DOM yet. They are used later when a cell 
is edited.
*/
renderChildren : function(){
    var i;
    
    for(i = 0; i < this._aColumns.length; i++){
        this._aColumns[i].pbShowLabel = false;
        this._aColumns[i].render();
        this._aColumns[i].afterRender();
        
        //  Determine the initial column
        if(this._aColumns[i].pbRender && this._iCurrentColumn === null){
            this._iCurrentColumn = i;
        }
    }
},

/*
This method augments the insertRow method and adds support for the editcell of the grid. That means 
that I will insert the edit cell when the inserted row is the current row.

@param  tRow       The row object from the cache.
@param  bTop       If true the row is inserted at the top of the table.
*/
insertRow : function(tRow, bTop){
    var iRow;
    
    df.WebGrid.base.insertRow.call(this, tRow, bTop);
    
    if(tRow && tRow.sRowID === this.psCurrentRowID){
        iRow = this.findRowByRowId(this.psCurrentRowID);
  
        this.editCell(iRow, this._iCurrentColumn);
    }
},

/*
Augments the removeTopRow method and properly removes the element from the DOM and moves the focus 
if the deleted row contains the edit cell.

@private
*/
removeTopRow : function(){
    if(this._eEditCell && this._eEditCell.parentNode === this._eTable.rows[0]){
        if(this._bCellEdit){
            this._eEditCell.removeChild(this._aColumns[this._iCurrentColumn]._eElem);
        }
        this._eEditCell = null;
        this._eFocus.focus();
    }
    
    df.WebGrid.base.removeTopRow.call(this);
},

/*
Augments the removeBottomRow method and properly removes the element from the DOM and moves the 
focus if the deleted row contains the edit cell.

@private
*/
removeBottomRow : function(){
    if(this._eEditCell && this._eEditCell.parentNode === this._eTable.rows[this._eTable.rows.length - 1]){
        this._eEditCell.removeChild(this._aColumns[this._iCurrentColumn]._eElem);
        this._eEditCell = null;
        this._eFocus.focus();
    }
    
    df.WebGrid.base.removeBottomRow.call(this);
},

/*
This method augments the refreshDisplay method with support for the editcell of the grid. It will 
insert the edit cell if the selected row is within the rendered section of the cache.
*/
refreshDisplay : function(){
    var iRow;
    
    //  FIX: Gently remove edit cell from the DOM (IE innerHTML issue)
    if(this._eEditCell){
        if(this._bCellEdit){
            this._eEditCell.removeChild(this._aColumns[this._iCurrentColumn]._eElem);
        }
        this._eEditCell = null;
    }
    
    df.WebGrid.base.refreshDisplay.call(this);
    
    iRow = this.findRowByRowId(this.psCurrentRowID);
    if(iRow >= this._iDispOffset && iRow < this._iDispOffset + this.getDisplaySize()){
        this.editCell(iRow, this._iCurrentColumn);
    }
},

/*
This method augments the selectRow method with the grid specific functionality. It unedits the edit 
cell in the old row and it edits the cell in the selected row. Optionally it directly changes the 
column when needed. It also adds support for the newrow. It inserts the newrow to the cache when it 
is selected and removes it when it is deselected.

@param  sGotoRow    String describing the row that will be selected ("new", "first", "last", "row").
@param  iRow        When sGotoRow indicates "row" then this is the cache row number to select.
*/
selectRow : function(sGotoRow, iRow, fOptHandler){
    var i, iNewRow, iPrevRow = this.findRowByRowId(this.psCurrentRowID), sPrevRowID = this.psCurrentRowID, tSelectRowData = null;
    
    //  Special handling for the new row
    if(sGotoRow === "new"){
        if(this._tNewRow){
            return false;
        }
    
        //  Initialize a new row data object
        this._tNewRow = {
            sRowID : "",
            sClassName : "",
            aCells : []
        };
        
        for(i = 0; i < this._aColumns.length; i++){
            this._tNewRow.aCells.push({ 
                sValue : ( this._aColumns[i].peDataType === df.ciTypeBCD ? "0" : "" ),
                sTooltip : "",
                aOptions : []
            });
        }
        
        //  For non data aware grids we sent it to the server to select it
        if(!this.pbDataAware){
            tSelectRowData = this._tNewRow;
        }
    }
    
    //  When working offline we manually copy data from the DEO's into the cache
    if(this.pbOfflineEditing && iPrevRow >= 0){
        this.updateCacheFromColumns(iPrevRow);
    }
    
    df.WebGrid.base.selectRow.call(this, sGotoRow, iRow, function handleRowChangeGrid(bChanged){
        var bRefresh = false, tRow = null;
        
        //  Get reference to cache row
        if(sGotoRow === "first" && this._bFirst){
            tRow = this._aCache[0];
        }else if(sGotoRow === "last" && this._bLast){
            tRow = this._aCache[this._aCache.length - 1];
        }else if(sGotoRow === "row"){
            tRow = this._aCache[iRow];
        }else if(sGotoRow === "new"){
            tRow = this._tNewRow;
            this._tNewRow = null;   //  Clean so updateCurrentCell won't accidentally use it
        }
        
        //  Store orrigional values for clearing
        this._aOrigRow = df.sys.json.parse(df.sys.json.stringify(tRow));
        
        
        //  Unedit the current cell (do that before messing with the new row
        if(bChanged || this._iNewCurrentColumn !== this._iCurrentColumn){
            this.unEditCell(iPrevRow, this._iCurrentColumn, !bChanged);
        }
        
        //  Remove new row when needed
        if(bChanged && sPrevRowID === "" && iPrevRow >= 0){
            //  We only remove it if it didn't got a rowid (which would mean that it is saved) or it is already removed by client action
            if(this._aCache[iPrevRow] && this._aCache[iPrevRow].sRowID === ""){
                //  Remove the newrow from the cache
                this._aCache.splice(iPrevRow, 1);
                
                //  Update the display
                this.updateScrollSize();
            }
            bRefresh = true;
        }
        
        //  Insert new row when needed
        if(bChanged && sGotoRow === "new"){
            if(this.pbOfflineEditing){
                this.set('psCurrentRowID', "");
            }
        
            if(this._bNewRowAppend){
                if(this._bLast){
                    //  Insert row
                    this._aCache.push(tRow);
                    
                    //  Update display
                    this.updateScrollSize();
                    this.scrollToCurrentRow();
                    bRefresh = true;
                }else{
                    this.loadCachePage("last", function(){
                        //  Insert row
                        this._aCache.push(tRow);
                        
                        //  Update display
                        this.updateScrollSize();
                        this.scrollToCurrentRow();
                        this.updatePosition(true);
                    });
                }
                
            }else{
                //  Insert row
                this._aCache.splice(iPrevRow, 0, tRow);
                
                //  Update display
                this.updateScrollSize();
                bRefresh = true;
            }
            
            if(this.pbOfflineEditing){
                this.updateColumnsFromCache(true);
            }
        }
        
        if(bRefresh){
			if(this._iNewCurrentColumn !== this._iCurrentColumn){
				this._iCurrentColumn = this._iNewCurrentColumn;
			}
            this.updatePosition(true);
        }else{
		   //  Select the new edit cell
			if(bChanged || this._iNewCurrentColumn !== this._iCurrentColumn){
				this._iCurrentColumn = this._iNewCurrentColumn;
				iNewRow = this.findRowByRowId(this.psCurrentRowID);
				this.editCell(iNewRow, this._iCurrentColumn);
			}
		}
        
        if(fOptHandler){
            fOptHandler.call(this, bChanged);
        }
        
    }, tSelectRowData);
},

/*
Called before the cache is manipulated (sorted / refilled). For a non-db grid we need to copy the 
data from the columns into the cache.

@private
*/
onBeforeCacheUpdate : function(){
    if(!this.pbDataAware){
        this.updateCacheFromColumns(this.findRowByRowId(this.psCurrentRowID));
    }
},

/*
Called after the cache is manipulated (sorted / refilled). We copy the data grom the cache into the 
columns for a non-db grid.

@private
*/
onAfterCacheUpdate : function(){
    if(!this.pbDataAware){
        this.updateColumnsFromCache(this._bGridRefresh);
    }
    this._bGridRefresh = false;
}, 

/*
Augment the gridRefresh method and set the indicator to true. This tells the onAfterCacheUpdate 
event that it also needs to clear the changed-states of the columns.

@private
*/
gridRefresh : function(bFirst, bLast){
    this._bGridRefresh = true;

    df.WebGrid.base.gridRefresh.call(this, bFirst, bLast);
},


/*
This method writes back the changes made in the column DEO's to the cache. This is only done when 
pbNonDataAware is true and the column DEO's have been filled from the cache before.

@param  iRow    The row to write the changes to.
@private
*/
updateCacheFromColumns : function(iRow){
    var iCol, bChanged = false;

    //  Update the column value's
    if(!this.pbDataAware){ // && this._bUpdatedColumnsFromCache){
        if(iRow >= 0){
            for(iCol = 0; iCol < this._aColumns.length; iCol++){
                if(this._aColumns[iCol].get('pbChanged')){
                    this._aCache[iRow].aCells[iCol].sValue = this._aColumns[iCol].get('psValue');
                    
                    bChanged = true;
                }
            }
            
            //  If this is a new row and values have been changed then we generate a 'unique' id
            if(bChanged && this._aCache[iRow].sRowID === ""){
                this._aCache[iRow].sRowID = "new_" + (this._iNewCount++);
                this.psCurrentRowID = this._aCache[iRow].sRowID;
            }
        }
    }
},

/*
This method replaces the content of a cell with the edit DOM elements. The column object generates 
the DOM elements.

@param  iRow    The cache row number.
@param  iCol    The number of the column
@private
*/
editCell : function(iRow, iCol){
    var eElem, eCell, oCol = this._aColumns[iCol], iCell, bEdit, eFocus;
    
    //  Calculate cell number based on column number
    iCell = this.colNrToCell(iCol);
    
    //  Check if the row is being displayed
    if(iRow >= this._iDispOffset && iRow < this._iDispOffset + this.getDisplaySize() && oCol && iCell >= 0){
        this._bCellEdit = bEdit = oCol._bCellEdit;
        
        //  Get the edit DOM elements from the column object
        eElem = oCol._eElem;
        
        oCol._bIgnoreOnChange = true;
        
        //  Replace cell content with edit elements
        eCell = this._eTable.rows[iRow - this._iDispOffset].cells[iCell];
        if(eCell !== this._eEditCell){  // FIX: Moving to / from the newrow calls this method twice which triggers IE innerHTML / input bug
            if(bEdit){
                eCell.innerHTML = "";
                eCell.appendChild(eElem);
            }
            df.dom.addClass(eCell, "WebGrid_EditCell");
        }
        
        oCol.cellEdit();
        
        if(this._bHasFocus){
            if(oCol.pbEnabled){
                if(bEdit){
                    oCol.focus();
                        
                    //  Make sure to select the text
                    if(oCol instanceof df.WebColumn){
                        oCol._eControl.select();
                    }
                    
                    //  FIX: Do again after a small timeout to fix IE issues with masked fields
                    if(df.sys.isIE){
                        setTimeout(function(){
                            // oCol.focus();
                            
                            //  Make sure to select the text
                            if(oCol instanceof df.WebColumn){
                                oCol._eControl.select();
                            }
                        }, 10);
                    }
                }else{
                    eFocus = df.dom.getFirstFocusChild(eCell);
                    if(eFocus){
                        eFocus.focus();
                    }else{
                        this._eFocus.focus();
                    }
                }
            }else{
                this._eFocus.focus();
            }
        }
        
        oCol._bIgnoreOnChange = false;
        
        this._eEditCell = eCell;
    }
},

/*
This method replaces the content of the edit cell with its value.

@param  iRow        The cache row number.
@param  iCol        The number of the column.
@param  bUpdate     If true the cache value is updated.
@private
*/
unEditCell : function(iRow, iCol, bUpdate){
    var oCol, eCell, sVal, iCell, bEdit;

    oCol = this._aColumns[iCol];
    iCell = this.colNrToCell(iCol);
    bEdit = oCol._bCellEdit;
    
    if(bUpdate && bEdit){
        sVal = oCol.get_psValue();
        this._aCache[iRow].aCells[iCol].sValue = sVal;
    }
    
    if(iRow >= this._iDispOffset && iRow < this._iDispOffset + this.getDisplaySize() && this._eTable.rows.length > iRow - this._iDispOffset && iCell >= 0){
        oCol.cellUnEdit();
        
        //  Tempolary place the focus on focus element
        this._bFocusEdit = false;
        this._eFocus.focus();
    
        eCell = this._eTable.rows[iRow - this._iDispOffset].cells[iCell];
        
        //  Remove gently from the DOM (IE doesn't like the rough method)
        if(bEdit){
            if(oCol._eElem.parentNode){
                oCol._eElem.parentNode.removeChild(oCol._eElem);
            }
        }
        eCell.innerHTML = this.cellHtml(oCol, this._aCache[iRow].aCells[iCol]);
        this._eEditCell = null;
        
        df.dom.removeClass(eCell, "WebGrid_EditCell");
        
        if(this._bHasFocus){
            this._eFocus.focus();
        }
    }
},

/*
This method is called by the server to update a single row in the cache or on the display; it is 
usually called after a save. If sRowID is empty then it means that a new row is saved which is added 
to the cache at the last location where a new row was displayed.

@param  sRowID  The original rowid of the row to be updated; empty string if it's a new row.
@param  sRowJSON   JSON string containing the object representing the row to be updated.

@client-action
*/
updateRow : function(sRowID){
    var tRow, iRow, eRow, aRows = this.deserializeVT(this._tActionData);
    
    if(aRows.length > 0){
        //  Get row from the data
        tRow = aRows[0];
        
        //  Find the row to update
        iRow = this.findRowByRowId(sRowID);
        if(iRow >= 0){
            
            //  If this is a new row and the provided rowid is still empty we generate one!
            if(sRowID === "" && tRow.sRowID === ""){
                tRow.sRowID = "new_" + (this._iNewCount++);
                if(this.psCurrentRowID === ""){
                    this.psCurrentRowID = tRow.sRowID;
                }
            }
            
            //  Replace row in cache
            tRow.bZebra = this._aCache[iRow].bZebra;
            this._aCache[iRow] = tRow;
            
            //  Check if display needs update
            if(this.psCurrentRowID !== sRowID){
                if(iRow >= this._iDispOffset && iRow < this._iDispOffset + this.getDisplaySize()){
                    eRow = this._eTable.rows[iRow - this._iDispOffset];
                    
                    //  Update displayed row
                    this.loopCols(function(oCol, iCol, bLast, iCount){
                        //  FIX: Skip the currently selected cell (IE input DOM elements dissapear when setting innerHTML)
                        if(eRow.cells[iCount] !== this._eEditCell){
                            eRow.cells[iCount].innerHTML = this.cellHtml(oCol, tRow.aCells[iCol]);
                        }
                    });
                }
            }
        }
    }
},

/*
This method is called by the server to update the cache when a row is deleted. It removes the row 
from the cache and updates the display.

@param  sRowID   The unique ID of the row that is deleted.

@client-action
*/
removeRow : function(sRowID){
    var iRow, sGotoRow = "row";

    
    iRow = this.findRowByRowId(sRowID);
    if(iRow >= 0){
        this._aCache.splice(iRow, 1);
        
        this.updateScrollSize();
        this.updatePosition(true);
        
        if(sRowID === this.psCurrentRowID){
            this.psCurrentRowID = null;
            
            if(iRow >= this._aCache.length){
                iRow--;
                if(iRow < 0){
                    if(this.pbAllowAppendRow){
                        sGotoRow = "new";
                    }else{
                        return;
                    }
                }
            }

            this.selectRow(sGotoRow, iRow, function(){
                this.focus();
            });
        }
    }else{
        throw new df.Error(999, "Could not find row to delete!", [], this);
    }
},

clearRow : function(sRowID){
    var iRow, iCol;

    if(sRowID === this.psCurrentRowID){
        iRow = this.findRowByRowId(sRowID);
            
        if(iRow >= 0){
            // ToDo: This doesn't work!! We need to get the orrigional unedited values from somewhere!
            for(iCol = 0; iCol < this._aColumns.length; iCol++){
                if(this._aColumns[iCol].get('pbChanged')){
                    this._aColumns[iCol].set('psValue', (this._aOrigRow && this._aOrigRow.aCells[iCol].sValue) || "");
                    this._aColumns[iCol].set('pbChanged', false);
                }
            }
        }
    }
},

/*
This method is called by the column when its value is updated. It will update the cache with the new 
value and if the selected record is rendered then it will also update the display.

@param  oCol    The column object.
@param  sVal    The new value.
*/
updateCurrentCell : function(oCol, sVal){
    var iRow, iCol, iCell;
    
    iCol = this.findColNr(oCol);
    
    if(this._tNewRow && this.psCurrentRowID === ""){
        //  Update the new row waiting to be inserted
        this._tNewRow.aCells[iCol].sValue = sVal;
        
    }else{
        //  Find row
        iRow = this.findRowByRowId(this.psCurrentRowID);    
        
        if(iRow >= 0){
            
            //  Update cache
            this._aCache[iRow].aCells[iCol].sValue = sVal;
            
            //  Check if display needs update
            if(this._eTable && iRow >= this._iDispOffset && iRow < this._iDispOffset + this.getDisplaySize()){
                iCell = this.colNrToCell(iCol);
                if(iCell >= 0 && iCol !== this._iCurrentColumn && this._eTable.rows.length > iRow - this._iDispOffset){
                    this._eTable.rows[iRow - this._iDispOffset].cells[iCell].innerHTML = this.cellHtml(oCol, this._aCache[iRow].aCells[iCol]);
                }
            }
        }
    }
},

/*
Augment the processDataSet function so that it copies data from the DEO’s to the cache before 
sending the data to the server.

@client-action
*/
processDataSet : function(eOperation){
    var iRow = this.findRowByRowId(this.psCurrentRowID);

    this.updateCacheFromColumns(iRow);

    df.WebGrid.base.processDataSet.call(this, eOperation);
},

// - - - - - - - Actions - - - - - - -

/*
This method selects the previous column that is enabled and visible. If the first column is selected 
it moves to the previous row.

@client-action
*/
prevCol : function(){
    var iRow, iCol, bPrevRow = false;
    
    //  Determine next available column
    iCol = this._iCurrentColumn;
    do{
        iCol--;
        //  If we get passed the first column we move to the previous row
        if(iCol < 0){
            if(bPrevRow){
                break;
            }
            bPrevRow = true;
            iCol = this._aColumns.length - 1;
        }
    }while(!this._aColumns[iCol].pbEnabled || !this._aColumns[iCol].pbRender);
    
    if(bPrevRow){
        //  Determine current row and if possible move one row back
        iRow = this.findRowByRowId(this.psCurrentRowID);
        
        if(iRow > 0){
            this._iNewCurrentColumn = iCol;
            
            iRow--;
            
            this.selectRow("row", iRow, function(bChanged){
                if(bChanged){
                    this.scrollToCurrentRow();
                }
            });
            
            return true;
        }     
    }else{
        //  Select the previous column
        this.selectCol(iCol);
        this.scrollToCurrentRow();
        return true;
    }
    
    return false;
},

/*
This method selects the next column that is enabled and visible. If the last column is selected it 
moves to the next row.

@client-action
*/
nextCol : function(){
    var iRow, iCol, bNextRow;
    
    //  Determine next available column
    iCol = this._iCurrentColumn;
    
    if(this._aColumns[iCol].validate && this._aColumns[iCol].validate()){
    
        do{
            iCol++;
            //  If we get passed the first column we move to the next row
            if(iCol >= this._aColumns.length){
                if(bNextRow){
                    break;
                }
                bNextRow = true;
                iCol = 0;
            }
        }while(!this._aColumns[iCol].pbEnabled || !this._aColumns[iCol].pbRender);
        
        if(bNextRow){
            iRow = this.findRowByRowId(this.psCurrentRowID);
            
            if(iRow < this._aCache.length - 1){
                iRow++;
                this._iNewCurrentColumn = iCol;
                
                this.selectRow("row", iRow, function(bChanged){
                    if(bChanged){
                        this.scrollToCurrentRow();
                    }
                });
                
                return true;
            }
            if(this._bLast){
                this._iNewCurrentColumn = iCol;
                return this.appendNewRow();
            }
        }else{
            this.selectCol(iCol);
            this.scrollToCurrentRow();
            
            return true;
        }
        
        return false;
    }
},

/*
This method selects a specific column. 

@param  iCol    The index of the column to select.
@client-action
*/
selectCol : function(iCol){
    var iRow = this.findRowByRowId(this.psCurrentRowID);
    
    //  Make sure we deal with an integer (since it can be called from the server)
    iCol = parseInt(iCol, 10);
    
    if(iCol >= 0 && iCol !== this._iCurrentColumn){
         // Unedit the current edit cell
        if(this._iCurrentColumn >= 0){
            this.unEditCell(iRow, this._iCurrentColumn, true);
        }
        
         // Edit the new current cell
        this._iCurrentColumn = iCol;
        this._iNewCurrentColumn = iCol;
        this.editCell(iRow, iCol);
    }
},

clearCache : function(){
    if(this._eEditCell){
        this._eEditCell.removeChild(this._aColumns[this._iCurrentColumn]._eElem);
        
        this._eEditCell = null;
    }
    
    df.WebGrid.base.clearCache.call(this);
},

/*
Augments the moveDownRow function and inserts a new row if no next row was available.

@client-action
*/
moveDownRow : function(){
    if(!df.WebGrid.base.moveDownRow.call(this)){
        if(this._bLast){
            this.appendNewRow();
        }
    }
},

/*
This method inserts a new row above the currently selected row. If inserting a new row is not 
allowed (pbAllowInsertRow) it will try to append a new row (at the end of the grid).

@return True if insert or append is allowed.
@client-action
*/
insertNewRow : function(){
    if(this.pbAllowInsertRow){
        this._bNewRowAppend = false;
        this.selectRow("new", -1);
        return true;
    }
    
    return this.appendNewRow();
},

/*
This method appends a new row at the end of the grid if pbAllowAppendRow is true.

@return True if append is allowed.
@client-action
*/
appendNewRow : function(){
    if(this.pbAllowAppendRow){
        this._bNewRowAppend = true;
        this.selectRow("new", -1);
        return true;
    }
    return false;
},

// - - - - - - - Events - - - - - - -

/* 
This function handles the click event on the list table. It determines which row and which column is 
clicked and makes sure that it gets selected. 

@param  oEvent  Event object.
@private
*/
onTableClick : function(oEvent){
    var eElem = oEvent.getTarget(), iCol = -1, iRow;
    
    this._bHasFocus = true;
    
    //  We need to determine if and which row was clicked so we start at the clicked element and move up untill we find the row
    while(eElem.parentNode && eElem !== this._eBody){
        //  Check if we found the tr element and if it is part of the table
        if(eElem.tagName === "TD"){
            iCol = this.cellToColNr(eElem.cellIndex);
            
        }else if(eElem.tagName === "TR" && this._eTable.rows[eElem.rowIndex] === eElem){
            
            iRow = eElem.rowIndex  + this._iDispOffset;
            if(iRow < this._aCache.length){
                
                //  Notify column of click
                this._aColumns[iCol].cellClick(oEvent, this._aCache[iRow].sRowID, this._aCache[iRow].aCells[iCol].sValue);
            
            
				this._iNewCurrentColumn = iCol;
                
                if(iRow !== this.findRowByRowId(this.psCurrentRowID)){
                    this.selectRow("row", iRow, function(bChanged){
                    
                    });
                }else{
                    if(iCol !== this._iCurrentColumn){
                        this.selectCol(iCol);
                    }
                }
            }else{
				if(this._bLast){
					this._iNewCurrentColumn = iCol;
					this.appendNewRow();
				}
			}
            // oEvent.stop();
            return;
        }
        
        eElem = eElem.parentNode;
    }
    
    if(this._bLast){
        this.appendNewRow();
    }

},

/*
This method augments the WebList onKeyDown method with the next & previous column functionality. 

@param  oEvent  The event object.
@return False if we did handle the event and performed an action, true if we didn't do anything.
@private
*/
onKeyDown : function(oEvent){
    if(oEvent.matchKey(df.settings.gridKeys.prevCol)){ 
        if(this.prevCol()){
            oEvent.stop();
            return false;
        }
    }else if(oEvent.matchKey(df.settings.gridKeys.nextCol)){ 
        if(this.nextCol()){
            oEvent.stop();
            return false;
        }
    }else if(oEvent.matchKey(df.settings.gridKeys.newRow)){ 
        if(this.insertNewRow()){
            oEvent.stop();
            return false;
        }
    }else{
        return df.WebGrid.base.onKeyDown.call(this, oEvent);
    }
    
    return true;
},

// - - - - - - - Focus - - - - - - -

attachFocusEvents : function(){
    df.events.addDomListener("focus", this._eFocus, this.onFocusElemFocus, this);
    
    //  Set the tabIndex of the focus holder negative so that we can tab in and out of the grid
    this._eFocus.tabIndex = -1;
    
    df.WebGrid.base.attachFocusEvents.call(this);
},

/*
We override the focus method and we pass the focus the edit element. If the edit element is not 
rendered we give the focus to the focus holder.

@return True if the List can take the focus.
*/
focus : function(){
    var oCol, iRow;

    if(this._bFocusAble && this.pbEnabled && this._eFocus){
        //  Try to give the focus to the edit cell if it is visible
        iRow = this.findRowByRowId(this.psCurrentRowID);
        if(iRow >= this._iDispOffset && iRow < this._iDispOffset + this.getDisplaySize()){
            //  Give the focus to the column if it wants it
            oCol = this._aColumns[this._iCurrentColumn];
            if(oCol.focus()){
                return true;
            }
        }
        
        //  If the column couldn't take the focus we pass it to the focus holder
        this._bFocusEdit = false;
        this._eFocus.focus();
        return true;
    }
    
    return false;
},

onFocusElemFocus : function(oEvent){
    if(this._bFocusEdit){
        this.focus();
    }
    this._bFocusEdit = true;
}

});