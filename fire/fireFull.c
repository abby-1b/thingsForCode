#include <stdio.h>

// Width and height
w = 40;
h = 22;

// Frames
int usleep();
double sin();
f = 0; // Frame count

// Random
double fmod();
double _ = 0.5643918756;
double rnd() {
	return _ = fmod(99.9038456 * _ * _ + 0.1543, 1.0);
}

// Distance from (0, 0)
double sqrt();
double dst(int x, int y) {
	return sqrt(x * x + y * y);
}

int main() {
	// return 0;
	for (f = 0; f < h * 2; f++) printf("\n"); // <<< Padding
	for (f = 0; f < 15 * 3; f++) {
		for (int x = 0; x < w; x++) {
			for (int y = 0; y < h; y++) {
				if (dst(x - w / 2 + sin(f * 0.2 + 1.57) * 5, y - h / 2) < sin(f * 0.2) * 3 + 8) {
					printf("\033[%d;%dH@@", y, x * 2);
				} else {
					printf("\033[%d;%dH  ", y, x * 2);
				}
			}
		}
		usleep(65000);
	}
}
