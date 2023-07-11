No registers, just memory.

# INSTRUCTIONS
`0b0000 MTH (i16 from), (i16 to)`
 * Four low bits indicate the move operation:

    * `0b0000 SET`: Sets `to` to `from` 
    * `0b0001 SWP`: Swaps `to` and `from`
    * `0b0010 ADD`: Adds `from` to `to`
    * `0b0011 SUB`: Subtracts `from` from `to`
    * `0b0100 MUL`: Multiplies `to` by `from`
    * `0b0101 DIV`: Divides `to` by `from`
    * `0b0110 FLR`: Makes `to` equal to `floor(from)`
    * `0b0111 CEI`: Makes `to` equal to `ceil(from)`
    * `0b1000 MDA`: Makes `to` equal to `to % from`
    * `0b1001 MDB`: Makes `to` equal to `from % to`
    * `0b1010 SIN`: Makes `to` equal to `sin(from)`
    * `0b1011 COS`: Makes `to` equal to `cos(from)`
    * `0b1100 TAN`: Makes `to` equal to `tan(from)`
    * `0b1101 AND`: Makes `to` equal to `to & from`
    * `0b1110 ORR`: Makes `to` equal to `to | from`
    * `0b1111 XOR`: Makes `to` equal to `to ^ from`

# MEMORY
`0x00`: Instruction pointer \
`0x01`: `from` pointer \
`0x02`: `to` pointer \
`0x03`: Stack end (pointer to where the stack ends)

