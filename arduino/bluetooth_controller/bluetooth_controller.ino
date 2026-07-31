const int ENA = 5;
const int IN1 = 7;
const int IN2 = 8;
const int IN3 = 11;
const int IN4 = 12;
const int ENB = 6;

const int TRIG_PIN = A0;
const int ECHO_PIN = A1;

const float SAFE_DISTANCE_CM = 15.0;
const unsigned long BT_TIMEOUT_MS = 1000;

const int MIN_RUN_SPEED = 90;
const int MAX_RUN_SPEED = 255;

char currentCommand = 'S';
int currentSpeed = 180;
unsigned long lastCommandTime = 0;

void setup() {
  Serial.begin(9600);   // HC-05 uses hardware serial (D0/D1)

  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENB, OUTPUT);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  stopCar();
}

void loop() {
  readBluetoothIfAvailable();

  bool linkActive = (millis() - lastCommandTime) < BT_TIMEOUT_MS;

  char commandToRun = linkActive ? currentCommand : 'S';
  int speedToRun = linkActive ? currentSpeed : 0;

  float distance = readDistanceCM();

  if (commandToRun == 'F' &&
      distance > 0 &&
      distance < SAFE_DISTANCE_CM) {
    commandToRun = 'S';
  }

  executeCommand(commandToRun, speedToRun);
}

void readBluetoothIfAvailable() {
  while (Serial.available()) {
    char c = Serial.read();

    if (c == 'F' || c == 'B' || c == 'L' ||
        c == 'R' || c == 'S') {

      currentCommand = c;
      lastCommandTime = millis();
    }

    else if (c >= '0' && c <= '9') {

      currentSpeed = map(
        c - '0',
        0,
        9,
        MIN_RUN_SPEED,
        MAX_RUN_SPEED
      );

      lastCommandTime = millis();
    }
  }
}

float readDistanceCM() {

  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);

  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0)
    return -1;

  return duration * 0.0343 / 2.0;
}

void executeCommand(char cmd, int speed) {

  switch (cmd) {

    case 'F':
      moveForward(speed);
      break;

    case 'B':
      moveBackward(speed);
      break;

    case 'L':
      turnLeft(speed);
      break;

    case 'R':
      turnRight(speed);
      break;

    default:
      stopCar();
      break;
  }
}

void moveForward(int speed) {

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);

  analogWrite(ENA, speed);
  analogWrite(ENB, speed);
}

void moveBackward(int speed) {

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);

  analogWrite(ENA, speed);
  analogWrite(ENB, speed);
}

void turnLeft(int speed) {

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);

  analogWrite(ENA, speed);
  analogWrite(ENB, speed);
}

void turnRight(int speed) {

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);

  analogWrite(ENA, speed);
  analogWrite(ENB, speed);
}

void stopCar() {

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);

  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
}