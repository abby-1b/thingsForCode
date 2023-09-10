
export const instructions = [
	// Registers
	"STX_I8" , // Sets X to the given value (I8 )
	"STX_U8" , // Sets X to the given value (U8 )
	"STX_I16", // Sets X to the given value (I16)
	"STX_U16", // Sets X to the given value (U16)
	"STX_I32", // Sets X to the given value (I32)
	"STX_U32", // Sets X to the given value (U32)
	"STX_F32", // Sets X to the given value (F32)
	"STX_F64", // Sets X to the given value (F64)

	// Loading values from memory
	"LDX_I8" , // Sets X to the value at the memory position X (I8 )
	"LDX_U8" , // Sets X to the value at the memory position X (U8 )
	"LDX_I16", // Sets X to the value at the memory position X (I16)
	"LDX_U16", // Sets X to the value at the memory position X (U16)
	"LDX_I32", // Sets X to the value at the memory position X (I32)
	"LDX_U32", // Sets X to the value at the memory position X (U32)
	"LDX_F32", // Sets X to the value at the memory position X (F32)
	"LDX_F64", // Sets X to the value at the memory position X (F64)

	// Putting values in memory
	"PUT_I8" , // Puts A into memory position X (I8 )
	"PUT_U8" , // Puts A into memory position X (U8 )
	"PUT_I16", // Puts A into memory position X (I16)
	"PUT_U16", // Puts A into memory position X (U16)
	"PUT_I32", // Puts A into memory position X (I32)
	"PUT_U32", // Puts A into memory position X (U32)
	"PUT_F32", // Puts A into memory position X (F32)
	"PUT_F64", // Puts A into memory position X (F64)

	"MVX", // Sets X to the value from the register X points to

	"STA", // Sets A to X
	"STB", // Sets B to X
	"STC", // Sets C to X

	// Does math using A and B, puts the result in A
	"ADD",
	"SUB",
	"MLT",
	"DIV",

	// Does math directly on A
	"INC", // Increments A by 1
	"DEC", // Decrements A by 1

	// Does bitwise math using A and B
	"AND",
	"OR" ,
	"XOR",
	"SHL", // shift left (up)
	"SHR", // shift right (down)


	// Does bitwise math directly on A
	"NOT", // Flips all the bits in A
	"BOL", // 0 if A is zero, otherwise 1
	"NEG", // 1 if A is less than zero, otherwise 0

	// Jumping
	"JMP", // Jumps to the position at X
	"JNZ", // Jumps to X if A isn't zero
	"JZE", // Jumps to X if A is zero

	// Output
	"GOA", // Outputs A to GPIO at index X
	"GOB", // Outputs B to GPIO at index X
	"GOC", // Outputs C to GPIO at index X

	// Input
	"GIX", // Puts the GPIO pin at X into X
	"GIA", // Puts the GPIO pin at X into A
	"GIB", // Puts the GPIO pin at X into B
	"GIC", // Puts the GPIO pin at X into C

	// Timing
	// "SLM", // Sleeps for X milliseconds

	// End
	"END"
]
