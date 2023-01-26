#include <iostream>

typedef union {
  float number;
  unsigned char bytes[4];
} FLOATUNION_t;

char expectingIdx = 0;
char expIdx = 0;
char expCount = 0;
FLOATUNION_t data[4];

void sendFloat(float num);
void recieveByte(unsigned char b);

int main() {
	// FLOATUNION_t yeet;
	// yeet.number = 723.88;

	sendFloat(723.89);

	std::cout << data[0].number << "\n";

	return 0;
}

void sendFloat(float num) {
	FLOATUNION_t n;
	n.number = num;
	recieveByte(0);
	recieveByte(n.bytes[0]);
	recieveByte(n.bytes[1]);
	recieveByte(n.bytes[2]);
	recieveByte(n.bytes[3]);
}

void recieveByte(unsigned char b) {
	if (expCount == 0) {
		expIdx = b;
		expCount = 4;
	} else {
		std::cout << "Set: " << 4 - expCount << "    to: " << (int)b << "\n";
		data[expIdx].bytes[4 - expCount] = b;
		expCount--;
	}
}
