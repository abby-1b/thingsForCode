/*
This holds functions that are a part of AppInventor,
such as RGB functions, random integers, square root, etc...
*/

const fnc = {
    "str": "#B32D5E",
    "arr": "#49A6D4",
    "var": "#D05F2D",
    "col": "#333333",
    "set": "#266643",
	"ctr": "#B18E35"
};
const libFns = {
    "rgb": { color: fnc.col, translate: true, transName: "make color" },
    "len": { color: fnc.arr, translate: true, transName: "length of list" },
    "strlen": { color: fnc.str, translate: true, transName: "length" },
    "join": { color: fnc.str },
    "trim": { color: fnc.str },
    "empty": { color: fnc.str, translate: true, transName: "is empty" },
    "uppercase": { color: fnc.str, translate: true, transName: "upcase" },
    "lowercase": { color: fnc.str, translate: true, transName: "downcase" },
    "includes": { color: fnc.str, translate: true, transName: "contains" },
    "split": { color: fnc.str },
    "replace": { color: fnc.str, translate: true, transName: "replace all" },
    "reverse": { color: fnc.str },
    "copy": { color: fnc.arr, translate: true, transName: "copy list" },
    "set": { color: fnc.set },
    "get": { color: fnc.set },
    "nop": { color: "", translate: true, transName: "evaluate but ignore result" },
	"openScreen": { color: fnc.ctr, translate: true, transName: "open another screen", bIns: "Screen Name: " },
	"openScreenVal": { color: fnc.ctr, translate: true, transName: "open another screen with start value", bIns: "Screen Name: " },
};
const mathFunctions = ["rand", "randi", "min", "max", "sqrt", "abs", "neg", "round", "ceil", "floor", "mod", "sin", "cos", "tan", "asin", "acos", "atan", "atan2"];
const mathFunctionMap = {
    "rand": "random fraction",
    "randi": "random integer",
    "sqrt": "square root",
    "ceil": "ceiling",
    "abs": "absolute",
    "mod": "modulo of"
};
