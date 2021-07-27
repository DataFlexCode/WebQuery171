/*
Namespace:
    df.sys.vt

This namespace contains the functionality needed to work with valuetrees. It can serialize and 
deserialize the valuetrees from and to usable objects. It is capable of generating a serialize and 
deserialize function based on a provided format as optimization. For the generation and live 
deserialization it is required to provide the format which can be done by passing an example object
 structure where actual values are replaced with integer constants representing the type. An example 
 is given below.
@code
{ aArray : [ { sMember : df.tString, iMember : df.tInt } ], bMember : df.tBool }
@code

Revision:
    2013/11/02  (HW, DAW) 
        Initial version.
*/
df.sys.vt = {

/* 
Generates a deserialization function based on the provided format definition. The function will know 
the format allowing it parse the valuetree faster. The resulting function has a single parameter 
(the value tree) and returns the object structure.

@code
myParser = df.sys.vt.generateDeserializer({ aArray : [ { sMember : df.tString, iMember : df.tInt } ], bMember : df.tBool });
oObj = myParser(tVT);
@code

@param  tDef    Format definition.
@return Function that can parse a value tree into an object structure with the provided format.
*/
generateDeserializer : function(tDef){
    var aCode = [], iFC = 0;
    
    function parseObj(sC, tDef){
        var sM, i = 0, iFunc = iFC++, aFunc = [];
        
        aFunc.push( 'function p', iFunc, '(tVT){', 
                        'return {');
        
        for(sM in tDef){
            if(tDef.hasOwnProperty(sM)){
                if(i > 0){
                    aFunc.push(',');
                }
                aFunc.push(sM, ':', switchType('tVT.c[' + i + ']', tDef[sM]));
                
                i++;
            }
        }
        
        aFunc.push(     '};',
                    '}');
        
        aCode.push(aFunc.join(''));
        
        return 'p' + iFunc + '(' + sC + ')';
    }
    
    function parseArray(sC, tDef){
        var iFunc = iFC++, aFunc = [];
        
        aFunc.push( 'function p', iFunc, '(tVT){', 
                        'var a = [], i; ', 
                        'for(i = 0; i < tVT.c.length; i++){');
        
        aFunc.push(         'a.push(', switchType('tVT.c[i]', tDef[0]), ');');
        
        aFunc.push(     '}', 
                        'return a;', 
                    '}');
        
        aCode.push(aFunc.join(''));
        
        return 'p' + iFunc + '(' + sC + ')';
    }
    
    function parseEndNode(sC, tDef){
        switch(tDef){
            case df.tBool:
                return 'df.toBool(' + sC + '.v)';
            case df.tInt:
                return 'df.toInt(' + sC + '.v)';
            default:
                return sC + '.v';
        }
    }
    
    function switchType(sC, tDef){
        if(typeof(tDef) === "number"){
            return parseEndNode(sC, tDef);
        }
        if(tDef instanceof Array){
            return parseArray(sC, tDef);
        }
        return parseObj(sC, tDef);
    } 
    
    
    
    aCode.push( 'try{', 
                    'return ', switchType("tVT", tDef), ';',
                '}catch(oErr){',
                    'throw new df.Error(999, "Unable to deserialize valuetree, invalid data format!\\n\\r\\n\\rMSG: {{0}}", this, [ oErr.message ]);',
                '}');
    
    // aCode.push('})');
    
    return new Function("tVT", aCode.join('')); //eval(aCode.join(""));
},

/*
Generates a serialization function based on the provided format definition. The function will know 
the format allowing it to generate the valuetree faster than when using object reflection.

@code
serializeVT = df.sys.vt.generateSerializer({ aArray : [ { sMember : df.tString, iMember : df.tInt } ], bMember : df.tBool });
tVT = serializeVT(tStruct);
@code

@param  tDef    Definition object.
@return Function that can generate a value tree for objects of this format.
*/
generateSerializer : function(tDef){
    var aCode = [], iFC = 0;
    
    function parseObj(sC, tDef){
        var sM, i = 0, iFunc = iFC++, aFunc = [];
        
        aFunc.push('function p', iFunc, '(oObj){', 
                        'return {', 
                            'v : "",',
                            'c : [');
        
        for(sM in tDef){
            if(tDef.hasOwnProperty(sM)){
                if(i > 0){
                    aFunc.push(',');
                }
                aFunc.push(switchType('oObj["' + sM + '"]', tDef[sM]));
                
                i++;
            }
        }
        
        aFunc.push(         ']',
                        '};',
                    '}');
        
        aCode.push(aFunc.join(''));
        
        return 'p' + iFunc + '(' + sC + ')';
    }
    
    function parseArray(sC, tDef){
        var iFunc = iFC++, aFunc = [];
        
        aFunc.push('function p', iFunc, '(aArray){',
                        'var tVT = { v : "", c : [] }, i;',
                        'for(i = 0; i < aArray.length; i++){');
        
        aFunc.push(         'tVT.c.push(', switchType('aArray[i]', tDef[0]), ');');
        
        aFunc.push(     '}',
                        'return tVT;',
                    '}');
        
        aCode.push(aFunc.join(''));
        
        return 'p' + iFunc + '(' + sC + ')';
    }
    
    function parseEndNode(sC, tDef){
        switch(tDef){
            case df.tBool:
                return '{ v : df.fromBool(' + sC + '), c : [] }';
            default:
                return '{ v : ' + sC + '.toString(), c : [] }';
        }
    }
    
    function switchType(sC, tDef){
        if(typeof(tDef) === "number"){
            return parseEndNode(sC, tDef);
        }
        if(tDef instanceof Array){
            return parseArray(sC, tDef);
        }
        return parseObj(sC, tDef);
    } 
    
    
    
    aCode.push( 'try{', 
                    'return ', switchType("tStruct", tDef), ';',
                '}catch(oErr){',
                    'throw new df.Error(999, "Unable to serialize valuetree, invalid data format!\\n\\r\\n\\rMSG: {{0}}", this, [ oErr.message ]);',
                '}');
    
    
    // aCode.push('})');
    
    return new Function("tStruct", aCode.join('')); //eval(aCode.join(""));
},

/*
Deserializes a valuetree into usable objects based on the provided format.

@param  tVT     The value tree.
@param  tDef    Definition object.
@return Objects based on the definition containing the data from the value tree.
*/
deserialize : function(tVT, tDef){
    
    function parseObj(tVT, tDef){
        var sM, i = 0, oRes = {};
        
        for(sM in tDef){
            if(tDef.hasOwnProperty(sM)){
                oRes[sM] = switchType(tVT.c[i], tDef[sM]);
                
                i++;
            }
        }
        
        return oRes;
    }
    
    function parseArray(tVT, tDef){
        var i, aRes = [];
        
        for(i = 0; i < tVT.c.length; i++){
            aRes.push(switchType(tVT.c[i], tDef[0]));
        }
        
        return aRes;
    }
    
    function parseEndNode(tVT, tDef){
        switch(tDef){
            case df.tBool:
                return df.toBool(tVT.v);
            case df.tInt:
                return df.toInt(tVT.v);
            default:
                return tVT.v;
        }
    }
    
    function switchType(tVT, tDef){
        if(typeof(tDef) === "number"){
            return parseEndNode(tVT, tDef);
        }
        if(tDef instanceof Array){
            return parseArray(tVT, tDef);
        }
        return parseObj(tVT, tDef);
    } 
    
    try{
        return switchType(tVT, tDef);
    }catch(oErr){
        throw new df.Error(999, "Unable to deserialize valuetree, invalid data format!\\n\\r\\n\\rMSG: {{0}}", this, [ oErr.message ]);
    }
},

/* 
Serializes the passed objects into a value tree. It will serialize all the available properties of 
the objects themselves (so not of the prototype).

@param  tStruct Data objects to serialize.
@return Valuetree with the data.
*/
serialize : function(tStruct){
    function parseObj(oObj){
        var sM, oRes = {v : "", c : []};
        
        for(sM in oObj){
            if(oObj.hasOwnProperty(sM)){
                oRes.c.push(switchType(oObj[sM]));
            }
        }
        
        return oRes;
    }
    
    function parseArray(aArray){
        var i,  oRes = {v : "", c : []};
        
        for(i = 0; i < aArray.length; i++){
            oRes.c.push(switchType(aArray[i]));
        }
        
        return oRes;
    }
    
    function parseEndNode(oObj){
        switch(typeof oObj){
            case "boolean":
                return { v : df.toBool(oObj), c : [] };
            default:
                return { v : oObj.toString(), c : [] };
        }
    }
    
    function switchType(tStruct){
        if(typeof(tStruct) === "object"){
            if(tStruct instanceof Array){
                return parseArray(tStruct);
            }
            return parseObj(tStruct);
        }
        return parseEndNode(tStruct);
        
    } 
    
    try{
        return switchType(tStruct);
    }catch(oErr){
        throw new df.Error(999, "Unable to serialize valuetree, invalid data format!\\n\\r\\n\\rMSG: {{0}}", this, [ oErr.message ]);
    }
}

};