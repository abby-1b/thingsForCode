// D5
#define OUT 14

// Microsecond store variable
int m;

void setup() {
  pinMode(OUT, OUTPUT);
}

void loop() {
  // Back porch
  analogWrite(OUT, 0);
  m = micros()+5; while (micros() < m) {};
  analogWrite(OUT, 80);
  m = micros()+5; while (micros() < m) {};

  // Video data
  m = micros()+42; while (micros() < m) {
    analogWrite(OUT, 280);
  }
 
  // Front porch
  analogWrite(OUT, 80);
  m = micros()+11; while (micros() < m) {};
}
