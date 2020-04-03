// D3
#define HS 0
// D5
#define VS 14
// D6
#define VF 12
// D7
#define VD 13

int m;

void setup() {
  pinMode(HS, OUTPUT);
  pinMode(VS, OUTPUT);
  pinMode(VF, OUTPUT);
  pinMode(VD, OUTPUT);
}
void loop() {
  digitalWrite(VS, HIGH);
  for (int y = 0; y < 480; y++) {
    digitalWrite(HS, HIGH);
    digitalWrite(VF, HIGH);
    m = micros(); while (micros() < m+25) {analogWrite(VD, 217);}
    digitalWrite(VD, 0);
    m = micros(); while (micros() < m+1) {}
    digitalWrite(HS, LOW);
    m = micros(); while (micros() < m+4) {}
    digitalWrite(HS, HIGH);
    m = micros(); while (micros() < m+2) {}
    digitalWrite(VF, LOW);
  }
  m = micros(); while (micros() < m+450) {}
  digitalWrite(VS, LOW);
  m = micros(); while (micros() < m+64) {}
  digitalWrite(VS, HIGH);
  m = micros(); while (micros() < m+1020) {
    // Calculate
  }
}
