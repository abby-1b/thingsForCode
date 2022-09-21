#include <stdint.h>
#include <stdio.h>

/*
let i = 0
	SET 0 to FF
	SET 5 to 00

:loop (4)
print(i)
	SET 0 to FF
	MOV 5 to D
	
i = i + 1
	SET 0 to FF
	MOV 5 to 1
	SET 2 to 01
	SET 3 to 0
	MOV 4 to 5

check(i == 10)
	SET 0 to FF
	MOV 5 to 1
	SET 3 to 04
	SET 2 to 0A

if true :done
	SET E to :done
jmp :loop
	SET F to :loop

:done
*/
// uint8_t mem[0x200] = {0xE2, 0x01, 0x1D, 0x40, 0x21, 0x02, 0xEF, 0x01};
uint8_t mem[0x200] = {
	0xE0, 0xFF, 0xE5, 0x00,
	0xE0, 0xFF, 0x5D,
	0xE0, 0xFF, 0x51, 0xE2, 0x01, 0xE3, 0x00, 0x45,
	0xE0, 0xFF, 0x51, 0xE3, 0x04, 0xE2, 0x0F,
	0xEE, 0x19, // <<< Put :done position here
	0xEF, 0x05, // <<< This is :loop
	0x5D
};
uint16_t reg[5];
// 0- (RW) Address (16 bits)
// 1- (RW) A (16 bits)
// 2- (RW) B (16 bits)
// 3- (RW) Math Operation (8 bits)
// 4- (R ) Math Output (16 bits)
// 5- (RW) Memory at Address (8 bits)

// D- ( W) Print number to output
// E- (R ) Reads ahead (8 bits)
// E- ( W) Jump to position if math doesn't equal zero (16 bits)
// F- (R ) Reads ahead (16 bits)
// F- ( W) Jump to position (16 bits)

void interpret();

int main() {
	interpret();
	printf("%04x %04x %04x %04x %04x %04x\n", reg[0], reg[1], reg[2], reg[3], reg[4], mem[reg[0]]);
}

void interpret() {
	for (int i = 0; i < 5; i++) reg[i] = 0;
	uint16_t ptr = -1;
	int reps = 0;
	while (mem[++ptr] != 0) {
		// printf("[%04x] %04x %04x %04x %04x %04x %04x\n", ptr, reg[0], reg[1], reg[2], reg[3], reg[4], mem[reg[0]]);
		// if (++reps > 130) break;
		uint16_t from = mem[ptr] >> 4;
		int to = mem[ptr] & 0b1111;
		if (from == 15) { from = mem[ptr + 1] << 8 | mem[ptr + 2]; ptr += 2; }
		else from = (from == 14) ? mem[++ptr] : (from < 5) ? reg[from] : mem[reg[0]];
		if (to == 15) { ptr = from; continue; } else if (to == 14) { if (reg[4] != 0) ptr = from; continue; } else if (to == 13) { printf("%d\n", from); continue; }
		if (to < 5) reg[to] = from; else mem[reg[0]] = from;
		if (to == 1 || to == 2 || to == 3 || to == 4) switch (reg[3]) {
			case  0: { reg[4] = reg[1] +  reg[2]; } break; case  1: { reg[4] = reg[1] -  reg[2]; } break;
			case  2: { reg[4] = reg[1] *  reg[2]; } break; case  3: { reg[4] = reg[1] /  reg[2]; } break;
			case  4: { reg[4] = reg[1] == reg[2] ? 1 : 0; } break; case  5: { reg[4] = reg[1] != reg[2] ? 1 : 0; } break;
			case  6: { reg[4] = reg[1] >  reg[2] ? 1 : 0; } break; case  7: { reg[4] = reg[1] <  reg[2] ? 1 : 0; } break;
			case  8: { reg[4] = reg[1] >= reg[2] ? 1 : 0; } break; case  9: { reg[4] = reg[1] <= reg[2] ? 1 : 0; } break;
			case 10: { reg[4] = reg[1] << reg[2]; } break; case 11: { reg[4] = reg[1] >> reg[2]; } break;
			case 14: { reg[4] = reg[2] << 8 | reg[1]; } break; case 15: { reg[4] = reg[1] << 8 | reg[2]; } break;
		}
	}
}