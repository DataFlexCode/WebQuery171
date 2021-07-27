Use Windows.pkg
Use DFClient.pkg
Use Winprint2.pkg
Use DateFunctions.pkg
Use Winprint2Functions.pkg

/TestImageHeader
<BLD>Winprint2Functions.pkg package test<bld>
-----------------------------------

/TestImage
<BLD>  String  <nop> Number<nop> Date <bld>
<nop>  _______ <ITL>____.__<itl> __/__/____
/TestImage2
      0        1         2         3         4         5         6
    0 123456789012345678901234567890123456789012345678901234567890
    1 (Characters 0 to 31 left out)   !"#$%&'()*+,-./0123456789:;<
   61 =>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwx
  121 yz{|}~€‚ƒ„…†‡ˆ‰Š‹Œ‘’“”•–—˜™š›œŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´
  181 µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏĞÑÒÓÔÕÖ×ØÙÚÛÜİŞßàáâãäåæçèéêëìíîïğ
  241 ñòóôõö÷øùúûüışÿ
  
                      ÚÄÄÄÂÄÄÄ¿  ÕÍÍÍÑÍÍÍ¸  ÖÄÄÄÒÄÄÄ·  ÉÍÍÍËÍÍÍ»
                      ³   ³   ³  ³   ³   ³  º   º   º  º   º   º
                      ÃÄÄÄÅÄÄÄ´  ÆÍÍÍØÍÍÍµ  ÇÄÄÄ×ÄÄÄ¶  ÌÍÍÍÎÍÍÍ¹
                      ÀÄÄÄÁÄÄÄÙ  ÔÍÍÍÏÍÍÍ¾  ÓÄÄÄĞÄÄÄ½  ÈÍÍÍÊÍÍÍ¼
  
    Normal
    <BLD>Bold<bld>              <nop><ITL>Italic<itl><nop>                 <nop><BLD><ITL>Bold, Italic<itl><bld>
    <UND>Underline<und>         <UND><ITL>Underline, Italic<und><itl>      <UND><ITL><BLD>Underline, Italic, Bold<und><itl><bld>
/*

Activate_View Activate_oWinprint2FunctionsTestView for oWinprint2FunctionsTestView
Object oWinprint2FunctionsTestView is a dbView

    Set Size to 200 300
    Set Location to 2 2
//    Set pbAutoActivate to True
    Set Label to "Output Image to WinPrint2 Report (Winprint2Functions.pkg)"

    Object oButton1 is a Button
        Set Size to 14 118
        Set Location to 81 88
        Set Label to 'Output images to report'
    
        // fires when the button is clicked
        Procedure OnClick
            Integer PageNumber
            String sValue
            Get SystemTimeString of oDateFunctions to sValue
            
            Send DFSetMargins of ghoWinPrint2 2 2 2 2 2
            Send DFNewDoc of ghoWinPrint2 True
            Get  DFNewPage of ghoWinPrint2 0 to PageNumber
            
            Send DFSetFont of ghoWinPrint2 "Courier New"
            
            Send DFSetFontSize of ghoWinPrint2 16
            Send OutputImage of oWinprint2Functions TestImageHeader.N
            Send DFSetFontSize of ghoWinPrint2 10
            
            For WindowIndex from 0 to 9
                Send DFWrite of ghoWinPrint2 (String(WindowIndex)) FONT_BOLD 0 -1 0
                Send DFWrite of ghoWinPrint2 (String(WindowIndex)) FONT_ITALIC 0 -1 0
                Send DFWrite of ghoWinPrint2 (String(WindowIndex)) 0 0 -1 0
            Loop
            Send DFWriteLn of ghoWinPrint2 "" 0 0 -1 0
            For WindowIndex from 0 to 9
                Send DFWrite of ghoWinPrint2 (String(WindowIndex)) 0 0 -1 0
                Send DFWrite of ghoWinPrint2 (String(WindowIndex)) 0 0 -1 0
                Send DFWrite of ghoWinPrint2 (String(WindowIndex)) 0 0 -1 0
            Loop
            
            Send Writeln of oWinprint2Functions ""
            Send Writeln of oWinprint2Functions ""
            
            Print "Yahoo" to TestImage.1
            Print 3.14 to TestImage.2
            Sysdate TestImage.3
            Send OutputImage of oWinprint2Functions TestImage.N
            
            Send Writeln of oWinprint2Functions ""

            Send OutputImage of oWinprint2Functions TestImage2.N
            
            Set PrintDlgInPreview of ghoWinPrint2 to False
            Send DFEndDocument of ghoWinPrint2
            Send DFPreviewNoWait of ghoWinPrint2
        End_Procedure
    
    End_Object

End_Object
