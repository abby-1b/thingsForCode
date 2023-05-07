
REGISTERS:
0x0 => [u32] Accumulator
0x1 => [u32] General purpose
...
0xF => [u32] The stack pointer position (the stack pointer is u16)

INSTRUCTIONS:
param: the 4 low bits of the instruction
arg: the bytes after the instruction

0x0_ => Stop execution (param: exit code)

[the following operations are performed with the accumulator and a single arg[u32]]
0x10 => Math i32 Add
0x11 => Math i32 Subtract
0x12 => Math i32 Multiply
0x13 => Math i32 Divide
0x14 => Math i32 Modulo
0x15 => Math i32 And
0x16 => Math i32 Or
0x17 => Math i32 Xor
0x18 => Math f32 Add
0x19 => Math f32 Subtract
0x1A => Math f32 Multiply
0x1B => Math f32 Divide
0x1C => Math f32 Modulo
0x1D => Math u32 Left-Shift
0x1E => Math u32 Right-Shift
0x1F => [unused]

0x20 => Math i32 Equal To
0x21 => Math i32 Less Than
0x22 => Math i32 More Than
0x23 => Math i32 Sqrt
...
0x28 => Math f32 Equal To
0x29 => Math f32 Less Than
0x2A => Math f32 More Than
0x2B => Math f32 Sqrt
0x2C => Math f32 Sin
0x2D => Math f32 Cos
0x2E => Math f32 Tan
0x2F => Math f32 Atan

0x3_ => Same as 0x1_, but with arg[ureg]
0x4_ => Same as 0x2_, but with arg[ureg]

0x5_ => Puts memory at the location of a register into said register
	(param: number of bytes to read at the location)
	arg[ureg]: The register
0x6_ => Puts a register into memory at a certain location
	(param: number of bytes to write to the location)
	arg[ureg]: The register containing the number to write
	arg[ureg]: The register containing the location to write to
0x7_ => Sets a register to a value
	(param: none)
	arg[ureg]: The register we're setting
	arg[u32]: The value

[the stack pointer here is on the currently available (empty element). 'push' adds the element first, then increments the pointer. 'pop' decrements the pointer, then gets the value.]
0x80 => Push
	arg[ureg]: The register to push
0x81 => Push
	arg[u8]: The value to push
0x84 => Pop
	arg[ureg]: The register to pop to
0x85 => Pops and throws away a value from the stack
	arg[u8]: How many bytes to pop
0x88 => Stores the current instruction pointer in the stack
0x89 => Pops the instruction pointer from the stack, jumping to it

0xB_ => Send a byte to an interface device
	(param: which interface device to send to)
	arg[u8]: the byte to send
0xC_ => Send a register to an interface device
	(param: which interface device to send to)
	arg[u8]:
		highest 4 bits: which register to send
		middle  2 bits: how many bytes to send
		lowest  2 bits: which register to send

0xD0 => Jump
	arg[usize]: The location to jump to
0xD1 => Jump
	arg[ureg]: The register containing the location to jump to

0xD2 => Conditional jump (if the accumulator is zero)
	arg[usize]: The location to jump to
0xD3 => Conditional jump (if the accumulator is zero)
	arg[ureg]: The register containing the location to jump to
0xD4 => Conditional jump (if the accumulator is not zero)
	arg[usize]: The location to jump to
0xD5 => Conditional jump (if the accumulator is not zero)
	arg[ureg]: The register containing the location to jump to

0xE0 => Moves the first register into the second
	arg[ureg]: The first register
	arg[ureg]: The second register
0xE1 => Swaps two registers
	arg[ureg]: The first register
	arg[ureg]: The second register

0xF0 => Copy a chunk of bytes
	arg[ureg]: The register containing the amount of bytes to read
	arg[usize]: The location of the bytes to move
	arg[usize]: The location to move the bytes to
0xF1 => Copy a chunk of bytes
	arg[u8]: the number of bytes to read
	arg[usize]: The location of the bytes to move
	arg[usize]: The location to move the bytes to

