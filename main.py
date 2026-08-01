import cv2
import dlib
import time
import numpy as np
from scipy.spatial import distance as dist
from send_final import BluetoothManager

# ---------- EAR FUNCTION ----------
def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

# ---------- SHAPE TO NUMPY ----------
def shape_to_np(shape):
    coords = np.zeros((68, 2), dtype=int)
    for i in range(68):
        coords[i] = (shape.part(i).x, shape.part(i).y)
    return coords

# ---------- HEAD PITCH ----------
def get_head_pitch(shape):
    nose_y = shape[30][1]
    chin_y = shape[8][1]

    left_eye_y = np.mean(shape[36:42, 1])
    right_eye_y = np.mean(shape[42:48, 1])
    eye_y = (left_eye_y + right_eye_y) / 2

    eye_to_nose = nose_y - eye_y
    nose_to_chin = chin_y - nose_y

    if nose_to_chin == 0:
        return "NEUTRAL"

    ratio = eye_to_nose / nose_to_chin

    if ratio > 0.55:
        return "DOWN"
    return "NEUTRAL"

# ---------- HEAD DIRECTION ----------
def get_head_direction(shape):
    nose_x = shape[30][0]
    left_eye_outer = shape[36][0]
    right_eye_outer = shape[45][0]

    dist_left = abs(nose_x - left_eye_outer)
    dist_right = abs(right_eye_outer - nose_x)
    if dist_right == 0:
        dist_right = 1

    ratio = dist_left / dist_right

    if ratio > 1.8:
        return "RIGHT"
    elif ratio < 0.55:
        return "LEFT"
    else:
        return "CENTER"

# ---------- BLUETOOTH ----------
bt = BluetoothManager()
if not bt.connect():
    print("Bluetooth not connected. Continuing anyway.")

# ---------- CONSTANTS ----------
EAR_THRESHOLD = 0.20
CONSEC_FRAMES = 2
DOUBLE_BLINK_TIME = 1.0

COMMAND_INTERVAL = 0.5  # seconds (Bluetooth sanity saver)

# ---------- VARIABLES ----------
frame_counter = 0
last_blink_time = 0
last_direction = "CENTER"
last_pitch = "NEUTRAL"
last_cmd_time = 0

# ---------- MODELS ----------
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

# ---------- CAMERA ----------
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Camera not accessible")
    exit()

print("System running. Blink twice fast. Turn head to steer.")

# ---------- MAIN LOOP ----------
while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)
    now = time.time()

    for face in faces:
        shape = predictor(gray, face)
        shape = shape_to_np(shape)

        leftEye = shape[42:48]
        rightEye = shape[36:42]

        ear = (eye_aspect_ratio(leftEye) + eye_aspect_ratio(rightEye)) / 2.0

        # ---------- BLINK ----------
        if ear < EAR_THRESHOLD:
            frame_counter += 1
        else:
            if frame_counter >= CONSEC_FRAMES:
                if now - last_blink_time <= DOUBLE_BLINK_TIME:
                    print("DOUBLE BLINK")
                    bt.send_command("F")
                last_blink_time = now
            frame_counter = 0

        # ---------- CONTINUOUS HEAD TURN ----------
        direction = get_head_direction(shape)

        if direction in ["LEFT", "RIGHT"]:
            if now - last_cmd_time > COMMAND_INTERVAL:
                cmd = "R" if direction == "LEFT" else "L"
                bt.send_command(cmd)
                print(f"{direction} (continuous)")
                last_cmd_time = now

        elif direction == "CENTER" and last_direction != "CENTER":
            bt.send_command("F")
    
            print("CENTER - Forward")

        last_direction = direction

        # ---------- HEAD DOWN ----------
        pitch = get_head_pitch(shape)
        if pitch == "DOWN" and pitch != last_pitch:
            bt.send_command("B")
            print("HEAD DOWN")
        last_pitch = pitch

        # ---------- VISUAL ----------
        cv2.rectangle(
            frame,
            (face.left(), face.top()),
            (face.right(), face.bottom()),
            (255, 0, 0),
            2,
        )

        cv2.putText(
            frame,
            f"EAR: {ear:.2f}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            
            0.7,
            (0, 255, 0),
            2,
        )

    cv2.imshow("Eye + Head Control", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
bt.disconnect()