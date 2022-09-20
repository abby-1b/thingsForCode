#include <stdint.h>
#include <stdio.h>

uint8_t mem[0x200];

void interpret();

int main() {
	mem[0]=0x01;mem[1]=0x01;mem[2]=0xFF;mem[3]=0x31;mem[4]=0x00;mem[5]=0x01;mem[6]=0x11;mem[7]=0x00;mem[8]=0xFF;mem[9]=0x14;mem[10]=0x92;mem[11]=0x16;mem[12]=0x0E;mem[13]=0x43;mem[14]=0x16;mem[15]=0x0E;mem[16]=0x4B;mem[17]=0x21;mem[18]=0x00;mem[19]=0xE0;mem[20]=0x6A;mem[21]=0x1D;mem[22]=0x21;mem[23]=0x00;mem[24]=0x08;mem[25]=0x27;

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
	uint16_t reg[4];

	int ptr = 0;
	while (mem[ptr] != 0) {
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
				reg[0] = old[swaps >> 6];
				reg[1] = old[swaps >> 4 & 3];
				reg[2] = old[swaps >> 2 & 3];
				reg[3] = old[swaps & 3];
			} break; // Swaps multiple registers at once.
		}
		ptr++;
		// printf("%04x %04x %04x %04x\n", reg[0], reg[1], reg[2], reg[3]);
	}
}