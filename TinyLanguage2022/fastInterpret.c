#include <stdint.h>
#include <stdio.h>

uint8_t mem[0x200];
uint16_t reg[4];

void interpret();

int main() {
	printf("Starting...\n");

	mem[0]  = (uint8_t)0x01;
	mem[1]  = (uint8_t)0x01;
	mem[2]  = (uint8_t)0xFF;
	mem[3]  = (uint8_t)0x31;
	mem[4]  = (uint8_t)0x00;
	mem[5]  = (uint8_t)0x01;
	mem[6]  = (uint8_t)0x11;
	mem[7]  = (uint8_t)0x00;
	mem[8]  = (uint8_t)0x01;
	mem[9]  = (uint8_t)0x14;
	mem[10] = (uint8_t)0x92;
	mem[11] = (uint8_t)0x16;
	mem[12] = (uint8_t)0x0E;
	mem[13] = (uint8_t)0x43;
	mem[14] = (uint8_t)0x16;
	mem[15] = (uint8_t)0x0E;
	mem[16] = (uint8_t)0x4B;
	mem[17] = (uint8_t)0x21;
	mem[18] = (uint8_t)0x00;
	mem[19] = (uint8_t)0xE0;
	mem[20] = (uint8_t)0x6A;
	mem[21] = (uint8_t)0x21;
	mem[22] = (uint8_t)0x00;
	mem[23] = (uint8_t)0x08;
	mem[24] = (uint8_t)0x27;

	printf("Interpreting...\n");

	interpret();
}

uint16_t doMath(int op, int a, int b) {
	switch (op) {
		case 0: { return a + b; } break;
		case 1: { return a - b; } break;
		case 2: { return a * b; } break;
		case 3: { return a / b; } break;
		case 4: { return a == b ? 1 : 0; } break;
		case 5: { return a != b ? 1 : 0; } break;
		case 6: { return a > b  ? 1 : 0; } break;
		case 7: { return a < b  ? 1 : 0; } break;
		case 8: { return a >= b ? 1 : 0; } break;
		case 9: { return a <= b ? 1 : 0; } break;
	}
	return 0;
}

void interpret() {
	printf("Resetting regisers.\n");
	reg[0] = 0;
	reg[1] = 0;
	reg[2] = 0;
	reg[3] = 0;
	printf("Finished resetting regisers!\n");

	// let reps = 0
	int ptr = 0;
	while (mem[ptr] != 0) {
		// if (reps++ > 500) break
		// const ins = mem[ptr] & 15
		printf("Ins: %d\n", mem[ptr] & 15);
		switch (mem[ptr] & 15) {
			/* 2 */ case 1: reg[mem[ptr] >> 4] = mem[ptr + 1] << 8 | mem[ptr + 2]; ptr += 2; break; // Set register
			/* 0 */ case 2: reg[mem[ptr] >> 6] = reg[(mem[ptr] >> 4) & 3]; break; // Copy register value
			/* 0 */ case 3: reg[mem[ptr] >> 6] = mem[reg[(mem[ptr] >> 4) & 3]]; break; // Read memory at a register to a register
			/* 0 */ case 4: mem[reg[mem[ptr] >> 6]] = reg[(mem[ptr] >> 4) & 3]; break; // Writes the value of a register to the memory another register points to.
			/* 3 */ case 5: mem[mem[ptr + 2] << 8 | mem[ptr + 3]] = mem[ptr + 1]; ptr += 3; break; // Write the memory at an address to a value
			/* 0 */ case 6: reg[1] = doMath(mem[ptr] >> 4, reg[2], reg[3]); break; // Do math and put answer in the General register
			/* 0 */ case 7: ptr = reg[mem[ptr] >> 4]; break; // Jump to the memory at a specified register
			/* 0 */ case 8: ptr += mem[ptr] >> 4; break; // Jump forward some amount (nybble)
			/* 0 */ case 9: ptr -= (mem[ptr] >> 4) - 1; break; // Jump backward some amount (nybble)
			/* 0 */ case 10: ptr = reg[mem[ptr] >> 6] != 0 ? ptr : reg[(mem[ptr] >> 4) & 3]; break; // Jump to a register if another register is 0
			/* 0 */ case 11: ptr = reg[mem[ptr] >> 6] == 0 ? ptr : reg[(mem[ptr] >> 4) & 3]; break; // Jump to a register if another register isn't 0
			/* 0 */ case 12: printf("%d\n", reg[mem[ptr] >> 4]); break; // Prints a numeric value (with a newline) to the console.
			/* 0 */ case 13: printf("%c", reg[mem[ptr] >> 4]); break; // Prints a character (without a newline) to the console.
			/* 1 */ case 14: {
				int swaps = mem[++ptr];
				uint16_t old[4] = { reg[0], reg[1], reg[2], reg[3] };
				reg[0] = reg[swaps >> 6];
				reg[1] = reg[swaps >> 4 & 3];
				reg[2] = reg[swaps >> 2 & 3];
				reg[3] = reg[swaps & 3];
			} break; // Swaps multiple registers at once.
		}
		ptr++;
		// console.log([...reg].map(r => toHex(r, 4)).join(" "))
	}
	// console.log()
}