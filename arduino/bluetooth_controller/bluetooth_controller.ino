const int ENA = 5;
const int IN1 = 7;
const int IN2 = 8;
const int IN3 = 9;
const int IN4 = 10;
const int ENB = 6;
 
const int TRIG_PIN = A0;
const int ECHO_PIN = A1;
const float STOP_DISTANCE = 15.0;   // forced stop only, single threshold
 
const int xPin = A2;
const int yPin = A3;
const int swPin = 4;

const int CENTER = 512;
const int DEADZONE = 150;
 
const int SPEED = 120;

char currentCommand = 'S';
 
bool joystickEnabled = false;    
bool lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long DEBOUNCE_DELAY = 250;

void setup() {
  Serial.begin(9600);

  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  pinMode(swPin, INPUT_PULLUP);

  stopCar();
}

void loop() {
  handleToggleButton();

  if (joystickEnabled) {
    readJoystick();
  } else {
    readBluetooth();
  }

  float distance = readDistance();

  if (distance < STOP_DISTANCE) {
    stopCar();
    return;
  }

  execute(currentCommand);
}
 
void handleToggleButton() {
  bool buttonState = digitalRead(swPin);

  if (buttonState == LOW && lastButtonState == HIGH &&
      (millis() - lastDebounceTime) > DEBOUNCE_DELAY) {

    joystickEnabled = !joystickEnabled;
    lastDebounceTime = millis();
    currentCommand = 'S';
    stopCar();
  }

  lastButtonState = buttonState;
}
 
void readJoystick() {
  int xVal = analogRead(xPin);
  int yVal = analogRead(yPin);

  int xOffset = xVal - CENTER;
  int yOffset = yVal - CENTER;

  if (abs(xOffset) < DEADZONE && abs(yOffset) < DEADZONE) {
    currentCommand = 'S';
  } else if (abs(xOffset) > abs(yOffset)) {
    currentCommand = (xOffset > 0) ? 'R' : 'L';
  } else {
    currentCommand = (yOffset > 0) ? 'F' : 'B';
  }
}
 
void readBluetooth() {
  while (Serial.available()) {
    char c = Serial.read();

    if (c == 'F' || c == 'B' || c == 'L' || c == 'R' || c == 'S') {
      currentCommand = c;
    }
  }
}
 
float readDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 25000);

  if (duration == 0) return 999;

  return duration * 0.0343 / 2.0;
}
 
void execute(char cmd) {
  switch (cmd) {
    case 'F': forward(); break;
    case 'B': backward(); break;
    case 'L': turnLeft(); break;
    case 'R': turnRight(); break;
    default: stopCar();
  }
}

void forward() {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(ENA, SPEED); analogWrite(ENB, SPEED);
}

void backward() {
  digitalWrite(IN1, LOW); digitalWrite(IN2, HIGH);
  digitalWrite(IN3, LOW); digitalWrite(IN4, HIGH);
  analogWrite(ENA, SPEED); analogWrite(ENB, SPEED);
}

void turnLeft() {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(ENA, 0); analogWrite(ENB, SPEED);
}

void turnRight() {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(ENA, SPEED); analogWrite(ENB, 0);
}

void stopCar() {
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
  digitalWrite(IN1, LOW); digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW); digitalWrite(IN4, LOW);
}