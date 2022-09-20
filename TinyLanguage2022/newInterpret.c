#include <stdint.h>
#include <stdio.h>

uint8_t mem[0x200];
uint16_t reg[5];

void interpret();

int main() {
	mem[0] = 0xE0;
	mem[1] = 0xFF;
	interpret();
	printf("%04x %04x %04x %04x %04x\n", reg[0], reg[1], reg[2], reg[3], reg[4]);
}

void interpret() {
	reg[0] = 0; // 0- Address (16 bits)
	reg[1] = 0; // 1- A (16 bits)
	reg[2] = 0; // 2- B (16 bits)
	reg[3] = 0; // 3- Math Operation (8 bits)
	reg[4] = 0; // 4- Math output (16 bits)
	// 5- Memory at address (8 bits)

	int ptr = 0;
	while (mem[ptr] != 0) {
		uint16_t from = mem[ptr] >> 4;
		int to = mem[ptr] & 0b1111;
		if (from == 15) { from = mem[ptr + 1] << 8 | mem[ptr + 2]; ptr += 2; }
		else from = from == 14 ? mem[++ptr] : (from < 5) ? reg[from] : mem[reg[0]];
		if (to < 5) reg[to] = from; else mem[reg[0]] = from;
		if (to == 1 || to == 2 || to == 4) switch (reg[3]) {
			case 0: { reg[4] = reg[1] +  reg[2]; } break;
			case 1: { reg[4] = reg[1] -  reg[2]; } break;
			case 2: { reg[4] = reg[1] *  reg[2]; } break;
			case 3: { reg[4] = reg[1] /  reg[2]; } break;
			case 4: { reg[4] = reg[1] == reg[2] ? 1 : 0; } break;
			case 5: { reg[4] = reg[1] != reg[2] ? 1 : 0; } break;
			case 6: { reg[4] = reg[1] >  reg[2] ? 1 : 0; } break;
			case 7: { reg[4] = reg[1] <  reg[2] ? 1 : 0; } break;
			case 8: { reg[4] = reg[1] >= reg[2] ? 1 : 0; } break;
			case 9: { reg[4] = reg[1] <= reg[2] ? 1 : 0; } break;
		}
		ptr++;
	}
}