const int ENA = 5;
const int IN1 = 7;
const int IN2 = 8;

const int IN3 = 11;
const int IN4 = 12;
const int ENB = 6;

const int TRIG_PIN = A0;
const int ECHO_PIN = A1;

const float SAFE_DISTANCE = 20.0;     
const float EMERGENCY_DISTANCE = 8;  

const unsigned long BT_TIMEOUT = 1000;

const int MIN_SPEED = 70;
const int MAX_SPEED = 170;

char currentCommand = 'S';
int currentSpeed = 120;

unsigned long lastCommandTime = 0;
 
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

  stopCar();
}
 
void loop() {

  readBluetooth();

  bool connected =
      (millis() - lastCommandTime) < BT_TIMEOUT;

  char cmd = connected ? currentCommand : 'S';

  int spd = connected ? currentSpeed : 0;

  float distance = readDistance();

  // Emergency Stop
  if (distance < EMERGENCY_DISTANCE) {

    stopCar();
    return;
  }

  // Stop only forward motions
  if ((cmd == 'F' ||
       cmd == 'G' ||
       cmd == 'I') &&
      distance < SAFE_DISTANCE) {

    stopCar();
    return;
  }

  execute(cmd, spd);
}

 
void readBluetooth() {

  while (Serial.available()) {

    char c = Serial.read();

    if (c == 'F' ||
        c == 'B' ||
        c == 'L' ||
        c == 'R' ||
        c == 'G' ||
        c == 'I' ||
        c == 'H' ||
        c == 'J' ||
        c == 'S') {

      currentCommand = c;
      lastCommandTime = millis();
    }

    else if (c >= '0' && c <= '9') {

      currentSpeed = map(
          c - '0',
          0,
          9,
          MIN_SPEED,
          MAX_SPEED);

      lastCommandTime = millis();
    }
  }
}

 
float readDistance() {

  float sum = 0;
  int valid = 0;

  for (int i = 0; i < 3; i++) {

    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);

    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);

    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH, 25000);

    if (duration > 0) {

      float d = duration * 0.0343 / 2.0;

      if (d > 2 && d < 400) {

        sum += d;
        valid++;
      }
    }

    delay(3);
  }

  if (valid == 0)
    return 999;

  return sum / valid;
}

 
void execute(char cmd, int speed) {

  switch (cmd) {

    case 'F':
      forward(speed);
      break;

    case 'B':
      backward(speed);
      break;

    case 'L':
      turnLeft(speed);
      break;

    case 'R':
      turnRight(speed);
      break;

    case 'G':
      forwardLeft(speed);
      break;

    case 'I':
      forwardRight(speed);
      break;

    case 'H':
      backwardLeft(speed);
      break;

    case 'J':
      backwardRight(speed);
      break;

    default:
      stopCar();
  }
}

 
void forward(int s) {

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);

  analogWrite(ENA, s);
  analogWrite(ENB, s);
}

 
void backward(int s) {

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);

  analogWrite(ENA, s);
  analogWrite(ENB, s);
}

 
void forwardLeft(int s) {

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);

  analogWrite(ENA, s * 0.45);
  analogWrite(ENB, s);
}

 
void forwardRight(int s) {

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);

  analogWrite(ENA, s);
  analogWrite(ENB, s * 0.45);
}

 
void backwardLeft(int s) {

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);

  analogWrite(ENA, s * 0.45);
  analogWrite(ENB, s);
}

 
void backwardRight(int s) {

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);

  analogWrite(ENA, s);
  analogWrite(ENB, s * 0.45);
}

 // Smooth turning
 

void turnLeft(int s) {

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);

  analogWrite(ENA, 0);
  analogWrite(ENB, s);
}

 
void turnRight(int s) {

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);

  analogWrite(ENA, s);
  analogWrite(ENB, 0);
}

 
void stopCar() {

  analogWrite(ENA, 0);
  analogWrite(ENB, 0);

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
}