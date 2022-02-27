
export const ParseStates: {[key: string]: number} = {
	NUM: 0, // .0123456789
	VAR: 0, // a-z A-Z _
	NAM: 0, // 

	CALL: 0, // #
	
	PAR_O: 0, // (
	PAR_C: 0, // )
	CMA: 0, // ,
	
	OPS: 0, // +-*/=!~%&|
	
	IF: 0, // ?
	ELSE: 0, // :

	REM: 0, // //

	RNG_O: 0, // [
	RNG_M: 0, // ;
	RNG_C: 0, // ]
}

let v = 0
let p: string
for (p in ParseStates) {
	ParseStates[p] = ++v
}
