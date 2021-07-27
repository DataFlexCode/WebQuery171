/*
Name:
    df.settings
Type:
    Library(object)

Settings that configure the default behavior of the JavaScript engine. These are not settings that 
would be changed regularly (those are controlled from the server) but mainly things like key-codes.
    
Revisions:
    2008/10/05  Created the initial version and so added the support for it in 
    the further library. (HW, DAE)
    2011/09/25  Refactored into the new VDF 17.1 framework. (HW, DAW)
*/


/*
Using the settings object the AJAX Library default settings can be configured. 
This object contains a JSON notation with the settings that are available. Most 
settings are key codes and are used to attach listeners for default behavior. 
These settings can be modified in the settings.js file itself but note that the 
file is overwritten during upgrades. The best way to override these settings is 
by using the following code in your own includes or pages (after the AJAX 
Library includes).

@code
//  Change the search key of the lookup from ctrl-f to crtl-s
df.settings.listKeys.search = {
    iKeyCode : 83,
    bCtrl : true,
    bShift : false,
    bAlt : false
};
@code

Note that this code should be executed (advised to be placed/included directly 
in the <head> element) before the List object is initialized.
*/
df.settings = {
    /*
    The keys that are used by the df.core.Form for the default actions.
    */
    formKeys : {
        findGT : {
            iKeyCode : 119,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        findLT : {
            iKeyCode : 118,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        findGE : {
            iKeyCode : 120,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        findFirst : {
            iKeyCode : 36,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },
        findLast : {
            iKeyCode : 35,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },
        save : {
            iKeyCode : 113,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        clear : {
            iKeyCode : 116,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        clearAll : {
            iKeyCode : 116,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },
        remove : {
            iKeyCode : 113,
            bCtrl : false,
            bShift : true,
            bAlt : false
        },
        prompt : {
            iKeyCode : 115,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        tabOut : {
            iKeyCode : 9,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        submit : {
            iKeyCode : 13, // Enter
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        escape : {
            iKeyCode : 27,
            bCtrl : false,
            bShift : false,
            bAlt : false
        }
    },
    
    /*
    The keys that are used by the df.core.List engine. The deriving prototypes 
    df.deo.Grid and df.deo.Lookup will also use these settings.
    */
    listKeys : {
        scrollUp : {    //  arrow up
            iKeyCode : 38,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        scrollDown : {  //  arrow down
            iKeyCode : 40,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        scrollPageUp : {    //  page up
            iKeyCode : 33,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        scrollPageDown : {  //  page down
            iKeyCode : 34,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        scrollTop : [{      //  ctrl - home
            iKeyCode : 36,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },{                 //  ctrl - arrow up
            iKeyCode : 38,
            bCtrl : true,
            bShift : false,
            bAlt : false
        }],
        scrollBottom : [{   //  ctrl - end
            iKeyCode : 35,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },{                 //  ctrl -arrow  down
            iKeyCode : 40,
            bCtrl : true,
            bShift : false,
            bAlt : false
        }],
        search : {          //  ctrl - f
            iKeyCode : 70,
            bCtrl : true,
            bShift : false,
            bAlt : false
        }
    },
    gridKeys : {
        nextCol : {         //  tab
            iKeyCode : 9,
            bCtrl : false,
            bShift : false,
            bAlt: false
        },
        prevCol : {         //  shift - tab
            iKeyCode : 9,
            bCtrl : false,
            bShift : true,
            bAlt: false
        },
        newRow : {          //  shift - F10
            iKeyCode : 121,
            bCtrl : false,
            bShift : true,
            bAlt : false
        }
    },
    tabKeys : {
        enter : {
            iKeyCode : 13,
            bCtrl : false,
            bShift : false,
            bAlt : false
        }
    },
    /*
    The keys used by the df.gui.Calendar control. The df.gui.PopupCalendar and 
    df.deo.DatePicker also use these settings.
    */
    calendarKeys : {
        dayUp : {           //  Arrow up
            iKeyCode : 38,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        dayDown : {         //  Arrow down
            iKeyCode : 40,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        dayLeft : {         //  Arrow left
            iKeyCode : 37,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        dayRight : {        //  Arrow right
            iKeyCode : 39,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        monthUp : {         //  Page up
            iKeyCode : 33,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        monthDown : {       //  Page down
            iKeyCode : 34,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        yearUp : {          //  Ctrl - Page up
            iKeyCode : 33,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },
        yearDown : {        //  Ctrl - page down
            iKeyCode : 34,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },
        enter : {           //  Enter
            iKeyCode : 13,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        close : {           //  Escape
            iKeyCode : 27,
            bCtrl : false,
            bShift : false,
            bAlt : false
        }
    },
    
    /*
    The keys that are used by the df.gui.TreeView component.
    */
    treeKeys : {
        moveUp : {
            iKeyCode : 38,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        moveDown : {
            iKeyCode : 40,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        collapse : {
            iKeyCode : 37,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        extend : {
            iKeyCode : 39,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        moveFirst : {
            iKeyCode : 36,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        moveLast : {
            iKeyCode : 35,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        enter : {
            iKeyCode : 13,
            bCtrl : false,
            bShift : false,
            bAlt : false
        }
    },
    
    sliderKeys : {
        sliderUp : {           //  Arrow up
            iKeyCode : 38,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        sliderDown : {         //  Arrow down
            iKeyCode : 40,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        sliderLeft : {         //  Arrow left
            iKeyCode : 37,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        sliderRight : {        //  Arrow right
            iKeyCode : 39,
            bCtrl : false,
            bShift : false,
            bAlt : false
        }
    },
    
    spinKeys : {
        moveUp : {
            iKeyCode : 38,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        moveDown : {
            iKeyCode : 40,
            bCtrl : false,
            bShift : false,
            bAlt : false
        }
    },
    
    suggestionKeys : {
        moveUp : {
            iKeyCode : 38,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        moveDown : {
            iKeyCode : 40,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        select : {
            iKeyCode : 13,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        escape : [{ //  ESC & Tab
            iKeyCode : 27,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },{
            iKeyCode : 9,
            bCtrl : false,
            bShift : false,
            bAlt : false
        }],
        forceDisplay : { // CTRL - Space
            iKeyCode : 32,
            bCtrl : true,
            bShift : false,
            bAlt : false
        }
        

    }
};