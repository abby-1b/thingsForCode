#define OUT 12

void setup() {
  pinMode(OUT, OUTPUT);
}

void loop() {
  line();
}

void line() {

  // Back low
  analogWrite(OUT, 0);
  int mc = micros();
  while (micros() < mc+5) {};
  
  // Back high
  analogWrite(OUT, 93);
  int mc = micros();
  while (micros() < mc+5) {};
  
  
  // Data (noise)
  int mc = micros();
  while (micros() < mc+5) {
    analogWrite(OUT, random(93, 310));
  };
  
  
  // Front low
  analogWrite(OUT, 0);
  int mc = micros();
  while (micros() < mc+5) {};
  
  // Front high
  analogWrite(OUT, 93);
  int mc = micros();
  while (micros() < mc+5) {};
 
}
